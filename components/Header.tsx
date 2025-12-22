
import React from 'react';
import { AppUser, View } from '../types';

interface HeaderProps {
    user: AppUser | null;
    currentView: View;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    unreadCount: number;
    onNotificationsViewed: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, currentView, onNavigate, onLogout, unreadCount }) => (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <h1 className="text-2xl font-bold text-cyan-400">Trade X</h1>
        </div>
        <nav className="flex items-center gap-6">
            <button onClick={() => onNavigate('market_analyst')} className={`text-sm ${currentView === 'market_analyst' ? 'text-cyan-400' : 'text-gray-400'}`}>Analyst</button>
            <button onClick={() => onNavigate('dashboard')} className={`text-sm ${currentView === 'dashboard' ? 'text-cyan-400' : 'text-gray-400'}`}>Dashboard</button>
            {user && <button onClick={onLogout} className="text-sm text-red-400">Logout</button>}
        </nav>
    </header>
);
