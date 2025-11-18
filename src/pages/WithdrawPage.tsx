import React, { useState } from 'react';
import { AppUser } from '../types';
import { withdrawalService } from '../services/withdrawalService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

interface WithdrawPageProps {
    user: AppUser;
    onWithdrawSuccess: () => void;
}

const WithdrawPage: React.FC<WithdrawPageProps> = ({ user, onWithdrawSuccess }) => {
    const [amount, setAmount] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        const tokenAmount = parseInt(amount, 10);
        if (isNaN(tokenAmount) || tokenAmount <= 0) {
            setError("Please enter a valid number of tokens.");
            return;
        }
        if (tokenAmount > user.profile.tokens) {
            setError("Withdrawal amount cannot exceed your current token balance.");
            return;
        }
        if (walletAddress.trim().length < 10) { // Simple validation
            setError("Please enter a valid wallet address.");
            return;
        }

        setIsLoading(true);
        try {
            await withdrawalService.createWithdrawalRequest({
                userId: user.auth.id,
                tokens: tokenAmount,
                address: walletAddress,
            });
            setSuccessMessage("Your withdrawal request has been submitted successfully. It will be processed by an admin shortly.");
            setAmount('');
            setWalletAddress('');
            onWithdrawSuccess(); // This could trigger a refresh of user data in the main app
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
         <div className="max-w-2xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">
                    Request Withdrawal
                </h1>
                <p className="text-gray-400 mt-1">
                    Your current balance: <span className="font-bold text-white">{user.profile.tokens} Tokens</span>
                </p>
            </div>

            {successMessage && !error && (
                 <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Success! </strong>
                    <span className="block sm:inline">{successMessage}</span>
                </div>
            )}
            
            {error && <ErrorAlert message={error} />}

            <div className="bg-emerald-900/50 p-6 rounded-2xl border border-green-800">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="token-amount" className="block text-sm font-medium text-gray-300">
                            Tokens to Withdraw
                        </label>
                        <input
                            id="token-amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g., 100"
                            required
                            className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                     <div>
                        <label htmlFor="wallet-address" className="block text-sm font-medium text-gray-300">
                            Your USDT (TRC20) Wallet Address
                        </label>
                        <input
                            id="wallet-address"
                            type="text"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            placeholder="Enter your wallet address"
                            required
                            className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-emerald-950 focus:ring-cyan-500 disabled:bg-gray-600"
                        >
                            {isLoading ? <LoadingSpinner /> : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WithdrawPage;