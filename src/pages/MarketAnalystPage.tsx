
import React, { useState, useCallback } from 'react';
import { AssetSelector } from '../components/results/ForexSelector';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultsPage } from './ResultsPage';
import { getMarketAnalystPrediction, getTimeframeAnalysis } from '../services/geminiService';
import { fetchCandlestickData } from '../services/marketDataService';
import { useTokenForAnalysis } from '../services/tokenService';
import { logService } from '../services/logService';
import { AnalysisResult, AppUser, Asset, TradingStyle, Timeframe, View } from '../types';
import { AVAILABLE_ASSETS, TRADING_STYLES } from '../constants';
import { CandlestickSpinner } from '../components/CandlestickSpinner';

interface MarketAnalystPageProps {
    user: AppUser;
    onTokenUsed: (newBalance: number) => void;
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
    { id: '1day', name: '1 Day' },
];

const MarketAnalystPage: React.FC<MarketAnalystPageProps> = ({ user, onTokenUsed, onNavigate }) => {
    const [selectedAsset, setSelectedAsset] = useState<Asset>(AVAILABLE_ASSETS[0]);
    const [mode, setMode] = useState<AnalysisMode>('expert');
    const [tradingStyle, setTradingStyle] = useState<TradingStyle>('ict');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (user.profile.tokens < 1) {
            setError("You have 0 tokens. Please buy more to perform a new analysis.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            let analysis: AnalysisResult;

            if (mode === 'expert') {
                // Fetch multi-timeframe data
                const [data1h, data4h, data1d] = await Promise.all([
                    fetchCandlestickData(selectedAsset.ticker, '1hour'),
                    fetchCandlestickData(selectedAsset.ticker, '4hour'),
                    fetchCandlestickData(selectedAsset.ticker, '1day'),
                ]);

                analysis = await getMarketAnalystPrediction({
                    pair: selectedAsset.ticker,
                    tradingStyle,
                    data1h,
                    data4h,
                    data1d
                });
            } else {
                // Fetch single timeframe data
                const data = await fetchCandlestickData(selectedAsset.ticker, mode);
                analysis = await getTimeframeAnalysis({
                    pair: selectedAsset.ticker,
                    timeframe: mode,
                    data
                });
            }

            const tokensUsed = analysis.confidenceLevel > 50 ? 1 : 0;
            await logService.createLog(analysis, user.auth.email!, tokensUsed, user.auth.id);

            if (tokensUsed > 0) {
                const newBalance = await useTokenForAnalysis(user.profile.tokens);
                onTokenUsed(newBalance);
            }

            setResult(analysis);

        } catch (err: any) {
            setError(err.message || "Analysis failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [user, selectedAsset, mode, tradingStyle, onTokenUsed]);

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center pt-16">
                <CandlestickSpinner />
                <p className="text-xl text-gray-300 mt-6 animate-pulse font-semibold">Analyzing market data...</p>
                <p className="text-gray-500 mt-2">Consulting AI models and processing price action.</p>
            </div>
        );
    }

    if (result) {
        return <ResultsPage result={result} onGoBack={() => setResult(null)} onNavigate={onNavigate} />;
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
             <div className="text-center">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                    Market Analyst
                </h1>
                <p className="text-gray-400 mt-2">Select an asset and analysis mode to generate AI-powered trading signals.</p>
            </div>

            {error && <ErrorAlert message={error} />}

            <div className="bg-gray-800/50 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 space-y-8">
                {/* Asset Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Select Asset Pair</label>
                    <AssetSelector assets={AVAILABLE_ASSETS} selectedAsset={selectedAsset} onSelectAsset={setSelectedAsset} />
                </div>

                {/* Mode Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Analysis Mode</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {MODES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                    mode === m.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {m.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Trading Style (Only for Expert Mode) */}
                {mode === 'expert' && (
                    <div className="animate-fade-in">
                         <label className="block text-sm font-medium text-gray-400 mb-3">Trading Persona</label>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {TRADING_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => setTradingStyle(style.id as TradingStyle)}
                                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                                        tradingStyle === style.id
                                            ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/50'
                                            : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {style.name}
                                </button>
                            ))}
                         </div>
                    </div>
                )}

                <div className="pt-4 border-t border-gray-700">
                    <button
                        onClick={handleAnalyze}
                        className="w-full h-14 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl hover:from-blue-500 hover:to-cyan-500 shadow-lg shadow-blue-900/50 transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Analyze Market (1 Token)
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        Token is only deducted if AI confidence > 50%.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MarketAnalystPage;
