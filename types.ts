// --- User & Auth ---
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
    referral_code: string;
}

export interface AppUser {
    auth: User;
    profile: Profile;
}

// --- Market Data & Assets ---
export interface Asset {
    ticker: string;
    name: string;
    tradingViewTicker: string;
}

export type Timeframe = '1min' | '5min' | '15min' | '1hour' | '4hour' | '1day';

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

// --- Gemini AI Analysis ---
export enum Signal {
    BUY = 'BUY',
    SELL = 'SELL',
    HOLD = 'HOLD'
}

export type TrendDirection = 'Bullish' | 'Bearish' | 'Sideways';

export interface ImageData {
    data: string; // base64 encoded string
    mimeType: string;
}

export interface AnalysisInput {
    pair: string;
    data1m: Candle[];
    data15m: Candle[];
    data1h: Candle[];
    newsSentiment: NewsSentiment;
    userAnnotations?: string;
}

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
            interpretation: 'Overbought' | 'Oversold' | 'Neutral' | 'Divergence';
        };
        macd: {
            signal: 'Bullish Crossover' | 'Bearish Crossover' | 'No Crossover';
        };
    };
}

// --- App Functionality ---
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

// --- Tokens & Purchases ---
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
    created_at: string;
    user_id: string;
    package_name: string;
    tokens_purchased: number;
    price_usd: number;
    payment_proof_url: string;
    status: TokenPurchaseStatus;
}

export interface PurchaseWithEmail extends TokenPurchase {
    profiles: { email: string } | null;
}

// --- Withdrawals ---
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface Withdrawal {
    id: string;
    created_at: string;
    user_id: string;
    tokens_to_withdraw: number;
    wallet_address: string;
    status: WithdrawalStatus;
}

export interface WithdrawalWithEmail extends Withdrawal {
    profiles: { email: string } | null;
}

// --- Referrals ---
export type EarningStatus = 'pending' | 'approved' | 'rejected';

export interface ReferredUser {
    id: string;
    email: string;
}

export interface ReferralEarning {
    id: string;
    created_at: string;
    referrer_id: string;
    referred_user_id: string;
    purchase_amount: number;
    commission_amount: number;
    status: EarningStatus;
}

export interface ReferralEarningWithEmail extends ReferralEarning {
    referred_user_profile: { email: string } | null;
}

export interface ReferralWithdrawal {
    id: string;
    created_at: string;
    user_id: string;
    amount_usd: number;
    wallet_address: string;
    status: WithdrawalStatus;
}

export interface ReferralWithdrawalWithEmail extends ReferralWithdrawal {
    profiles: { email: string } | null;
}

// --- Notifications ---
export type NotificationType =
    | 'signal_high_confidence'
    | 'purchase_approved'
    | 'purchase_rejected'
    | 'withdrawal_approved'
    | 'withdrawal_rejected'
    | 'referral_signup'
    | 'referral_commission'
    | 'referral_withdrawal_approved'
    | 'referral_withdrawal_rejected'
    | 'welcome';

export interface Notification {
    id: number;
    created_at: string;
    user_id: string;
    message: string;
    is_read: boolean;
    type: NotificationType;
    link: string | null;
}

// --- Chatbot ---
export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

// --- Charting ---
export interface LineSettings {
    color: string;
    style: number; // 0=Solid, 1=Dotted, 2=Dashed
    width: number;
}

export interface DrawingSettings {
    trendline: LineSettings;
    horizontalLine: LineSettings;
    fibRetracement: LineSettings;
}

// --- Deriv Trading ---
export type UiDerivContractType = 'multiplier' | 'higher_lower' | 'reset';

export interface DerivActiveSymbol {
    allow_forward_starting: number;
    display_name: string;
    exchange_is_open: number;
    is_trading_suspended: number;
    market: string;
    market_display_name: string;
    pip: number;
    submarket: string;
    submarket_display_name: string;
    symbol: string;
    symbol_type: string;
}

export interface DerivBalance {
    balance: number;
    currency: string;
    id: string;
    loginid: string;
}

export interface DerivContractsForSymbol {
    available: {
        barrier_category: string;
        barriers: number;
        contract_category: string;
        contract_category_display: string;
        contract_display: string;
        contract_type: string;
        exchange_name: string;
        expiry_type: string;
        market: string;
        max_contract_duration: string;
        min_contract_duration: string;
        sentiment: string;
        start_type: string;
        submarket: string;
        // FIX: Changed `object` to `any` to avoid potential type inference issues with complex objects.
        trading_period: any;
        underlying_symbol: string;
    }[];
    close: number;
    feed_license: string;
    hit_count: number;
    id: string;
    open: number;
    spot: number;
}

export interface DerivTick {
    ask: number;
    bid: number;
    epoch: number;
    id: string;
    pip_size: number;
    quote: number;
    symbol: string;
}

export interface DerivProposal {
    ask_price: number;
    date_start: number;
    display_value: string;
    id: string;
    longcode: string;
    payout: number;
    spot: number;
    spot_time: number;
    // FIX: Added optional `contract_type` to align with the data structure used in the component.
    contract_type?: string;
}

export interface DerivContract {
    contract_id: number;
    buy_price: number;
    contract_type: string;
    currency: string;
    date_start: number;
    longcode: string;
    payout: number;
    purchase_time: number;
    symbol: string;
    transaction_id: number;
    bid_price: number;
    profit: number;
    is_expired: number;
    is_valid_to_sell: number;
}

export interface DerivPortfolio {
    contracts: DerivContract[];
}

export interface DerivProfitTableEntry {
    app_id: number;
    buy_price: number;
    contract_id: number;
    duration_type: string;
    longcode: string;
    payout: number;
    purchase_time: number;
    sell_price: number;
    sell_time: number;
    shortcode: string;
    transaction_id: number;
    profit_loss: number;
}

export interface DerivTradeParams {
    symbol: string;
    contract_type: string;
    duration: number;
    duration_unit: 't' | 'm' | 'h' | 'd';
    stake: number;
    barrier1?: string;
    multiplier?: number;
    stopLoss?: number;
    takeProfit?: number;
}