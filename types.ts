
export interface Credentials {
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
}

export interface Profile {
    id: string;
    email: string;
    tokens: number;
    is_admin: boolean;
    referral_code: string;
    referred_by: string | null;
}

export interface AppUser {
    auth: User;
    profile: Profile;
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
    score: number;
    rationale: string;
    articles: { title: string; source: string }[];
}

export type Timeframe = '1min' | '5min' | '15min' | '1hour' | '4hour' | '1day';

export interface AnalysisInput {
    pair: string;
    data1m: Candle[];
    data15m: Candle[];
    data1h: Candle[];
    newsSentiment: NewsSentiment;
    userAnnotations?: string;
}

export interface ImageData {
    mimeType: string;
    data: string;
}

export enum Signal {
    BUY = 'BUY',
    SELL = 'SELL',
    HOLD = 'HOLD'
}

export interface AnalysisResult {
    signal: Signal;
    entryPrice: number;
    takeProfit: number;
    stopLoss: number;
    rationale: string;
    pair: string;
    confidenceLevel: number;
    pips: {
        takeProfit: number;
        stopLoss: number;
    };
    riskRewardRatio: string;
    support: number;
    resistance: number;
    trend: TrendDirection;
    indicators: {
        rsi: {
            value: number;
            interpretation: string;
        };
        macd: {
            signal: string;
        };
    };
}

export type TrendDirection = 'Bullish' | 'Bearish' | 'Sideways';

export type TradingStyle = 'ict' | 'swing' | 'scalper';

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
    userAnnotations?: string;
}

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

export interface PurchaseWithEmail extends TokenPurchase {
    profiles?: { email: string };
}

export type AnalysisOutcome = 'Pending' | 'TP Hit' | 'SL Hit' | 'Cancelled';

export interface AnalysisLog {
    id: number;
    user_email: string;
    user_id: string;
    symbol: string;
    signal: Signal;
    entry_price: number | null;
    stop_loss: number | null;
    take_profit_1: number | null;
    confidence: number;
    analysis_notes: string;
    outcome: AnalysisOutcome;
    tokens_used: number;
    created_at: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface Withdrawal {
    id: string;
    user_id: string;
    tokens_to_withdraw: number;
    wallet_address: string;
    status: WithdrawalStatus;
    created_at: string;
}

export interface WithdrawalWithEmail extends Withdrawal {
    profiles?: { email: string };
}

export type EarningStatus = 'pending' | 'approved' | 'rejected';

export interface ReferralEarning {
    id: string;
    referrer_id: string;
    referred_user_id: string;
    purchase_id: string;
    purchase_amount: number;
    commission_amount: number;
    status: EarningStatus;
    created_at: string;
}

export interface ReferralEarningWithEmail extends ReferralEarning {
    referred_user_profile?: { email: string };
}

export interface ReferralWithdrawal {
    id: string;
    user_id: string;
    amount_usd: number;
    wallet_address: string;
    status: WithdrawalStatus;
    created_at: string;
}

export interface ReferralWithdrawalWithEmail extends ReferralWithdrawal {
    profiles?: { email: string };
}

export interface ReferredUser {
    id: string;
    email: string;
}

export interface Notification {
    id: number;
    user_id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    is_read: boolean;
    created_at: string;
}

export interface Asset {
    ticker: string;
    name: string;
    type: 'Forex' | 'Crypto' | 'Commodity' | 'Index';
}

export interface DrawingSettings {
    indicators: {
        rsi: boolean;
        macd: boolean;
        bollinger: boolean;
        ema: boolean;
    };
    colors: {
        candleUp: string;
        candleDown: string;
        grid: string;
        background: string;
    };
}

// Deriv Types
export type UiDerivContractType = 'multiplier' | 'higher_lower' | 'reset';

export interface DerivActiveSymbol {
    symbol: string;
    display_name: string;
    market: string;
}

export interface DerivBalance {
    balance: number;
    currency: string;
    loginid: string;
}

export interface DerivContract {
    contract_type: string;
    contract_display: string;
}

export interface DerivContractsForSymbol {
    available: DerivContract[];
}

export interface DerivTick {
    quote: number;
    bid?: number;
    ask?: number;
    epoch: number;
}

export interface DerivProposal {
    id: string;
    ask_price: number;
    payout: number;
    contract_type: string;
    longcode: string;
}

export interface DerivOpenContract {
    contract_id: number;
    longcode: string;
    buy_price: number;
    bid_price: number;
    profit: number;
    is_valid_to_sell: boolean;
}

export interface DerivPortfolio {
    contracts: DerivOpenContract[];
}

export interface DerivProfitTableEntry {
    contract_id: number;
    shortcode: string;
    purchase_time: number;
    sell_time: number;
    buy_price: number;
    sell_price: number;
    profit_loss: number;
}

export interface DerivTradeParams {
    symbol: string;
    contract_type: string;
    stake: number;
    duration: number;
    duration_unit: 't' | 'm' | 'h';
    barrier1?: string;
    multiplier?: number;
    takeProfit?: number;
    stopLoss?: number;
}

// Chatbot Types
export interface CompoundingLevel {
    level: number;
    startBalance: number;
    risk: number;
    profitTarget: number;
    endBalance: number;
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

export type View = 'dashboard' | 'market_analyst' | 'image_analyst' | 'chart' | 'history' | 'profile' | 'buyTokens' | 'purchaseHistory' | 'admin' | 'referrals' | 'withdraw' | 'withdrawalHistory' | 'about' | 'contact' | 'disclaimer' | 'derivTrader' | 'derivSmartTrader' | 'compoundingAgent' | 'instructions';
