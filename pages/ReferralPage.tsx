import React, { useState, useEffect, useCallback } from 'react';
import { AppUser, ReferredUser, ReferralEarningWithEmail, EarningStatus } from '../types';
import { referralService } from '../services/referralService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

interface ReferralPageProps {
    user: AppUser;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 p-4 sm:p-6 rounded-xl border border-gray-700 flex items-center gap-4">
        <div className="flex-shrink-0 text-cyan-400">{icon}</div>
        <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A11.995 11.995 0 0012 13a11.995 11.995 0 00-3-5.197m-2 2.197a4 4 0 11.22-6.572" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25-2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" /></svg>;

const EarningStatusBadge: React.FC<{ status: EarningStatus }> = ({ status }) => {
    const styles = {
        'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        'approved': 'bg-green-500/20 text-green-300 border-green-500/30',
        'rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const ReferralPage: React.FC<ReferralPageProps> = ({ user }) => {
    const [stats, setStats] = useState({ totalReferrals: 0, pendingEarnings: 0, availableEarnings: 0, lifetimeEarnings: 0 });
    const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
    const [earningsHistory, setEarningsHistory] = useState<ReferralEarningWithEmail[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'referrals' | 'earnings'>('referrals');
    const [copied, setCopied] = useState(false);
    
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawalSuccess, setWithdrawalSuccess] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [statsData, usersData, earningsData] = await Promise.all([
                referralService.getReferralStats(user.auth.id, user.profile.referral_code),
                referralService.getReferredUsers(user.profile.referral_code),
                referralService.getEarningsHistory(user.auth.id),
            ]);
            setStats(statsData);
            setReferredUsers(usersData);
            setEarningsHistory(earningsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load referral data.');
        } finally {
            setIsLoading(false);
        }
    }, [user.auth.id, user.profile.referral_code]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const referralLink = `${window.location.origin}/?ref=${user.profile.referral_code}`;
    
    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleWithdrawalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setWithdrawalSuccess(null);
        const amount = parseFloat(withdrawalAmount);

        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid withdrawal amount.");
            return;
        }
        if (amount > stats.availableEarnings) {
            setError("Withdrawal amount cannot exceed available earnings.");
            return;
        }
        if (walletAddress.trim().length < 10) {
             setError("Please enter a valid wallet address.");
            return;
        }

