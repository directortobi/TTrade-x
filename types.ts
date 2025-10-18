import { TRADING_STYLES } from "./constants";

export interface User {
    id: string;
    email: string;
}

export interface Profile {
    id: string;
    email: string;
    tokens: number;
    referral_code: string;
    created_at: string;
}

export interface AppUser {
    auth: User;
    profile: Profile;
}

export interface Credentials {
    email: string;
    password: string;
}

export interface Asset {
    ticker: string; // User-facing ticker
    name: string;
    tradingViewTicker: string; // Ticker for the TradingView widget
}

export interface Candle {
    datetime: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface NewsSentiment {
    score: number; // -10 (very negative) to +10 (very positive)
    rationale: string;
    articles: { title: string; source: string }[];
}

export enum Signal {
    BUY = 'BUY',
    SELL = 'SELL',
    HOLD = 'HOLD'
}

export interface Pips {
    takeProfit: number;
    stopLoss: number;
}

export interface IndicatorReadings {
    rsi: {
        value: number;
        interpretation: 'Overbought' | 'Oversold' | 'Neutral' | 'Divergence';
    };
    macd: {
        signal: 'Bullish Crossover' | 'Bearish Crossover' | 'No Crossover';
    };
}

export type TrendDirection = 'Bullish' | 'Bearish' | 'Sideways';

export interface AnalysisResult {
    signal: Signal;
    entryPrice: number;
    takeProfit: number;
    stopLoss: number;
    rationale: string;
    // New detailed fields
    pair: string;
    confidenceLevel: number;
    pips: Pips;
    riskRewardRatio: string;
    // Expanded fields
    support: number;
    resistance: number;
    trend: TrendDirection;
    indicators: IndicatorReadings;
}


export interface AnalysisInput {
    pair: string;
    data1m: Candle[];
    data15m: Candle[];
    data1h: Candle[];
    newsSentiment: NewsSentiment;
    userAnnotations?: string;
}

export interface ImageData {
    data: string; // base64 encoded string
    mimeType: string;
}

export type TradingStyle = typeof TRADING_STYLES[number]['id'];

export type Timeframe = '1min' | '5min' | '15min' | '1hour' | '4hour' | '1day';

export interface MarketAnalystInput {
    pair: string;
    tradingStyle: TradingStyle;
    data1h: Candle[];
    data4h: Candle[];
    data1d: Candle[];
}

export interface TimeframeAnalysisInput {
    pair: string;
    timeframe: Timeframe;
    data: Candle[];
}

// New types for Compounding Agent
export interface CompoundingLevel {
  level: number;
  startBalance: number;
  profitTarget: number;
  endBalance: number;
  risk: number;
}

export interface TradeLog {
  timestamp: string;
  level: number;
  symbol: string;
  entryPrice: number;
  result: 'TP Hit' | 'SL Hit';
  pnl: number;
  balance: number;
}

// New types for Token and Referral System
export interface TokenPackage {
    id: string;
    name: string;
    tokens: number;
    price: number;
    description: string;
}

export type TokenPurchaseStatus = 'pending' | 'approved' | 'rejected';

export interface TokenPurchase {
    id: string;
    user_id: string;
    package_name: string;
    tokens_purchased: number;
    price_usd: number;
    payment_proof_url: string;
    status: TokenPurchaseStatus;
    created_at: string;
}

export type EarningStatus = 'pending' | 'approved' | 'rejected';

export interface ReferralEarning {
    id: number;
    referrer_id: string;
    referred_user_id: string;
    purchase_id: string;
    purchase_amount: number;
    commission_amount: number;
    status: EarningStatus;
    created_at: string;
}

// New types for Withdrawals
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface Withdrawal {
    id: string;
    user_id: string;
    tokens_to_withdraw: number;
    wallet_address: string;
    status: WithdrawalStatus;
    created_at: string;
}

export interface ReferralWithdrawal {
    id: string;
    user_id: string;
    amount_usd: number;
    wallet_address: string;
    status: WithdrawalStatus;
    created_at: string;
}

// Types for Admin page with joined email data
export interface PurchaseWithEmail extends TokenPurchase {
    profiles: {
        email: string;
    } | null;
}

export interface WithdrawalWithEmail extends Withdrawal {
     profiles: {
        email:string;
    } | null;
}

export interface ReferralWithdrawalWithEmail extends ReferralWithdrawal {
     profiles: {
        email: string;
    } | null;
}

// New types for Trading History
export type AnalysisOutcome = 'Pending' | 'TP Hit' | 'SL Hit' | 'Cancelled';

export interface AnalysisLog {
    id: number;
    created_at: string;
    user_email: string;
    symbol: string;
    signal: Signal;
    entry_price: number | null;
    stop_loss: number | null;
    take_profit_1: number | null;
    confidence: number | null;
    analysis_notes: string | null;
    outcome: AnalysisOutcome;
    tokens_used: number;
}

// New types for Referral Page
export interface ReferredUser {
    id: string;
    email: string;
    created_at: string;
}

export interface ReferralEarningWithEmail extends ReferralEarning {
    referred_user_profile: {
        email: string;
    } | null;
}

// New types for Notifications
export type NotificationType = 'signal_buy' | 'signal_sell' | 'purchase_approved' | 'purchase_rejected' | 'withdrawal_approved' | 'withdrawal_rejected' | 'referral_earning' | 'referral_withdrawal_approved' | 'referral_withdrawal_rejected';

export interface Notification {
    id: number;
    user_id: string;
    created_at: string;
    type: NotificationType;
    message: string;
    is_read: boolean;
    link: string | null;
}

// New type for Chatbot
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}
