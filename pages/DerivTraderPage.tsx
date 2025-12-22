import React, { useState, useEffect, useCallback, useRef } from 'react';
import { derivService } from '../services/derivService';
import { useSignal } from '../contexts/SignalContext';
import { Signal, DerivActiveSymbol, DerivBalance, DerivProposal, DerivContractsForSymbol, DerivTick, DerivPortfolio, DerivProfitTableEntry, DerivTradeParams } from '../types';
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

    const handleConnect = useCallback(() => {
        if (!apiToken) {
            setError("Please enter a valid Deriv API Token.");
            return;
        }
        setIsLoading(true);
        setError(null);
        derivService.connect(apiToken, {
            onOpen: () => {
                setIsConnected(true);
                setIsLoading(false);
            },
            onBalance: setBalance,
            onActiveSymbols: (symbols) => setActiveSymbols(symbols.filter(s => s.market === 'synthetic_index')),
            onContractsFor: setContracts,
            onTick: setTick,
            onProposal: (p: DerivProposal) => setProposals(prev => ({...prev, [p.longcode]: p})),
            onPortfolio: setPortfolio,
            onTransaction: () => {
                derivService.getPortfolio();
                derivService.getProfitTable();
            },
            onProfitTable: setProfitTable,
            onError: (err: unknown) => {
                const message = typeof err === 'string' ? err : (err instanceof Error ? err.message : String(err));
                setError(message);
                setIsLoading(false);
                setIsConnected(false);
            },
            onClose: () => {
                setIsConnected(false);
                setBalance(null);
            }
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

    if (!isConnected) {
        return (
            <div className="max-w-md mx-auto text-center p-8 bg-gray-800 rounded-2xl border border-gray-700">
                <h1 className="text-2xl font-bold text-white mb-6">Connect to Deriv</h1>
                {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
                <input
                    type="password"
                    value={apiToken}
                    onChange={e => setApiToken(e.target.value)}
                    placeholder="Enter Deriv API Token"
                    className="w-full h-12 px-3 text-white bg-gray-700 border border-gray-600 rounded-md mb-4"
                />
                <button onClick={handleConnect} disabled={isLoading} className="w-full h-12 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-600">
                    {isLoading ? <LoadingSpinner /> : 'Connect Terminal'}
                </button>
            </div>
        );
    }

    // FIX: Added explicit type to parameter 'p' in find() to resolve 'unknown' type error when accessing contract_type.
    const callProposal = Object.values(proposals).find((p: any): p is DerivProposal => p?.contract_type === 'CALL');
    // FIX: Added explicit type to parameter 'p' in find() to resolve 'unknown' type error when accessing contract_type.
    const putProposal = Object.values(proposals).find((p: any): p is DerivProposal => p?.contract_type === 'PUT');

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
             <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-6">
                     <h2 className="text-xl font-bold text-white">Deriv Terminal</h2>
                     <p className="font-bold text-lg text-green-400">${balance?.balance.toFixed(2)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleBuy(callProposal)} disabled={!callProposal} className="h-24 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 disabled:opacity-50">Rise</button>
                    <button onClick={() => handleBuy(putProposal)} disabled={!putProposal} className="h-24 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 disabled:opacity-50">Fall</button>
                </div>
            </div>
        </div>
    );
};

export default DerivTraderPage;