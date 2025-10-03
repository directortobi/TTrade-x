import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const TradingViewMarketOverviewWidget: React.FC = () => {
    const container = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!container.current) return;
        
        // Clear previous widget to ensure a clean slate on re-render (e.g., theme change)
        container.current.innerHTML = '';

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
        script.type = 'text/javascript';
        script.async = true;
        script.innerHTML = JSON.stringify({
          "colorTheme": theme,
          "dateRange": "12M",
          "showChart": true,
          "locale": "en",
          "largeChartUrl": "",
          "isTransparent": true,
          "showSymbolLogo": true,
          "showFloatingTooltip": false,
          "width": "100%",
          "height": "100%",
          "tabs": [
            {
              "title": "Forex",
              "symbols": [
                { "s": "OANDA:EURUSD", "d": "EUR/USD" },
                { "s": "OANDA:GBPUSD", "d": "GBP/USD" },
                { "s": "OANDA:USDJPY", "d": "USD/JPY" },
                { "s": "OANDA:XAUUSD", "d": "Gold/USD" },
                { "s": "OANDA:USDCHF", "d": "USD/CHF" },
                { "s": "OANDA:AUDUSD", "d": "AUD/USD" },
              ],
              "originalTitle": "Forex"
            },
            {
              "title": "Crypto",
              "symbols": [
                { "s": "COINBASE:BTCUSD", "d": "Bitcoin" },
                { "s": "COINBASE:ETHUSD", "d": "Ethereum" },
              ],
              "originalTitle": "Crypto"
            }
          ]
        });
        container.current.appendChild(script);

        // Cleanup script on component unmount
        return () => {
            if (container.current) {
                container.current.innerHTML = '';
            }
        };
    }, [theme]); // Rerun effect if theme changes

    return (
        <div 
            className="tradingview-widget-container" 
            ref={container} 
            style={{ height: "100%", width: "100%" }}
        />
    );
};

export default memo(TradingViewMarketOverviewWidget);