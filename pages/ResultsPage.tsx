import React from 'react';
import { AnalysisResult, Signal, TrendDirection } from '../types';
import { BuyIcon, SellIcon, HoldIcon } from '../components/icons/SignalIcons';
import { ConfidenceMeter } from '../components/results/ConfidenceMeter';
import { ReadAloudButton } from '../components/results/ReadAloudButton';

interface ResultsPageProps {
    result: AnalysisResult;
    onGoBack: () => void;
}

const getSignalAppearance = (signal: Signal) => {
    switch (signal) {
        case Signal.BUY:
            return {
                text: 'BUY',
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/50',
                icon: <BuyIcon />,
            };
        case Signal.SELL:
            return {
                text: 'SELL',
                color: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/50',
                icon: <SellIcon />,
            };
        case Signal.HOLD:
        default:
            return {
                text: 'HOLD',
                color: 'text-gray-400',
                bgColor: 'bg-gray-500/10',
                borderColor: 'border-gray-500/50',
                icon: <HoldIcon />,
            };
    }
};

const MetricCard: React.FC<{ title: string; value: React.ReactNode; subValue?: string; className?: string }> = ({ title, value, subValue, className }) => (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-inner text-center ${className}`}>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="text-2xl font-semibold text-white">{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
    </div>
);

// --- New Icon Components ---
const TrendUpIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>);
const TrendDownIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>);
const TrendSidewaysIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>);
const SupportIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const ResistanceIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const RsiIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>);
const MacdIcon: React.FC = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 12L3 8m4 8l4-8m4 8V4m0 12l4-8m-4 8l-4-8m-2 14h12" /></svg>);

const TechnicalCard: React.FC<{ title: string; value: React.ReactNode; subValue?: string; icon: React.ReactNode; }> = ({ title, value, subValue, icon }) => (
    <div className="bg-gray-900/50 p-4 rounded-lg flex items-center space-x-4">
        <div className="flex-shrink-0 text-cyan-400">{icon}</div>
        <div>
            <h4 className="text-sm text-gray-400">{title}</h4>
            <p className="text-lg font-semibold text-white">{value}</p>
            {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
        </div>
    </div>
);


export const ResultsPage: React.FC<ResultsPageProps> = ({ result, onGoBack }) => {
    const { signal, entryPrice, takeProfit, stopLoss, rationale, pair, confidenceLevel, pips, riskRewardRatio, support, resistance, trend, indicators } = result;
    const appearance = getSignalAppearance(signal);

    const isTradeSignal = signal === Signal.BUY || signal === Signal.SELL;

    const generateSummaryText = () => {
        const intro = `AI analysis for ${pair} indicates a ${signal} signal with ${confidenceLevel} percent confidence. The current market trend is identified as ${trend}.`;
        if (isTradeSignal) {
            return `${intro} Suggested entry price is ${entryPrice.toFixed(5)}. Key support is at ${support.toFixed(5)} and resistance is at ${resistance.toFixed(5)}. Take profit is set at ${takeProfit.toFixed(5)}, and stop loss at ${stopLoss.toFixed(5)}.`;
        }
        return `${intro} Key support is at ${support.toFixed(5)} and resistance is at ${resistance.toFixed(5)}. No immediate trade is advised.`;
    };

    const summaryText = generateSummaryText();

     const getTrendInfo = (trend: TrendDirection) => {
        switch(trend) {
            case 'Bullish': return { icon: <TrendUpIcon />, color: 'text-green-400' };
            case 'Bearish': return { icon: <TrendDownIcon />, color: 'text-red-400' };
            default: return { icon: <TrendSidewaysIcon />, color: 'text-gray-400' };
        }
    }
    const trendInfo = getTrendInfo(trend);


    return (
        <div className="max-w-3xl mx-auto animate-fade-in-up space-y-6">
            <div className={`p-6 rounded-xl border ${appearance.borderColor} ${appearance.bgColor} flex flex-col sm:flex-row items-center gap-6 shadow-lg`}>
                <div className="flex-shrink-0">{appearance.icon}</div>
                <div className="text-center sm:text-left">
                    <h2 className={`text-4xl font-bold ${appearance.color}`}>{appearance.text} SIGNAL</h2>
                    <p className="text-xl text-gray-300 font-medium">{pair}</p>
                    <ReadAloudButton textToRead={summaryText} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex justify-center">
                    <ConfidenceMeter level={confidenceLevel} />
                </div>
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                    <MetricCard title="Risk/Reward Ratio" value={isTradeSignal ? riskRewardRatio : 'N/A'} />
                    <MetricCard title="Pips" value={isTradeSignal ? `+${pips.takeProfit}` : 'N/A'} subValue="Take Profit" className="text-green-400" />
                    <MetricCard title="Entry Price" value={isTradeSignal ? entryPrice.toFixed(5) : 'N/A'} />
                    <MetricCard title="Pips" value={isTradeSignal ? `-${pips.stopLoss}` : 'N/A'} subValue="Stop Loss" className="text-red-400" />
                </div>
            </div>

            <div className="bg-gray-800/70 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Technical Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <TechnicalCard 
                        title="Trend"
                        value={<span className={trendInfo.color}>{trend}</span>}
                        icon={trendInfo.icon}
                    />
                    <TechnicalCard 
                        title="Support"
                        value={isTradeSignal ? support.toFixed(5) : 'N/A'}
                        icon={<SupportIcon />}
                    />
                    <TechnicalCard 
                        title="Resistance"
                        value={isTradeSignal ? resistance.toFixed(5) : 'N/A'}
                        icon={<ResistanceIcon />}
                    />
                    <TechnicalCard 
                        title="RSI"
                        value={String(indicators.rsi.value.toFixed(1))}
                        subValue={indicators.rsi.interpretation}
                        icon={<RsiIcon />}
                    />
                    <TechnicalCard 
                        title="MACD"
                        value={indicators.macd.signal.replace(' Crossover', '')}
                        subValue="Signal"
                        icon={<MacdIcon />}
                    />
                </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <MetricCard title="Take Profit Level" value={isTradeSignal ? takeProfit.toFixed(5) : 'N/A'} className="!text-green-400" />
                 <MetricCard title="Stop Loss Level" value={isTradeSignal ? stopLoss.toFixed(5) : 'N/A'} className="!text-red-400" />
            </div>

            <div className="bg-gray-800/70 p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">AI Rationale</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{rationale}</p>
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={onGoBack}
                    className="h-12 px-8 text-lg text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
                >
                    Analyze Another
                </button>
            </div>
        </div>
    );
};