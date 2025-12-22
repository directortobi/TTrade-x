
import React, { useEffect, useRef } from 'react';

const TradingViewMarketOverviewWidget: React.FC = () => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current) return;
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "colorTheme": "dark",
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
                        { "s": "FX:EURUSD" },
                        { "s": "FX:GBPUSD" },
                        { "s": "FX:USDJPY" },
                        { "s": "FX:USDCHF" },
                        { "s": "FX:AUDUSD" }
                    ]
                }
            ]
        });
        container.current.appendChild(script);
    }, []);

    return <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }} />;
}

export default TradingViewMarketOverviewWidget;
