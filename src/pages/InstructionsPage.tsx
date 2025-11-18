import React from 'react';
import { View } from '../MainApp';

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
const ChartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
);
const TokenIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4.5a1.5 1.5 0 001.5-1.5V3a1.5 1.5 0 00-1.5-1.5H12a1.5 1.5 0 00-1.5 1.5v1.5m1.5 0h-1.5M12 9a2.25 2.25 0 00-2.25 2.25c0 1.357.868 2.518 2.01 2.934m1.99-5.868A2.25 2.25 0 0114.25 11.25c0 1.357-.868 2.518-2.01 2.934m0-5.868V9.75" />
    </svg>
);

export const InstructionsPage: React.FC<InstructionsPageProps> = ({ onNavigate }) => {
    return (
        <div className="max-w-6xl mx-auto animate-fade-in space-y-8 pb-12">
            <div className="text-center py-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                    How to use <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">Trade X</span>
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                    Your AI-powered companion for smarter trading decisions. Follow this guide to maximize your trading potential.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GuideSection
                    title="AI Market Analyst"
                    icon={<AnalyzeIcon />}
                    steps={[
                        "Navigate to the 'Market Analyst' page from the menu.",
                        "Choose an asset (Forex, Crypto, or Indices) from the dropdown.",
                        "Select a 'Trading Style' (Scalper, Day Trader, Swing) or a specific Timeframe.",
                        "Click 'Analyze Market'. This will cost 1 Token.",
                        "Review the generated signal, including Entry Price, Stop Loss, Take Profit, and a detailed AI rationale.",
                        "Use the 'Trade this Signal' button to quickly execute the trade on Deriv."
                    ]}
                />

                <GuideSection
                    title="Image Chart Analyzer"
                    icon={<ImageIcon />}
                    steps={[
                        "Take a screenshot of your chart from TradingView, MT4, or MT5.",
                        "Navigate to the 'Image Analyzer' page.",
                        "Upload the image file (PNG, JPG).",
                        "Optionally, add your own notes or questions in the text box.",
                        "Click 'Analyze'. The AI will interpret the visual patterns, indicators, and market structure to give a second opinion."
                    ]}
                />

                <GuideSection
                    title="Interactive Chart"
                    icon={<ChartIcon />}
                    steps={[
                        "Go to the 'Chart' page for a live, interactive experience.",
                        "Select an asset to view its real-time candlestick chart.",
                        "Use the drawing tools (Trendlines, Horizontal Lines) to mark up the chart.",
                        "Add indicators like RSI, MACD, and Bollinger Bands from the settings.",
                        "Click 'Analyze Chart' to have the AI analyze the current view along with your drawings (1 Token)."
                    ]}
                />

                <GuideSection
                    title="Tokens & Management"
                    icon={<TokenIcon />}
                    steps={[
                        "Each detailed AI analysis costs 1 Token.",
                        "Navigate to 'Profile' > 'Buy Tokens' to top up your balance.",
                        "Select a package, make the payment, and upload proof.",
                        "Admins will review and credit your tokens shortly.",
                        "Share your Referral Code found in your Profile to earn 20% commission on your friends' purchases."
                    ]}
                />
            </div>

             <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-8 rounded-2xl border border-blue-800/30 text-center mt-8">
                <h3 className="text-2xl font-bold text-white mb-4">Ready to make your first trade?</h3>
                <div className="flex justify-center gap-4 flex-wrap">
                    <button
                        onClick={() => onNavigate('market_analyst')}
                        className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-green-500/20"
                    >
                        Start Analyzing
                    </button>
                    <button
                        onClick={() => onNavigate('dashboard')}
                        className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstructionsPage;