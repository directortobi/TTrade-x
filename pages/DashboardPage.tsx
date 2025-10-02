import React from 'react';
import { AppUser } from '../types';
import { View } from '../MainApp';

interface DashboardPageProps {
    user: AppUser;
    onNavigate: (view: View) => void;
}

const FeatureCard: React.FC<{ title: string; description: string; onClick: () => void; icon: React.ReactNode }> = ({ title, description, onClick, icon }) => (
    <button
        onClick={onClick}
        className="bg-blue-900/50 p-6 rounded-xl border border-blue-800 shadow-sm hover:shadow-lg hover:border-blue-500 transition-all duration-300 text-left w-full h-full flex flex-col"
    >
        <div className="flex-shrink-0 text-sky-400 mb-3">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-400 flex-grow">{description}</p>
    </button>
);

const ScanIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>);
const UploadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>);
const TokensIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4.5a1.5 1.5 0 001.5-1.5V3a1.5 1.5 0 00-1.5-1.5H12a1.5 1.5 0 00-1.5 1.5v1.5m1.5 0h-1.5M12 9a2.25 2.25 0 00-2.25 2.25c0 1.357.868 2.518 2.01 2.934m1.99-5.868A2.25 2.25 0 0114.25 11.25c0 1.357-.868 2.518-2.01 2.934m0-5.868V9.75" /></svg>);


const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">{user.auth.email?.split('@')[0]}</span>
                </h1>
                <p className="text-gray-400 mt-2">Here's your overview. What would you like to do today?</p>
            </div>

            <div className="p-6 bg-blue-900/50 rounded-2xl border border-blue-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <p className="text-sm text-gray-400">Available Analysis Tokens</p>
                    <p className="text-4xl font-bold text-white">{user.profile.tokens}</p>
                </div>
                <button
                    onClick={() => onNavigate('buyTokens')}
                    className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                    Buy More Tokens
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard 
                    title="Market Scanner"
                    description="Get live, AI-powered analysis for any asset and timeframe using various trading strategies."
                    onClick={() => onNavigate('marketScan')}
                    icon={<ScanIcon />}
                />
                 <FeatureCard 
                    title="Chart Upload"
                    description="Upload a chart image or screenshot for an in-depth institutional analysis from the AI."
                    onClick={() => onNavigate('forexScanner')}
                    icon={<UploadIcon />}
                />
                 <FeatureCard 
                    title="Buy Tokens"
                    description="Securely purchase more analysis tokens to continue leveraging the power of our AI."
                    onClick={() => onNavigate('buyTokens')}
                    icon={<TokensIcon />}
                />
            </div>
        </div>
    );
};

export default DashboardPage;