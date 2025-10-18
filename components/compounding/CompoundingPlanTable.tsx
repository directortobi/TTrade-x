import React from 'react';
import { CompoundingLevel } from '../../types';

interface CompoundingPlanTableProps {
    plan: CompoundingLevel[];
    currentLevel: number;
}

const Checkmark: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export const CompoundingPlanTable: React.FC<CompoundingPlanTableProps> = ({ plan, currentLevel }) => {
    return (
        <div className="overflow-x-auto max-h-[60vh] pr-2">
            {/* Desktop Table */}
            <table className="hidden md:table w-full min-w-[600px] text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900/70 sticky top-0">
                    <tr>
                        <th scope="col" className="px-4 py-3">Level</th>
                        <th scope="col" className="px-4 py-3">Start Balance</th>
                        <th scope="col" className="px-4 py-3">Profit Target</th>
                        <th scope="col" className="px-4 py-3 text-red-400">Risk</th>
                        <th scope="col" className="px-4 py-3">End Balance</th>
                    </tr>
                </thead>
                <tbody>
                    {plan.map((item) => {
                        const isCurrent = item.level === currentLevel;
                        const isCompleted = item.level < currentLevel;
                        return (
                            <tr
                                key={item.level}
                                className={`border-b border-gray-700 transition-colors duration-300
                                    ${isCurrent ? 'bg-indigo-900/50' : ''}
                                    ${isCompleted ? 'bg-gray-800/60 text-gray-500' : ''}
                                `}
                            >
                                <th scope="row" className="px-4 py-3 font-medium text-white whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        {isCurrent && <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>}
                                        {isCompleted && <Checkmark />}
                                        {item.level}
                                    </div>
                                </th>
                                <td className="px-4 py-3">${item.startBalance.toFixed(2)}</td>
                                <td className="px-4 py-3 text-green-400">+${item.profitTarget.toFixed(2)}</td>
                                <td className="px-4 py-3 text-red-400">-${item.risk.toFixed(2)}</td>
                                <td className="px-4 py-3 font-bold text-green-300/80">${item.endBalance.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {/* Mobile Card List */}
            <div className="block md:hidden space-y-3">
                {plan.map(item => {
                    const isCurrent = item.level === currentLevel;
                    const isCompleted = item.level < currentLevel;
                    return (
                        <div key={item.level} className={`p-4 rounded-lg border transition-all duration-300 ${
                            isCurrent ? 'bg-indigo-900/50 border-indigo-700' : 
                            isCompleted ? 'bg-gray-800/60 border-gray-700 text-gray-500' : 
                            'bg-gray-900/50 border-gray-700'
                        }`}>
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 font-bold text-white">
                                    {isCurrent && <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse"></div>}
                                    {isCompleted && <Checkmark />}
                                    Level {item.level}
                                </div>
                                <span className={`font-bold ${isCompleted ? 'text-green-500/80' : 'text-green-300/80'}`}>
                                    End: ${item.endBalance.toFixed(2)}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs text-center">
                                <div className={isCompleted ? 'text-gray-500' : ''}>
                                    <p className="text-gray-400">Start</p>
                                    <p className="font-mono">${item.startBalance.toFixed(2)}</p>
                                </div>
                                <div className={isCompleted ? 'text-green-500/50' : 'text-green-400'}>
                                    <p>Target</p>
                                    <p className="font-mono">+${item.profitTarget.toFixed(2)}</p>
                                </div>
                                <div className={isCompleted ? 'text-red-500/50' : 'text-red-400'}>
                                    <p>Risk</p>
                                    <p className="font-mono">-${item.risk.toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
