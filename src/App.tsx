
import React, { useState, useEffect } from 'react';
import { initializeSupabase, isSupabaseConfigured, supabase } from './services/supabase';
import { isGeminiConfigured } from './services/geminiService';
import { MainApp } from './MainApp';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { authService } from './services/authService';
import { Credentials } from './types';
import { ConfigurationErrorPage } from './pages/ConfigurationErrorPage';
import { LoadingSpinner } from './components/LoadingSpinner';

type AuthView = 'login' | 'signup' | 'check_email';

const App: React.FC = () => {
    const [session, setSession] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authView, setAuthView] = useState<AuthView>('login');
    const [authError, setAuthError] = useState<string | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [configError, setConfigError] = useState<'Supabase' | 'Gemini' | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                await initializeSupabase();
                
                if (!isSupabaseConfigured) {
                    setConfigError('Supabase');
                    setIsLoading(false);
                    return;
                }

                if (!isGeminiConfigured) {
                    setConfigError('Gemini');
                    setIsLoading(false);
                    return;
                }

                // Get initial session
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);

                // Listen for auth changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    setSession(session);
                    if (_event === 'SIGNED_IN') {
                        setAuthView('login');
                        setAuthError(null);
                    }
                    if (_event === 'SIGNED_OUT') {
                        setSession(null);
                        setAuthView('login');
                    }
                });
                
                // Referral logic
                const params = new URLSearchParams(window.location.search);
                const refCode = params.get('ref');
                if (refCode) {
                    sessionStorage.setItem('referralCode', refCode);
                    window.history.replaceState({}, document.title, window.location.pathname);
                }

                setIsLoading(false);
                return () => subscription.unsubscribe();

            } catch (err) {
                console.error("App Initialization Error:", err);
                setIsLoading(false);
            }
        };
        init();
    }, []);

    const handleLogin = async (credentials: Credentials) => {
        setIsAuthLoading(true);
        setAuthError(null);
        try {
            await authService.login(credentials);
        } catch (error) {
            setAuthError((error as Error).message);
        } finally {
            setIsAuthLoading(false);
        }
    };
    
    const handleSignUp = async (credentials: Credentials) => {
        setIsAuthLoading(true);
        setAuthError(null);
        try {
            await authService.signup(credentials, sessionStorage.getItem('referralCode'));
            setSuccessMessage("Sign up successful! Please check your email to verify your account before logging in.");
            setAuthView('check_email');
        } catch (error) {
            setAuthError((error as Error).message);
        } finally {
            setIsAuthLoading(false);
        }
    };

    if (configError) {
        return <ConfigurationErrorPage missingConfig={configError} />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="text-gray-500 mt-4 font-medium animate-pulse">Initializing Trade X...</p>
            </div>
        );
    }

    if (!session) {
         if (authView === 'check_email') {
            return (
                <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4 text-center">
                    <div className="bg-gray-800 p-8 rounded-2xl border border-blue-500/30 shadow-2xl max-w-md">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
                        <p className="text-gray-400 mb-8">{successMessage}</p>
                        <button 
                            onClick={() => setAuthView('login')} 
                            className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-semibold"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            );
        }
        return authView === 'signup' ? (
            <SignUpPage 
                onSignUp={handleSignUp} 
                onNavigateToLogin={() => { setAuthView('login'); setAuthError(null); }}
                error={authError}
                isLoading={isAuthLoading}
            />
        ) : (
            <LoginPage 
                onLogin={handleLogin} 
                onNavigateToSignUp={() => { setAuthView('signup'); setAuthError(null); }}
                error={authError}
                isLoading={isAuthLoading}
                successMessage={successMessage}
            />
        );
    }

    return <MainApp session={session} />;
};

export default App;