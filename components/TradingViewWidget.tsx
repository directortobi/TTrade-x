import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface TradingViewWidgetProps {
    ticker: string;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ ticker }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Clear the container on re-render to ensure a fresh widget is loaded
        container.innerHTML = '';

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        
        // The container for the widget will be the ref'd div itself.
        // We create a unique ID to avoid conflicts on re-renders.
        const widgetContainerId = `tradingview_widget_container_${Math.random().toString(36).substring(7)}`;
        container.id = widgetContainerId;
        
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": `OANDA:${ticker.replace('/', '')}`,
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": theme, // Use the dynamic theme from context
            "style": "1",
            "locale": "en",
            "enable_publishing": false,
            "withdateranges": true,
            "hide_side_toolbar": false,
            "allow_symbol_change": true,
            "container_id": widgetContainerId,
        });

        container.appendChild(script);

        // Cleanup when component unmounts or dependencies change
        return () => {
            if(container) {
                container.innerHTML = '';
            }
        };
    }, [ticker, theme]); // Re-run this effect if the ticker or theme changes

    return (
        <div 
            ref={containerRef} 
            className="tradingview-widget-container" 
            style={{ height: "100%", width: "100%" }} 
        />
    );
}

export default memo(TradingViewWidget);