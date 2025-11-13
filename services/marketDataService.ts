// FIX: Add .ts extension to import path.
import { Candle, NewsSentiment, Timeframe } from '../types.ts';

// ===================================================================================
// DEVELOPER NOTE: THIS IS A MOCK DATA SERVICE FOR DEMONSTRATION PURPOSES.
// To make this a truly "live" analyzer app, you must replace the functions
// in this file with calls to a real financial market data provider API.
//
// Popular options include:
// - Polygon.io
// - Alpha Vantage
// - IEX Cloud
// - A direct connection to a brokerage like Alpaca or OANDA.
//
// You will need to sign up for one of these services, get an API key,
// and modify the fetchCandlestickData and fetchNewsSentiment functions
// to fetch and format data from that live source.
// ===================================================================================


// Helper function to generate a random number in a range
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generates a single procedural candle based on the previous one
const generateNextCandle = (previousCandle: Candle, intervalMinutes: number): Candle => {
    const volatility = 0.001 * Math.sqrt(intervalMinutes / 60); // Higher timeframe = higher volatility
    const change = (Math.random() - 0.5) * volatility;
    const open = previousCandle.close;
    const close = open * (1 + change);
    const high = Math.max(open, close) * (1 + Math.random() * (volatility / 2));
    const low = Math.min(open, close) * (1 - Math.random() * (volatility / 2));
    const volume = previousCandle.volume * randomInRange(0.8, 1.2);
    const datetime = new Date(new Date(previousCandle.datetime).getTime() + intervalMinutes * 60000).toISOString();
    return { datetime, open, high, low, close, volume: Math.floor(volume) };
};

// --- MOCK API FUNCTIONS ---

/**
 * Simulates fetching the last 100 candlestick data points for a given forex pair and timeframe.
 * In a real application, this would call an external data API.
 */
export const fetchCandlestickData = async (
    ticker: string,
    timeframe: Timeframe
): Promise<Candle[]> => {
    console.log(`Simulating fetch for ${ticker} - ${timeframe}`);
    
    // Starting prices for different pairs to make them look distinct
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
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, randomInRange(100, 300)));

    return candles;
};

/**
 * Simulates fetching and analyzing news sentiment for a forex pair.
 * In a real application, this would call NewsAPI and then a sentiment analysis model.
 */
export const fetchNewsSentiment = async (ticker: string): Promise<NewsSentiment> => {
    console.log(`Simulating news sentiment analysis for ${ticker}`);
    
    const score = Math.round(randomInRange(-8, 8));
    let rationale = '';
    if (score > 3) {
        rationale = "Positive economic data and central bank statements are buoying investor confidence.";
    } else if (score < -3) {
        rationale = "Geopolitical tensions and inflation fears are leading to a risk-off sentiment in the market.";
    } else {
        rationale = "Market sentiment is mixed, with no strong directional bias from recent news.";
    }
    
    const articles = [
        { title: `Analysis: ${ticker.split('/')[0]} Strengthens on Economic Outlook`, source: 'Reuters' },
        { title: `Central Bank Hints at Future Policy Changes Affecting ${ticker.split('/')[1]}`, source: 'Bloomberg' },
        { title: `Market Volatility Increases for ${ticker} Ahead of Jobs Report`, source: 'Financial Times' },
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, randomInRange(100, 300)));

    return { score, rationale, articles };
};