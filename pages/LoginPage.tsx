
import React, { useState } from 'react';
// FIX: Add .ts extension to import path.
import { Credentials } from '../types.ts';
// FIX: Add .tsx extension to import path.
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
// FIX: Add .tsx extension to import path.
import { SupabaseLogo } from '../components/icons/SupabaseLogo.tsx';
// FIX: Add .tsx extension to import path.
import { AppLogo } from '../components/AppLogo.tsx';

interface LoginPageProps {
    onLogin: (credentials: Credentials) => Promise<void>;
    onNavigateToSignUp: () => void;
    error: string | null;
    isLoading: boolean;
    successMessage?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToSignUp, error, isLoading, successMessage }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin({ email, password });
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <AppLogo large />
                    </div>
                    <p className="text-gray-400 mt-4">Login to access your AI Trading Assistant</p>
                </div>
                <div className="bg-emerald-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-green-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {successMessage && !error && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-sm" role="alert">
                                {successMessage}
                            </div>
                        )}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                        </div>
                        {error && <p className="text-sm text-red-400">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-emerald-950 focus:ring-green-500 disabled:bg-gray-600"
                            >
                                {isLoading ? <LoadingSpinner /> : 'Login'}
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <button onClick={onNavigateToSignUp} className="font-medium text-teal-400 hover:text-teal-300 focus:outline-none">
                            Sign up
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
