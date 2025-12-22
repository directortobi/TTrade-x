
import React from 'react';
import { CompoundingLevel } from '../../types';

interface AgentStatusDisplayProps {
    status: string;
    level: number;
    balance: number;
    pnl: number;
    levelData?: CompoundingLevel;
}

export const AgentStatusDisplay: React.FC<AgentStatusDisplayProps> = ({ status, level, balance, pnl, levelData }) => (
    <div className="space-y-4 p-4 bg-gray-900/50 rounded-xl border border-gray-700">
        <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Agent Status</span>
            <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'In Trade' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{status}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-gray-500 text-xs uppercase">Current Level</p>
                <p className="text-xl font-bold">{level}/30</p>
            </div>
            <div>
                <p className="text-gray-500 text-xs uppercase">Account Balance</p>
                <p className="text-xl font-bold text-green-400">${balance.toFixed(2)}</p>
            </div>
        </div>
    </div>
);
