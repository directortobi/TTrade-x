import React, { useState } from 'react';
// FIX: Add .ts extension to import path.
import { AppUser } from '../types.ts';
import { authService } from '../services/authService.ts';
// FIX: Add .tsx extension to import path.
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
// FIX: Add .tsx extension to import path.
import { View } from '../MainApp.tsx';

interface ProfilePageProps {
    user: AppUser;
    onLogout: () => void;
    onNavigate: (view: View) => void;
}

const InfoCard: React.FC<{ label: string; value: string | number; isCode?: boolean }> = ({ label, value, isCode }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        if (value) {
            navigator.clipboard.writeText(value.toString());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
            <span className="text-gray-400">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`font-mono text-white ${isCode ? 'bg-gray-700 px-2 py-1 rounded' : ''}`}>{value}</span>
                {isCode && (
                    <button onClick={handleCopy} className="text-gray-400 hover:text-white transition-colors" aria-label="Copy referral code">
                        {copied ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};


const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onNavigate }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            await authService.updatePassword(newPassword);
            setSuccess("Password updated successfully!");
            setNewPassword('');
            setConfirmPassword('');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Profile & Settings</h1>
                <p className="text-gray-400 mt-1">Manage your account details and application settings.</p>
            </div>

            {/* Profile Information Card */}
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold text-green-400">Account Information</h2>
                    <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                        <button
                            onClick={() => onNavigate('buyTokens')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Buy More Tokens
                        </button>
                        <button
                            onClick={() => onNavigate('purchaseHistory')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Purchase History
                        </button>
                         <button
                            onClick={() => onNavigate('withdrawalHistory')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                        >
                            Withdrawal History
                        </button>
                        <button
                            onClick={() => onNavigate('withdraw')}
                            className="px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
                        >
                            Request Withdrawal
                        </button>
                    </div>
                </div>
                <div className="space-y-2">
                    <InfoCard label="Email" value={user.profile.email} />
                    <InfoCard label="Analysis Tokens" value={user.profile.tokens} />
                    <InfoCard label="Referral Code" value={user.profile.referral_code} isCode />
                </div>
            </div>

            {/* Change Password Card */}
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h2 className="text-xl font-semibold text-green-400 mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label htmlFor="new-password"className="block text-sm font-medium text-gray-300">New Password</label>
                        <input
                            id="new-password"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                        <input
                            id="confirm-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    {success && <p className="text-sm text-green-400">{success}</p>}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="h-12 px-6 flex justify-center items-center border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 disabled:bg-gray-600"
                        >
                            {isLoading ? <LoadingSpinner /> : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
             <div className="mt-8 text-center">
                <button
                    onClick={onLogout}
                    className="px-6 py-2 text-sm font-medium text-red-500/80 bg-red-500/10 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-colors border border-red-500/30"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;