import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisInput, AnalysisResult, Signal, ImageData, MarketAnalystInput, TradingStyle, TimeframeAnalysisInput } from '../types';

export const isGeminiConfigured = !!(typeof process !== 'undefined' && process.env.API_KEY);

const getAi = () => {
    if (!process.env.API_KEY) throw new Error("Gemini API Key missing.");
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getTradingSignal = async (input: AnalysisInput): Promise<AnalysisResult> => {
    const ai = getAi();
    const { pair, data1m, data15m, data1h, newsSentiment, userAnnotations } = input;

    const userNotesPrompt = userAnnotations ? `\n**User's Analysis & Notes:**\n${userAnnotations}\n` : '';
    const prompt = `Analyze ${pair}. Latest Price: ${data1m[data1m.length - 1]?.close}. Sentiment Score: ${newsSentiment.score}. ${userNotesPrompt} Provide detailed technical breakdown in JSON.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.3,
        },
    });
    
    return JSON.parse(response.text || "{}") as AnalysisResult;
};

export const getSignalFromImage = async (imageData: ImageData, userAnnotations?: string): Promise<AnalysisResult> => {
    const ai = getAi();
    const imagePart = { inlineData: { mimeType: imageData.mimeType, data: imageData.data } };
    const textPart = { text: `Analyze this chart. Notes: ${userAnnotations || 'none'}. Provide JSON output.` };

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [imagePart, textPart] },
        config: { responseMimeType: "application/json", temperature: 0.3 },
    });
    
    return JSON.parse(response.text || "{}") as AnalysisResult;
};

export const getMarketAnalystPrediction = async (input: MarketAnalystInput): Promise<AnalysisResult> => {
    const ai = getAi();
    const prompt = `Expert AI Analyst (${input.tradingStyle}). Analyze ${input.pair}. Provide JSON output.`;

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.4 },
    });
    
    return JSON.parse(response.text || "{}") as AnalysisResult;
};

export const getTimeframeAnalysis = async (input: TimeframeAnalysisInput): Promise<AnalysisResult> => {
    const ai = getAi();
    const prompt = `Technical Analyst for ${input.pair} (${input.timeframe}). Latest: ${input.data[input.data.length - 1]?.close}. Provide JSON output.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 0.3 },
    });
    
    return JSON.parse(response.text || "{}") as AnalysisResult;
};