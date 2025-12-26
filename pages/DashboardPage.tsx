import React from 'react';
import { AppUser, View } from '../types';
import TradingViewMarketOverviewWidget from '../components/TradingViewMarketOverviewWidget';
import RecentSignals from '../components/dashboard/RecentSignals';

interface DashboardPageProps {
    user: AppUser;
    onNavigate: (view: View) => void;
}

const TokenBadge: React.FC<{ tokens: number, onClick: () => void }> = ({ tokens, onClick }) => (
    <div className="bg-[#050505] border border-white/5 p-8 rounded-[2.5rem] group transition-all hover:border-cyan-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Operational Credits</span>
            <div className="p-3 bg-cyan-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
        </div>
        <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-7xl font-black text-white tracking-tighter">{tokens}</span>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Tokens</span>
        </div>
        <button 
            onClick={onClick}
            className="w-full mt-8 py-4 bg-white/5 hover:bg-cyan-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 group-hover:shadow-lg active:scale-[0.98]"
        >
            Add More
        </button>
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full pointer-events-none"></div>
    </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
    return (
        <div className="max-w-7xl mx-auto space-y-12 py-8 px-4 animate-fade-in">
            {/* Greeting Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tighter leading-none">
                        Pulse<span className="text-cyan-500">.</span>
                    </h1>
                    <p className="text-xl text-gray-500 mt-4 font-medium max-w-md">The next generation of AI trading analysis starts here.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => onNavigate('instructions')} 
                        className="px-6 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-gray-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                    >
                        Guides
                    </button>
                    <button 
                        onClick={() => onNavigate('market_analyst')} 
                        className="px-8 py-3.5 rounded-2xl bg-cyan-600 text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-cyan-500 transition-all shadow-xl shadow-cyan-900/20 active:scale-95 glow-cyan"
                    >
                        New Probe
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Insights Column */}
                <div className="xl:col-span-4 space-y-10">
                    <TokenBadge tokens={user.profile.tokens} onClick={() => onNavigate('buyTokens')} />
                    
                    <div className="bg-[#050505] border border-white/5 p-8 rounded-[2.5rem] shadow-2xl">
                        <RecentSignals onNavigate={onNavigate} />
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Expansion Protocol</h3>
                            <p className="text-blue-200/60 text-sm leading-relaxed mb-8 font-medium">Unlock 20% commission by referring other institutional traders to Pulse.</p>
                            <button 
                                onClick={() => onNavigate('referrals')}
                                className="px-8 py-3.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-cyan-400 transition-all duration-500"
                            >
                                Referral Dashboard
                            </button>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
                    </div>
                </div>

                {/* Market Overview Column */}
                <div className="xl:col-span-8 space-y-10">
                    <div className="bg-[#020202] border border-white/5 rounded-[3rem] p-4 h-[850px] shadow-inner relative overflow-hidden group">
                        <div className="absolute top-10 left-10 z-10 flex items-center gap-3 pointer-events-none">
                            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_#06b6d4]"></div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Quantum Market Stream</span>
                        </div>
                        <div className="w-full h-full rounded-[2.5rem] overflow-hidden grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700">
                             <TradingViewMarketOverviewWidget />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;