import React, { createContext, useState, useContext, useCallback } from 'react';
import { AnalysisResult, UiDerivContractType } from '../types';

interface SignalContextState {
    signal: AnalysisResult | null;
    contractType: UiDerivContractType | null;
    setSignal: (signal: AnalysisResult, contractType: UiDerivContractType) => void;
    clearSignal: () => void;
}

const SignalContext = createContext<SignalContextState | undefined>(undefined);

export const SignalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [signal, setSignal] = useState<AnalysisResult | null>(null);
    const [contractType, setContractType] = useState<UiDerivContractType | null>(null);

    const handleSetSignal = useCallback((newSignal: AnalysisResult, newContractType: UiDerivContractType) => {
        setSignal(newSignal);
        setContractType(newContractType);
    }, []);

    const handleClearSignal = useCallback(() => {
        setSignal(null);
        setContractType(null);
    }, []);

    return (
        <SignalContext.Provider value={{ signal, contractType, setSignal: handleSetSignal, clearSignal: handleClearSignal }}>
            {children}
        </SignalContext.Provider>
    );
};

export const useSignal = (): SignalContextState => {
    const context = useContext(SignalContext);
    if (!context) {
        throw new Error('useSignal must be used within a SignalProvider');
    }
    return context;
};
