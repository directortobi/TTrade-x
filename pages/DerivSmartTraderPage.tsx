import React, { useState, useEffect, useCallback } from 'react';
import { derivService } from '../services/derivService';
import { DerivActiveSymbol, DerivBalance, DerivProposal, DerivContractsForSymbol, DerivTick, DerivTradeParams } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

const DerivSmartTraderPage: React.FC = () => {
    const [apiToken, setApiToken] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<DerivBalance | null>(null);
    
    const handleConnect = useCallback(() => {
        if (!apiToken) return;
        setIsLoading(true);
        setError(null);
        derivService.connect(apiToken, {
            onOpen: () => {
                setIsConnected(true);
                setIsLoading(false);
            },
            onBalance: setBalance,
            onActiveSymbols: () => {},
            onContractsFor: () => {},
            onTick: () => {},
            onProposal: () => {},
            onPortfolio: () => {},
            onTransaction: () => {},
            onProfitTable: () => {},
            onError: (err: unknown) => {
                const message = typeof err === 'string' ? err : (err instanceof Error ? err.message : String(err));
                setError(message);
                setIsLoading(false);
                setIsConnected(false);
            },
            onClose: () => {
                setIsConnected(false);
            }
        });
    }, [apiToken]);

    if (!isConnected) {
        return (
            <div className="max-w-md mx-auto p-8 bg-gray-800 rounded-2xl border border-gray-700 text-center">
                <h1 className="text-2xl font-bold text-white mb-6">Smart Trader</h1>
                {error && <div className="mb-4"><ErrorAlert message={error} /></div>}
                <input
                    type="password"
                    value={apiToken}
                    onChange={e => setApiToken(e.target.value)}
                    className="w-full h-12 bg-gray-700 text-white rounded-lg mb-4 px-3 border border-gray-600"
                    placeholder="Deriv API Token"
                />
                <button onClick={handleConnect} disabled={isLoading} className="w-full h-12 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                    {isLoading ? <LoadingSpinner /> : 'Connect Smart Terminal'}
                </button>
            </div>
        );
    }

    return (
        <div className="text-white p-8 bg-gray-800 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-bold">Smart Trader Connected</h2>
            <p className="mt-2 text-gray-400">Balance: ${balance?.balance.toFixed(2)}</p>
        </div>
    );
};

export default DerivSmartTraderPage;
