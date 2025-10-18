import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppUser, TokenPurchase, TokenPurchaseStatus } from '../types';
import { getPurchaseHistory } from '../services/tokenService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { View } from '../MainApp';

interface PurchaseHistoryPageProps {
    user: AppUser;
    onNavigate: (view: View) => void;
}

const TokensIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4.5a1.5 1.5 0 001.5-1.5V3a1.5 1.5 0 00-1.5-1.5H12a1.5 1.5 0 00-1.5 1.5v1.5m1.5 0h-1.5M12 9a2.25 2.25 0 00-2.25 2.25c0 1.357.868 2.518 2.01 2.934m1.99-5.868A2.25 2.25 0 0114.25 11.25c0 1.357-.868 2.518-2.01 2.934m0-5.868V9.75" /></svg>;
const SpentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-center gap-4">
        <div className="flex-shrink-0 text-sky-400">{icon}</div>
        <div>
            <h3 className="text-sm font-medium text-gray-400">{title}</h3>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const StatusBadge: React.FC<{ status: TokenPurchaseStatus }> = ({ status }) => {
    const styles = {
        'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        'approved': 'bg-green-500/20 text-green-300 border-green-500/30',
        'rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const PurchaseHistoryPage: React.FC<PurchaseHistoryPageProps> = ({ user, onNavigate }) => {
    const [history, setHistory] = useState<TokenPurchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPurchaseHistory(user.auth.id);
            setHistory(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load purchase history.');
        } finally {
            setIsLoading(false);
        }
    }, [user.auth.id]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const stats = useMemo(() => {
        const approvedPurchases = history.filter(p => p.status === 'approved');
        const totalTokens = approvedPurchases.reduce((acc, p) => acc + p.tokens_purchased, 0);
        const totalSpent = approvedPurchases.reduce((acc, p) => acc + Number(p.price_usd), 0);
        return { totalTokens, totalSpent };
    }, [history]);

    const renderContent = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
        }
        if (error) {
            return <div className="py-16"><ErrorAlert message={error} /></div>;
        }
        if (history.length === 0) {
            return (
                <div className="text-center py-16">
                    <p className="text-gray-400 text-lg mb-4">You have no purchase history yet.</p>
                    <button
                        onClick={() => onNavigate('buyTokens')}
                        className="h-12 px-8 text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
                    >
                        Buy Tokens
                    </button>
                </div>
            );
        }
        return (
            <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-900/70">
                            <tr>
                                <th scope="col" className="px-4 py-3">Date</th>
                                <th scope="col" className="px-4 py-3">Package Name</th>
                                <th scope="col" className="px-4 py-3">Tokens</th>
                                <th scope="col" className="px-4 py-3">Price (USD)</th>
                                <th scope="col" className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(purchase => (
                                <tr key={purchase.id} className="border-b border-gray-700 hover:bg-gray-800/40">
                                    <td className="px-4 py-3 whitespace-nowrap">{new Date(purchase.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-medium">{purchase.package_name}</td>
                                    <td className="px-4 py-3 text-green-400">{purchase.tokens_purchased}</td>
                                    <td className="px-4 py-3">${Number(purchase.price_usd).toFixed(2)}</td>
                                    <td className="px-4 py-3"><StatusBadge status={purchase.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Mobile Card List */}
                <div className="block md:hidden space-y-3">
                    {history.map(purchase => (
                        <div key={purchase.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-white">{purchase.package_name} Package</span>
                                <StatusBadge status={purchase.status} />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{new Date(purchase.created_at).toLocaleString()}</p>
                            <div className="mt-3 flex justify-between items-center text-sm">
                                <p className="text-gray-300">Tokens: <span className="font-semibold text-green-400">{purchase.tokens_purchased}</span></p>
                                <p className="text-gray-300">Price: <span className="font-semibold text-white">${Number(purchase.price_usd).toFixed(2)}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">
                        Token Purchase History
                    </h1>
                    <p className="text-gray-400 mt-1">A record of all your token package purchases.</p>
                </div>
                 <button onClick={fetchHistory} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors border border-gray-600 disabled:opacity-50 self-start sm:self-center">
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
             
             {error && !isLoading && <ErrorAlert message={error} />}

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard title="Total Tokens Purchased" value={stats.totalTokens.toLocaleString()} icon={<TokensIcon />} />
                <StatCard title="Total Spent (Approved)" value={`$${stats.totalSpent.toFixed(2)}`} icon={<SpentIcon />} />
            </div>

            <div className="bg-blue-900/50 p-2 sm:p-4 rounded-2xl border border-blue-800">
                {renderContent()}
            </div>
        </div>
    );
};

export default PurchaseHistoryPage;
