import React from 'react';
import { CompoundingLevel } from '../../types';

type AgentStatus = 'Idle' | 'Scanning' | 'In Trade' | 'Paused - SL Hit' | 'Completed';

interface AgentStatusDisplayProps {
    status: AgentStatus;
    level: number;
    balance: number;
    pnl: number;
    levelData?: CompoundingLevel;
}

const StatusIndicator: React.FC<{ status: AgentStatus }> = ({ status }) => {
    const statusConfig = {
        'Idle': { color: 'bg-gray-500', text: 'Idle' },
        'Scanning': { color: 'bg-blue-500 animate-pulse', text: 'Scanning Market' },
        'In Trade': { color: 'bg-purple-500', text: 'Position Open' },
        'Paused - SL Hit': { color: 'bg-red-500', text: 'Paused - SL Hit' },
        'Completed': { color: 'bg-green-500', text: 'Plan Completed!' },
    };
    const config = statusConfig[status];

    return (
        <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
            <span className="font-semibold text-white">{config.text}</span>
        </div>
    );
};

const Metric: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className="bg-gray-900/50 p-3 rounded-lg">
        <div className="text-xs text-gray-400">{label}</div>
        <div className={`text-xl font-bold text-white ${className}`}>{value}</div>
    </div>
);

export const AgentStatusDisplay: React.FC<AgentStatusDisplayProps> = ({ status, level, balance, pnl, levelData }) => {
    
    const pnlColor = pnl > 0 ? 'text-green-400' : pnl < 0 ? 'text-red-400' : 'text-gray-300';

    return (
        <div className="space-y-4 border-t border-gray-700 pt-4">
            <div className="bg-gray-900/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Live Status</h3>
                <StatusIndicator status={status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Metric label="Current Level" value={`${level}`} />
                <Metric label="Account Balance" value={`$${balance.toFixed(2)}`} />
            </div>

            {status === 'In Trade' && levelData && (
                 <div className="bg-gray-900/50 p-3 rounded-lg">
                     <div className="text-xs text-gray-400">Live Trade P/L</div>
                     <div className={`text-2xl font-bold ${pnlColor}`}>{pnl > 0 ? '+' : ''}${pnl.toFixed(2)}</div>
                     <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                        <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${Math.min(100, (pnl / levelData.profitTarget) * 100)}%` }}
                        ></div>
                    </div>
                     <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>$0</span>
                        <span>Target: ${levelData.profitTarget.toFixed(2)}</span>
                     </div>
                 </div>
            )}

            {status === 'Paused - SL Hit' && levelData && (
                <div className="bg-red-900/50 p-4 rounded-lg text-center">
                    <p className="font-semibold text-red-300">Stop-Loss Hit</p>
                    <p className="text-sm text-gray-400">Risked: ${levelData.risk.toFixed(2)}</p>
                    <p className="text-sm text-gray-400 mt-2">Please reset the agent to try again from Level 1.</p>
                </div>
            )}
             {status === 'Completed' && (
                <div className="bg-green-900/50 p-4 rounded-lg text-center">
                    <p className="font-semibold text-green-300">Congratulations!</p>
                    <p className="text-sm text-gray-400">You have completed the 30-level plan.</p>
                </div>
            )}
        </div>
    );
};