        setIsWithdrawing(true);
        try {
            await referralService.createReferralWithdrawalRequest(user.auth.id, amount, walletAddress);
            setWithdrawalSuccess("Your withdrawal request has been submitted successfully!");
            setWithdrawalAmount('');
            setWalletAddress('');
            fetchData(); // Refresh stats
        } catch(err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsWithdrawing(false);
        }
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
    }

    return (
        <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                    Referral Program
                </h1>
                <p className="text-gray-400 mt-1">Earn 20% commission on every token purchase made by users you refer.</p>
            </div>
            
            {error && <ErrorAlert message={error} />}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Referrals" value={stats.totalReferrals} icon={<UsersIcon />} />
                <StatCard title="Pending Earnings" value={`$${stats.pendingEarnings.toFixed(2)}`} icon={<ClockIcon />} />
                <StatCard title="Available for Withdrawal" value={`$${stats.availableEarnings.toFixed(2)}`} icon={<WalletIcon />} />
            </div>

            <div className="bg-gray-800/50 p-4 sm:p-6 rounded-2xl border border-gray-700">
                <h2 className="text-lg sm:text-xl font-semibold text-teal-300">Your Referral Link</h2>
                <p className="text-gray-400 mb-4 text-sm">Share this unique link with your friends. When they sign up, you'll earn commission.</p>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-gray-900/50 p-4 rounded-lg">
                    <span className="font-mono text-sm sm:text-base text-white flex-grow break-all">{referralLink}</span>
                    <button onClick={handleCopyToClipboard} className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors w-full sm:w-auto flex-shrink-0">
                        {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gray-800/50 p-4 sm:p-6 rounded-2xl border border-gray-700">
                    <div className="flex border-b border-gray-700 mb-4">
                        <button onClick={() => setActiveTab('referrals')} className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'referrals' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                            My Referrals ({referredUsers.length})
                        </button>
                        <button onClick={() => setActiveTab('earnings')} className={`px-4 py-2 font-medium text-sm transition-colors ${activeTab === 'earnings' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:text-white'}`}>
                            Earnings History ({earningsHistory.length})
                        </button>
                    </div>

                    <div className="overflow-x-auto max-h-[60vh]">
                    {activeTab === 'referrals' && (
                        <table className="w-full text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-900/70 sticky top-0">
                                <tr><th scope="col" className="px-4 py-3">User Email</th><th scope="col" className="px-4 py-3">Joined On</th></tr>
                            </thead>
                            <tbody>
                                {referredUsers.length > 0 ? referredUsers.map(ref => (
                                    <tr key={ref.id} className="border-b border-gray-700 hover:bg-gray-800/40"><td className="px-4 py-3 break-all">{ref.email}</td><td className="px-4 py-3 whitespace-nowrap">{new Date(ref.created_at).toLocaleDateString()}</td></tr>
                                )) : <tr><td colSpan={2} className="px-4 py-10 text-center text-gray-500">No users have signed up with your code yet.</td></tr>}
                            </tbody>
                        </table>
                    )}
                     {activeTab === 'earnings' && (
                        <table className="w-full min-w-[600px] text-sm text-left text-gray-300">
                            <thead className="text-xs text-gray-400 uppercase bg-gray-900/70 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Date</th>
                                    <th scope="col" className="px-4 py-3">From User</th>
                                    <th scope="col" className="px-4 py-3">Purchase Amt</th>
                                    <th scope="col" className="px-4 py-3">Commission</th>
                                    <th scope="col" className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {earningsHistory.length > 0 ? earningsHistory.map(earn => (
                                    <tr key={earn.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                                        <td className="px-4 py-3 whitespace-nowrap">{new Date(earn.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 break-all">{earn.referred_user_profile?.email ?? 'N/A'}</td>
                                        <td className="px-4 py-3">${Number(earn.purchase_amount).toFixed(2)}</td>
                                        <td className="px-4 py-3 font-semibold text-green-400">+${Number(earn.commission_amount).toFixed(2)}</td>
                                        <td className="px-4 py-3"><EarningStatusBadge status={earn.status} /></td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-500">No earnings have been recorded yet.</td></tr>}
                            </tbody>
                        </table>
                    )}
                    </div>
                </div>
                <div className="lg:col-span-1 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 self-start">
                     <h2 className="text-xl font-semibold text-teal-300 mb-4">Withdraw Earnings</h2>
                     {withdrawalSuccess && (
                         <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg mb-4 text-sm" role="alert">
                           {withdrawalSuccess}
                        </div>
                     )}
                     <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
                         <div>
                            <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-300">Amount (USD)</label>
                            <input
                                id="withdraw-amount" type="number" step="0.01" value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                placeholder={`Max $${stats.availableEarnings.toFixed(2)}`} required
                                className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md"
                            />
                         </div>
                         <div>
                            <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-300">Your USDT (TRC20) Wallet</label>
                            <input
                                id="wallet-address" type="text" value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                placeholder="Enter your wallet address" required
                                className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md"
                            />
                         </div>
                         <div className="pt-2">
                             <button type="submit" disabled={isWithdrawing || stats.availableEarnings <= 0}
                                className="w-full h-12 flex justify-center items-center text-white font-semibold bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed">
                                {isWithdrawing ? <LoadingSpinner /> : 'Request Withdrawal'}
                            </button>
                         </div>
                     </form>
                </div>
            </div>
        </div>
    );
};

export default ReferralPage;
