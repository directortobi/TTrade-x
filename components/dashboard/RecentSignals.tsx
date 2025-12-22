
import React from 'react';
import { View } from '../../types';

export const RecentSignals: React.FC<{ onNavigate: (v: View) => void }> = ({ onNavigate }) => (
    <div className="bg-blue-900/50 p-6 rounded-xl border border-blue-800 shadow-lg">
        <h2 className="text-lg font-bold text-white mb-4">Recent Market Signals</h2>
        <div className="space-y-3">
            {[
                { pair: 'EUR/USD', signal: 'BUY', time: '5m', reason: 'Bullish Hammer' },
                { pair: 'GBP/USD', signal: 'SELL', time: '15m', reason: 'RSI Overbought' }
            ].map((sig, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-700">
                    <div>
                        <p className="text-sm font-bold text-white">{sig.pair}</p>
                        <p className="text-xs text-gray-500">{sig.time} • {sig.reason}</p>
                    </div>
                    <span className={`text-xs font-bold ${sig.signal === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{sig.signal}</span>
                </div>
            ))}
        </div>
        <button onClick={() => onNavigate('market_analyst')} className="mt-4 w-full text-xs text-sky-400 hover:text-sky-300 font-medium">View All Signals →</button>
    </div>
);

export default RecentSignals;
