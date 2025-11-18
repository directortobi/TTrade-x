import React from 'react';
// FIX: Add .ts extension to import path.
import { AppUser } from '../types';
// FIX: Add .tsx extension to import path.
import { View } from '../MainApp';
// FIX: Add .tsx extension to import path.
import TradingViewMarketOverviewWidget from '../components/TradingViewMarketOverviewWidget';
// FIX: Add .tsx extension to import path.
import RecentSignals from '../components/dashboard/RecentSignals';

interface DashboardPageProps {
    user: AppUser;
    onNavigate: (view: View) => void;
}

const ProfileIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>);
const TokensIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4.5a1.5 1.5 0 001.5-1.5V3a1.5 1.5 0 00-1.5-1.5H12a1.5 1.5 0 00-1.5 1.5v1.5m1.5 0h-1.5M12 9a2.25 2.25 0 00-2.25 2.25c0 1.357.868 2.518 2.01 2.934m1.99-5.868A2.25 2.25 0 0114.25 11.25c0 1.357-.868 2.518-2.01 2.934m0-5.868V9.75" /></svg>);


const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">{user.auth.email?.split('@')[0]}</span>
                </h1>
                <p className="text-gray-400 mt-2">Here's your real-time market overview and account status.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-blue-900/50 p-6 rounded-xl border border-blue-800 shadow-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex--- START OF FILE pages/ComingSoonPage.tsx ---

import React from 'react';

interface ComingSoonPageProps {
    title: string;
    description: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description }) => {
    return (
        <div className="max-w-4xl mx-auto text-center py-16 animate-fade-in">
            <div className="bg-blue-900/50 p-12 rounded-2xl border border-blue-800 shadow-lg">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400 mb-4">
                    {title}
                </h1>
                <p className="text-lg text-gray-400 mb-2">
                    This feature is coming soon!
                </p>
                <p className="text-gray-500">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default ComingSoonPage;