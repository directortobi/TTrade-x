import React, { useState } from 'react';
import { AnalysisResult, Signal, TrendDirection, UiDerivContractType, View } from '../types';
import { BuyIcon, SellIcon, HoldIcon } from '../components/icons/SignalIcons';
import { ConfidenceMeter } from '../components/results/ConfidenceMeter';
import { ReadAloudButton } from '../components/icons/ReadAloudButton';
import { useSignal } from '../contexts/SignalContext';

interface ResultsPageProps {
    result: AnalysisResult;
    onGoBack: () => void;
    onNavigate: (view: View) => void;
}

const getSignalAppearance = (signal: Signal) => {
    switch (signal) {
        case Signal.BUY:
            return {
                text: 'BUY',
                color: 'text-emerald-400',
                bgColor: 'bg-emerald-500/5',
                borderColor: 'border-emerald-500/20',
                icon: <BuyIcon />,
                glow: 'shadow-emerald-900/10'
            };
        case Signal.SELL:
            return {
                text: 'SELL',
                color: 'text-rose-400',
                bgColor: 'bg-rose-500/5',
                borderColor: 'border-rose-500/20',
                icon: <SellIcon />,
                glow: 'shadow-rose-900/10'
            };
        case Signal.HOLD:
        default:
            return {
                text: 'HOLD',
                color: 'text-slate-400',
                bgColor: 'bg-slate-500/5',
                borderColor: 'border-slate-500/20',
                icon: <HoldIcon />,
                glow: 'shadow-slate-900/10'
            };
    }
};

const MetricCard: React.FC<{ title: string; value: string; colorClass?: string }> = ({ title, value, colorClass = 'text-white' }) => (
    <div className="bg-gray-800/40 border border-gray-800 p-5 rounded-3xl text-center">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{title}</p>
        <p className={`text-xl font-black ${colorClass}`}>{value}</p>
    </div>
);

