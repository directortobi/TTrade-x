
import React from 'react';
import { TradeLog } from '../../types';

export const TradeLogTable: React.FC<{ logs: TradeLog[] }> = ({ logs }) => (
    <div className="overflow-x-auto max-h-[400px]">
        <table className="w-full text-sm text-left text-gray-400">
            <thead className="sticky top-0 bg-gray-800 text-xs uppercase text-gray-500">
                <tr>
                    <th className="px-4 py-2">Time</th>
                    <th className="px-4 py-2">Asset</th>
                    <th className="px-4 py-2">Result</th>
                    <th className="px-4 py-2">P/L</th>
                </tr>
            </thead>
            <tbody>
                {logs.map((log, i) => (
                    <tr key={i} className="border-b border-gray-700/50">
                        <td className="px-4 py-2">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="px-4 py-2">{log.symbol}</td>
                        <td className="px-4 py-2">{log.result}</td>
                        <td className={`px-4 py-2 font-bold ${log.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>${log.pnl.toFixed(2)}</td>
                    </tr>
                ))}
                {logs.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-600">No trades executed yet.</td></tr>}
            </tbody>
        </table>
    </div>
);
