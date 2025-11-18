import React, { useState, useEffect, useCallback } from 'react';
// FIX: Add .ts extension to import path.
import { AppUser, Withdrawal, ReferralWithdrawal, WithdrawalStatus } from '../types';
import { withdrawalService } from '../services/withdrawalService';
// FIX: Add .tsx extension to import path.
import { LoadingSpinner } from '../components/LoadingSpinner';
// FIX: Add .tsx extension to import path.
import { ErrorAlert } from '../components/ErrorAlert';

interface WithdrawalHistoryPageProps {
    user: AppUser;
}

const StatusBadge: React.FC<{ status: WithdrawalStatus }> = ({ status }) => {
    const styles = {
        'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        'approved': 'bg-green-500/20 text-green-300 border-green-500/30',
        'rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};


const WithdrawalHistoryPage: React.FC<WithdrawalHistoryPageProps> = ({ user }) => {
    const [tokenWithdrawals, setTokenWithdrawals] = useState<Withdrawal[]>([]);
    const [referralWithdrawals, setReferralWithdrawals] = useState<ReferralWithdrawal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tokenData, referralData] = await Promise.all([
                withdrawalService.getWithdrawalHistory(user.auth.id),
                withdrawalService.getReferralWithdrawalHistory(user.auth.id)
            ]);
            setTokenWithdrawals(tokenData);
            setReferralWithdrawals(referralData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load withdrawal history.');
        } finally {
            setIsLoading(false);
        }
    }, [user.auth.id]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);
    
    const renderTokenHistory = () => (
         <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900/70">
                    <tr>
                        <th scope="col" className="px-4 py-3">Date</th>
                        <th scope="col" className="px-4 py-3">Tokens Withdrawn</th>
                        <th scope="col" className="px-4 py-3">Wallet Address</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {tokenWithdrawals.map(w => (
                        <tr key={w.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                            <td className="px-4 py-3">{new Date(w.created_at).toLocaleString()}</td>
                            <td className="px-4 py-3 font-medium">{w.tokens_to_withdraw}</td>
                            <td className="px-4 py-3 font-mono text-xs">{w.wallet_address}</td>
                            <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderReferralHistory = () => (
         <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-900/70">
                    <tr>
                        <th scope="col" className="px-4 py-3">Date</th>
                        <th scope="col" className="px-4 py-3">Amount (USD)</th>
                        <th scope="col" className="px-4 py-3">Wallet Address</th>
                        <th scope="col" className="px-4 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {referralWithdrawals.map(w => (
                        <tr key={w.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                            <td className="px-4 py-3">{new Date(w.created_at).toLocaleString()}</td>
                            <td className="px-4 py-3 font-medium">${Number(w.amount_usd).toFixed(2)}</td>
                            <td className="px-4 py-3 font-mono text-xs">{w.wallet_address}</td>
                            <td className="px-4 py-3"><StatusBadge status={w.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">
                        Withdrawal History
                    </h1>
                    <p className="text-gray-400 mt-1">A record of all your token and referral earning withdrawals.</p>
                </div>
                 <button onClick={fetchHistory} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors border border-gray-600 disabled:opacity-50 self-start sm:self-center">
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            {error && <ErrorAlert message={error} />}
            
            <div className="bg-blue-900/50 p-4 sm:p-6 rounded-2xl border border-blue-800">
                <h2 className="text-xl font-semibold text-sky-300 mb-4">Token Withdrawals</h2>
                {isLoading ? <TableSkeleton cols={4} /> : (tokenWithdrawals.length > 0 ? renderTokenHistory() : <p className="text-center text-gray-400 py-8">No token withdrawal history found.</p>)}
            </div>
            <div className="bg-blue-900/50 p-4 sm:p-6 rounded-2xl border border-blue-800">
                <h2 className="text-xl font-semibold text-sky-300 mb-4">Referral Earnings Withdrawals</h2>
                 {isLoading ? <TableSkeleton cols={4} /> : (referralWithdrawals.length > 0 ? renderReferralHistory() : <p className="text-center text-gray-400 py-8">No referral earnings withdrawal history found.</p>)}
            </div>
        </div>
    )
}

export default WithdrawalHistoryPage;