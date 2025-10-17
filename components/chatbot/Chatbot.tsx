import React, { useState, useRef, useEffect } from 'react';
import { ChatFab } from './ChatFab';
import { ChatWindow } from './ChatWindow';
import { ChatMessage } from '../../types';
import { GoogleGenAI, Chat } from '@google/genai';
import { isGeminiConfigured } from '../../services/geminiService';

const CHATBOT_GREETING = "Hello! I'm the Trade X Assistant. How can I help you today? You can ask me about market trends, trading concepts, or how to use the app.";

export const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: CHATBOT_GREETING }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        if (!isGeminiConfigured) return;

        const initializeChat = async () => {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
                
                const systemInstruction = `You are "Trade X Assistant", an expert AI companion for the Trade X financial analysis application. Your primary role is to help users understand market trends, explain trading concepts, and guide them on how to use the app's features.

                Key characteristics:
                - **Expertise:** You are knowledgeable about forex, commodities, crypto, technical analysis (RSI, MACD, candlestick patterns, market structure), and trading strategies (ICT, Swing, Scalping).
                - **App-Aware:** You know the features of Trade X, including the 'Market Scanner' (for AI predictions), 'Chart Upload' (for analyzing screenshots), 'Trading History', 'Compounding Agent', and 'Referral Program'.
                - **Helpful & Clear:** Provide concise, easy-to-understand explanations. Avoid jargon where possible, or explain it clearly if necessary. Use markdown for formatting like lists or bold text.
                - **Cautious:** You MUST NOT give direct financial advice. Never tell a user to "buy" or "sell" a specific asset. Instead of giving advice, explain the concepts or what the AI analysis tools might show. Frame your answers educationally. Use disclaimers like "This is for educational purposes and not financial advice." when discussing potential market movements.
                - **Persona:** Be friendly, professional, and supportive.`;

                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction,
                        temperature: 0.7,
                    }
                });
            } catch (error) {
                console.error("Failed to initialize chatbot:", error);
                setMessages(prev => [...prev, { role: 'model', text: 'Sorry, the chat assistant failed to initialize. Please check the API key configuration.'}]);
            }
        };

        initializeChat();
    }, []);

    const handleSendMessage = async (messageText: string) => {
        if (isLoading || !chatRef.current) return;

        setIsLoading(true);
        const userMessage: ChatMessage = { role: 'user', text: messageText };
        setMessages(prev => [...prev, userMessage]);

        try {
            const result = await chatRef.current.sendMessage(messageText);
            const responseText = result.text;
            
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isGeminiConfigured) {
        return null; // Don't render the chatbot if Gemini is not configured
    }

    return (
        <>
            {!isOpen && <ChatFab onClick={() => setIsOpen(true)} />}
            <ChatWindow 
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
            />
        </>
    );
};
