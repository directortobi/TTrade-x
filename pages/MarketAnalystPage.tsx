import React, { useState, useCallback } from 'react';
// FIX: Add .tsx extension to import path.
import { AssetSelector } from '../components/results/ForexSelector';
// FIX: Add .tsx extension to import path.
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultsPage } from './ResultsPage';
import { getMarketAnalystPrediction, getTimeframeAnalysis } from '../services/geminiService';
import { fetchCandlestickData } from '../services/marketDataService';
import { useTokenForAnalysis } from '../services/tokenService';
import { logService } from '../services/logService';
// FIX: Add .ts extension to import path.
import { AnalysisResult, AppUser, Asset, TradingStyle, Timeframe, Signal, View } from '../types';
// FIX: Add .ts extension to import path.
import { AVAILABLE_ASSETS, TRADING_STYLES } from '../constants';
// FIX: Add .tsx extension to import path.
import { CandlestickSpinner } from '../components/CandlestickSpinner';

interface MarketAnalystPageProps {
    user: AppUser;
    onTokenUsed: (newBalance: number) => void;
    // FIX: Add onNavigate to props
    onNavigate: (view: View) => void;
}

type AnalysisMode = 'expert' | Timeframe;

const MODES: { id: AnalysisMode, name: string }[] = [
    { id: 'expert', name: 'Expert Analyst' },
    { id: '1min', name: '1 Min' },
    { id: '5min', name: '5 Min' },
    { id: '15min', name: '15 Min' },
    { id: '1hour', name: '1 Hour' },
    { id: '4hour', name: '4 Hour' },
    { id: '1day', name: 'Daily' },
];

const TradingStyleSelector: React.FC<{
    selectedStyle: TradingStyle;
    onStyleSelect: (style: TradingStyle) => void;
    disabled: boolean;
}> = ({ selectedStyle, onStyleSelect, disabled }) => (
    <div>
        <label htmlFor="style-selector" className="block text-sm font-medium text-gray-400 mb-2">
            Select Trading Style
        </label>
        <select
            id="style-selector"
            value={selectedStyle}
            onChange={(e) => onStyleSelect(e.target.value as TradingStyle)}
            disabled={disabled}
            className="w-full h-12 pl-3 pr-10 text-base text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {TRADING_STYLES.map((style) => (
                <option key={style.id} value={style.id} className="bg-gray-800 text-white">
                    {style.name}
                </option>
            ))}
        </select>
    </div>
);


