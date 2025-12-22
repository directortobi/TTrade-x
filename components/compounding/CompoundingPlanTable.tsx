
import React from 'react';
import { CompoundingLevel } from '../../types';

export const CompoundingPlanTable: React.FC<{ plan: CompoundingLevel[]; currentLevel: number }> = ({ plan, currentLevel }) => (
    <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-sm text-left text-gray-400">
            <thead className="sticky top-0 bg-gray-800 text-xs uppercase text-gray-500">
                <tr>
                    <th className="px-4 py-2">Lvl</th>
                    <th className="px-4 py-2">Start</th>
                    <th className="px-4 py-2">Risk</th>
                    <th className="px-4 py-2">Profit</th>
                    <th className="px-4 py-2">End</th>
                </tr>
            </thead>
            <tbody>
                {plan.map(lvl => (
                    <tr key={lvl.level} className={`border-b border-gray-700/50 ${lvl.level === currentLevel ? 'bg-indigo-900/20 text-indigo-300' : ''}`}>
                        <td className="px-4 py-2">{lvl.level}</td>
                        <td className="px-4 py-2">${lvl.startBalance}</td>
                        <td className="px-4 py-2 text-red-500/70">${lvl.risk}</td>
                        <td className="px-4 py-2 text-green-500/70">${lvl.profitTarget}</td>
                        <td className="px-4 py-2 font-semibold">${lvl.endBalance}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
