import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { Asset, AppUser, AnalysisResult, View } from '../types';
import { AVAILABLE_ASSETS } from '../constants';
import { fetchCandlestickData } from '../services/marketDataService';
import { AssetSelector } from './results/ForexSelector';
import { CandlestickSpinner } from './CandlestickSpinner';
import { ResultsPage } from '../pages/ResultsPage';
import { getTimeframeAnalysis } from '../services/geminiService';
import { useTokenForAnalysis } from '../services/tokenService';
import { logService } from '../services/logService';
import { ChartAnnotationPanel } from './ChartAnnotationPanel';

interface InteractiveChartProps {
    user: AppUser;
    onTokenUsed: (newBalance: number) => void;
    onNavigate: (view: View) => void;
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({ user, onTokenUsed, onNavigate }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

    const [selectedAsset, setSelectedAsset] = useState<Asset>(AVAILABLE_ASSETS[0]);
    const [loading, setLoading] = useState(true);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [userNotes, setUserNotes] = useState('');

    const timeframe = '15min'; // Hardcoded for this component

    const handleAnalysis = useCallback(async () => {
        if (user.profile.tokens < 1) {
            alert("You have 0 tokens. Please buy more to perform an analysis.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const data = await fetchCandlestickData(selectedAsset.ticker, timeframe);
            
            // The AI gets the raw data and user notes, but no pre-drawn indicators.
            const result = await getTimeframeAnalysis({
                pair: selectedAsset.ticker,
                timeframe: timeframe,
                data: data,
                // userAnnotations: userNotes, // This feature could be added here
            });
            
            const tokensUsed = result.confidenceLevel > 50 ? 1 : 0;
            await logService.createLog(result, user.auth.email!, tokensUsed, user.auth.id);

            if (tokensUsed > 0) {
                const newBalance = await useTokenForAnalysis(user.profile.tokens);
                onTokenUsed(newBalance);
            }
            
            setAnalysisResult(result);
        } catch (error) {
            console.error(error);
            alert("Analysis failed. Please try again.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedAsset, user, onTokenUsed, timeframe]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        chartRef.current = createChart(chartContainerRef.current, {
            layout: {
                background: { color: '#111827' },
                textColor: 'rgba(255, 255, 255, 0.9)',
            },
            grid: {
                vertLines: { color: '#374151' },
                horzLines: { color: '#374151' },
            },
            timeScale: { timeVisible: true, secondsVisible: false },
        });

        candlestickSeriesRef.current = chartRef.current.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
        });

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chartRef.current?.remove();
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        fetchCandlestickData(selectedAsset.ticker, timeframe).then(data => {
            if (isMounted && candlestickSeriesRef.current) {
                const formattedData = data.map(candle => ({
                    time: new Date(candle.datetime).getTime() / 1000 as Time,
                    open: candle.open,
                    high: candle.high,
                    low: candle.low,
                    close: candle.close,
                }));
                candlestickSeriesRef.current.setData(formattedData);
                chartRef.current?.timeScale().fitContent();
            }
            setLoading(false);
        });

        return () => { isMounted = false; };
    }, [selectedAsset]);

    if (analysisResult) {
        return <ResultsPage result={analysisResult} onGoBack={() => setAnalysisResult(null)} onNavigate={onNavigate} />;
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">
                    Interactive Chart & Analysis
                </h1>
                <p className="text-gray-400 mt-1">Analyze live charts with annotations and get instant AI feedback.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700">
                        <div className="flex flex-wrap gap-4 items-center mb-4">
                            <div className="flex-grow">
                                <AssetSelector
                                    assets={AVAILABLE_ASSETS}
                                    selectedAsset={selectedAsset}
                                    onSelectAsset={setSelectedAsset}
                                />
                            </div>
                            <span className="text-sm font-medium text-gray-400 bg-gray-700/50 px-3 py-1.5 rounded-md">{timeframe}</span>
                        </div>
                        <div ref={chartContainerRef} className="h-[60vh] relative">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                                    <CandlestickSpinner />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <ChartAnnotationPanel
                        isAnalyzing={isAnalyzing}
                        onAnalyze={handleAnalysis}
                        notes={userNotes}
                        onNotesChange={setUserNotes}
                    />
                </div>
            </div>
        </div>
    );
};

export default InteractiveChart;