const MarketAnalystPage: React.FC<MarketAnalystPageProps> = ({ user, onTokenUsed, onNavigate }) => {
    const [mode, setMode] = useState<AnalysisMode>('expert');
    const [selectedAsset, setSelectedAsset] = useState<Asset>(AVAILABLE_ASSETS[0]);
    const [tradingStyle, setTradingStyle] = useState<TradingStyle>(TRADING_STYLES[0].id);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [loadingStep, setLoadingStep] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = useCallback(async () => {
        if (user.profile.tokens < 1) {
            setError("You have 0 tokens. Please buy more to perform a new analysis.");
            return;
        }

        setLoadingStep("Fetching market data...");
        setError(null);
        setAnalysisResult(null);

        try {
            let result: AnalysisResult;
            if (mode === 'expert') {
                const [data1h, data4h, data1d] = await Promise.all([
                    fetchCandlestickData(selectedAsset.ticker, '1hour'),
                    fetchCandlestickData(selectedAsset.ticker, '4hour'),
                    fetchCandlestickData(selectedAsset.ticker, '1day')
                ]);
                setLoadingStep("Analyzing market data with AI...");
                result = await getMarketAnalystPrediction({
                    pair: selectedAsset.ticker,
                    tradingStyle,
                    data1h,
                    data4h,
                    data1d,
                });
            } else {
                // Mode is a timeframe
                const data = await fetchCandlestickData(selectedAsset.ticker, mode as Timeframe);
                setLoadingStep("Analyzing market data with AI...");
                result = await getTimeframeAnalysis({
                    pair: selectedAsset.ticker,
                    timeframe: mode as Timeframe,
                    data,
                });
            }
            
            setLoadingStep("Finalizing analysis...");
            const tokensUsed = result.confidenceLevel > 50 ? 1 : 0;
            await logService.createLog(result, user.auth.email!, tokensUsed, user.auth.id);
            
            if (tokensUsed > 0) {
                const newBalance = await useTokenForAnalysis(user.profile.tokens);
                onTokenUsed(newBalance);
            } else {
                const originalRationale = result.rationale;
                const originalSignal = result.signal;
                result.signal = Signal.HOLD;
                result.entryPrice = 0;
                result.takeProfit = 0;
                result.stopLoss = 0;
                result.pips = { takeProfit: 0, stopLoss: 0 };
                result.riskRewardRatio = 'N/A';
                result.rationale = `AI Confidence (${result.confidenceLevel}%) is at or below the 50% threshold. Signal converted to HOLD (no token charged).\nIt is advisable to wait for a clearer market setup.\n\n--- Original AI Rationale (Signal: ${originalSignal}) ---\n${originalRationale}`;
            }

            setAnalysisResult(result);

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(`Analysis failed: ${err.message}`);
            } else {
                setError("An unknown error occurred during analysis.");
            }
            console.error(err);
        } finally {
            setLoadingStep(null);
        }
    }, [selectedAsset, tradingStyle, mode, user, onTokenUsed]);
    
    const handleReset = useCallback(() => {
        setAnalysisResult(null);
        setError(null);
    }, []);
    
    const getPageDescription = () => {
        if (mode === 'expert') {
            return "Select a trading style and asset for a detailed, multi-timeframe trade prediction.";
        }
        const currentMode = MODES.find(m => m.id === mode);
        return `Get a focused technical analysis for the ${currentMode?.name} timeframe.`
    }

    if (analysisResult) {
        // FIX: Pass onNavigate prop to ResultsPage
        return <ResultsPage result={analysisResult} onGoBack={handleReset} onNavigate={onNavigate} />;
    }

    return (
         <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300">AI Market Analyst</h2>
                    <p className="text-gray-400">{getPageDescription()}</p>
                </div>

                <div className="flex flex-wrap gap-2 p-1 bg-gray-900/50 rounded-lg border border-gray-700">
                    {MODES.map((m) => (
                       <button
                         key={m.id}
                         onClick={() => setMode(m.id)}
                         disabled={!!loadingStep}
                         className={`flex-grow px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:cursor-not-allowed ${
                           mode === m.id
                             ? 'bg-green-600 text-white shadow-md'
                             : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                         }`}
                       >
                         {m.name}
                       </button>
                    ))}
                </div>

                <AssetSelector
                    assets={AVAILABLE_ASSETS}
                    selectedAsset={selectedAsset}
                    onSelectAsset={setSelectedAsset}
                />
                
                {mode === 'expert' && (
                    <TradingStyleSelector
                        selectedStyle={tradingStyle}
                        onStyleSelect={setTradingStyle}
                        disabled={!!loadingStep}
                    />
                )}

                <div className="pt-2">
                    <button
                        onClick={handleAnalysis}
                        disabled={!!loadingStep}
                        className="w-full h-14 px-6 text-lg text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loadingStep ? <CandlestickSpinner /> : 'Analyze Market (1 Token)'}
                    </button>
                </div>
            </div>
            <div className="mt-10 max-w-3xl mx-auto">
                {error && <ErrorAlert message={error} />}
                {loadingStep && (
                    <div className="text-center p-8 flex flex-col items-center justify-center">
                        <CandlestickSpinner />
                        <p className="text-lg text-gray-300 mt-4 animate-pulse">{loadingStep}</p>
                    </div>
                )}
            </div>
         </div>
    );
};

export default MarketAnalystPage;