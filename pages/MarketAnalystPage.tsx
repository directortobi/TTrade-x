
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

const MODES: { id: Timeframe | 'expert', name: string }[] = [
    { id: 'expert', name: 'Expert Analyst' },
    { id: '15min', name: '15 Min' },
    { id: '1hour', name: '1 Hour' },
    { id: '1day', name: '1 Day' },
];

export const MarketAnalystPage: React.FC<MarketAnalystPageProps> = ({ user, onTokenUsed, onNavigate }) => {
    const [selectedAsset, setSelectedAsset] = useState<Asset>(AVAILABLE_ASSETS[0]);
    const [mode, setMode] = useState<Timeframe | 'expert'>('expert');
    const [tradingStyle, setTradingStyle] = useState<TradingStyle>('ict');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (user.profile.tokens < 1) {
            setError("Insufficient tokens.");
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
            if (tokensUsed > 0) {
                const newBalance = await useTokenForAnalysis(user.profile.tokens);
                onTokenUsed(newBalance);
            }
            setResult(analysis);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [user, selectedAsset, mode, tradingStyle, onTokenUsed]);

    if (isLoading) return <div className="flex flex-col items-center justify-center p-12"><CandlestickSpinner /><p className="mt-4">Analyzing...</p></div>;
    if (result) return <ResultsPage result={result} onGoBack={() => setResult(null)} onNavigate={onNavigate} />;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white">Market Analyst</h1>
            {error && <ErrorAlert message={error} />}
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 space-y-6">
                <AssetSelector assets={AVAILABLE_ASSETS} selectedAsset={selectedAsset} onSelectAsset={setSelectedAsset} />
                <div className="flex gap-4">
                    {MODES.map(m => (
                        <button key={m.id} onClick={() => setMode(m.id)} className={`px-4 py-2 rounded-lg ${mode === m.id ? 'bg-cyan-600' : 'bg-gray-700'}`}>{m.name}</button>
                    ))}
                </div>
                <button onClick={handleAnalyze} className="w-full h-14 bg-cyan-600 text-white font-bold rounded-xl">Analyze Market</button>
            </div>
        </div>
    );
};

// FIX: Added default export for React.lazy in MainApp.tsx.
export default MarketAnalystPage;
