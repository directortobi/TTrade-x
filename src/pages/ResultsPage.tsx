
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

const KeyLevelsIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
);

const RationaleIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);


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

const RationaleItem: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg">
        <div className="flex-shrink-0 text-cyan-400 mt-1">{icon}</div>
        <div className="text-gray-300">{children}</div>
    </div>
);


export const ResultsPage: React.FC<ResultsPageProps> = ({ result, onGoBack, onNavigate }) => {
    const { signal, entryPrice, takeProfit, stopLoss, rationale, pair, confidenceLevel, pips, riskRewardRatio, support, resistance, trend, indicators } = result;
    const appearance = getSignalAppearance(signal);
    const { setSignal } = useSignal();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isTradeSignal = signal === Signal.BUY || signal === Signal.SELL;
    
    const handleTradeSignal = (contractType: UiDerivContractType) => {
        setSignal(result, contractType);
        onNavigate('derivTrader');
    };

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

    const TradeSignalModal: React.FC = () => (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <h3 className="text-lg font-semibold text-white">How do you want to trade this <span className={appearance.color}>{result.signal}</span> signal?</h3>
                    <p className="text-sm text-gray-400 mt-2">Select a Deriv contract type to pre-fill the trading form.</p>
                </div>
                <div className="p-4 space-y-3">
                     <button onClick={() => handleTradeSignal('multiplier')} className="w-full text-left p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors">
                        <p className="font-semibold text-cyan-400">Multiplier</p>
                        <p className="text-xs text-gray-400">Trade with leverage, Take Profit, and Stop Loss.</p>
                    </button>
                    <button onClick={() => handleTradeSignal('higher_lower')} className="w-full text-left p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors">
                        <p className="font-semibold text-cyan-400">Higher / Lower</p>
                        <p className="text-xs text-gray-400">Predict if the exit spot is higher or lower than a barrier.</p>
                    </button>
                    <button onClick={() => handleTradeSignal('reset')} className="w-full text-left p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors">
                        <p className="font-semibold text-cyan-400">Reset Call / Reset Put</p>
                        <p className="text-xs text-gray-400">Win if the exit spot is higher/lower than the entry spot.</p>
                    </button>
                </div>
                <div className="p-4 border-t border-gray-700 text-right">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-300 rounded-lg hover:bg-gray-700">Cancel</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto animate-fade-in-up space-y-6">
            {isModalOpen && <TradeSignalModal />}
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
                        value={support.toFixed(5)}
                        icon={<SupportIcon />}
                    />
                    <TechnicalCard 
                        title="Resistance"
                        value={resistance.toFixed(5)}
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

             <div className="bg-gray-800/70 p-6 rounded-lg border border-gray-700 space-y-4">
                <h3 className="text-xl font-semibold text-cyan-400">AI Rationale Breakdown</h3>
                <div className="space-y-4">
                    <RationaleItem icon={<div className={trendInfo.color}>{trendInfo.icon}</div>}>
                        <p dangerouslySetInnerHTML={{ __html: `<strong>Trend:</strong> The analysis indicates a clear <strong>${trend}</strong> market trend. The general direction of price action supports this momentum.` }} />
                    </RationaleItem>
                    <RationaleItem icon={<KeyLevelsIcon />}>
                        <p dangerouslySetInnerHTML={{ __html: `<strong>Support & Resistance:</strong> Key levels have been identified. Immediate support is at <strong>${support.toFixed(5)}</strong>, with resistance at <strong>${resistance.toFixed(5)}</strong>. These levels are critical for defining trade boundaries.` }} />
                    </RationaleItem>
                    <RationaleItem icon={<RsiIcon />}>
                        <p dangerouslySetInnerHTML={{ __html: `<strong>RSI Analysis:</strong> The Relative Strength Index (RSI) is at <strong>${indicators.rsi.value.toFixed(1)}</strong>, which suggests the market is in a <strong>${indicators.rsi.interpretation}</strong> state.` }} />
                    </RationaleItem>
                    <RationaleItem icon={<MacdIcon />}>
                        <p dangerouslySetInnerHTML={{ __html: `<strong>MACD Analysis:</strong> The MACD indicator is showing a <strong>${indicators.macd.signal}</strong>, confirming momentum in the direction of the trend.` }} />
                    </RationaleItem>
                    <div className="border-t border-gray-700 !my-6"></div>
                    <RationaleItem icon={<RationaleIcon />}>
                        <div>
                            <p className="font-semibold text-gray-200 mb-2">Full AI Commentary</p>
                            <p className="leading-relaxed whitespace-pre-wrap text-gray-400">{rationale}</p>
                        </div>
                    </RationaleItem>
                </div>
            </div>

            <div className="mt-8 flex justify-center items-center gap-4">
                <button
                    onClick={onGoBack}
                    className="h-12 px-8 text-lg text-white font-semibold bg-gray-600 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
                >
                    Analyze Another
                </button>
                {isTradeSignal && (
                     <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-12 px-8 text-lg text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 animate-pulse"
                    >
                        Trade this Signal on Deriv
                    </button>
                )}
            </div>
        </div>
    );
};
