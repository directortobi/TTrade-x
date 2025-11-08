import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { AppLogo } from '../AppLogo';
import { CloseIcon } from '../icons/CloseIcon';
import { SendIcon } from '../icons/SendIcon';

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const TypingIndicator: React.FC = () => (
    <div className="flex items-center space-x-1 p-2">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
);

export const ChatWindow: React.FC<ChatWindowProps> = ({ isOpen, onClose, messages, onSendMessage, isLoading }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const message = inputRef.current?.value;
        if (message && !isLoading) {
            onSendMessage(message);
            inputRef.current.value = '';
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[600px] bg-gray-900/80 backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl flex flex-col z-50 animate-fade-in-up">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <AppLogo />
                    <h2 className="font-semibold text-white">Trade X Assistant</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                    <CloseIcon />
                </button>
            </header>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                         <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-xl bg-gray-700 text-gray-200 rounded-bl-none">
                            <TypingIndicator />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Ask about trading..."
                        disabled={isLoading}
                        className="flex-1 h-12 px-4 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50"
                    />
                    <button type="submit" disabled={isLoading} className="w-12 h-12 flex items-center justify-center bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                        <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};