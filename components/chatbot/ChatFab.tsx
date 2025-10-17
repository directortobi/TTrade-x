import React from 'react';
import { ChatIcon } from '../icons/ChatIcon';

interface ChatFabProps {
    onClick: () => void;
}

export const ChatFab: React.FC<ChatFabProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 bg-gradient-to-br from-cyan-500 to-blue-600 text-white w-16 h-16 rounded-full shadow-lg hover:scale-110 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-transform duration-200 ease-in-out z-50 flex items-center justify-center"
            aria-label="Open chat assistant"
        >
            <ChatIcon />
        </button>
    );
};
