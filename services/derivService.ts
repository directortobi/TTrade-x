
// FIX: Removed .ts extension.
import { 
    DerivActiveSymbol, DerivBalance, DerivProposal, DerivContractsForSymbol, DerivTick, 
    DerivPortfolio, DerivProfitTableEntry, DerivTradeParams
} from '../types';

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
        ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

        ws.onopen = () => {
            ws?.send(JSON.stringify({ authorize: apiToken }));
        };

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            if (data.error) {
                callbacks?.onError(data.error.message);
                return;
            }

            switch (data.msg_type) {
                case 'authorize':
                    if (callbacks) {
                        ws?.send(JSON.stringify({ balance: 1, subscribe: 1 }));
                        ws?.send(JSON.stringify({ active_symbols: 'brief', product_type: 'basic' }));
                        callbacks.onOpen();
                    }
                    break;
                case 'balance':
                    callbacks?.onBalance(data.balance);
                    break;
                case 'active_symbols':
                    callbacks?.onActiveSymbols(data.active_symbols);
                    break;
                case 'contracts_for':
                    callbacks?.onContractsFor(data.contracts_for);
                    break;
                case 'tick':
                    callbacks?.onTick(data.tick);
                    break;
                case 'proposal':
                    // Store the proposal ID based on its contract type for later use
                    if (data.proposal && data.echo_req.contract_type) {
                        proposalIdMap[data.echo_req.contract_type] = data.proposal.id;
                    }
                    callbacks?.onProposal(data.proposal);
                    break;
                case 'portfolio':
                    callbacks?.onPortfolio(data.portfolio);
                    break;
                case 'transaction':
                    callbacks?.onTransaction(!!data.transaction.action);
                    break;
                case 'profit_table':
                    callbacks?.onProfitTable(data.profit_table.transactions);
                    break;
                 case 'history':
                    if (tickHistoryCallback) {
                        tickHistoryCallback(data.history.prices.map((p: string, i: number) => ({
                            epoch: data.history.times[i],
                            open: parseFloat(p),
                            high: parseFloat(p),
                            low: parseFloat(p),
                            close: parseFloat(p),
                        })));
                    }
                    break;
            }
        };

        ws.onerror = () => callbacks?.onError('WebSocket error occurred.');
        ws.onclose = () => callbacks?.onClose();
    },

    disconnect: () => {
        if (ws) {
            ws.close();
            ws = null;
        }
    },
    
    subscribeToTicks: (symbol: string) => {
        ws?.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
    },

    unsubscribeFromTicks: () => {
        ws?.send(JSON.stringify({ forget_all: 'ticks' }));
    },

    getContractsFor: (symbol: string) => {
        ws?.send(JSON.stringify({ contracts_for: symbol }));
    },

    getProposal: (params: Partial<DerivTradeParams>) => {
        if (!params.symbol || !params.contract_type || !params.stake || !params.duration || !params.duration_unit) {
            return;
        }
        
        const req: any = {
            proposal: 1,
            subscribe: 1,
            amount: params.stake,
            basis: 'stake',
            contract_type: params.contract_type,
            currency: 'USD',
            duration: params.duration,
            duration_unit: params.duration_unit,
            symbol: params.symbol,
        };
        if(params.barrier1) req.barrier = params.barrier1;
        if(params.multiplier) req.multiplier = params.multiplier;

        ws?.send(JSON.stringify(req));
    },

    forgetProposal: (proposalId: string) => {
        ws?.send(JSON.stringify({ forget: proposalId }));
    },

    buyContract: (proposalId: string, price: number) => {
        ws?.send(JSON.stringify({
            buy: proposalId,
            price: price
        }));
    },
    
    sellContract: (contractId: number, price: number) => {
        ws?.send(JSON.stringify({ sell: contractId, price: price }));
    },
    
    getPortfolio: () => {
        ws?.send(JSON.stringify({ portfolio: 1 }));
    },

    getProfitTable: () => {
        ws?.send(JSON.stringify({ profit_table: 1, description: 1, limit: 20, sort: 'DESC' }));
    },
};

export { derivService };
