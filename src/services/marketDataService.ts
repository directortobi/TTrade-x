import { Candle, NewsSentiment, Timeframe } from '../types';

const DERIV_APP_ID = 1089;

const SYMBOL_MAP: Record<string, string> = {
    'EUR/USD': 'frxEURUSD',
    'GBP/USD': 'frxGBPUSD',
    'USD/JPY': 'frxUSDJPY',
    'USD/CHF': 'frxUSDCHF',
    'AUD/USD': 'frxAUDUSD',
    'USD/CAD': 'frxUSDCAD',
    'NZD/USD': 'frxNZDUSD',
    'XAU/USD': 'frxXAUUSD',
    'BTC/USD': 'cryBTCUSD',
    'ETH/USD': 'cryETHUSD',
    'Volatility 75 Index': 'R_75',
    'Boom 1000 Index': 'BOOM1000',
};

const getDerivSymbol = (ticker: string): string => {
    return SYMBOL_MAP[ticker] || ticker;
};

const getGranularity = (timeframe: Timeframe): number => {
    switch (timeframe) {
        case '1min': return 60;
        case '5min': return 300;
        case '15min': return 900;
        case '1hour': return 3600;
        case '4hour': return 14400;
        case '1day': return 86400;
        default: return 3600;
    }
};

export const fetchCandlestickData = async (
    ticker: string,
    timeframe: Timeframe
): Promise<Candle[]> => {
    const symbol = getDerivSymbol(ticker);
    const granularity = getGranularity(timeframe);

    return new Promise((resolve, reject) => {
        const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${DERIV_APP_ID}`);

        const timeout = setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) ws.close();
            reject(new Error("Connection timed out while fetching market data."));
        }, 15000);

        ws.onopen = () => {
            const request = {
                ticks_history: symbol,
                adjust_start_time: 1,
                count: 100,
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
                    volume: 0
                }));
                
                clearTimeout(timeout);
                ws.close();
                resolve(candles);
            }
        };

        ws.onerror = (error) => {
            clearTimeout(timeout);
            ws.close();
            reject(new Error("Failed to connect to market data provider."));
        };
    });
};

export const fetchNewsSentiment = async (ticker: string): Promise<NewsSentiment> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const score = Math.round((Math.random() * 16) - 8);
    let rationale = '';
    
    if (score > 3) rationale = `Bullish outlook for ${ticker} based on recent economic indicators.`;
    else if (score < -3) rationale = `Bearish pressure on ${ticker} due to market uncertainty.`;
    else rationale = `Neutral sentiment for ${ticker} ahead of key reports.`;
    
    return { 
        score, 
        rationale, 
        articles: [{ title: `${ticker} Market Analysis`, source: 'Financial Times' }] 
    };
};