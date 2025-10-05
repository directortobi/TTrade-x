import React, { useState, useEffect } from 'react';
import { AnalysisLog, Signal } from '../../types';
import { logService } from '../../services/logService';
import { LoadingSpinner } from '../LoadingSpinner';
import { View } from '../../MainApp';

interface RecentSignalsProps {
    onNavigate: (view: View) => void;
}

const SignalBadge: React.FC<{ signal: Signal }> = ({ signal }) => {
    const styles = {
        [Signal.BUY]: 'bg-green-500/20 text-green-300 border-green-500/30',
        [Signal.SELL]: 'bg-red-500/20 text-red-300 border-red-500/30',
        [Signal.HOLD]: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${styles[signal]}`}>{signal}</span>;
};

const RecentSignals: React.FC<RecentSignalsProps> = ({ onNavigate }) => {
    const [signals, setSignals] = useState<AnalysisLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSignals = async () => {
            setIsLoading(true);
            try {
                const allLogs = await logService.getLogs();
                // Filter for BUY/SELL signals and take the latest 3
                const tradeSignals = allLogs.filter(log => log.signal !== Signal.HOLD).slice(0, 3);
                setSignals(tradeSignals);
            } catch (error) {
                console.error("Failed to fetch recent signals:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSignals();
    }, []);

    return (
        <div className="bg-blue-900/50 p-6 rounded-xl border border-blue-800 shadow-lg">
            <h2 className="text-lg font-bold text-white mb-4">Recent High-Confidence Signals</h2>
            {isLoading ? (
                <div className="flex justify-center items-center h-24"><LoadingSpinner /></div>
            ) : signals.length === 0 ? (
                <p className="text-sm text-center text-gray-400 py-6">No recent trade signals found. Perform an analysis to get started!</p>
            ) : (
                <div className="space-y-3">
                    {signals.map(signal => (
                        <div key={signal.id} className="bg-gray-800/50 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-white">{signal.symbol}</span>
                                    <SignalBadge signal={signal.signal} />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Confidence: {signal.confidence}% | {new Date(signal.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => onNavigate('history')} className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600/70 rounded-md hover:bg-blue-600 transition-colors">
                                Details
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecentSignals;
