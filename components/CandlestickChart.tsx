import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { Candle } from '../types';

interface CandlestickChartProps {
  data: Candle[];
}

const formatDataForChart = (data: Candle[]): CandlestickData[] => {
    return data
        .map(candle => ({
            time: (new Date(candle.datetime).getTime() / 1000) as UTCTimestamp,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
        }))
        .sort((a, b) => a.time - b.time); // Data must be sorted by time
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ data }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<{ chart: IChartApi | null; series: ISeriesApi<'Candlestick'> | null }>({
        chart: null,
        series: null,
    });
    const prevDataRef = useRef<Candle[]>();


    // Effect for chart initialization and cleanup
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            layout: {
                background: { color: 'transparent' },
                textColor: 'rgba(209, 213, 219, 0.9)',
            },
            grid: {
                vertLines: { color: 'rgba(75, 85, 99, 0.5)' },
                horzLines: { color: 'rgba(75, 85, 99, 0.5)' },
            },
            timeScale: {
                borderColor: 'rgba(75, 85, 99, 0.8)',
                timeVisible: true,
                secondsVisible: false,
            },
            crosshair: {
                mode: 1, // Magnet mode
            },
        });

        const series = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderDownColor: '#ef5350',
            borderUpColor: '#26a69a',
            wickDownColor: '#ef5350',
            wickUpColor: '#26a69a',
        });
        
        chartRef.current = { chart, series };

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, []);

    // Effect for data updates
    useEffect(() => {
        const series = chartRef.current.series;
        if (!series || !data || data.length === 0) {
            return;
        }
        
        const prevData = prevDataRef.current;
        // A full refresh is needed if there's no previous data, or if the starting point has changed (e.g., new asset selected).
        const isFullRefresh = !prevData || prevData[0].datetime !== data[0].datetime;

        const formattedData = formatDataForChart(data);

        if (isFullRefresh) {
            series.setData(formattedData);
            chartRef.current.chart?.timeScale().fitContent();
        } else {
            // This is a real-time update. Pass the latest candle to the series.
            const lastCandle = formattedData[formattedData.length - 1];
            series.update(lastCandle);
        }

        prevDataRef.current = data;
    }, [data]);


    return <div ref={chartContainerRef} className="w-full h-full" />;
};
