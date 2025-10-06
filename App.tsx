import React, { useState, useEffect, useCallback } from 'react';
import { AppUser, Credentials } from './types';
import { authService } from './services/authService';
import { supabase, isSupabaseConfigured } from './services/supabase';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import MainApp from './MainApp';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ConfigurationErrorPage } from './pages/ConfigurationErrorPage';
import { profileService } from './services/profileService';
import { ThemeProvider } from './contexts/ThemeContext';

type AuthPage = 'login' | 'signup';

const App: React.FC = () => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [authPage, setAuthPage] = useState<AuthPage>('login');
    const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true);
    const [authActionInProgress, setAuthActionInProgress] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);
    
    useEffect(() => {
        // This effect runs once on app load to capture a referral code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) {
            // Store it in session storage so it's available until the browser tab is closed.
            sessionStorage.setItem('referralCode', refCode);
        }
    }, []);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setIsLoadingUser(false);
            return;
        }
        setIsLoadingUser(true);
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                try {
                    const profile = await profileService.getProfile(session.user.id);
                     if (profile) {
                        setUser({
                            auth: { id: session.user.id, email: session.user.email! },
                            profile
                        });
                    } else {
                        // This might happen if the DB trigger for profile creation fails or is slow.
                        // We can create a fallback profile object to keep the app functional.
                        console.warn(`Profile for user ${session.user.id} not found.`);
                        setUser({
                            auth: { id: session.user.id, email: session.user.email! },
                            profile: {
                                id: session.user.id,
                                email: session.user.email!,
                                tokens: 12, // Fallback to new user token amount
                                referral_code: 'N/A'
                            }
                        });
                    }
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    // Log out the user if we can't get their profile, as it's critical data
                    await authService.logout();
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoadingUser(false);
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const handleLogin = useCallback(async (credentials: Credentials) => {
        setError(null);
        setSignupSuccessMessage(null);
        setAuthActionInProgress(true);
        try {
            await authService.login(credentials);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setAuthActionInProgress(false);
        }
    }, []);

    const handleSignUp = useCallback(async (credentials: Credentials) => {
        setError(null);
        setSignupSuccessMessage(null);
        setAuthActionInProgress(true);
        try {
            const referredByCode = sessionStorage.getItem('referralCode');
            await authService.signup(credentials, referredByCode);
            setSignupSuccessMessage("Success! Please check your email for a confirmation link to complete registration.");
            sessionStorage.removeItem('referralCode'); // Clear after use
            setAuthPage('login');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setAuthActionInProgress(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await authService.logout();
        setUser(null);
        setAuthPage('login');
        setError(null);
    }, []);

    const navigateToSignUp = useCallback(() => {
        setAuthPage('signup');
        setError(null);
        setSignupSuccessMessage(null);
    }, []);

    const navigateToLogin = useCallback(() => {
        setAuthPage('login');
        setError(null);
    }, []);
    
    if (!isSupabaseConfigured) {
        return <ConfigurationErrorPage missingConfig="Supabase" />;
    }

    if (isLoadingUser) {
        return (
            <div className="bg-blue-950 dark:bg-blue-950 min-h-screen flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!user) {
        return authPage === 'login' ? (
            <LoginPage 
                onLogin={handleLogin} 
                onNavigateToSignUp={navigateToSignUp} 
                error={error} 
                isLoading={authActionInProgress}
                successMessage={signupSuccessMessage}
            />
        ) : (
            <SignUpPage 
                onSignUp={handleSignUp} 
                onNavigateToLogin={navigateToLogin} 
                error={error} 
                isLoading={authActionInProgress}
            />
        );
    }
    
    return <MainApp user={user} onLogout={handleLogout} setUser={setUser} />;
};

const WrappedApp: React.FC = () => (
    <ThemeProvider>
        <App />
    </ThemeProvider>
);

export default WrappedApp;