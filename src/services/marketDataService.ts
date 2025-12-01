
import { Candle, NewsSentiment, Timeframe } from '../types';

// Deriv App ID (Public default or your specific one)
const DERIV_APP_ID = 1089;

// Map app tickers to Deriv API symbols
const SYMBOL_MAP: Record<string, string> = {
    'EUR/USD': 'frxEURUSD',
    'GBP/USD': 'frxGBPUSD',
    'USD/JPY': 'frxUSDJPY',
    'USD/CHF': 'frxUSDCHF',
    'AUD/USD': 'frxAUDUSD',
    'USD/CAD': 'frxUSDCAD',
    'NZD/USD': 'frxNZDUSD',
    'XAU/USD': 'frxXAUUSD', // Gold
    'BTC/USD': 'cryBTCUSD',
    'ETH/USD': 'cryETHUSD',
    // Synthetic Indices (examples, add more if needed)
    'Volatility 75 Index': 'R_75',
    'Boom 1000 Index': 'BOOM1000',
};

const getDerivSymbol = (ticker: string): string => {
    return SYMBOL_MAP[ticker] || ticker;
};

const getGranularity = (timeframe: Timeframe): number => {
    // Deriv accepts granularity in seconds
    switch (timeframe) {
        case '1min': return 60;
        case '5min': return 300;
        case '15min': return 900;
        case '1hour': return 3600;
        case '4hour': return 14400; // 4 hours
        case '1day': return 86400;  // 1 day
        default: return 3600;
    }
};

/**
 * Fetches the last 100 candlestick data points for a given asset and timeframe using Deriv WebSocket API.
 */
export const fetchCandlestickData = async (
    ticker: string,
    timeframe: Timeframe
): Promise<Candle[]> => {
    const symbol = getDerivSymbol(ticker);
    const granularity = getGranularity(timeframe);

    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`);

        // Timeout to prevent hanging requests
        const timeout = setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
            reject(new Error("Connection timed out while fetching market data."));
        }, 10000);

        ws.onopen = () => {
            const request = {
                ticks_history: symbol,
                adjust_start_time: 1,
                count: 100, // Fetch last 100 candles
                end: 'latest',
                style: 'candles',
                granularity: granularity
            };
            ws.send(JSON.stringify(request));
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data as string);

            if (data.error) {
                clearTimeout(timeout);
                ws.close();
                console.error("Deriv API Error:", data.error);
                // If symbol is invalid or market closed, we might want to handle gracefully,
                // but for now, we propagate the error.
                reject(new Error(`Market data error: ${data.error.message}`));
                return;
            }

            if (data.msg_type === 'candles') {
                const candles: Candle[] = data.candles.map((c: any) => ({
                    datetime: new Date(c.epoch * 1000).toISOString(),
                    open: Number(c.open),
                    high: Number(c.high),
                    low: Number(c.low),
                    close: Number(c.close),
                    volume: 0 // Deriv API often does not return volume for forex/synthetics
                }));
                
                clearTimeout(timeout);
                ws.close();
                resolve(candles);
            }
        };

        ws.onerror = (error) => {
            clearTimeout(timeout);
            console.error("WebSocket Error:", error);
            ws.close();
            reject(new Error("Failed to connect to market data provider."));
        };
    });
};

/**
 * Helper function to generate a random number in a range (used for simulation fallback if needed)
 */
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

/**
 * Simulates fetching and analyzing news sentiment.
 * Real-time news APIs typically require paid subscriptions and server-side proxies to handle CORS and secrets.
 * For this demo, we simulate sentiment analysis based on the asset type.
 */
export const fetchNewsSentiment = async (ticker: string): Promise<NewsSentiment> => {
    console.log(`Fetching news sentiment for ${ticker}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Randomized but deterministic-looking simulation
    const score = Math.round(randomInRange(-8, 8));
    let rationale = '';
    
    if (score > 3) {
        rationale = `Recent economic reports and market momentum are creating a bullish outlook for ${ticker}. Investors are reacting positively to key indicators.`;
    } else if (score < -3) {
        rationale = `Bearish pressure is mounting on ${ticker} due to geopolitical uncertainties and technical resistance levels being tested.`;
    } else {
        rationale = `Market sentiment for ${ticker} remains neutral as traders await upcoming high-impact news events. Consolidation is expected.`;
    }
    
    const articles = [
        { title: `${ticker} Market Update: Key Levels to Watch`, source: 'Financial Times' },
        { title: `Global Economic Shifts Impacting ${ticker.split('/')[0]}`, source: 'Bloomberg' },
        { title: `Technical Analysis: Is ${ticker} Oversold?`, source: 'Reuters' },
    ];

    return { score, rationale, articles };
};