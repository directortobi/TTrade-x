import React, { useState, useEffect } from 'react';
// FIX: Add .ts extension to import path.
import { Credentials } from '../types.ts';
// FIX: Add .tsx extension to import path.
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
// FIX: Add .tsx extension to import path.
import { SupabaseLogo } from '../components/icons/SupabaseLogo.tsx';
// FIX: Add .tsx extension to import path.
import { AppLogo } from '../components/AppLogo.tsx';

interface SignUpPageProps {
    onSignUp: (credentials: Credentials) => Promise<void>;
    onNavigateToLogin: () => void;
    error: string | null;
    isLoading: boolean;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp, onNavigateToLogin, error, isLoading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [referralCode, setReferralCode] = useState<string | null>(null);

    useEffect(() => {
        const code = sessionStorage.getItem('referralCode');
        setReferralCode(code);
    }, []);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError(null);

        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }
        
        onSignUp({ email, password });
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <AppLogo large />
                    </div>
                    <p className="text-gray-400 mt-4">Create your account to get started</p>
                </div>
                <div className="bg-emerald-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-green-800">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        {referralCode && (
                            <div>
                                <label htmlFor="referral" className="block text-sm font-medium text-gray-400">
                                    Referred by
                                </label>
                                <input
                                    id="referral"
                                    type="text"
                                    disabled
                                    value={referralCode}
                                    className="mt-1 block w-full h-12 px-3 text-gray-300 bg-gray-800/50 border border-gray-600 rounded-md shadow-sm cursor-not-allowed"
                                />
                            </div>
                        )}
                         <div>
                            <label htmlFor="password"className="block text-sm font-medium text-gray-300">Password</label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                         <div>
                            <label htmlFor="confirm-password"className="block text-sm font-medium text-gray-300">Confirm Password</label>
                            <input
                                id="confirm-password"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {passwordError && <p className="text-sm text-red-400">{passwordError}</p>}
                        {error && !passwordError && <p className="text-sm text-red-400">{error}</p>}
                        
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-emerald-950 focus:ring-green-500 disabled:bg-gray-600"
                            >
                                {isLoading ? <LoadingSpinner /> : 'Create Account'}
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-400">
                        Already have an account?{' '}
                        <button onClick={onNavigateToLogin} className="font-medium text-teal-400 hover:text-teal-300 focus:outline-none">
                            Log in
                        </button>
                    </p>
                    <div className="mt-8 border-t border-gray-700 pt-4 flex items-center justify-center gap-2">
                        <span className="text-xs text-gray-500">Secure authentication by</span>
                        <SupabaseLogo />
                    </div>
                </div>
            </div>
        </div>
    );
};