import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const [proposal, setProposal] = useState<DerivProposal | null>(null);
    const [portfolio, setPortfolio] = useState<DerivPortfolio | null>(null);
    const [profitTable, setProfitTable] = useState<DerivProfitTableEntry[]>([]);
    const [tradeParams, setTradeParams] = useState<Partial<DerivTradeParams>>({
        stake: 10,
        duration: 5,
        duration_unit: 't'
    });

    const { signal, contractType, clearSignal } = useSignal();

    const handleConnect = () => {
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
            onProposal: setProposal,
            onPortfolio: setPortfolio,
            onTransaction: () => {
                derivService.getPortfolio();
                derivService.getProfitTable();
            },
            onProfitTable: setProfitTable,
            onError: (err) => {
                setError(err);
                setIsLoading(false);
                setIsConnected(false);
            },
            onClose: () => {
                setIsConnected(false);
                setBalance(null);
            }
        });
    };

    useEffect(() => {
        if (isConnected && selectedSymbol) {
            derivService.unsubscribeFromTicks();
            derivService.subscribeToTicks(selectedSymbol);
            derivService.getContractsFor(selectedSymbol);
            derivService.getPortfolio();
            derivService.getProfitTable();
        }
    }, [isConnected, selectedSymbol]);

    // Effect to pre-fill form from a signal context
    useEffect(() => {
        if (signal && contractType) {
            // Logic to map signal to trade params
            const newParams: Partial<DerivTradeParams> = {
                stake: 10, // default stake
            };
            const symbolInfo = activeSymbols.find(s => s.display_name === signal.pair || s.symbol === signal.pair);
            if (symbolInfo) {
                setSelectedSymbol(symbolInfo.symbol);
            }

            if (contractType === 'multiplier') {
                newParams.contract_type = signal.signal === Signal.BUY ? 'MULTUP' : 'MULTDOWN';
                newParams.takeProfit = signal.takeProfit;
                newParams.stopLoss = signal.stopLoss;
            } else if (contractType === 'higher_lower') {
                newParams.contract_type = signal.signal === Signal.BUY ? 'CALL' : 'PUT';
                newParams.duration = 5;
                newParams.duration_unit = 't';
            } else if (contractType === 'reset') {
                 newParams.contract_type = signal.signal === Signal.BUY ? 'RESETCALL' : 'RESETPUT';
                 newParams.duration = 5;
                 newParams.duration_unit = 't';
            }
            
            setTradeParams(prev => ({...prev, ...newParams}));
            clearSignal(); // Clear signal after using it
        }
    }, [signal, contractType, activeSymbols, clearSignal]);
    
    const handleBuy = () => {
        if (proposal) {
            derivService.buyContract(proposal.id, proposal.ask_price, tradeParams as DerivTradeParams);
        }
    };
    
    if (!isConnected) {
        return (
            <div className="max-w-md mx-auto text-center">
                <h1 className="text-2xl font-bold text-white mb-4">Connect to Deriv</h1>
                {error && <ErrorAlert message={error} />}
                <input
                    type="password"
                    value={apiToken}
                    onChange={e => setApiToken(e.target.value)}
                    placeholder="Enter Deriv API Token"
                    className="w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm mb-4"
                />
                <button onClick={handleConnect} disabled={isLoading} className="w-full h-12 flex justify-center items-center text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700">
                    {isLoading ? <LoadingSpinner /> : 'Connect'}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h2 className="text-xl font-bold text-white">Trade Terminal</h2>
                <div className="grid grid-cols-2 gap-4 my-4">
                    <div>
                        <label className="text-sm text-gray-400">Asset</label>
                        <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} className="w-full h-10 pl-3 text-white bg-gray-700 border border-gray-600 rounded-lg">
                            {activeSymbols.map(s => <option key={s.symbol} value={s.symbol}>{s.display_name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Contract Type</label>
                        <select value={tradeParams.contract_type} onChange={e => setTradeParams({...tradeParams, contract_type: e.target.value})} className="w-full h-10 pl-3 text-white bg-gray-700 border border-gray-600 rounded-lg">
                           {contracts?.available?.map(c => <option key={c.contract_type} value={c.contract_type}>{c.contract_display}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4 my-4">
                     <div>
                        <label className="text-sm text-gray-400">Stake ($)</label>
                        <input type="number" value={tradeParams.stake} onChange={e => setTradeParams({...tradeParams, stake: parseFloat(e.target.value)})} className="w-full h-10 pl-3 text-white bg-gray-700 border border-gray-600 rounded-lg" />
                    </div>
                    {/* Add more inputs for other params like duration, barriers etc. */}
                </div>
                <button onClick={handleBuy} disabled={!proposal} className="w-full h-12 bg-green-600 text-white font-bold rounded-lg disabled:bg-gray-500">
                    Place Trade
                </button>
            </div>
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-lg">Balance: ${balance?.balance.toFixed(2)}</h3>
                    <p className="text-sm text-gray-400">Current Price ({tick?.symbol}): <span className="font-mono">{tick?.quote}</span></p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <h3 className="font-bold text-lg">Open Positions</h3>
                    <ul>
                        {portfolio?.contracts.map(c => (
                            <li key={c.contract_id}>{c.longcode} - Buy Price: ${c.buy_price}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DerivTraderPage;
