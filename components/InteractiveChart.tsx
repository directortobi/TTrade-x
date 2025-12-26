import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, IChartApi, ISeriesApi, Time, CandlestickData, ColorType } from 'lightweight-charts';
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
            alert("Insufficient tokens. Please purchase more to proceed.");
            return;
        }
        setIsAnalyzing(true);
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
            console.error('Analysis error:', error);
            alert("Analysis failed. Please check your connectivity and try again.");
        } finally {
            setIsAnalyzing(false);
        }
    }, [selectedAsset, user, onTokenUsed, timeframe, userNotes]);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#000000' },
                textColor: '#d1d5db',
            },
            grid: {
                vertLines: { color: '#111' },
                horzLines: { color: '#111' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 450,
            timeScale: {
                borderColor: '#222',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: '#222',
            }
        });

        // Initialize series immediately to ensure prototype is valid
        const series = chart.addCandlestickSeries({
            upColor: '#06b6d4',
            downColor: '#f43f5e',
            borderDownColor: '#f43f5e',
            borderUpColor: '#06b6d4',
            wickDownColor: '#f43f5e',
            wickUpColor: '#06b6d4',
        });

        chartRef.current = chart;
        candlestickSeriesRef.current = series;

        const handleResize = () => {
            if (chartContainerRef.current && chartRef.current) {
                chartRef.current.applyOptions({ 
                    width: chartContainerRef.current.clientWidth 
                });
            }
        };

        window.addEventListener('resize', handleResize);
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
            chart.remove();
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
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        Interactive <span className="text-cyan-500">Terminal</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Real-time analysis with direct AI integration.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live Feed</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <div className="bg-[#050505] p-6 rounded-[2rem] border border-white/5 shadow-2xl space-y-6">
                        <AssetSelector assets={AVAILABLE_ASSETS} selectedAsset={selectedAsset} onSelectAsset={setSelectedAsset} />
                        
                        <div className="relative group">
                            <div 
                                ref={chartContainerRef} 
                                className="w-full h-[450px] rounded-2xl overflow-hidden border border-white/5 bg-black"
                            />
                            {loading && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
                                    <CandlestickSpinner />
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-4">Syncing Market Data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <ChartAnnotationPanel
                            isAnalyzing={isAnalyzing}
                            onAnalyze={handleAnalysis}
                            notes={userNotes}
                            onNotesChange={setUserNotes}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InteractiveChart;