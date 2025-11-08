import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const TradingViewMarketOverviewWidget: React.FC = () => {
    const container = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (!container.current || container.current.querySelector('script')) {
            // If the script is already there, don't add another one.
            // The widget itself should handle theme updates if configured correctly.
            // A full re-init is safer though.
            if (container.current) container.current.innerHTML = '';
        }

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
                { "s": "FX:EURUSD", "d": "EUR/USD" },
                { "s": "FX:GBPUSD", "d": "GBP/USD" },
                { "s": "FX:USDJPY", "d": "USD/JPY" },
                { "s": "FX:USDCHF", "d": "USD/CHF" },
                { "s": "FX:AUDUSD", "d": "AUD/USD" },
                { "s": "FX:USDCAD", "d": "USD/CAD" },
                { "s": "FX:NZDUSD", "d": "NZD/USD" }
              ],
              "originalTitle": "Forex"
            },
            {
              "title": "Indices",
              "symbols": [
                { "s": "FOREXCOM:SPXUSD", "d": "S&P 500" },
                { "s": "FOREXCOM:NSXUSD", "d": "US 100" },
                { "s": "FOREXCOM:DJI", "d": "Dow 30" },
                { "s": "INDEX:DEU40", "d": "DAX 40" },
                { "s": "FOREXCOM:UKXGBP", "d": "UK 100" },
                { "s": "FOREXCOM:JPN225", "d": "Nikkei 225" }
              ],
              "originalTitle": "Indices"
            },
            {
              "title": "Commodities",
              "symbols": [
                { "s": "OANDA:XAUUSD", "d": "Gold" },
                { "s": "OANDA:XAGUSD", "d": "Silver" },
                { "s": "TVC:USOIL", "d": "Crude Oil" },
                { "s": "TVC:UKOIL", "d": "Brent Oil" },
                { "s": "COMEX:GC1!", "d": "Gold Futures" }
              ],
              "originalTitle": "Commodities"
            },
            {
              "title": "Crypto",
              "symbols": [
                { "s": "COINBASE:BTCUSD", "d": "Bitcoin" },
                { "s": "COINBASE:ETHUSD", "d": "Ethereum" },
                { "s": "BINANCE:SOLUSDT", "d": "Solana" },
                { "s": "BINANCE:BNBUSDT", "d": "BNB" },
                { "s": "BINANCE:XRPUSDT", "d": "Ripple" },
                { "s": "BINANCE:DOGEUSDT", "d": "Dogecoin" }
              ],
              "originalTitle": "Crypto"
            }
          ]
        });

        if (container.current) {
            container.current.appendChild(script);
        }

        return () => {
            if (container.current) {
                container.current.innerHTML = '';
            }
        };
    }, [theme]);

    return (
        <div 
            className="tradingview-widget-container" 
            ref={container} 
            style={{ height: "100%", width: "100%" }}
        />
    );
};

export default memo(TradingViewMarketOverviewWidget);