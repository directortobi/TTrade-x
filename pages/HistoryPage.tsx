import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppUser, AnalysisLog, Signal, AnalysisOutcome } from '../types';
import { logService } from '../services/logService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

interface HistoryPageProps {
    user: AppUser;
}

// --- Icons for Stat Cards ---
const TradesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>;
const WinRateIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.125-1.5M12 16.5v-9.75m0 9.75c-.621 0-1.125-.504-1.125-1.125v-1.5c0-.621.504-1.125 1.125-1.125v3.75z" /></svg>;
const WinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.707.293L4.415 8.585A2 2 0 003 10.285V18a2 2 0 002 2h3.286" /></svg>;
const LossIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.738 3h4.017c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.085a2 2 0 001.707-.293l4.415-4.415A2 2 0 0021 13.715V6a2 2 0 00-2-2h-3.286" /></svg>;

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
        <div className="flex-shrink-0 text-sky-400">{icon}</div>
        <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);


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

    const stats = useMemo(() => {
        const trades = logs.filter(log => log.outcome === 'TP Hit' || log.outcome === 'SL Hit');
        const wins = trades.filter(log => log.outcome === 'TP Hit').length;
        const losses = trades.filter(log => log.outcome === 'SL Hit').length;
        const total = wins + losses;
        const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
        return {
            totalTrades: logs.filter(log => log.signal !== 'HOLD').length,
            winRate,
            wins,
            losses
        };
    }, [logs]);

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
                                        {log.signal !== 'HOLD' && log.outcome === 'Pending' ? (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Signals" value={stats.totalTrades} icon={<TradesIcon />} />
                <StatCard title="Win Rate" value={`${stats.winRate}%`} icon={<WinRateIcon />} />
                <StatCard title="Trades Won" value={stats.wins} icon={<WinIcon />} />
                <StatCard title="Trades Lost" value={stats.losses} icon={<LossIcon />} />
            </div>

            <div className="bg-blue-900/50 p-4 sm:p-6 rounded-2xl border border-blue-800">
                {renderContent()}
            </div>
        </div>
    );
};

export default HistoryPage;
