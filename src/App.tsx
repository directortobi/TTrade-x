import React, { useState, useEffect } from 'react';
import { initializeSupabase, isSupabaseConfigured, supabase } from './services/supabase.ts';
import { isGeminiConfigured } from './services/geminiService.ts';
import { MainApp } from './MainApp.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { SignUpPage } from './pages/SignUpPage.tsx';
import { authService } from './services/authService.ts';
import { Credentials } from './types.ts';
import { ConfigurationErrorPage } from './pages/ConfigurationErrorPage.tsx';
import { LoadingSpinner } from './components/LoadingSpinner.tsx';

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
            await initializeSupabase();
            if (!isSupabaseConfigured) {
                setConfigError('Supabase');
            } else if (!isGeminiConfigured) {
                setConfigError('Gemini');
            } else {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);

                const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                    setSession(session);
                    if (_event === 'SIGNED_IN') {
                        setAuthView('login'); // Reset view after successful login/signup
                    }
                });
                
                 // Check for referral code in URL on initial load
                const params = new URLSearchParams(window.location.search);
                const refCode = params.get('ref');
                if (refCode) {
                    sessionStorage.setItem('referralCode', refCode);
                    // Optional: Clean the URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                }


                setIsLoading(false);
                return () => subscription.unsubscribe();
            }
            // Add a fallback for when initialization fails but doesn't set a config error
            // This can happen if the async init itself has an unhandled rejection
            if (isLoading) {
                 setIsLoading(false);
            }
        };
        init();
    }, [isLoading]);

    const handleLogin = async (credentials: Credentials) => {
        setIsAuthLoading(true);
        setAuthError(null);
        setSuccessMessage(null);
        try {
            await authService.login(credentials);
            // onAuthStateChange will handle setting the session
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
            setSuccessMessage("Sign up successful! Please check your email to verify your account.");
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
        return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!session) {
         if (authView === 'check_email') {
            return (
                <div className="min-h-screen flex flex-col justify-center items-center p-4 text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Check Your Email</h1>
                    <p className="text-gray-300 max-w-md mb-6">{successMessage}</p>
                    <button onClick={() => setAuthView('login')} className="font-medium text-teal-400 hover:text-teal-300">
                        Back to Login
                    </button>
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