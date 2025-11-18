import React, { useState, useEffect, useCallback } from 'react';
// FIX: Add .ts extension to import path.
import { AppUser, AnalysisLog, Signal, AnalysisOutcome } from '../types.ts';
import { logService } from '../services/logService.ts';
// FIX: Add .tsx extension to import path.
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
// FIX: Add .tsx extension to import path.
import { ErrorAlert } from '../components/ErrorAlert.tsx';

interface HistoryPageProps {
    user: AppUser;
}

const SignalBadge: React.FC<{ signal: Signal }> = ({ signal }) => {
    const styles = {
        [Signal.BUY]: 'bg-green-500/20 text-green-300 border-green-500/30',
        [Signal.SELL]: 'bg-red-500/20 text-red-300 border-red-500/30',
        [Signal.HOLD]: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[signal]}`}>{signal}</span>;
};

const OutcomeBadge: React.FC<{ outcome: AnalysisOutcome }> = ({ outcome }) => {
     const styles = {
        'Pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        'TP Hit': 'bg-green-500/20 text-green-300 border-green-500/30',
        'SL Hit': 'bg-red-500/20 text-red-300 border-red-500/30',
        'Cancelled': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[outcome]}`}>{outcome}</span>;
}

const OutcomeSelector: React.FC<{ logId: number; onUpdate: (id: number, outcome: AnalysisOutcome) => void }> = ({ logId, onUpdate }) => (
    <div className="flex items-center gap-1">
        <button onClick={() => onUpdate(logId, 'TP Hit')} className="px-2 py-0.5 text-xs font-bold text-green-200 bg-green-600/50 rounded hover:bg-green-600/80" title="Take Profit Hit">TP</button>
        <button onClick={() => onUpdate(logId, 'SL Hit')} className="px-2 py-0.5 text-xs font-bold text-red-200 bg-red-600/50 rounded hover:bg-red-600/80" title="Stop Loss Hit">SL</button>
        <button onClick={() => onUpdate(logId, 'Cancelled')} className="px-2 py-0.5 text-xs font-bold text-gray-200 bg-gray-600/50 rounded hover:bg-gray-600/80" title="Cancel Trade">X</button>
    </div>
);


const HistoryPage: React.FC<HistoryPageProps> = ({ user }) => {
    const [logs, setLogs] = useState<AnalysisLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedLogRowId, setExpandedLogRowId] = useState<number | null>(null);

    const fetchLogs = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await logService.getLogs();
            setLogs(data);
        } catch (err) {
            setError((err as any)?.message || 'Failed to load history');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const handleUpdateOutcome = async (logId: number, outcome: AnalysisOutcome) => {
        const originalLogs = [...logs];
        setLogs(currentLogs => currentLogs.map(log => log.id === logId ? { ...log, outcome } : log));

        try {
            await logService.updateLogOutcome(logId, outcome);
        } catch (err) {
            setLogs(originalLogs);
            setError(err instanceof Error ? `Failed to update: ${err.message}` : 'Update failed');
        }
    };
    
    const toggleExpandRow = (logId: number) => {
        setExpandedLogRowId(currentId => (currentId === logId ? null : logId));
    };

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
        }
        if (logs.length === 0 && !error) {
            return <p className="text-center text-gray-400 py-16">You have no analysis history yet. Perform an analysis to get started!</p>;
        }
        return (
            <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-900/70">
                        <tr>
                            <th scope="col" className="px-4 py-3">Date</th>
                            <th scope="col" className="px-4 py-3">Symbol</th>
                            <th scope="col" className="px-4 py-3">Signal</th>
                            <th scope="col" className="px-4 py-3">Entry</th>
                            <th scope="col" className="px-4 py-3">Stop Loss</th>
                            <th scope="col" className="px-4 py-3">Take Profit</th>
                            <th scope="col" className="px-4 py-3">Confidence</th>
                            <th scope="col" className="px-4 py-3">Tokens Used</th>
                            <th scope="col" className="px-4 py-3">Outcome</th>
                            <th scope="col" className="px-4 py-3">Rationale</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <React.Fragment key={log.id}>
                                <tr className="border-b border-gray-700 hover:bg-gray-800/40">
                                    <td className="px-4 py-3">{new Date(log.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-medium">{log.symbol}</td>
                                    <td className="px-4 py-3"><SignalBadge signal={log.signal} /></td>
                                    <td className="px-4 py-3">{log.entry_price?.toFixed(4) ?? 'N/A'}</td>
                                    <td className="px-4 py-3">{log.stop_loss?.toFixed(4) ?? 'N/A'}</td>
                                    <td className="px-4 py-3">{log.take_profit_1?.toFixed(4) ?? 'N/A'}</td>
                                    <td className="px-4 py-3">{log.confidence ?? 'N/A'}%</td>
                                    <td className="px-4 py-3 text-center">{log.tokens_used}</td>
                                    <td className="px-4 py-3">
                                        {log.outcome === 'Pending' ? (
                                            <OutcomeSelector logId={log.id} onUpdate={handleUpdateOutcome} />
                                        ) : (
                                            <OutcomeBadge outcome={log.outcome} />
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button onClick={() => toggleExpandRow(log.id)} className="text-cyan-400 hover:underline">
                                            {expandedLogRowId === log.id ? 'Hide' : 'View'}
                                        </button>
                                    </td>
                                </tr>
                                {expandedLogRowId === log.id && (
                                    <tr className="bg-gray-900/50">
                                        <td colSpan={10} className="p-4">
                                            <div className="bg-gray-800 p-4 rounded-lg">
                                                <h4 className="font-semibold text-gray-200 mb-2">AI Analysis Rationale:</h4>
                                                <p className="text-gray-400 whitespace-pre-wrap text-sm leading-relaxed">
                                                    {log.analysis_notes || 'No rationale was saved for this analysis.'}
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">
                        Trading History
                    </h1>
                    <p className="text-gray-400 mt-1">Review your past AI analyses and track trade outcomes.</p>
                </div>
                 <button onClick={fetchLogs} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors border border-gray-600 disabled:opacity-50 self-start sm:self-center">
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
             
             {error && !isLoading && <ErrorAlert message={error} />}

            <div className="bg-blue-900/50 p-4 sm:p-6 rounded-2xl border border-blue-800">
                {renderContent()}
            </div>
        </div>
    );
};

export default HistoryPage;