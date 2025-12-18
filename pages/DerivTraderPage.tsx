
import React, { useState, useEffect, useCallback, useRef } from 'react';
// FIX: Removed extensions from import paths.
import { derivService } from '../services/derivService';
import { useSignal } from '../contexts/SignalContext';
import { Signal, DerivActiveSymbol, DerivBalance, DerivProposal, DerivContractsForSymbol, DerivTick, DerivPortfolio, DerivProfitTableEntry, DerivTradeParams, UiDerivContractType } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

const DerivTraderPage: React.FC = () => {
    const [apiToken, setApiToken] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<DerivBalance | null>(null);
    const [activeSymbols, setActiveSymbols] = useState<DerivActiveSymbol[]>([]);
    const [selectedSymbol, setSelectedSymbol] = useState<string>('R_100');
    const [contracts, setContracts] = useState<DerivContractsForSymbol | null>(null);
    const [tick, setTick] = useState<DerivTick | null>(null);
    const [proposals, setProposals] = useState<{ [key: string]: DerivProposal | null }>({});
    const [portfolio, setPortfolio] = useState<DerivPortfolio | null>(null);
    const [profitTable, setProfitTable] = useState<DerivProfitTableEntry[]>([]);
    
    const [tradeParams, setTradeParams] = useState<Partial<DerivTradeParams>>({
        stake: 10,
        duration: 5,
        duration_unit: 't',
        contract_type: 'CALL'
    });
    
    const { signal, contractType, clearSignal } = useSignal();
    const proposalSubIds = useRef<{ [key: string]: string }>({});

    const handleConnect = useCallback(() => {
        if (!apiToken) { setError("No token."); return; }
        setIsLoading(true);
        derivService.connect(apiToken, {
            onOpen: () => { setIsConnected(true); setIsLoading(false); },
            onBalance: setBalance,
            onActiveSymbols: (symbols) => setActiveSymbols(symbols.filter(s => s.market === 'synthetic_index')),
            onContractsFor: setContracts,
            onTick: setTick,
            onProposal: (p: DerivProposal) => setProposals(prev => ({...prev, [p.longcode]: p})),
            onPortfolio: setPortfolio,
            onTransaction: () => { derivService.getPortfolio(); derivService.getProfitTable(); },
            onProfitTable: setProfitTable,
            // FIX: Typed err as any to handle various error sources safely.
            onError: (err: any) => {
                setError(typeof err === 'string' ? err : JSON.stringify(err));
                setIsLoading(false);
                setIsConnected(false);
            },
            onOpen: () => { setIsConnected(true); setIsLoading(false); },
            onClose: () => { setIsConnected(false); setBalance(null); }
        });
    }, [apiToken]);

    useEffect(() => {
        if (isConnected) {
            derivService.subscribeToTicks(selectedSymbol);
            derivService.getContractsFor(selectedSymbol);
            derivService.getPortfolio();
            derivService.getProfitTable();
        }
    }, [isConnected, selectedSymbol]);

    const handleBuy = (proposal: DerivProposal | null | undefined) => {
        if (proposal) derivService.buyContract(proposal.id, proposal.ask_price);
    };

    // FIX: Using type guard and explicit cast to resolve 'unknown' property access errors.
    const callProposal = Object.values(proposals).find((p): p is DerivProposal => !!p && (p as any).contract_type === 'CALL');
    const putProposal = Object.values(proposals).find((p): p is DerivProposal => !!p && (p as any).contract_type === 'PUT');

    if (!isConnected) {
        return (
            <div className="max-w-md mx-auto p-4">
                <input type="password" value={apiToken} onChange={e => setApiToken(e.target.value)} placeholder="API Token" className="w-full h-12 bg-gray-700 text-white rounded-lg mb-4" />
                <button onClick={handleConnect} disabled={isLoading} className="w-full h-12 bg-blue-600 text-white rounded-lg">
                    {isLoading ? <LoadingSpinner /> : 'Connect'}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                <h2 className="text-white font-bold">Balance: ${balance?.balance.toFixed(2)}</h2>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button onClick={() => handleBuy(callProposal)} disabled={!callProposal} className="h-20 bg-green-600 text-white font-bold rounded-lg">Rise</button>
                    <button onClick={() => handleBuy(putProposal)} disabled={!putProposal} className="h-20 bg-red-600 text-white font-bold rounded-lg">Fall</button>
                </div>
            </div>
        </div>
    );
};

export default DerivTraderPage;
