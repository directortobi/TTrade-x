import { Asset, TokenPackage, CompoundingLevel } from './types';

export const AVAILABLE_ASSETS: Asset[] = [
    { ticker: 'EUR/USD', name: 'Euro / US Dollar', type: 'Forex' },
    { ticker: 'GBP/USD', name: 'British Pound / US Dollar', type: 'Forex' },
    { ticker: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'Forex' },
    { ticker: 'USD/CHF', name: 'US Dollar / Swiss Franc', type: 'Forex' },
    { ticker: 'AUD/USD', name: 'Australian Dollar / US Dollar', type: 'Forex' },
    { ticker: 'USD/CAD', name: 'US Dollar / Canadian Dollar', type: 'Forex' },
    { ticker: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', type: 'Forex' },
    { ticker: 'XAU/USD', name: 'Gold / US Dollar', type: 'Commodity' },
    { ticker: 'BTC/USD', name: 'Bitcoin / US Dollar', type: 'Crypto' },
    { ticker: 'ETH/USD', name: 'Ethereum / US Dollar', type: 'Crypto' },
];

export const TRADING_STYLES = [
    { id: 'ict', name: 'ICT (Inner Circle Trader)' },
    { id: 'swing', name: 'Swing Trader' },
    { id: 'scalper', name: 'High Frequency Scalper' },
];

export const TOKEN_PACKAGES: TokenPackage[] = [
    {
        id: 'starter',
        name: 'Starter Pack',
        tokens: 10,
        price: 50,
        description: 'Perfect for trying out the AI analyst. Valid for 30 days.',
    },
    {
        id: 'pro',
        name: 'Pro Trader',
        tokens: 50,
        price: 200,
        description: 'For serious traders. Includes priority support. Valid for 90 days.',
    },
    {
        id: 'institutional',
        name: 'Institutional',
        tokens: 200,
        price: 700,
        description: 'Best value for heavy usage. Valid for 1 year.',
    },
];

// Generate a 30-level compounding plan
// Strategy: Risk $10 to make $3 (30% gain per trade).
// If loss (-$10), go back to step 1.
export const COMPOUNDING_PLAN: CompoundingLevel[] = [];

let currentBalance = 100; // Starting Balance
const riskPerTrade = 10; // Fixed Risk
const profitPercent = 0.30; // 30% gain

for (let i = 1; i <= 30; i++) {
    const profitTarget = riskPerTrade * 1.5; // Approx 1:1.5 Risk Reward usually, but simplified here for the "Compounding Agent" logic
    // Actually, based on "Risk $10 to make $3" in comment vs standard compounding.
    // Let's stick to a standard compounding curve for the demo.
    
    // Simulating a strategy where we compound profits.
    const risk = currentBalance * 0.10; // Risk 10% of balance
    const reward = risk * 1.5; // 1:1.5 RR
    
    COMPOUNDING_PLAN.push({
        level: i,
        startBalance: parseFloat(currentBalance.toFixed(2)),
        risk: parseFloat(risk.toFixed(2)),
        profitTarget: parseFloat(reward.toFixed(2)),
        endBalance: parseFloat((currentBalance + reward).toFixed(2)),
    });
    
    currentBalance += reward;
}
