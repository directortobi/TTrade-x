import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisInput, AnalysisResult, Signal, ImageData, MarketAnalystInput, TradingStyle, TimeframeAnalysisInput } from '../types';

export const isGeminiConfigured = !!(typeof process !== 'undefined' && process.env?.API_KEY);

const getAi = () => {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        signal: { type: Type.STRING, enum: [Signal.BUY, Signal.SELL, Signal.HOLD], description: "The trading signal." },
        entryPrice: { type: Type.NUMBER, description: "Suggested entry price." },
        takeProfit: { type: Type.NUMBER, description: "Suggested take-profit level." },
        stopLoss: { type: Type.NUMBER, description: "Suggested stop-loss level." },
        rationale: { type: Type.STRING, description: "Detailed technical rationale." },
        pair: { type: Type.STRING, description: "Asset pair." },
        confidenceLevel: { type: Type.NUMBER, description: "Confidence score 0-100." },
        pips: {
            type: Type.OBJECT,
            properties: { 
                takeProfit: { type: Type.NUMBER, description: "Pips to take profit" }, 
                stopLoss: { type: Type.NUMBER, description: "Pips to stop loss" } 
            },
            required: ["takeProfit", "stopLoss"]
        },
        riskRewardRatio: { type: Type.STRING, description: "Risk to reward ratio" },
        support: { type: Type.NUMBER, description: "Key support level" },
        resistance: { type: Type.NUMBER, description: "Key resistance level" },
        trend: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Sideways'], description: "Market trend direction" },
        indicators: {
            type: Type.OBJECT,
            properties: {
                rsi: {
                    type: Type.OBJECT,
                    properties: { 
                        value: { type: Type.NUMBER, description: "RSI value" }, 
                        interpretation: { type: Type.STRING, description: "RSI interpretation" } 
                    },
                    required: ["value", "interpretation"]
                },
                macd: {
                    type: Type.OBJECT,
                    properties: { 
                        signal: { type: Type.STRING, description: "MACD signal description" } 
                    },
                    required: ["signal"]
                }
            },
            required: ["rsi", "macd"]
        },
    },
    required: ["signal", "entryPrice", "takeProfit", "stopLoss", "rationale", "pair", "confidenceLevel", "pips", "riskRewardRatio", "support", "resistance", "trend", "indicators"],
};

export const getTradingSignal = async (input: AnalysisInput): Promise<AnalysisResult> => {
    const ai = getAi();
    const prompt = `Perform expert technical analysis for ${input.pair}. Return JSON response.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.3,
        },
    });
    
    return JSON.parse(response.text || "{}") as AnalysisResult;
};

export const getSignalFromImage = async (imageData: ImageData, userAnnotations?: string): Promise<AnalysisResult> => {
    const ai = getAi();
    const imagePart = { inlineData: { mimeType: imageData.mimeType, data: imageData.data } };
    const textPart = { text: `Analyze this chart screenshot. User notes: ${userAnnotations || 'none'}. Return JSON output.` };

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.3,
        },
    });
    
    return JSON.parse(response.text || "{}") as AnalysisResult;
};

export const getMarketAnalystPrediction = async (input: MarketAnalystInput): Promise<AnalysisResult> => {
    const ai = getAi();
    const prompt = `Expert AI Analyst (${input.tradingStyle}). Analyze ${input.pair} based on provided data. Return JSON output.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.4,
        },
    });
    
    return JSON.parse(response.text || "{}") as AnalysisResult;
};

export const getTimeframeAnalysis = async (input: TimeframeAnalysisInput): Promise<AnalysisResult> => {
    const ai = getAi();
    const prompt = `Technical Analyst for ${input.pair} on ${input.timeframe} timeframe. Return JSON output.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema,
            temperature: 0.3,
        },
    });
    
    return JSON.parse(response.text || "{}") as AnalysisResult;
};