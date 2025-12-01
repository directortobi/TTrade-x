
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisInput, AnalysisResult, Signal, ImageData, MarketAnalystInput, TradingStyle, TimeframeAnalysisInput, Timeframe } from '../types';

// The API key is loaded from environment variables.
// For Vite projects, use import.meta.env.VITE_...
const geminiApiKey = (import.meta as any).env.VITE_API_KEY;

export const isGeminiConfigured = !!geminiApiKey;

// Initialize the AI client once.
let ai: GoogleGenAI;

const initializeAi = () => {
    if (ai) return;

    if (!isGeminiConfigured) {
        console.error("Gemini API key is not configured. Please set the VITE_API_KEY environment variable.");
        throw new Error("Google Gemini API Key not found. Please ensure the VITE_API_KEY environment variable is set.");
    }
    
    ai = new GoogleGenAI({ apiKey: geminiApiKey! });
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
    initializeAi();
    const { pair, data1m, data15m, data1h, newsSentiment, userAnnotations } = input;

    const userNotesPrompt = userAnnotations
        ? `\n**User's Analysis & Notes (Consider these insights):**\n${userAnnotations}\n`
        : '';

    const prompt = `
        You are an expert Forex market analyst. Your task is to provide a trading signal (BUY, SELL, or HOLD) for the ${pair} pair.
        Analyze the provided data comprehensively and return your analysis in a structured JSON format.

        **Market Data:**
        *   1-Minute Chart (Last 100 Candles): Latest Price: ${data1m[data1m.length - 1].close}
        *   15-Minute Chart (Last 100 Candles): Latest Price: ${data15m[data15m.length - 1].close}
        *   1-Hour Chart (Last 100 Candles): Latest Price: ${data1h[data1h.length - 1].close}
        *   News Sentiment (Last 24 hours): Score: ${newsSentiment.score}, Summary: ${newsSentiment.rationale}
        ${userNotesPrompt}
        **Analysis Instructions:**
        1.  **Technical Indicator Analysis:** Based on the provided candlestick data, infer the state of and signals from the following technical indicators:
            *   **RSI (Relative Strength Index):** Is the asset overbought, oversold, or showing divergence? Determine its numerical value and interpretation.
            *   **MACD (Moving Average Convergence Divergence):** Is there a bullish or bearish crossover? What is the histogram momentum? Determine the signal.
            *   **Bollinger Bands:** Is the price trading near the upper or lower band? Is there a "squeeze" indicating potential volatility?
            *   **Candlestick Pattern Analysis:** Scrutinize the chart for significant candlestick patterns such as Doji, Engulfing patterns (Bullish/Bearish), Hammer, Shooting Star, or Morning/Evening Star formations, especially near key support and resistance levels. These patterns are crucial for confirming potential reversals or continuations.
            *   **Market Structure:** Identify the current trend and look for any 'break of structure' (BoS) that might signal a trend reversal or continuation. Determine the overall trend direction ('Bullish', 'Bearish', 'Sideways').
        2.  **Multi-Timeframe Confirmation:** Correlate findings from the technical indicators across the 1m, 15m, and 1h charts to establish a confluence of signals.
        3.  **Support and Resistance:** Identify the most significant and nearest support and resistance price levels from the 15m and 1h charts.
        4.  **Sentiment Integration:** How does the news sentiment support or contradict the technical analysis?
        5.  **Decision and Levels:** Decide on a BUY, SELL, or HOLD signal. If BUY or SELL, provide a precise Entry Price, Take Profit, and Stop Loss. If HOLD, set price levels to 0.
        6.  **Rationale:** Provide a clear, concise explanation for your decision. **Crucially, your rationale must begin by stating any identified candlestick patterns and their implications.** Then, integrate this with your analysis of technical indicators (RSI, MACD, Bollinger Bands) and market structure to build a cohesive argument for the trade.
        7.  **Confidence & Risk:**
            *   Provide a 'confidenceLevel' (0-100) for this signal.
            *   Calculate the 'takeProfit' and 'stopLoss' distance in pips. For most pairs, 1 pip = 0.0001. For JPY pairs (e.g., USD/JPY), 1 pip = 0.01.
            *   Calculate the 'riskRewardRatio' (Take Profit pips / Stop Loss pips). Format it as a string "1:X".
            *   The 'pair' is ${pair}.

        Provide your final output in the required JSON format, including support, resistance, trend, and indicator readings (RSI value and interpretation, MACD signal).
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.3,
            },
        });
        
        const text = response.text.trim();
        const parsedJson = JSON.parse(text);

        if (!Object.values(Signal).includes(parsedJson.signal)) {
            throw new Error("Invalid signal received from AI.");
        }
        
        return parsedJson as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes("API key")) {
             throw error;
        }
        throw new Error("Failed to get analysis from AI. The model may have returned an invalid response.");
    }
};

export const getSignalFromImage = async (imageData: ImageData, userAnnotations?: string): Promise<AnalysisResult> => {
    initializeAi();
    const imagePart = {
        inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.data,
        },
    };

    const userNotesPrompt = userAnnotations
        ? `\n**User's Analysis & Notes (Consider these insights):**\n${userAnnotations}\n`
        : '';

    const textPart = {
        text: `
          You are an expert financial chart analyst. Your task is to analyze the provided chart image and determine a trading signal.
          ${userNotesPrompt}
          **Analysis Instructions:**
          1.  **Identify Asset:** Identify the asset from labels (e.g., EUR/USD, BTC, AAPL) and put it in the 'pair' field. If not possible, use 'UNKNOWN/USD'.
          2.  **Technical Analysis from Chart:**
              *   **Identify Key Indicators:** Look for visible indicators on the chart like **RSI, MACD, and Bollinger Bands**. Analyze their readings (e.g., RSI overbought/oversold, MACD crossover, price interaction with bands). Provide the RSI value and interpretation, and the MACD signal.
              *   **Analyze Market Structure:** Identify the trend, key horizontal and trend-line support/resistance levels, and any **'break of structure' (BoS)**. Determine the most significant support and resistance levels and the overall trend direction.
              *   **Identify Candlestick Patterns:** This is a critical step. Search for powerful candlestick patterns like Doji, Engulfing, Hammer, or Shooting Star. Note where they appear (e.g., at a resistance level) as this heavily influences their meaning.
          3.  **Synthesize Findings:** Combine the analysis of price action, market structure, and all visible indicators to form a cohesive view.
          4.  **Decision and Levels:**
              *   Decide on a **BUY, SELL, or HOLD** signal.
              *   If BUY or SELL, provide a precise **Entry Price**, **Take Profit**, and **Stop Loss** based on your analysis. Entry should be near the last visible price.
              *   If HOLD, set price levels to 0.
          5.  **Rationale:** Provide a step-by-step explanation. **Start by describing any candlestick patterns you found and what they signal in the current context.** Then, connect this to your analysis of market structure and other visible indicators to justify your signal.
          6.  **Confidence & Risk:**
              *   Provide a 'confidenceLevel' (0-100) for the signal.
              *   Calculate 'takeProfit' and 'stopLoss' distance in **pips**. Use standard definitions (0.0001 for 4-decimal prices, 0.01 for 2-decimal prices).
              *   Calculate the 'riskRewardRatio' and format it as a string "1:X".

          Provide your final output in the required JSON format, including support, resistance, trend, and indicator readings.
        `,
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.3,
            },
        });
        
        const text = response.text.trim();
        const parsedJson = JSON.parse(text);

        if (!Object.values(Signal).includes(parsedJson.signal)) {
            throw new Error("Invalid signal received from AI.");
        }
        
        return parsedJson as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API with image:", error);
         if (error instanceof Error && error.message.includes("API key")) {
             throw error;
        }
        throw new Error("Failed to get analysis from AI. The model may have returned an invalid response.");
    }
};

