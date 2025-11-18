import React, { useState, useEffect, useCallback, useRef } from 'react';
import { derivService } from '../services/derivService.ts';
import { DerivActiveSymbol, DerivBalance, DerivProposal, DerivContractsForSymbol, DerivTick, DerivPortfolio, DerivProfitTableEntry, DerivTradeParams } from '../types.ts';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import { ErrorAlert } from '../components/ErrorAlert.tsx';

const DerivSmartTraderPage: React.FC = () => {
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
            onContractsFor: (contracts) => {
                setContracts(contracts);
                // Set default contract type if the current one is not available for the new symbol
                const defaultContract = contracts.available.find(c => c.contract_type === 'CALL');
                if (defaultContract) {
                    setTradeParams(prev => ({...prev, contract_type: defaultContract.contract_type}));
                } else if (contracts.available.length > 0) {
                     setTradeParams(prev => ({...prev, contract_type: contracts.available[0].contract_type}));
                }
            },
            onTick: setTick,
            onProposal: (p: DerivProposal) => {
                if (p?.contract_type) {
                     setProposals(prev => ({...prev, [p.contract_type]: p}));
                }
            },
            onPortfolio: setPortfolio,
            onTransaction: () => { // Refresh portfolio and profit table after a trade
                derivService.getPortfolio();
                derivService.getProfitTable();
            },
            onProfitTable: setProfitTable,
            // FIX: Changed the onError signature to accept a string to match the derivService contract, resolving the type error.
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
        return () => {
            derivService.disconnect();
        };
    }, []);
    
    useEffect(() => {
        if (isConnected) {
            derivService.unsubscribeFromTicks();
            derivService.subscribeToTicks(selectedSymbol);
            derivService.getContractsFor(selectedSymbol);
            derivService.getPortfolio();
            derivService.getProfitTable();
            setTradeParams(prev => ({ ...prev, symbol: selectedSymbol }));
        }
    }, [isConnected, selectedSymbol]);

    // Request proposals when trade params change
    useEffect(() => {
        const getProposals = () => {
            if (!isConnected || !tradeParams.contract_type) return;

            Object.values(proposalSubIds.current).forEach(id => derivService.forgetProposal(id));
            proposalSubIds.current = {};
            setProposals({});

            const baseParams = { ...tradeParams, symbol: selectedSymbol };
            
            // For Rise/Fall, we want both proposals to show payouts
            if (['CALL', 'PUT'].includes(tradeParams.contract_type)) {
                 derivService.getProposal({ ...baseParams, contract_type: 'CALL' });
                 derivService.getProposal({ ...baseParams, contract_type: 'PUT' });
            } else {
                // For other