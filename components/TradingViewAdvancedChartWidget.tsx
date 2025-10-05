import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface TradingViewAdvancedChartWidgetProps {
    symbol: string;
}

const TradingViewAdvancedChartWidget: React.FC<TradingViewAdvancedChartWidgetProps> = ({ symbol }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear the container to ensure the widget re-initializes on symbol or theme change
        container.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => {
            if (typeof (window as any).TradingView !== 'undefined') {
                new (window as any).TradingView.widget({
                    "autosize": true,
                    "symbol": symbol,
                    "interval": "60", // Default to 1 hour
                    "timezone": "Etc/UTC",
                    "theme": theme,
                    "style": "1", // Candlesticks
                    "locale": "en",
                    "toolbar_bg": theme === 'dark' ? '#131722' : '#f1f3f6',
                    "enable_publishing": false,
                    "withdateranges": true,
                    "hide_side_toolbar": false,
                    "allow_symbol_change": true,
                    "details": true,
                    "hotlist": true,
                    "calendar": true,
                    "studies": [
                        "RSI",
                        "MACD",
                        "BollingerBands@tv-basicstudies"
                    ],
                    "container_id": `tradingview-chart-container-${symbol}`
                });
            }
        };

        container.setAttribute('id', `tradingview-chart-container-${symbol}`);
        document.body.appendChild(script);

        return () => {
            // Cleanup script on component unmount
            const scriptElement = document.querySelector(`script[src='https://s3.tradingview.com/tv.js']`);
            if (scriptElement) {
                scriptElement.remove();
            }
            if (container) {
                container.innerHTML = '';
            }
        };
    }, [symbol, theme]);

    // Using a key on the container div ensures React replaces the DOM element,
    // which helps in reliably re-triggering the useEffect for the TradingView widget.
    return (
        <div 
            key={`${symbol}-${theme}`}
            ref={containerRef} 
            className="tradingview-widget-container"
            style={{ height: "100%", width: "100%" }}
        />
    );
};

export default memo(TradingViewAdvancedChartWidget);