import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickData } from 'lightweight-charts';
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

    const timeframe = '15min';

    const handleAnalysis = useCallback(async () => {
        if (user.profile.tokens < 1) {
            alert("You have 0 tokens. Please buy more to perform an analysis.");
            return;
        }
        setIsAnalyzing(true);
        setAnalysisResult(null);

        try {
            const data = await fetchCandlestickData(selectedAsset.ticker, timeframe);
            
            const result = await getTimeframeAnalysis({
                pair: selectedAsset.ticker,
                timeframe: timeframe,
                data: data,
                userAnnotations: userNotes
            });
            
            const tokensUsed = result.confidenceLevel > 50 ? 1 : 0;
            await logService.createLog(result, user.auth.email!, tokensUsed, user.auth.id);

            if (tokensUsed > 0) {
                const newBalance = await useTokenForAnalysis(user.profile.tokens);
                onTokenUsed(newBalance);
            }
            
            setAnalysisResult(result);
        } catch (error) {
            console.error('Analysis Error:', error);
            alert("Analysis failed. Please ensure your API key is correct.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedAsset, user, onTokenUsed, timeframe, userNotes]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Ensure we clean up any existing chart before re-creating
        if (chartRef.current) {
            chartRef.current.remove();
        }

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { color: '#111827' },
                textColor: '#d1d5db',
            },
            grid: {
                vertLines: { color: '#374151' },
                horzLines: { color: '#374151' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 400,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            }
        });

        // Initialize Series
        const series = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderDownColor: '#ef4444',
            borderUpColor: '#22c55e',
            wickDownColor: '#ef4444',
            wickUpColor: '#22c55e',
        });

        chartRef.current = chart;
        candlestickSeriesRef.current = series;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
            chartRef.current = null;
            candlestickSeriesRef.current = null;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadChartData = async () => {
            if (!candlestickSeriesRef.current) return;
            
            setLoading(true);
            try {
                const data = await fetchCandlestickData(selectedAsset.ticker, timeframe);
                if (isMounted && candlestickSeriesRef.current) {
                    const formattedData: CandlestickData<Time>[] = data.map(c => ({
                        time: (new Date(c.datetime).getTime() / 1000) as Time,
                        open: c.open,
                        high: c.high,
                        low: c.low,
                        close: c.close
                    }));
                    candlestickSeriesRef.current.setData(formattedData);
                    chartRef.current?.timeScale().fitContent();
                }
            } catch (err) {
                console.error('Market Data Load Error:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadChartData();
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
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
                        <AssetSelector assets={AVAILABLE_ASSETS} selectedAsset={selectedAsset} onSelectAsset={setSelectedAsset} />
                        <div ref={chartContainerRef} className="mt-6 relative min-h-[400px] rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
                            {loading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80">
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