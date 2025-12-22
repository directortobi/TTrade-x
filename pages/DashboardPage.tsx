import React from 'react';
import { AppUser, View } from '../types';
import TradingViewMarketOverviewWidget from '../components/TradingViewMarketOverviewWidget';
import RecentSignals from '../components/dashboard/RecentSignals';

interface DashboardPageProps {
    user: AppUser;
    onNavigate: (view: View) => void;
}

const TokenBadge: React.FC<{ tokens: number, onClick: () => void }> = ({ tokens, onClick }) => (
    <div className="bg-gray-900/40 border border-gray-800 p-6 rounded-3xl group transition-all hover:border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Available Credits</span>
            <div className="p-2 bg-cyan-500/10 rounded-xl group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
        </div>
        <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">{tokens}</span>
            <span className="text-sm font-medium text-gray-400">Tokens</span>
        </div>
        <button 
            onClick={onClick}
            className="w-full mt-6 py-3 bg-gray-800 hover:bg-cyan-600 text-white text-sm font-bold rounded-2xl transition-all duration-300 group-hover:shadow-lg active:scale-[0.98]"
        >
            Add More
        </button>
    </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
    return (
        <div className="max-w-7xl mx-auto space-y-10 py-6 px-4 animate-fade-in">
            {/* Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">{user.auth.email?.split('@')[0]}</span>
                    </h1>
                    <p className="text-lg text-gray-400 mt-2 font-medium">Your AI trading co-pilot is ready.</p>
                </div>
                <div className="flex items-center gap-3">
                     <button onClick={() => onNavigate('instructions')} className="px-5 py-2.5 rounded-2xl bg-gray-800 border border-gray-700 text-gray-300 text-sm font-semibold hover:bg-gray-700 transition-colors">
                        User Guide
                    </button>
                    <button onClick={() => onNavigate('market_analyst')} className="px-6 py-3 rounded-2xl bg-cyan-600 text-white text-sm font-black hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20 active:scale-95">
                        New Analysis
                    </button>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Insights Column */}
                <div className="xl:col-span-4 space-y-8">
                    <TokenBadge tokens={user.profile.tokens} onClick={() => onNavigate('buyTokens')} />
                    
                    <div className="bg-gray-800/20 border border-gray-800/50 p-6 rounded-3xl">
                        <RecentSignals onNavigate={onNavigate} />
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-white mb-2">Refer & Earn</h3>
                            <p className="text-indigo-100/80 text-sm leading-relaxed mb-6">Invite friends and get 20% commission on every package they buy.</p>
                            <button 
                                onClick={() => onNavigate('referrals')}
                                className="px-6 py-2.5 bg-white text-indigo-600 text-xs font-black rounded-full hover:bg-indigo-50 transition-colors"
                            >
                                Open Referral Dashboard
                            </button>
                        </div>
                        {/* Decorative Element */}
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    </div>
                </div>

                {/* Market Overview Column */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-[2rem] p-2 h-[750px] shadow-inner relative">
                        <div className="absolute top-6 left-6 z-10 flex items-center gap-2 pointer-events-none">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Market Data</span>
                        </div>
                        <TradingViewMarketOverviewWidget />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;