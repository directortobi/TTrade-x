import React from 'react';
import { AppUser } from '../types';
import { View } from '../MainApp';
import TradingViewMarketOverviewWidget from '../components/TradingViewMarketOverviewWidget';
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
                            <div className="flex items-center gap-4">
                                <div className="text-sky-400">
                                    <ProfileIcon />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Profile & Balance</h2>
                                    <p className="text-sm text-gray-400 truncate">{user.profile.email}</p>
                                </div>
                            </div>
                            <button onClick={() => onNavigate('profile')} className="px-3 py-1.5 text-xs font-semibold text-white bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors border border-gray-600">
                                Manage
                            </button>
                        </div>
                        <div className="mt-6 border-t border-blue-800 pt-4">
                            <p className="text-sm text-gray-400">Available Tokens</p>
                            <div className="flex items-center gap-4 mt-2">
                                <p className="text-5xl font-bold text-white">{user.profile.tokens}</p>
                                <div className="text-sky-400">
                                  <TokensIcon/>
                                </div>
                            </div>
                            <button
                                onClick={() => onNavigate('buyTokens')}
                                className="mt-4 w-full px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Buy More Tokens
                            </button>
                        </div>
                    </div>

                    {/* Help Card */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
                        <h3 className="text-lg font-bold text-white mb-2">Need Help?</h3>
                        <p className="text-sm text-gray-400 mb-4">Learn how to use Trade X features effectively.</p>
                        <button 
                            onClick={() => onNavigate('instructions')} 
                            className="w-full py-2 text-sm font-semibold text-cyan-400 bg-cyan-900/20 rounded-lg hover:bg-cyan-900/40 transition-colors border border-cyan-800"
                        >
                            View Instructions
                        </button>
                    </div>

                     <RecentSignals onNavigate={onNavigate} />
                </div>

                {/* Right Column */}
                <div className="lg:col-span-3">
                     <div className="h-[65vh] bg-blue-950/50 rounded-xl border border-blue-800 p-1">
                        <TradingViewMarketOverviewWidget />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;