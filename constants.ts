import { Asset, CompoundingLevel, TokenPackage } from './types';

export const AVAILABLE_ASSETS: Asset[] = [
    // Forex Majors
    { ticker: 'EUR/USD', name: 'Euro / US Dollar', tradingViewTicker: 'FX:EURUSD' },
    { ticker: 'USD/JPY', name: 'US Dollar / Japanese Yen', tradingViewTicker: 'FX:USDJPY' },
    { ticker: 'GBP/USD', name: 'British Pound / US Dollar', tradingViewTicker: 'FX:GBPUSD' },
    { ticker: 'USD/CHF', name: 'US Dollar / Swiss Franc', tradingViewTicker: 'FX:USDCHF' },
    { ticker: 'AUD/USD', name: 'Australian Dollar / US Dollar', tradingViewTicker: 'FX:AUDUSD' },
    { ticker: 'USD/CAD', name: 'US Dollar / Canadian Dollar', tradingViewTicker: 'FX:USDCAD' },
    { ticker: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', tradingViewTicker: 'FX:NZDUSD' },
    
    // Forex Minors
    { ticker: 'EUR/GBP', name: 'Euro / British Pound', tradingViewTicker: 'FX:EURGBP' },
    { ticker: 'EUR/JPY', name: 'Euro / Japanese Yen', tradingViewTicker: 'FX:EURJPY' },
    { ticker: 'GBP/JPY', name: 'British Pound / Japanese Yen', tradingViewTicker: 'FX:GBPJPY' },
    { ticker: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', tradingViewTicker: 'FX:AUDJPY' },

    // Commodities
    { ticker: 'XAU/USD', name: 'Gold / US Dollar', tradingViewTicker: 'OANDA:XAUUSD' },
    { ticker: 'XAG/USD', name: 'Silver / US Dollar', tradingViewTicker: 'OANDA:XAGUSD' },
    { ticker: 'USOIL', name: 'WTI Crude Oil', tradingViewTicker: 'TVC:USOIL' },
    { ticker: 'UKOIL', name: 'Brent Crude Oil', tradingViewTicker: 'TVC:UKOIL' },

    // Crypto
    { ticker: 'BTC/USD', name: 'Bitcoin / US Dollar', tradingViewTicker: 'COINBASE:BTCUSD' },
    { ticker: 'ETH/USD', name: 'Ethereum / US Dollar', tradingViewTicker: 'COINBASE:ETHUSD' },
    { ticker: 'SOL/USD', name: 'Solana / US Dollar', tradingViewTicker: 'COINBASE:SOLUSD' },
    { ticker: 'XRP/USD', name: 'Ripple / US Dollar', tradingViewTicker: 'COINBASE:XRPUSD' },
    { ticker: 'DOGE/USD', name: 'Dogecoin / US Dollar', tradingViewTicker: 'COINBASE:DOGEUSD' },
    
    // Indices
    { ticker: 'US500', name: 'S&P 500', tradingViewTicker: 'TVC:SPX' },
    { ticker: 'US100', name: 'Nasdaq 100', tradingViewTicker: 'TVC:NDX' },
    { ticker: 'US30', name: 'Dow Jones 30', tradingViewTicker: 'TVC:DJI' },
    { ticker: 'DE40', name: 'DAX 40 (Germany)', tradingViewTicker: 'INDEX:DEU40' },
    { ticker: 'UK100', name: 'FTSE 100 (UK)', tradingViewTicker: 'TVC:UKX' },
];


export const TRADING_STYLES = [
    { id: 'ict', name: 'ICT Day Trader' },
    { id: 'swing', name: 'Swing Trader' },
    { id: 'scalper', name: 'Scalper' },
] as const;

export const COMPOUNDING_PLAN: CompoundingLevel[] = [
    { level: 1, startBalance: 37.00, profitTarget: 18.50, endBalance: 55.50, risk: 8.51 },
    { level: 2, startBalance: 55.50, profitTarget: 27.75, endBalance: 83.25, risk: 12.77 },
    { level: 3, startBalance: 83.25, profitTarget: 41.63, endBalance: 124.88, risk: 19.15 },
    { level: 4, startBalance: 124.88, profitTarget: 62.44, endBalance: 187.31, risk: 28.72 },
    { level: 5, startBalance: 187.31, profitTarget: 93.66, endBalance: 280.97, risk: 43.08 },
    { level: 6, startBalance: 280.97, profitTarget: 140.48, endBalance: 421.45, risk: 64.62 },
    { level: 7, startBalance: 421.45, profitTarget: 210.73, endBalance: 632.18, risk: 96.93 },
    { level: 8, startBalance: 632.18, profitTarget: 316.09, endBalance: 948.27, risk: 145.40 },
    { level: 9, startBalance: 948.27, profitTarget: 474.14, endBalance: 1422.41, risk: 218.10 },
    { level: 10, startBalance: 1422.41, profitTarget: 711.20, endBalance: 2133.61, risk: 327.15 },
    { level: 11, startBalance: 2133.61, profitTarget: 1066.81, endBalance: 3200.42, risk: 490.73 },
    { level: 12, startBalance: 3200.42, profitTarget: 1600.21, endBalance: 4800.63, risk: 736.10 },
    { level: 13, startBalance: 4800.63, profitTarget: 2400.31, endBalance: 7200.94, risk: 1104.14 },
    { level: 14, startBalance: 7200.94, profitTarget: 3600.47, endBalance: 10801.41, risk: 1656.22 },
    { level: 15, startBalance: 10801.41, profitTarget: 5400.71, endBalance: 16202.12, risk: 2484.32 },
    { level: 16, startBalance: 16202.12, profitTarget: 8101.06, endBalance: 24303.18, risk: 3726.49 },
    { level: 17, startBalance: 24303.18, profitTarget: 12151.59, endBalance: 36454.77, risk: 5589.73 },
    { level: 18, startBalance: 36454.77, profitTarget: 18227.38, endBalance: 54682.15, risk: 8384.59 },
    { level: 19, startBalance: 54682.15, profitTarget: 27341.08, endBalance: 82023.23, risk: 12576.89 },
    { level: 20, startBalance: 82023.23, profitTarget: 41011.61, endBalance: 123034.84, risk: 18865.34 },
    { level: 21, startBalance: 123034.84, profitTarget: 61517.42, endBalance: 184552.26, risk: 28298.01 },
    { level: 22, startBalance: 184552.26, profitTarget: 92276.13, endBalance: 276828.39, risk: 42447.02 },
    { level: 23, startBalance: 276828.39, profitTarget: 138414.20, endBalance: 415242.59, risk: 63670.54 },
    { level: 24, startBalance: 415242.59, profitTarget: 207621.29, endBalance: 622863.88, risk: 95505.80 },
    { level: 25, startBalance: 622863.88, profitTarget: 311431.94, endBalance: 934295.82, risk: 143258.70 },
    { level: 26, startBalance: 934295.82, profitTarget: 467147.91, endBalance: 1401443.73, risk: 214888.05 },
    { level: 27, startBalance: 1401443.73, profitTarget: 700721.87, endBalance: 2102165.60, risk: 322332.08 },
    { level: 28, startBalance: 2102165.60, profitTarget: 1051082.80, endBalance: 3153248.40, risk: 483498.12 },
    { level: 29, startBalance: 3153248.40, profitTarget: 1576624.20, endBalance: 4729872.60, risk: 725247.18 },
    { level: 30, startBalance: 4729872.60, profitTarget: 2364936.30, endBalance: 7094808.90, risk: 1087870.78 },
];

export const TOKEN_PACKAGES: TokenPackage[] = [
    { id: 'starter', name: 'Starter', tokens: 12, price: 10, description: 'Quick top-up for a few analyses.' },
    { id: 'trader', name: 'Trader', tokens: 75, price: 50, description: 'Good value for regular traders.' },
    { id: 'pro', name: 'Pro', tokens: 200, price: 100, description: 'Best value for heavy users.' },
];