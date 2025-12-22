import React from 'react';
import { AppUser, View } from '../types';
import { AppLogo } from './AppLogo';

interface HeaderProps {
    user: AppUser | null;
    currentView: View;
    onNavigate: (view: View) => void;
    onLogout: () => void;
    unreadCount: number;
    onNotificationsViewed: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, currentView, onNavigate, onLogout }) => {
    const navItems: { label: string, view: View }[] = [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'Market Analyst', view: 'market_analyst' },
        { label: 'Charts', view: 'chart' },
        { label: 'History', view: 'history' },
    ];

    return (
        <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-gray-900/80 border-b border-gray-800/50 px-4 sm:px-8 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="cursor-pointer transition-transform active:scale-95" onClick={() => onNavigate('dashboard')}>
                        <AppLogo />
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => (
                            <button
                                key={item.view}
                                onClick={() => onNavigate(item.view)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    currentView === item.view
                                        ? 'bg-cyan-500/10 text-cyan-400 shadow-[inset_0_0_12px_rgba(34,211,238,0.1)]'
                                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex items-center gap-3 sm:gap-6">
                    {user && (
                        <div className="flex items-center gap-4">
                            <div 
                                onClick={() => onNavigate('profile')}
                                className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors"
                            >
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                                    {user.profile.email.charAt(0)}
                                </div>
                                <span className="text-xs font-semibold text-gray-300">
                                    {user.profile.tokens} <span className="text-gray-500 font-normal">Tokens</span>
                                </span>
                            </div>
                            
                            <button 
                                onClick={() => onNavigate('market_analyst')}
                                className="hidden lg:block px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-full transition-all shadow-lg shadow-cyan-900/20 active:scale-95"
                            >
                                New Analysis
                            </button>

                            <button 
                                onClick={onLogout}
                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};