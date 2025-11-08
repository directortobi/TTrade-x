import { Candle } from '../types';

// NOTE: These are simplified mock calculations for demonstration.
// For production use, consider a robust library like 'technicalindicators'.

export const calculateRSI = (candles: Candle[], period = 14): number | null => {
    if (candles.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    const relevantCandles = candles.slice(candles.length - period - 1);

    for (let i = 1; i < relevantCandles.length; i++) {
        const change = relevantCandles[i].close - relevantCandles[i-1].close;
        if (change > 0) {
            gains += change;
        } else {
            losses -= change; // losses are positive values
        }
    }

    if (losses === 0) return 100;
    if (gains === 0) return 0;
    
    const avgGain = gains / period;
    const avgLoss = losses / period;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
};

export const calculateMACD = (candles: Candle[], fast = 12, slow = 26): { macd: number } | null => {
    if (candles.length < slow) return null;
    
    const simpleMovingAverage = (data: Candle[], count: number) => {
        const sum = data.slice(data.length - count).reduce((acc, val) => acc + val.close, 0);
        return sum / count;
    };
    
    // This is a highly simplified mock. A real implementation uses Exponential Moving Averages.
    const fastMA = simpleMovingAverage(candles, fast);
    const slowMA = simpleMovingAverage(candles, slow);

    return {
        macd: fastMA - slowMA,
    };
};
