
import React, { useState, useEffect, useCallback, useRef } from 'react';
// FIX: Removed extensions from import paths.
import { CompoundingLevel, TradeLog } from '../types';
import { COMPOUNDING_PLAN } from '../constants';
import { AgentStatusDisplay } from '../components/chatbot/AgentStatusDisplay';
import { CompoundingPlanTable } from '../components/compounding/CompoundingPlanTable';
import { TradeLogTable } from '../components/chatbot/TradeLogTable';
import { LoadingSpinner } from '../components/LoadingSpinner';

const DERIV_ASSETS = ['Volatility 75 Index', 'Boom 1000 Index', 'EUR/USD', 'GBP/USD'];

type AgentStatus = 'Idle' | 'Scanning' | 'In Trade' | 'Paused - SL Hit' | 'Completed';

const CompoundingAgentPage: React.FC = () => {
    const [apiToken, setApiToken] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState<AgentStatus>('Idle');
    const [currentLevel, setCurrentLevel] = useState(1);
    const [currentBalance, setCurrentBalance] = useState(COMPOUNDING_PLAN[0].startBalance);
    const [logs, setLogs] = useState<TradeLog[]>([]);
    const [selectedAsset, setSelectedAsset] = useState(DERIV_ASSETS[0]);
    const [activeTab, setActiveTab] = useState<'plan' | 'logs'>('plan');
    const [currentPnl, setCurrentPnl] = useState(0);

    const agentLogicTimeoutRef = useRef<number | null>(null);

    const levelData = COMPOUNDING_PLAN[currentLevel - 1];

    const stopAgent = useCallback((newStatus: AgentStatus) => {
        setIsRunning(false);
        setStatus(newStatus);
        if (agentLogicTimeoutRef.current) {
            clearTimeout(agentLogicTimeoutRef.current);
            agentLogicTimeoutRef.current = null;
        }
    }, []);

    const runAgentLogic = useCallback(() => {
        if (!isRunning || !levelData) {
            stopAgent(levelData ? 'Idle' : 'Completed');
            return;
        }

        setStatus('Scanning');
        setCurrentPnl(0);

        agentLogicTimeoutRef.current = window.setTimeout(() => {
            setStatus('In Trade');
            agentLogicTimeoutRef.current = window.setTimeout(() => {
                const isWin = Math.random() > 0.3;
                const tradeResult: TradeLog = {
                    timestamp: new Date().toISOString(),
                    level: currentLevel,
                    symbol: selectedAsset,
                    entryPrice: 15000 + Math.random() * 100,
                    result: isWin ? 'TP Hit' : 'SL Hit',
                    pnl: isWin ? levelData.profitTarget : -levelData.risk,
                    balance: currentBalance + (isWin ? levelData.profitTarget : -levelData.risk),
                };

                setLogs(prev => [tradeResult, ...prev]);
                setCurrentBalance(tradeResult.balance);

                if (isWin) {
                    if (currentLevel >= COMPOUNDING_PLAN.length) {
                        stopAgent('Completed');
                    } else {
                        setCurrentLevel(prev => prev + 1);
                    }
                } else {
                    stopAgent('Paused - SL Hit');
                }
            }, 5000);
        }, 3000);

    }, [isRunning, currentLevel, currentBalance, selectedAsset, levelData, stopAgent]);

    useEffect(() => {
        if (isRunning && (status === 'Idle' || status === 'Scanning')) {
             if (currentLevel <= COMPOUNDING_PLAN.length) {
                runAgentLogic();
             } else {
                stopAgent('Completed');
             }
        }
        return () => {
            if (agentLogicTimeoutRef.current) {
                clearTimeout(agentLogicTimeoutRef.current);
            }
        };
    }, [isRunning, currentLevel, status, runAgentLogic, stopAgent]);

    const handleStartStop = () => {
        if (isRunning) {
            stopAgent('Idle');
        } else {
            if (!apiToken) {
                alert('Please enter a Deriv API Token.');
                return;
            }
            setIsRunning(true);
            setStatus('Idle');
        }
    };
    
    const handleReset = () => {
        stopAgent('Idle');
        setCurrentLevel(1);
        setCurrentBalance(COMPOUNDING_PLAN[0].startBalance);
        setLogs([]);
        setCurrentPnl(0);
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
            <h1 className="text-3xl font-bold text-white">Autonomous Compounding Agent</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 space-y-6">
                    <input type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)} placeholder="Deriv API Token" disabled={isRunning} className="w-full h-12 px-3 bg-gray-700 text-white rounded-lg" />
                    <div className="flex gap-4">
                        <button onClick={handleStartStop} disabled={!apiToken || status === 'Completed'} className={`w-full h-14 font-semibold rounded-lg ${isRunning ? 'bg-red-600' : 'bg-green-600'} text-white`}>
                            {isRunning ? (status === 'In Trade' || status === 'Scanning' ? <LoadingSpinner /> : 'Stop Agent') : 'Start Agent'}
                        </button>
                    </div>
                     <AgentStatusDisplay status={status} level={currentLevel} balance={currentBalance} pnl={currentPnl} levelData={levelData} />
                </div>
                <div className="lg:col-span-2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                    <div className="flex border-b border-gray-700 mb-4">
                        <button onClick={() => setActiveTab('plan')} className={`px-4 py-2 text-sm ${activeTab === 'plan' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Plan</button>
                        <button onClick={() => setActiveTab('logs')} className={`px-4 py-2 text-sm ${activeTab === 'logs' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-gray-400'}`}>Logs</button>
                    </div>
                    {activeTab === 'plan' ? <CompoundingPlanTable plan={COMPOUNDING_PLAN} currentLevel={currentLevel} /> : <TradeLogTable logs={logs} />}
                </div>
            </div>
        </div>
    );
};

export default CompoundingAgentPage;
