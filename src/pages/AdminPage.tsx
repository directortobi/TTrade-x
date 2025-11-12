import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
// FIX: Add .ts extension to import path.
import { PurchaseWithEmail, WithdrawalWithEmail, ReferralWithdrawalWithEmail } from '../types.ts';
// FIX: Add .tsx extension to import path.
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
// FIX: Add .tsx extension to import path.
import { ErrorAlert } from '../components/ErrorAlert.tsx';
import { TableSkeleton } from '../components/skeletons/TableSkeleton';


const AdminPage: React.FC = () => {
    const [purchases, setPurchases] = useState<PurchaseWithEmail[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalWithEmail[]>([]);
    const [referralWithdrawals, setReferralWithdrawals] = useState<ReferralWithdrawalWithEmail[]>([]);
    
    const [isLoading, setIsLoading] = useState({ purchases: true, withdrawals: true, referralWithdrawals: true });
    const [error, setError] = useState<string | null>(null);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null); // holds the id of the item being actioned
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const showSuccess = (message: string) => {
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    const fetchPurchases = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, purchases: true }));
        try {
            const data = await adminService.getPendingPurchases();
            setPurchases(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load purchase data');
        } finally {
            setIsLoading(prev => ({ ...prev, purchases: false }));
        }
    }, []);

    const fetchWithdrawals = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, withdrawals: true }));
        try {
            const data = await adminService.getPendingWithdrawals();
            setWithdrawals(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load withdrawal data');
        } finally {
            setIsLoading(prev => ({ ...prev, withdrawals: false }));
        }
    }, []);

    const fetchReferralWithdrawals = useCallback(async () => {
        setIsLoading(prev => ({...prev, referralWithdrawals: true }));
        try {
            const data = await adminService.getPendingReferralWithdrawals();
            setReferralWithdrawals(data);
        } catch (err) {
            setError(err instanceof Error ? err.message: 'Failed to load referral withdrawal data');
        } finally {
            setIsLoading(prev => ({...prev, referralWithdrawals: false }));
        }
    }, []);

    useEffect(() => {
        setError(null);
        fetchPurchases();
        fetchWithdrawals();
        fetchReferralWithdrawals();
    }, [fetchPurchases, fetchWithdrawals, fetchReferralWithdrawals]);

    const handleApprovePurchase = async (purchase: PurchaseWithEmail) => {
        if (!window.confirm(`Are you sure you want to approve this purchase and add ${purchase.tokens_purchased} tokens to ${purchase.profiles?.email}?`)) {
            return;
        }
        setActionInProgress(purchase.id);
        setError(null);
        try {
            await adminService.approvePurchase(purchase.id);
            showSuccess(`Purchase from ${purchase.profiles?.email} approved.`);
            fetchPurchases();
        } catch (err) {
            setError(err instanceof Error ? `Failed to approve: ${err.message}` : 'An unknown error occurred.');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleRejectPurchase = async (purchaseId: string) => {
         if (!window.confirm("Are you sure you want to reject this purchase request? This action cannot be undone.")) return;
        setActionInProgress(purchaseId);
        setError(null);
        try {
            await adminService.rejectPurchase(purchaseId);
            showSuccess(`Purchase rejected successfully.`);
            fetchPurchases();
        } catch (err) {
             setError(err instanceof Error ? `Failed to reject: ${err.message}` : 'An unknown error occurred.');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleApproveWithdrawal = async (withdrawalId: string) => {
        if (!window.confirm(`Are you sure you want to approve this token withdrawal? This will debit the user's tokens.`)) return;
        setActionInProgress(withdrawalId);
        setError(null);
        try {
            await adminService.approveWithdrawal(withdrawalId);
            showSuccess('Token withdrawal approved.');
            fetchWithdrawals();
        } catch (err) {
            setError(err instanceof Error ? `Failed to approve: ${err.message}` : 'An unknown error occurred.');
        } finally {
            setActionInProgress(null);
        }
    };
    
    const handleRejectWithdrawal = async (withdrawalId: string) => {
        if (!window.confirm("Are you sure you want to reject this token withdrawal request?")) return;
        setActionInProgress(withdrawalId);
        setError(null);
        try {
            await adminService.rejectWithdrawal(withdrawalId);
            showSuccess('Token withdrawal rejected.');
            fetchWithdrawals();
        } catch (err) {
            setError(err instanceof Error ? `Failed to reject: ${err.message}` : 'An unknown error occurred.');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleApproveReferralWithdrawal = async (withdrawalId: string) => {
        if (!window.confirm("Are you sure you want to approve this referral earnings withdrawal?")) return;
        setActionInProgress(withdrawalId);
        setError(null);
        try {
            await adminService.approveReferralWithdrawal(withdrawalId);
            showSuccess('Referral withdrawal approved.');
            fetchReferralWithdrawals();
        } catch (err) {
            setError(err instanceof Error ? `Failed to approve: ${err.message}` : 'An unknown error occurred.');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleRejectReferralWithdrawal = async (withdrawalId: string) => {
        if (!window.confirm("Are you sure you want to reject this referral earnings withdrawal?")) return;
        setActionInProgress(withdrawalId);
        setError(null);
        try {
            await adminService.rejectReferralWithdrawal(withdrawalId);
            showSuccess('Referral withdrawal rejected.');
            fetchReferralWithdrawals();
        } catch (err) {
            setError(err instanceof Error ? `Failed to reject: ${err.message}` : 'An unknown error occurred.');
        } finally {
            setActionInProgress(null);
        }
    };


    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
                Admin Dashboard
            </h1>

            {error && <ErrorAlert message={error} />}
            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg" role="alert">
                    {successMessage}
                </div>
            )}

            {/* Token Purchases */}
            <section className="bg-emerald-900/50 p-6 rounded-2xl border border-green-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-teal-300">Pending Token Purchases</h2>
                    <button onClick={fetchPurchases} disabled={isLoading.purchases} className="px-3 py-1.5 text-sm font-medium text-white bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors border border-gray-600 disabled:opacity-50">
                        Refresh
                    </button>
                </div>
                {isLoading.purchases ? (
                    <TableSkeleton cols={7} />
                ) : purchases.length === 0 ? (
                    <p className="text-center text-gray-400 py-12">No pending purchase requests.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm text-left text-gray-300">
                           <thead className="text-xs text-gray-400 uppercase bg-gray-900/70">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Date</th>
                                    <th scope="col" className="px-4 py-3">User</th>
                                    <th scope="col" className="px-4 py-3">Package</th>
                                    <th scope="col" className="px-4 py-3">Tokens</th>
                                    <th scope="col" className="px-4 py-3">Price (USD)</th>
                                    <th scope="col" className="px-4 py-3">Proof</th>
                                    <th scope="col" className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map(p => (
                                    <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                                        <td className="px-4 py-3">{new Date(p.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3">{p.profiles?.email || p.user_id}</td>
                                        <td className="px-4 py-3">{p.package_name}</td>
                                        <td className="px-4 py-3">{p.tokens_purchased}</td>
                                        <td className="px-4 py-3">${p.price_usd}</td>
                                        <td className="px-4 py-3">
                                            <a href={p.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                                                View Proof
                                            </a>
                                        </td>
                                        <td className="px-4 py-3">
                                            {actionInProgress === p.id ? <LoadingSpinner /> : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApprovePurchase(p)} className="px-3 py-1 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700">Approve</button>
                                                    <button onClick={() => handleRejectPurchase(p.id)} className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700">Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Referral Earnings Withdrawals */}
            <section className="bg-emerald-900/50 p-6 rounded-2xl border border-green-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-teal-300">Pending Referral Earnings Withdrawals</h2>
                    <button onClick={fetchReferralWithdrawals} disabled={isLoading.referralWithdrawals} className="px-3 py-1.5 text-sm font-medium text-white bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors border border-gray-600 disabled:opacity-50">
                        Refresh
                    </button>
                </div>
                 {isLoading.referralWithdrawals ? (
                    <TableSkeleton cols={5} />
                ) : referralWithdrawals.length === 0 ? (
                    <p className="text-center text-gray-400 py-12">No pending referral withdrawal requests.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm text-left text-gray-300">
                           <thead className="text-xs text-gray-400 uppercase bg-gray-900/70">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Date</th>
                                    <th scope="col" className="px-4 py-3">User</th>
                                    <th scope="col" className="px-4 py-3">Amount (USD)</th>
                                    <th scope="col" className="px-4 py-3">Wallet Address</th>
                                    <th scope="col" className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {referralWithdrawals.map(w => (
                                    <tr key={w.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                                        <td className="px-4 py-3">{new Date(w.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3">{w.profiles?.email || w.user_id}</td>
                                        <td className="px-4 py-3">${w.amount_usd}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{w.wallet_address}</td>
                                        <td className="px-4 py-3">
                                            {actionInProgress === w.id ? <LoadingSpinner /> : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApproveReferralWithdrawal(w.id)} className="px-3 py-1 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700">Approve</button>
                                                    <button onClick={() => handleRejectReferralWithdrawal(w.id)} className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700">Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Token Withdrawals */}
            <section className="bg-emerald-900/50 p-6 rounded-2xl border border-green-800">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-teal-300">Pending Token Withdrawals</h2>
                    <button onClick={fetchWithdrawals} disabled={isLoading.withdrawals} className="px-3 py-1.5 text-sm font-medium text-white bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors border border-gray-600 disabled:opacity-50">
                        Refresh
                    </button>
                </div>
                 {isLoading.withdrawals ? (
                    <TableSkeleton cols={5} />
                ) : withdrawals.length === 0 ? (
                    <p className="text-center text-gray-400 py-12">No pending token withdrawal requests.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-sm text-left text-gray-300">
                           <thead className="text-xs text-gray-400 uppercase bg-gray-900/70">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Date</th>
                                    <th scope="col" className="px-4 py-3">User</th>
                                    <th scope="col" className="px-4 py-3">Tokens</th>
                                    <th scope="col" className="px-4 py-3">Wallet Address</th>
                                    <th scope="col" className="px-4 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {withdrawals.map(w => (
                                    <tr key={w.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                                        <td className="px-4 py-3">{new Date(w.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3">{w.profiles?.email || w.user_id}</td>
                                        <td className="px-4 py-3">{w.tokens_to_withdraw}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{w.wallet_address}</td>
                                        <td className="px-4 py-3">
                                            {actionInProgress === w.id ? <LoadingSpinner /> : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApproveWithdrawal(w.id)} className="px-3 py-1 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700">Approve</button>
                                                    <button onClick={() => handleRejectWithdrawal(w.id)} className="px-3 py-1 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700">Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};

export default AdminPage;