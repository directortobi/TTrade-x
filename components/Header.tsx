import React, { useState } from 'react';
import { AppUser } from '../types';
import { View } from '../MainApp';
import { ProfileIcon } from './icons/ProfileIcon';
import { ThemeToggle } from './ThemeToggle';
import { AppLogo } from './AppLogo';

interface HeaderProps {
    activeView: View;
    onNavigate: (view: View) => void;
    user: AppUser;
    onLogout: () => void;
    isAdmin: boolean;
}

const NavItem: React.FC<{
    label: string;
    view: View;
    activeView: View;
    onNavigate: (view: View) => void;
}> = ({ label, view, activeView, onNavigate }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => onNavigate(view)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
            }`}
        >
            {label}
        </button>
    );
};

export const Header: React.FC<HeaderProps> = ({ activeView, onNavigate, user, onLogout, isAdmin }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const navItems: { label: string; view: View; adminOnly?: boolean }[] = [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'Market Scanner', view: 'marketScan' },
        { label: 'Chart Upload', view: 'forexScanner' },
        { label: 'Trading History', view: 'history' },
        { label: 'Strategies', view: 'strategies' },
        { label: 'Buy Tokens', view: 'buyTokens' },
        { label: 'Withdraw', view: 'withdraw' },
        { label: 'Referrals', view: 'referralProgram' },
        { label: 'Admin', view: 'adminDashboard', adminOnly: true },
        { label: 'About Us', view: 'about' },
    ];
    
    return (
        <header className="bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-800">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <button onClick={() => onNavigate('dashboard')} className="flex-shrink-0">
                            <AppLogo />
                        </button>
                        <nav className="hidden md:flex items-center ml-10 space-x-2">
                            {navItems.map(item => (
                                (!item.adminOnly || isAdmin) && (
                                    <NavItem
                                        key={item.view}
                                        label={item.label}
                                        view={item.view}
                                        activeView={activeView}
                                        onNavigate={onNavigate}
                                    />
                                )
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                         <div className="hidden sm:flex items-center gap-2">
                            <span className="text-sm text-gray-400">Tokens:</span>
                            <span className="font-bold text-white">{user.profile.tokens}</span>
                        </div>
                        <ThemeToggle />
                        <button onClick={() => onNavigate('profile')} className="p-2 rounded-full text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors">
                            <ProfileIcon />
                        </button>
                         <button onClick={onLogout} className="hidden sm:block px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-md hover:bg-gray-700 hover:text-white transition-colors">
                            Logout
                        </button>
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                         {navItems.map(item => (
                            (!item.adminOnly || isAdmin) && (
                                <button
                                    key={item.view}
                                    onClick={() => {
                                        onNavigate(item.view);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium ${
                                        activeView === item.view
                                            ? 'bg-gray-700 text-white'
                                            : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            )
                        ))}
                        <button onClick={onLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700/50 hover:text-white">
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};