const IndicatorChip: React.FC<{ label: string; value: string; trend?: 'up' | 'down' | 'neutral' }> = ({ label, value, trend }) => (
    <div className="flex items-center justify-between p-4 bg-gray-900/40 rounded-2xl border border-gray-800/50">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{value}</span>
            {trend === 'up' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
            {trend === 'down' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>}
        </div>
    </div>
);

export const ResultsPage: React.FC<ResultsPageProps> = ({ result, onGoBack, onNavigate }) => {
    const { signal, entryPrice, takeProfit, stopLoss, rationale, pair, confidenceLevel, riskRewardRatio, trend, indicators } = result;
    const appearance = getSignalAppearance(signal);
    const { setSignal } = useSignal();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isTradeSignal = signal === Signal.BUY || signal === Signal.SELL;
    
    const handleTradeSignal = (contractType: UiDerivContractType) => {
        setSignal(result, contractType);
        onNavigate('derivTrader');
    };

    const TradeSignalModal: React.FC = () => (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-gray-800 border border-gray-700 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-8 text-center bg-gradient-to-b from-gray-700/30 to-transparent">
                    <h3 className="text-xl font-bold text-white">Execution Mode</h3>
                    <p className="text-sm text-gray-400 mt-2">Trade this <span className={appearance.color}>{signal}</span> signal on Deriv</p>
                </div>
                <div className="p-6 space-y-3">
                    <button onClick={() => handleTradeSignal('multiplier')} className="w-full group p-5 bg-gray-900/50 hover:bg-cyan-600 rounded-2xl transition-all border border-gray-700 hover:border-cyan-400">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-200 group-hover:text-white">Multiplier</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </div>
                    </button>
                    <button onClick={() => handleTradeSignal('higher_lower')} className="w-full group p-5 bg-gray-900/50 hover:bg-cyan-600 rounded-2xl transition-all border border-gray-700 hover:border-cyan-400">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-200 group-hover:text-white">Higher / Lower</span>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                        </div>
                    </button>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-full py-6 text-xs font-bold text-gray-500 hover:text-gray-300 uppercase tracking-widest">Close</button>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in-up">
            {isModalOpen && <TradeSignalModal />}

            {/* Signal Hero Header */}
            <div className={`relative overflow-hidden rounded-[2.5rem] border ${appearance.borderColor} ${appearance.bgColor} p-10 sm:p-14 text-center shadow-2xl ${appearance.glow}`}>
                <div className="relative z-10 space-y-4">
                    <p className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-4">Signal Detected for {pair}</p>
                    <div className="flex items-center justify-center gap-4 mb-2">
                         <div className="p-3 bg-gray-900/50 rounded-2xl">
                             {appearance.icon}
                         </div>
                         <h2 className={`text-6xl sm:text-8xl font-black ${appearance.color} tracking-tighter`}>{appearance.text}</h2>
                    </div>
                    <div className="flex flex-col items-center gap-4 pt-4">
                        <ReadAloudButton textToRead={`Signal identified for ${pair}: ${signal}. Confidence level is ${confidenceLevel} percent.`} />
                    </div>
                </div>
                {/* Background Glows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-radial from-cyan-500/5 to-transparent opacity-50"></div>
            </div>

            {/* Confidence & Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                <div className="md:col-span-4 bg-gray-800/20 border border-gray-800 rounded-[2rem] p-6 flex items-center justify-center">
                    <ConfidenceMeter level={confidenceLevel} />
                </div>
                <div className="md:col-span-8 grid grid-cols-2 gap-4">
                    <MetricCard title="Entry Price" value={isTradeSignal ? entryPrice.toFixed(5) : 'N/A'} />
                    <MetricCard title="Risk / Reward" value={isTradeSignal ? riskRewardRatio : 'N/A'} colorClass="text-cyan-400" />
                    <MetricCard title="Take Profit" value={isTradeSignal ? takeProfit.toFixed(5) : 'N/A'} colorClass="text-emerald-400" />
                    <MetricCard title="Stop Loss" value={isTradeSignal ? stopLoss.toFixed(5) : 'N/A'} colorClass="text-rose-400" />
                </div>
            </div>

            {/* Technical Breakdown */}
            <div className="bg-gray-800/20 border border-gray-800/60 rounded-[2rem] p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white tracking-tight">Technical Indicators</h3>
                    <div className="px-3 py-1 bg-gray-900/60 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-800">Verified by AI</div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <IndicatorChip label="Trend" value={trend} trend={trend === 'Bullish' ? 'up' : trend === 'Bearish' ? 'down' : 'neutral'} />
                    <IndicatorChip label="RSI (14)" value={indicators.rsi.value.toFixed(1)} trend={indicators.rsi.value < 30 ? 'up' : indicators.rsi.value > 70 ? 'down' : 'neutral'} />
                    <IndicatorChip label="MACD" value={indicators.macd.signal.split(' ')[0]} />
                    <IndicatorChip label="Momentum" value={confidenceLevel > 70 ? 'Strong' : 'Steady'} />
                </div>
            </div>

            {/* Rationale Section */}
            <div className="bg-gray-900/40 border border-gray-800/80 rounded-[2rem] p-8 sm:p-12 space-y-8">
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">Market Rationale</h3>
                    <p className="text-sm text-gray-500">A detailed breakdown of why this signal was generated.</p>
                </div>
                
                <div className="prose prose-invert max-w-none">
                    <div className="p-8 bg-gray-800/20 rounded-3xl border border-gray-800 italic text-gray-300 leading-relaxed font-medium">
                         "{rationale}"
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-40">
                <div className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 p-2 rounded-[2rem] shadow-2xl flex gap-2">
                    <button 
                        onClick={onGoBack} 
                        className="flex-1 py-4 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                    >
                        Dismiss
                    </button>
                    {isTradeSignal && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex-[2] py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-black rounded-[1.5rem] transition-all shadow-xl shadow-cyan-900/20 active:scale-[0.98]"
                        >
                            Execute Trade
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};