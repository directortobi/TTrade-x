import React from 'react';
import { TradeLog } from '../../types';

interface TradeLogTableProps {
    logs: TradeLog[];
}

export const TradeLogTable: React.FC<TradeLogTableProps> = ({ logs }) => {
    if (logs.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-400">No trades have been executed yet.</p>
                <p className="text-sm text-gray-500">Start the agent to begin trading.</p>
            </div>
        );
    }
    
    return (
        <div className="overflow-x-auto max-h-[60vh]">
            {/* Desktop Table */}
            <table className="hidden md:table w-full min-w-[600px] text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900/70 sticky top-0">
                    <tr>
                        <th scope="col" className="px-4 py-3">Timestamp</th>
                        <th scope="col" className="px-4 py-3">Level</th>
                        <th scope="col" className="px-4 py-3">Symbol</th>
                        <th scope="col" className="px-4 py-3">Entry Price</th>
                        <th scope="col" className="px-4 py-3">Result</th>
                        <th scope="col" className="px-4 py-3">P/L ($)</th>
                        <th scope="col" className="px-4 py-3">Balance ($)</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log, index) => (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-800/40">
                            <td className="px-4 py-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-3">{log.level}</td>
                            <td className="px-4 py-3 font-medium">{log.symbol}</td>
                            <td className="px-4 py-3">{log.entryPrice.toFixed(4)}</td>
                            <td className={`px-4 py-3 font-semibold ${log.result === 'TP Hit' ? 'text-green-400' : 'text-red-400'}`}>
                                {log.result}
                            </td>
                            <td className={`px-4 py-3 font-semibold ${log.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {log.pnl > 0 ? '+' : ''}{log.pnl.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 font-bold">${log.balance.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile Card List */}
            <div className="block md:hidden space-y-3">
                {logs.map((log, index) => (
                    <div key={index} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-bold text-white">{log.symbol}</p>
                                <p className="text-xs text-gray-400">Level {log.level}</p>
                            </div>
                            <span className={`font-semibold text-lg ${log.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {log.pnl > 0 ? '+' : ''}${log.pnl.toFixed(2)}
                            </span>
                        </div>
                        <div className="mt-3 border-t border-gray-700 pt-3 text-sm space-y-1">
                            <p className="flex justify-between">
                                <span className="text-gray-400">Result:</span>
                                <span className={`font-semibold ${log.result === 'TP Hit' ? 'text-green-400' : 'text-red-400'}`}>{log.result}</span>
                            </p>
                             <p className="flex justify-between">
                                <span className="text-gray-400">New Balance:</span>
                                <span className="font-bold text-white">${log.balance.toFixed(2)}</span>
                            </p>
                            <p className="flex justify-between">
                                <span className="text-gray-400">Time:</span>
                                <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