const tradingStylePrompts: Record<TradingStyle, string> = {
    ict: `Focus on ICT (Inner Circle Trader) concepts. Identify key liquidity zones (highs/lows), fair value gaps (FVGs), order blocks, and market structure shifts. Your entry should be based on a return to an FVG or order block after a liquidity grab.`,
    swing: `Adopt a swing trader's perspective. Analyze the higher timeframe (4h, 1d) market structure to determine the primary trend. Identify major support and resistance levels. Look for entries on pullbacks to these levels or on trendline touches, confirmed by candlestick patterns.`,
    scalper: `Act as a high-frequency scalper. Focus on the 1-hour chart for trend direction and identify immediate order flow and momentum shifts. Look for quick entries based on breakouts of small ranges or immediate reactions to minor support/resistance flips. Aim for small, high-probability gains.`
};

export const getMarketAnalystPrediction = async (input: MarketAnalystInput): Promise<AnalysisResult> => {
    initializeAi();
    const { pair, tradingStyle, data1h, data4h, data1d } = input;
    const styleSpecificInstructions = tradingStylePrompts[tradingStyle];
    const styleName = {ict: "ICT Day Trader", swing: "Swing Trader", scalper: "Scalper"}[tradingStyle];


    const prompt = `
        You are an AI Forex Market Analyst with deep expertise in multi-timeframe technical analysis, order flow, and statistical modeling.
        Your sole responsibility is to scan the live forex market for the ${pair} pair and issue a precise trade prediction based on the '${styleName}' trading style.

        **Current Market Data:**
        * 1-Hour Chart (Last 100 Candles): Latest Close: ${data1h[data1h.length - 1].close}
        * 4-Hour Chart (Last 100 Candles): Latest Close: ${data4h[data4h.length - 1].close}
        * 1-Day Chart (Last 100 Candles): Latest Close: ${data1d[data1d.length - 1].close}

        **Your Persona & Trading Style:** ${styleSpecificInstructions}

        **Task:**
        Analyze the provided multi-timeframe data according to your trading style. Determine the trend, key support/resistance, significant candlestick patterns, and indicator states (RSI, MACD, and Bollinger Bands), then issue a single, actionable trade prediction.

        **Prediction Requirements (Your output MUST be this JSON object):**
        1.  **trend**: Determine the overall trend direction ('Bullish', 'Bearish', 'Sideways').
        2.  **support / resistance**: Identify the most significant nearby support and resistance levels.
        3.  **indicators**: Provide the current RSI value and its interpretation ('Overbought', 'Oversold', 'Neutral', 'Divergence') and the current MACD signal ('Bullish Crossover', 'Bearish Crossover', 'No Crossover').
        4.  **signal**: "BUY" or "SELL". Do not use "HOLD". If no high-probability setup is found, you must still choose the most likely direction and indicate low confidence.
        5.  **entryPrice**: The precise price to enter the trade.
        6.  **takeProfit**: The target price to exit with a profit.
        7.  **stopLoss**: The price to exit if the trade moves against you. The risk-to-reward ratio (distance to TP vs. distance to SL) must be at least 1:1.5.
        8.  **confidenceLevel**: Your certainty in this prediction, from 0 to 100.
        9.  **rationale**: A detailed step-by-step justification for your decision, directly referencing your trading style's concepts (e.g., FVGs for ICT, major S/R for swing) and incorporating your findings on trend, S/R, candlestick patterns, and indicators (RSI, MACD, and Bollinger Bands analysis).
        10. **pips**: Calculate TP and SL distance in pips. For most pairs, 1 pip = 0.0001. For JPY pairs (e.g., USD/JPY), 1 pip = 0.01. For XAU/USD, 1 pip = 0.1. For BTC/USD, 1 pip = 1.0.
        11. **riskRewardRatio**: Calculate the risk/reward ratio as "1:X".
        12. **pair**: The pair being analyzed (${pair}).

        Generate the JSON output.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.4,
            },
        });
        
        const text = response.text.trim();
        const parsedJson = JSON.parse(text);

        if (![Signal.BUY, Signal.SELL, Signal.HOLD].includes(parsedJson.signal)) {
            throw new Error("Invalid signal received from AI.");
        }
        
        if (parsedJson.signal === Signal.HOLD) {
             throw new Error("AI returned a 'HOLD' signal against instructions. Please try again.");
        }

        return parsedJson as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API for Market Analyst:", error);
        if (error instanceof Error && error.message.includes("API key")) {
             throw error;
        }
        throw new Error("Failed to get analysis from AI Analyst. The model may have returned an invalid response.");
    }
};


export const getTimeframeAnalysis = async (input: TimeframeAnalysisInput): Promise<AnalysisResult> => {
    initializeAi();
    const { pair, timeframe, data } = input;

    const prompt = `
        You are an expert technical analyst providing a focused trade signal for ${pair} based *only* on the provided ${timeframe} chart data.

        **Market Data:**
        *   ${timeframe} Chart (Last 100 Candles): Latest Price: ${data[data.length - 1].close}

        **Analysis Instructions:**
        1.  **Technical Analysis:** Based on the provided candlestick data, infer signals from technical indicators:
            *   **RSI (Relative Strength Index):** Is the asset overbought, oversold, or showing divergence? Determine its numerical value and interpretation.
            *   **MACD (Moving Average Convergence Divergence):** Is there a bullish or bearish crossover? Determine the signal.
            *   **Bollinger Bands:** Is the price trading near the upper or lower band? Is there a "squeeze" indicating potential volatility?
            *   **Candlestick Patterns:** Identify influential candlestick patterns (Doji, Engulfing, Hammer, etc.) and explain their significance at the current price level.
            *   **Market Structure:** Identify the immediate trend, support, and resistance levels on this timeframe. Determine the trend direction ('Bullish', 'Bearish', 'Sideways').
        2.  **Decision and Levels:** Decide on a BUY or SELL signal. If no high-probability setup is found, you must still choose the most likely direction and indicate low confidence.
        3.  **Rationale:** Provide a clear, concise explanation for your decision. **Start your rationale by discussing the candlestick patterns you've identified.** Then, explain how these patterns, in conjunction with RSI, MACD, Bollinger Bands, and market structure, lead to your final signal.
        4.  **Confidence & Risk:**
            *   Provide a 'confidenceLevel' (0-100).
            *   Calculate 'takeProfit' and 'stopLoss' distance in pips appropriate for the timeframe.
            *   Calculate 'riskRewardRatio' as "1:X", ensuring it is at least 1:1.5.
            *   The 'pair' is ${pair}.

        Provide your final output in the required JSON format, including support, resistance, trend, and indicator readings.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.3,
            },
        });
        
        const text = response.text.trim();
        const parsedJson = JSON.parse(text);

        if (![Signal.BUY, Signal.SELL, Signal.HOLD].includes(parsedJson.signal)) {
            throw new Error("Invalid signal received from AI.");
        }
        
        if (parsedJson.signal === Signal.HOLD) {
             throw new Error("AI returned a 'HOLD' signal against instructions. Please try again.");
        }

        return parsedJson as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API for Timeframe Analyst:", error);
        if (error instanceof Error && error.message.includes("API key")) {
             throw error;
        }
        throw new Error("Failed to get analysis from AI Timeframe Analyst. The model may have returned an invalid response.");
    }
};
