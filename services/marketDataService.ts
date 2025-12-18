
// FIX: Removed .ts extension from import path.
import { Candle, NewsSentiment, Timeframe } from '../types';

// Helper function to generate a random number in a range
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generates a single procedural candle based on the previous one
const generateNextCandle = (previousCandle: Candle, intervalMinutes: number): Candle => {
    const volatility = 0.001 * Math.sqrt(intervalMinutes / 60); 
    const change = (Math.random() - 0.5) * volatility;
    const open = previousCandle.close;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * (volatility / 2));
    const low = Math.min(open, close) * (1 - Math.random() * (volatility / 2));
    const volume = previousCandle.volume * randomInRange(0.8, 1.2);
    const datetime = new Date(new Date(previousCandle.datetime).getTime() + intervalMinutes * 60000).toISOString();
    return { datetime, open, high, low, close, volume: Math.floor(volume) };
};

export const fetchCandlestickData = async (
    ticker: string,
    timeframe: Timeframe
): Promise<Candle[]> => {
    const basePrices: { [key: string]: number } = {
        'EUR/USD': 1.07,
        'USD/JPY': 157.0,
        'GBP/USD': 1.27,
        'USD/CHF': 0.90,
        'AUD/USD': 0.66,
        'USD/CAD': 1.37,
        'NZD/USD': 0.61,
        'XAU/USD': 2350.50,
        'BTC/USD': 67500.00,
    };

    const intervalMap: Record<Timeframe, number> = {
        '1min': 1,
        '5min': 5,
        '15min': 15,
        '1hour': 60,
        '4hour': 240,
        '1day': 1440,
    };
    const intervalMinutes = intervalMap[timeframe];

    const candles: Candle[] = [];
    let currentCandle: Candle = {
        datetime: new Date(Date.now() - 100 * intervalMinutes * 60000).toISOString(),
        open: basePrices[ticker] || 1.0,
        high: (basePrices[ticker] || 1.0) * (1 + randomInRange(0, 0.0005 * Math.sqrt(intervalMinutes))),
        low: (basePrices[ticker] || 1.0) * (1 - randomInRange(0, 0.0005 * Math.sqrt(intervalMinutes))),
        close: (basePrices[ticker] || 1.0) * (1 + (Math.random() - 0.5) * 0.001),
        volume: randomInRange(1000, 5000) * intervalMinutes
    };
    candles.push(currentCandle);

    for (let i = 1; i < 100; i++) {
        currentCandle = generateNextCandle(currentCandle, intervalMinutes);
        candles.push(currentCandle);
    }
    
    await new Promise(resolve => setTimeout(resolve, randomInRange(100, 300)));

    return candles;
};

export const fetchNewsSentiment = async (ticker: string): Promise<NewsSentiment> => {
    const score = Math.round(randomInRange(-8, 8));
    let rationale = '';
    if (score > 3) {
        rationale = "Positive economic data is buoying confidence.";
    } else if (score < -3) {
        rationale = "Geopolitical tensions are leading to risk-off sentiment.";
    } else {
        rationale = "Market sentiment is mixed.";
    }
    
    const articles = [
        { title: `Analysis: ${ticker.split('/')[0]} Outlook`, source: 'Reuters' },
    ];
    
    await new Promise(resolve => setTimeout(resolve, randomInRange(100, 300)));

    return { score, rationale, articles };
};
