import { 
    DerivActiveSymbol, DerivBalance, DerivProposal, DerivContractsForSymbol, DerivTick, 
    DerivPortfolio, DerivProfitTableEntry, DerivTradeParams
// FIX: Add .ts extension to import path.
} from '../types.ts';

type MessageCallback = (data: any) => void;
type TickHistoryCallback = (history: any[]) => void;

interface Callbacks {
    onOpen: () => void;
    onBalance: (balance: DerivBalance) => void;
    onActiveSymbols: (symbols: DerivActiveSymbol[]) => void;
    onContractsFor: (contracts: DerivContractsForSymbol) => void;
    onTick: (tick: DerivTick) => void;
    onProposal: (proposal: DerivProposal) => void;
    onPortfolio: (portfolio: DerivPortfolio) => void;
    onTransaction: (isSale: boolean) => void;
    onProfitTable: (table: DerivProfitTableEntry[]) => void;
    onError: (error: string) => void;
    onClose: () => void;
}

let ws: WebSocket | null = null;
let callbacks: Callbacks | null = null;
let tickHistoryCallback: TickHistoryCallback | null = null;
let proposalIdMap: { [key: string]: string } = {}; // To store proposal IDs for different contract types

const derivService = {
    connect: async (apiToken: string, cbs: Callbacks) => {
        callbacks = cbs;
        ws = new WebSocket('wss://