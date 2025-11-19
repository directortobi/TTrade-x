
import React from 'react';
import { View } from '../types';

interface InstructionsPageProps {
    onNavigate: (view: View) => void;
}

const GuideSection: React.FC<{ title: string; icon: React.ReactNode; steps: string[] }> = ({ title, icon, steps }) => (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors duration-300">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-900/80 rounded-lg text-cyan-400 shadow-lg">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <ul className="space-y-3">
            {steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-400 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-700 text-gray-300 rounded-full text-xs font-mono mt-0.5">
                        {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                </li>
            ))}
        </ul>
    </div>
);

// Icons
const AnalyzeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);
const TokensIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4.5a1.5 1.5 0 001.5-1.5V3a1.5 1.5 0 00-1.5-1.5H12a1.5 1.5 0 00-1.5 1.5v1.5m1.5 0h-1.5M12 9a2.25 2.25 0 00-2.25 2.25c0 1.357.868 2.518 2.01 2.934m1.99-5.868A2.25 2.25 0 0114.25 11.25c0 1.357-.868 2.518-2.01 2.934m0-5.868V9.75" />
    </svg>
);

const InstructionsPage: React.FC<InstructionsPageProps> = ({ onNavigate }) => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    How to Use Trade X
                </h1>
                <p className="text-gray-400 mt-2">Master the markets with AI-powered analysis in three simple steps.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GuideSection
                    title="Market Analyst"
                    icon={<AnalyzeIcon />}
                    steps={[
                        "Navigate to the 'Market Analyst' page.",
                        "Select your asset pair (e.g., EUR/USD, BTC/USD) and your preferred trading style (ICT, Swing, Scalper).",
                        "Click 'Analyze Market'. This costs 1 Token.",
                        "Review the AI's detailed report, including Entry Price, Stop Loss, Take Profit, and Rationale.",
                        "Execute the trade on your broker platform based on the signals."
                    ]}
                />
                <GuideSection
                    title="Image Analyzer"
                    icon={<ImageIcon />}
                    steps={[
                        "Take a screenshot of your trading chart (from TradingView, MT4, etc.).",
                        "Navigate to the 'Image Analyzer' page.",
                        "Upload your screenshot. Add any specific questions or notes in the text box.",
                        "Click 'Analyze Image'. This costs 1 Token.",
                        "The AI will interpret the visual patterns, indicators, and structure to give you a second opinion."
                    ]}
                />
                 <GuideSection
                    title="Managing Tokens"
                    icon={<TokensIcon />}
                    steps={[
                        "You start with 0 tokens. Navigate to 'Buy Tokens' to purchase a package.",
                        "Select a package (Starter, Pro, Institutional) and follow the payment instructions.",
                        "Upload your proof of payment. Admin approval usually takes less than 24 hours.",
                        "Once approved, tokens are added to your balance automatically.",
                        "You can request withdrawals of unused tokens via the 'Withdraw' page."
                    ]}
                />
                 <div className="bg-blue-900/30 p-6 rounded-2xl border border-blue-800 flex flex-col justify-center items-center text-center hover:border-blue-700 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-2">Ready to Start?</h3>
                    <p className="text-gray-400 mb-6">Jump straight into the market action.</p>
                    <button
                        onClick={() => onNavigate('market_analyst')}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-blue-900/50"
                    >
                        Go to Analyst
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructionsPage;