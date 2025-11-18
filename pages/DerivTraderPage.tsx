import React, { useState, useEffect, useCallback, useRef } from 'react';
import { derivService } from '../services/derivService.ts';
import { useSignal } from '../contexts/SignalContext.tsx';
// FIX: Add .ts extension to import path.
import { Signal, DerivActiveSymbol, DerivBalance, DerivProposal, DerivContractsForSymbol, DerivTick, DerivPortfolio, DerivProfitTableEntry, DerivTradeParams, UiDerivContractType } from '../types.ts';
// FIX: Add .tsx extension to import path.
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
// FIX: Add .tsx extension to import path.
import { ErrorAlert } from '../components/ErrorAlert.tsx';

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

    const clearError = () => setError(null);

    const handleConnect = useCallback(() => {
        if (!apiToken) {
            setError("Please enter a valid Deriv API Token.");
            return;
        }
        setIsLoading(true);
        clearError();
        derivService.connect(apiToken, {
            onOpen: () => {
                setIsConnected(true);
                setIsLoading(false);
            },
            onBalance: setBalance,
            onActiveSymbols: (symbols) => setActiveSymbols(symbols.filter(s => s.market === 'synthetic_index')),
            onContractsFor: setContracts,
            onTick: setTick,
            // FIX: Explicitly type the `p` parameter to ensure correct type inference in the `proposals` state.
            onProposal: (p: DerivProposal) => setProposals(prev => ({...prev, [p.longcode]: p})),
            onPortfolio: setPortfolio,
            onTransaction: () => {
                derivService.getPortfolio();
                derivService.getProfitTable();
            },
            onProfitTable: (table) => setProfitTable(table),
            // FIX: Changed onError signature to match service contract.
            onError: (err: string) => {
                setError(err);
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
            derivService.unsubscribeFromTicks();
            derivService.subscribeToTicks(selectedSymbol);
            derivService.getContractsFor(selectedSymbol);
            derivService.getPortfolio();
            derivService.getProfitTable();
            setTradeParams(prev => ({ ...prev, symbol: selectedSymbol, contract_type: 'CALL' }));
        }
    }, [isConnected, selectedSymbol]);

    useEffect(() => {
        if (signal && contractType) {
            const symbolInfo = activeSymbols.find(s => s.display_name === signal.pair || s.symbol === signal.pair);
            if (symbolInfo) {
                setSelectedSymbol(symbolInfo.symbol);
            }

            let newParams: Partial<DerivTradeParams> = { symbol: symbolInfo?.symbol || signal.pair, stake: 10, duration: 5, duration_unit: 'm' };
            if (contractType === 'multiplier') {
                newParams.contract_type = signal.signal === Signal.BUY ? 'MULTUP' : 'MULTDOWN';
                newParams.takeProfit = signal.takeProfit;
                newParams.stopLoss = signal.stopLoss;
            } else {
                newParams.contract_type = signal.signal === Signal.BUY ? 'CALL' : 'PUT';
            }
            setTradeParams(newParams);
            clearSignal();
        }
    }, [signal, contractType, activeSymbols, clearSignal]);

    // Request proposals when trade params change
    useEffect(() => {
        const getProposals = () => {
            if (!isConnected || !tradeParams.contract_type) return;

            Object.values(proposalSubIds.current).forEach(id => derivService.forgetProposal(id));
            proposalSubIds.current = {};
            setProposals({});

            const baseParams = { ...tradeParams, symbol: selectedSymbol };
            
            if (tradeParams.contract_type.includes('MULT')) {
                derivService.getProposal(baseParams);
            } else {
                 derivService.getProposal({ ...baseParams, contract_type: 'CALL' });
                 derivService.getProposal({ ...baseParams, contract_type: 'PUT' });
            }
        };
        const timeoutId = setTimeout(getProposals, 300); // Debounce
        return () => clearTimeout(timeoutId);

    }, [isConnected, selectedSymbol, tradeParams]);
    
    // FIX: Update function signature to accept `undefined` to match the return type of `Array.prototype.find`.
    const handleBuy = (proposal: DerivProposal | null | undefined) => {
        if (proposal) {
            derivService.buyContract(proposal.id, proposal.ask_price);
        }
    };
    
    const handleSell = (contractId: number) => {
        derivService.sellContract(contractId, 0); // Price 0 means sell at market price
    }

    if (!isConnected) {
        return (
            <div className="max-w-md mx-auto text-center p-4">
                <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700 shadow-lg">
                    <h1 className="text-2xl font-bold text-white mb-4">Connect to Deriv</h1>
                    {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
                    <input
                        type="password"
                        value={apiToken}
                        onChange={e => { setApiToken(e.target.value); clearError(); }}
                        placeholder="Enter Deriv API Token"
                        className="w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm mb-4"
                    />
                    <button onClick={handleConnect} disabled={isLoading || !apiToken} className="w-full h-12 flex justify-center items-center text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? <LoadingSpinner /> : 'Connect'}
                    </button>
                    <p className="text-xs text-gray-500 mt-4">Your token is stored locally and never sent to our servers.</p>
                </div>
            </div>
        );
    }
    
    // FIX: Use type guard and optional chaining to safely find proposals.
    const callProposal = Object.values(proposals).find((p): p is DerivProposal => p?.contract_type === 'CALL');
    const putProposal = Object.values(proposals).find((p): p is DerivProposal => p?.contract_type === 'PUT');

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left/Main Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-xl font-bold text-white">Trade Terminal</h2>
                         <div className="text-right">
                             <p className="font-bold text-lg text-green-400">${balance?.balance.toFixed(2)}</p>
                             <p className="text-xs text-gray-500">{balance?.loginid}</p>
                         </div>
                    </div>
                   
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} className="w-full h-10 pl-3 text-white bg-gray-700 border border-gray-600 rounded-lg">
                            {activeSymbols.map(s => <option key={s.symbol} value={s.symbol}>{s.display_name}</option>)}
                        </select>
                         <select value={tradeParams.contract_type} onChange={e => setTradeParams({...tradeParams, contract_type: e.target.value})} className="w-full h-10 pl-3 text-white bg-gray-700 border border-gray-600 rounded-lg">
                           {contracts?.available?.map(c => <option key={c.contract_type} value={c.contract_type}>{c.contract_display}</option>)}
                        </select>
                         <input type="number" value={tradeParams.stake} onChange={e => setTradeParams({...tradeParams, stake: parseFloat(e.target.value) || 0})} placeholder="Stake" className="w-full h-10 pl-3 text-white bg-gray-700 border border-gray-600 rounded-lg" />
                         <div className="flex gap-2">
                            <input type="number" value={tradeParams.duration} onChange={e => setTradeParams({...tradeParams, duration: parseInt(e.target.value) || 0})} placeholder="Duration" className="w-2/3 h-10 pl-3 text-white bg-gray-700 border border-gray-600 rounded-lg" />
                            <select value={tradeParams.duration_unit} onChange={e => setTradeParams({...tradeParams, duration_unit: e.target.value as 't'|'m'})} className="w-1/3 h-10 pl-2 text-white bg-gray-700 border border-gray-600 rounded-lg">
                                <option value="t">Ticks</option>
                                <option value="m">Minutes</option>
                            </select>
                         </div>
                    </div>
                    {error && <div className="mt-4"><ErrorAlert message={error} /></div>}
                     <div className="grid grid-cols-2 gap-4 mt-4">
                        <button onClick={() => handleBuy(callProposal)} disabled={!callProposal} className="h-20 bg-green-600 text-white font-bold rounded-lg disabled:bg-gray-600/50 flex flex-col items-center justify-center transition-colors">
                            <span>Higher / Rise</span>
                            <span className="text-xs font-normal">Payout: ${callProposal?.payout.toFixed(2)}</span>
                        </button>
                        <button onClick={() => handleBuy(putProposal)} disabled={!putProposal} className="h-20 bg-red-600 text-white font-bold rounded-lg disabled:bg-gray-600/50 flex flex-col items-center justify-center transition-colors">
                             <span>Lower / Fall</span>
                            <span className="text-xs font-normal">Payout: ${putProposal?.payout.toFixed(2)}</span>
                        </button>
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                    <h3 className="font-bold text-lg mb-2">Open Positions</h3>
                    <div className="overflow-x-auto max-h-64">
                         <table className="w-full text-sm">
                             <thead><tr className="text-left text-gray-400"><th className="p-2">Contract</th><th className="p-2">Buy Price</th><th className="p-2">Current Price</th><th className="p-2">Profit/Loss</th><th className="p-2"></th></tr></thead>
                             <tbody>
                                {portfolio?.contracts.map(c => (
                                    <tr key={c.contract_id} className="border-t border-gray-700">
                                        <td className="p-2">{c.longcode}</td>
                                        <td className="p-2">${c.buy_price.toFixed(2)}</td>
                                        <td className="p-2">${c.bid_price.toFixed(2)}</td>
                                        <td className={`p-2 font-semibold ${c.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>{c.profit > 0 ? '+':''}${c.profit.toFixed(2)}</td>
                                        <td className="p-2 text-right"><button onClick={() => handleSell(c.contract_id)} disabled={!c.is_valid_to_sell} className="px-2 py-1 text-xs bg-gray-600 rounded hover:bg-gray-500 disabled:opacity-50">Sell</button></td>
                                    </tr>
                                ))}
                                {(!portfolio || portfolio.contracts.length === 0) && <tr><td colSpan={5} className="text-center p-4 text-gray-500">No open positions.</td></tr>}
                             </tbody>
                         </table>
                    </div>
                </div>
            </div>
            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 text-center">
                    <p className="text-sm text-gray-400">{selectedSymbol}</p>
                    <p className={`text-4xl font-mono font-bold transition-colors ${tick && tick.quote > (tick.bid || 0) ? 'text-green-400' : 'text-red-400'}`}>{tick?.quote}</p>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700">
                    <h3 className="font-bold text-lg mb-2">Recent Trades</h3>
                    <div className="overflow-y-auto max-h-96">
                        <table className="w-full text-sm">
                             <tbody>
                                {profitTable.map(t => (
                                     <tr key={t.contract_id} className="border-b border-gray-700 last:border-0">
                                        <td className="p-2">
                                            <p className="font-medium">{t.shortcode.split('_')[0]}</p>
                                            <p className="text-xs text-gray-500">{new Date(t.sell_time * 1000).toLocaleTimeString()}</p>
                                        </td>
                                        <td className={`p-2 text-right font-semibold ${t.profit_loss > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {t.profit_loss > 0 ? '+':''}${t.profit_loss.toFixed(2)}
                                        </td>
                                     </tr>
                                ))}
                                 {profitTable.length === 0 && <tr><td colSpan={2} className="text-center p-4 text-gray-500">No recent trade history.</td></tr>}
                             </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DerivTraderPage;