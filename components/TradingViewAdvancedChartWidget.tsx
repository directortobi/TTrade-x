import React, { useEffect, useRef, memo, useState, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { AppUser, DrawingSettings } from '../types';
import { drawingService } from '../services/drawingService';
import { settingsService } from '../services/settingsService';
import { DrawingSettingsModal } from './DrawingSettingsModal';

interface TradingViewAdvancedChartWidgetProps {
    symbol: string;
    user: AppUser;
}

const mapSettingsToOverrides = (settings: DrawingSettings) => {
    return {
        // Trendline Styles
        "linetooltrendline.linecolor": settings.trendline.color,
        "linetooltrendline.linestyle": settings.trendline.style,
        "linetooltrendline.linewidth": settings.trendline.width,
        // Horizontal Line Styles
        "linetoolhorzline.linecolor": settings.horizontalLine.color,
        "linetoolhorzline.linestyle": settings.horizontalLine.style,
        "linetoolhorzline.linewidth": settings.horizontalLine.width,
        // Fib Retracement Styles
        "linetoolfibretraction.linecolor": settings.fibRetracement.color,
        "linetoolfibretraction.linestyle": settings.fibRetracement.style,
        "linetoolfibretraction.linewidth": settings.fibRetracement.width,
    };
};


const TradingViewAdvancedChartWidget: React.FC<TradingViewAdvancedChartWidgetProps> = ({ symbol, user }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<any>(null);
    const { theme } = useTheme();
    
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [drawingSettings, setDrawingSettings] = useState<DrawingSettings | null>(null);

    const applyDrawingSettings = useCallback((widget: any, settings: DrawingSettings) => {
        if (widget && typeof widget.applyOverrides === 'function') {
            const overrides = mapSettingsToOverrides(settings);
            widget.applyOverrides(overrides);
        }
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || widgetRef.current) return; // Prevent re-initialization

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.async = true;
        
        script.onload = () => {
            if (typeof (window as any).TradingView !== 'undefined' && container) {
                const widgetOptions = {
                    "autosize": true,
                    "symbol": symbol,
                    "interval": "60",
                    "timezone": "Etc/UTC",
                    "theme": theme,
                    "style": "1",
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
                    "container_id": container.id,
                    "disabled_features": ["use_localstorage_for_settings"],
                };

                const widget = new (window as any).TradingView.widget(widgetOptions);
                widgetRef.current = widget;

                widget.onChartReady(async () => {
                    widget.headerReady().then(async () => {
                        // Create Save Drawings button
                        const saveButton = widget.createButton();
                        saveButton.setAttribute('title', 'Save drawings to your profile');
                        saveButton.textContent = 'Save Drawings';
                        saveButton.addEventListener('click', () => {
                            widget.save(async (savedData: object) => {
                               try {
                                    await drawingService.saveDrawings(user.auth.id, symbol, savedData);
                                    widget.showNotice("Drawings Saved", "Your drawings have been saved to your profile.");
                                } catch (error) {
                                    console.error("Failed to save drawings:", error);
                                    widget.showNotice("Save Failed", `Error: ${(error as Error).message}`, { color: '#F23645' });
                                }
                            });
                        });
                        
                        // Create Settings button
                        const settingsButton = widget.createButton();
                        settingsButton.setAttribute('title', 'Customize drawing tool settings');
                        settingsButton.innerHTML = `<div class="custom-tv-button">${SettingsIcon}</div>`;
                        settingsButton.addEventListener('click', () => setIsSettingsModalOpen(true));
                    });

                    // Load drawings
                    try {
                        const savedDrawings = await drawingService.loadDrawings(user.auth.id, symbol);
                        if (savedDrawings) {
                            widget.load(savedDrawings);
                        }
                    } catch (error) {
                        console.error("Failed to load drawings:", error);
                    }

                     // Load drawing settings
                    try {
                        const settings = await settingsService.loadSettings(user.auth.id);
                        if (settings) {
                            setDrawingSettings(settings);
                            applyDrawingSettings(widget, settings);
                        }
                    } catch (error) {
                        console.error("Failed to load drawing settings:", error);
                    }
                });
            }
        };

        container.id = `tradingview-chart-container-${symbol}-${Date.now()}`;
        document.body.appendChild(script);

        return () => {
            if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
                widgetRef.current.remove();
                widgetRef.current = null;
            }
            script.remove();
        };
    }, [symbol, theme, user.auth.id, applyDrawingSettings]);

    const handleSettingsSave = (newSettings: DrawingSettings) => {
        setDrawingSettings(newSettings);
        if (widgetRef.current) {
            applyDrawingSettings(widgetRef.current, newSettings);
        }
        setIsSettingsModalOpen(false);
    };

    return (
        <>
            <style>{`
                .custom-tv-button svg { width: 18px; height: 18px; }
            `}</style>
            <div 
                key={`${symbol}-${theme}`}
                ref={containerRef} 
                className="tradingview-widget-container"
                style={{ height: "100%", width: "100%" }}
            />
            <DrawingSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onSave={handleSettingsSave}
                user={user}
                initialSettings={drawingSettings}
            />
        </>
    );
};

const SettingsIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path fill-rule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.85c-.09.55.279.95.81.95h3.28a.75.75 0 00.81-.95l-.178-2.033A1.875 1.875 0 0012.922 2.25h-1.844zM12 7.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM14.25 4.525a.75.75 0 00-1.5 0v.686a3.75 3.75 0 013.435 3.435h.686a.75.75 0 000-1.5h-.686A2.25 2.25 0 0014.25 5.21v-.686zM5.21 14.25a.75.75 0 000 1.5h.686a3.75 3.75 0 013.435 3.435v.686a.75.75 0 001.5 0v-.686a2.25 2.25 0 00-2.25-2.25h-1.321A3.75 3.75 0 015.21 14.25zM18.79 9.75a.75.75 0 00-1.5 0v1.321a2.25 2.25 0 00-2.25 2.25h-1.321a.75.75 0 000 1.5h1.321a3.75 3.75 0 013.435-3.435v-.686zM9.75 5.21a.75.75 0 00-1.5 0v.686a2.25 2.25 0 002.25 2.25h1.321a.75.75 0 000-1.5H10.5A3.75 3.75 0 019.75 5.896v-.686zM5.896 9.75A3.75 3.75 0 019.33 6.315v-.686a.75.75 0 00-1.5 0v.686A2.25 2.25 0 005.58 8.565H4.259a.75.75 0 000 1.5h1.337zM18.104 14.25a3.75 3.75 0 01-3.435 3.435v.686a.75.75 0 001.5 0v-.686a2.25 2.25 0 002.25-2.25h1.32a.75.75 0 000-1.5h-1.32z" clip-rule="evenodd" />
</svg>`;

export default memo(TradingViewAdvancedChartWidget);