
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisInput, AnalysisResult, Signal, ImageData, MarketAnalystInput, TradingStyle, TimeframeAnalysisInput, Timeframe } from '../types';

// FIX: Obtain API key exclusively from process.env.API_KEY as per guidelines.
const geminiApiKey = process.env.API_KEY;

export const isGeminiConfigured = !!geminiApiKey;

const initializeAi = () => {
    // FIX: Always create a new GoogleGenAI instance right before making an API call.
    return new GoogleGenAI({ apiKey: geminiApiKey! });
}

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        signal: {
            type: Type.STRING,
            enum: [Signal.BUY, Signal.SELL, Signal.HOLD],
            description: "The trading signal: BUY, SELL, or HOLD.",
        },
        entryPrice: {
            type: Type.NUMBER,
            description: "The suggested entry price for the trade. Should be based on the latest price visible in the chart.",
        },
        takeProfit: {
            type: Type.NUMBER,
            description: "The suggested take-profit level, based on visible resistance or support.",
        },
        stopLoss: {
            type: Type.NUMBER,
            description: "The suggested stop-loss level, based on visible support or resistance.",
        },
        rationale: {
            type: Type.STRING,
            description: "A detailed rationale for the trading signal, analyzing technical indicators, candlestick patterns, trend lines, and any other visual information in the chart.",
        },
        pair: {
            type: Type.STRING,
            description: "The asset pair being analyzed, e.g., 'EUR/USD' or 'BTC/USD' if identified from a chart.",
        },
        confidenceLevel: {
            type: Type.NUMBER,
            description: "A confidence score from 0 to 100 on the reliability of the signal.",
        },
        pips: {
            type: Type.OBJECT,
            properties: {
                takeProfit: { type: Type.NUMBER },
                stopLoss: { type: Type.NUMBER },
            },
            required: ["takeProfit", "stopLoss"],
            description: "The take profit and stop loss values converted to pips.",
        },
        riskRewardRatio: {
            type: Type.STRING,
            description: "The calculated risk-to-reward ratio, expressed as a string '1:X'.",
        },
        support: {
            type: Type.NUMBER,
            description: "The nearest significant support price level identified from the analysis.",
        },
        resistance: {
            type: Type.NUMBER,
            description: "The nearest significant resistance price level identified from the analysis.",
        },
        trend: {
            type: Type.STRING,
            enum: ['Bullish', 'Bearish', 'Sideways'],
            description: "The identified market trend direction.",
        },
        indicators: {
            type: Type.OBJECT,
            properties: {
                rsi: {
                    type: Type.OBJECT,
                    properties: {
                        value: { type: Type.NUMBER, description: "The calculated RSI value." },
                        interpretation: {
                            type: Type.STRING,
                            enum: ['Overbought', 'Oversold', 'Neutral', 'Divergence'],
                            description: "Interpretation of the RSI reading.",
                        }
                    },
                    required: ["value", "interpretation"],
                },
                macd: {
                    type: Type.OBJECT,
                    properties: {
                        signal: {
                            type: Type.STRING,
                            enum: ['Bullish Crossover', 'Bearish Crossover', 'No Crossover'],
                            description: "The current MACD signal.",
                        }
                    },
                    required: ["signal"],
                }
            },
            required: ["rsi", "macd"],
        },
    },
    required: ["signal", "entryPrice", "takeProfit", "stopLoss", "rationale", "pair", "confidenceLevel", "pips", "riskRewardRatio", "support", "resistance", "trend", "indicators"],
};

