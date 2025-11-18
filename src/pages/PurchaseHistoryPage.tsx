import React, { useState, useEffect, useCallback } from 'react';
import { AppUser, TokenPurchase, TokenPurchaseStatus } from '../types.ts';
import { getPurchaseHistory } from '../services/tokenService';
import { ErrorAlert } from '../components/ErrorAlert.tsx';
import { View } from '../MainApp.tsx';
import { TableSkeleton } from '../components/skeletons/TableSkeleton.tsx';

interface PurchaseHistoryPageProps {
    user: AppUser;
    onNavigate: (view: View) => void;
}

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

    const renderContent = () => {
        if (isLoading) {
            return <TableSkeleton cols={5} />;
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
            <div className="overflow-x-auto">
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
                                <td className="px-4 py-3">{new Date(purchase.created_at).toLocaleString()}</td>
                                <td className="px-4 py-3 font-medium">{purchase.package_name}</td>
                                <td className="px-4 py-3 text-green-400">{purchase.tokens_purchased}</td>
                                <td className="px-4 py-3">${Number(purchase.price_usd).toFixed(2)}</td>
                                <td className="px-4 py-3"><StatusBadge status={purchase.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400">
                        Token Purchase History
                    </h1>
                    <p className="text-gray-400 mt-1">A record of all your token package purchases.</p>
                </div>
                 <button onClick={fetchHistory} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white bg-gray-700/80 rounded-md hover:bg-gray-600 transition-colors border border-gray-600 disabled:opacity-50 self-start sm:self-center">
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

export default PurchaseHistoryPage;