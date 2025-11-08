import React from 'react';
import { CompoundingLevel } from '../../types';

interface CompoundingPlanTableProps {
    plan: CompoundingLevel[];
    currentLevel: number;
}

export const CompoundingPlanTable: React.FC<CompoundingPlanTableProps> = ({ plan, currentLevel }) => {
    return (
        <div className="overflow-x-auto max-h-[60vh] pr-2">
            <table className="w-full min-w-[600px] text-sm text-left text-gray-300">
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
        </div>
    );
};

const Checkmark: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
)
