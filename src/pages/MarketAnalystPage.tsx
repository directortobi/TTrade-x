
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
        try {
            let analysis: AnalysisResult;
            if (mode === 'expert') {
                const [d1h, d4h, d1d] = await Promise.all([
                    fetchCandlestickData(selectedAsset.ticker, '1hour'),
                    fetchCandlestickData(selectedAsset.ticker, '4hour'),
                    fetchCandlestickData(selectedAsset.ticker, '1day'),
                ]);
                analysis = await getMarketAnalystPrediction({ pair: selectedAsset.ticker, tradingStyle, data1h: d1h, data4h: d4h, data1d: d1d });
            } else {
                const data = await fetchCandlestickData(selectedAsset.ticker, mode);
                analysis = await getTimeframeAnalysis({ pair: selectedAsset.ticker, timeframe: mode, data });
            }

            const tokensUsed = analysis.confidenceLevel > 50 ? 1 : 0;
            await logService.createLog(analysis, user.auth.email!, tokensUsed, user.auth.id);
            if (tokensUsed > 0) {
                const newBalance = await useTokenForAnalysis(user.profile.tokens);
                onTokenUsed(newBalance);
            }
            setResult(analysis);
        } catch (err: any) {
            setError(err.message || "Analysis failed.");
        } finally {
            setIsLoading(false);
        }
    }, [user, selectedAsset, mode, tradingStyle, onTokenUsed]);

    if (isLoading) return <div className="max-w-3xl mx-auto flex flex-col items-center justify-center p-16"><CandlestickSpinner /><p className="mt-4 text-gray-400">Consulting AI Market Analyst...</p></div>;
    if (result) return <ResultsPage result={result} onGoBack={() => setResult(null)} onNavigate={onNavigate} />;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white">AI Market Analyst</h1>
                <p className="text-gray-400 mt-2">Get high-probability signals based on multi-timeframe price action.</p>
            </div>
            {error && <ErrorAlert message={error} />}
            <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 space-y-8">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Asset Pair</label>
                    <AssetSelector assets={AVAILABLE_ASSETS} selectedAsset={selectedAsset} onSelectAsset={setSelectedAsset} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {MODES.map(m => (
                        <button key={m.id} onClick={() => setMode(m.id)} className={`px-4 py-2 rounded-lg transition-all ${mode === m.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>{m.name}</button>
                    ))}
                </div>
                {mode === 'expert' && (
                    <div className="flex gap-4">
                        {TRADING_STYLES.map(style => (
                            <button key={style.id} onClick={() => setTradingStyle(style.id as TradingStyle)} className={`flex-1 px-4 py-2 rounded-lg border ${tradingStyle === style.id ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-600 text-gray-400'}`}>{style.name}</button>
                        ))}
                    </div>
                )}
                <div className="pt-6 border-t border-gray-700">
                    <button onClick={handleAnalyze} className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-blue-900/40">Analyze Market (1 Token)</button>
                    <p className="text-center text-xs text-gray-500 mt-4">Token only deducted if confidence level is above 50%.</p>
                </div>
            </div>
        </div>
    );
};

export default MarketAnalystPage;