export const getTradingSignal = async (input: AnalysisInput): Promise<AnalysisResult> => {
    const ai = initializeAi();
    const { pair, data1m, data15m, data1h, newsSentiment, userAnnotations } = input;

    const userNotesPrompt = userAnnotations
        ? `\n**User's Analysis & Notes (Consider these insights):**\n${userAnnotations}\n`
        : '';

    const prompt = `
        You are an expert Forex market analyst. Your task is to provide a trading signal (BUY, SELL, or HOLD) for the ${pair} pair.
        Analyze the provided data comprehensively and return your analysis in a structured JSON format.

        **Market Data:**
        *   1-Minute Chart (Last 100 Candles): Latest Price: ${data1m[data1m.length - 1]?.close}
        *   15-Minute Chart (Last 100 Candles): Latest Price: ${data15m[data15m.length - 1]?.close}
        *   1-Hour Chart (Last 100 Candles): Latest Price: ${data1h[data1h.length - 1]?.close}
        *   News Sentiment (Last 24 hours): Score: ${newsSentiment.score}, Summary: ${newsSentiment.rationale}
        ${userNotesPrompt}
        **Analysis Instructions:**
        1.  **Technical Indicator Analysis:** Based on the provided candlestick data, infer the state of and signals from indicators: RSI, MACD, Bollinger Bands.
        2.  **Candlestick Pattern Analysis:** Scrutinize the chart for significant patterns (Doji, Engulfing, Hammer, etc.).
        3.  **Market Structure:** Identify the trend (Bullish, Bearish, Sideways) and key S/R levels.
        4.  **Multi-Timeframe Confirmation:** Correlate findings across 1m, 15m, and 1h charts.
        5.  **Rationale:** Begin by stating candlestick patterns, then integrate technical indicators.
        6.  **Decision:** Provide precise Entry, TP, and SL. For JPY pairs, 1 pip = 0.01. Others, 0.0001.

        Provide final output in JSON format.
    `;

    try {
        const response = await ai.models.generateContent({
            // FIX: Using gemini-3-flash-preview as recommended for text tasks.
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.3,
            },
        });
        
        // FIX: Access response text property directly.
        const text = response.text?.trim() || "{}";
        const parsedJson = JSON.parse(text);
        return parsedJson as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get analysis from AI.");
    }
};

export const getSignalFromImage = async (imageData: ImageData, userAnnotations?: string): Promise<AnalysisResult> => {
    const ai = initializeAi();
    const imagePart = {
        inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data,
        },
    };

    const userNotesPrompt = userAnnotations
        ? `\n**User's Analysis & Notes:**\n${userAnnotations}\n`
        : '';

    const textPart = {
        text: `
          You are an expert financial chart analyst. Analyze this chart image.
          ${userNotesPrompt}
          1. Identify Asset.
          2. Perform Technical Analysis (RSI, MACD, S/R).
          3. Identify Candlestick Patterns.
          4. Decide BUY, SELL, or HOLD.
          5. Provide detailed rationale starting with patterns.
          
          Provide output in the required JSON format.
        `,
    };

    try {
        const response = await ai.models.generateContent({
            // FIX: Using gemini-3-flash-preview for multimodal tasks.
            model: "gemini-3-flash-preview",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.3,
            },
        });
        
        // FIX: Access response text property directly.
        const text = response.text?.trim() || "{}";
        const parsedJson = JSON.parse(text);
        return parsedJson as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API with image:", error);
        throw new Error("Failed to get analysis from AI image analyst.");
    }
};

export const getMarketAnalystPrediction = async (input: MarketAnalystInput): Promise<AnalysisResult> => {
    const ai = initializeAi();
    const { pair, tradingStyle, data1h, data4h, data1d } = input;

    const prompt = `
        Expert AI Analyst (${tradingStyle} style). Analyze ${pair} using:
        - 1H Close: ${data1h[data1h.length - 1]?.close}
        - 4H Close: ${data4h[data4h.length - 1]?.close}
        - 1D Close: ${data1d[data1d.length - 1]?.close}

        Requirements:
        1. "BUY" or "SELL" signal only.
        2. RR Ratio min 1:1.5.
        3. Detailed rationale based on ${tradingStyle} concepts (e.g. FVGs for ICT).
        
        Generate JSON output.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.4,
            },
        });
        
        const text = response.text?.trim() || "{}";
        const parsedJson = JSON.parse(text);
        return parsedJson as AnalysisResult;
    } catch (error) {
        console.error("Error in Market Analyst:", error);
        throw new Error("AI Analyst failed to provide a prediction.");
    }
};

export const getTimeframeAnalysis = async (input: TimeframeAnalysisInput): Promise<AnalysisResult> => {
    const ai = initializeAi();
    const { pair, timeframe, data } = input;

    const prompt = `
        Technical Analyst focused on ${pair} (${timeframe}).
        Latest Price: ${data[data.length - 1]?.close}
        Provide technical breakdown, signal, levels, and rationale in JSON.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.3,
            },
        });
        
        const text = response.text?.trim() || "{}";
        const parsedJson = JSON.parse(text);
        return parsedJson as AnalysisResult;
    } catch (error) {
        console.error("Error in Timeframe Analyst:", error);
        throw new Error("Failed to get analysis for this timeframe.");
    }
};
