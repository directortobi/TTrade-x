import React from 'react';

const BellIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

interface NotificationIconProps {
    unreadCount: number;
    onClick: () => void;
}

export const NotificationIcon: React.FC<NotificationIconProps> = ({ unreadCount, onClick }) => {
    return (
        <button onClick={onClick} className="relative p-2 rounded-full text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors">
            <BellIcon />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 block h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold ring-2 ring-gray-900">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
};
