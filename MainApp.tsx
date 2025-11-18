import React, { useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './services/supabase.ts';
import { profileService } from './services/profileService.ts';
// FIX: Add .ts extension to import path.
import { AppUser, Profile } from './types.ts';
// FIX: Add .tsx extension to import path.
import { Header } from './components/Header.tsx';
// FIX: Add .tsx extension to import path.
import { LoadingSpinner } from './components/LoadingSpinner.tsx';
// FIX: Add .tsx extension to import path.
import { ErrorAlert } from './components/ErrorAlert.tsx';
import { notificationService } from './services/notificationService.ts';
import { DashboardSkeleton } from './components/skeletons/DashboardSkeleton.tsx';

// Lazy load pages for better initial performance
const DashboardPage = React.lazy(() => import('./pages/DashboardPage.tsx'));
const MarketAnalystPage = React.lazy(() => import('./pages/MarketAnalystPage.tsx'));
// FIX: Add .tsx extension to import path.
const ImageAnalyzer = React.lazy(() => import('./components/ImageAnalyzer.tsx'));
// FIX: Add .tsx extension to import path.
const InteractiveChart = React.lazy(() => import('./components/InteractiveChart.tsx'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage.tsx'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage.tsx'));
const BuyTokensPage = React.lazy(() => import('./pages/BuyTokensPage.tsx'));
const PurchaseHistoryPage = React.lazy(() => import('./pages/PurchaseHistoryPage.tsx'));
const AdminPage = React.lazy(() => import('./pages/AdminPage.tsx'));
const ReferralPage = React.lazy(() => import('./pages/ReferralPage.tsx'));
const WithdrawPage = React.lazy(() => import('./pages/WithdrawPage.tsx'));
const WithdrawalHistoryPage = React.lazy(() => import('./pages/WithdrawalHistoryPage.tsx'));
const AboutUsPage = React.lazy(() => import('./pages/AboutUsPage.tsx'));
const ContactUsPage = React.lazy(() => import('./pages/ContactUsPage.tsx'));
const LegalDisclaimerPage = React.lazy(() => import('./pages/LegalDisclaimerPage.tsx'));
const DerivTraderPage = React.lazy(() => import('./pages/DerivTraderPage.tsx'));
const DerivSmartTraderPage = React.lazy(() => import('./pages/DerivSmartTraderPage.tsx'));
const CompoundingAgentPage = React.lazy(() => import('./pages/CompoundingAgentPage.tsx'));

export type View = 'dashboard' | 'market_analyst' | 'image_analyst' | 'chart' | 'history' | 'profile' | 'buyTokens' | 'purchaseHistory' | 'admin' | 'referrals' | 'withdraw' | 'withdrawalHistory' | 'about' | 'contact' | 'disclaimer' | 'derivTrader' | 'derivSmartTrader' | 'compoundingAgent';

const DEFAULT_PROFILE: Profile = {
    id: '',
    email: '',
    tokens: 0,
    is_admin: false,
    referral_code: 'N/A',
    referred_by: null,
};


export const MainApp: React.FC<{ session: Session }> = ({ session }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<View>('dashboard');
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const fetchUserAndProfile = useCallback(async () => {
        if (!session.user) {
            setIsUserLoading(false);
            setError("No user session found.");
            return;
        }

        try {
            const profileData = await profileService.getProfile(session.user.id);
            const notifications = await notificationService.getNotifications();
            setUnreadNotifications(notifications.filter(n => !n.is_read).length);

            setUser({
                auth: { id: session.user.id, email: session.user.email! },
                profile: profileData ? { ...profileData, email: session.user.email! } : { ...DEFAULT_PROFILE, id: session.user.id, email: session.user.email! },
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred while fetching user profile.");
        } finally {
            setIsUserLoading(false);
        }
    }, [session.user]);

    useEffect(() => {
        fetchUserAndProfile();
    }, [fetchUserAndProfile]);

    const handleTokenUpdate = (newBalance: number) => {
        if (user) {
            setUser({ ...user, profile: { ...user.profile, tokens: newBalance } });
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        // The onAuthStateChange listener in App.tsx will handle the session change.
    };

    const renderView = () => {
        if (!user) return null; // Should be covered by loading/error state
        
        const pageProps = { user, onNavigate: setView };

        switch (view) {
            case 'dashboard':
                return <DashboardPage {...pageProps} />;
            case 'market_analyst':
                return <MarketAnalystPage user={user} onTokenUsed={handleTokenUpdate} onNavigate={setView} />;
            case 'image_analyst':
                 return <ImageAnalyzer {...pageProps} onTokenUsed={handleTokenUpdate} onNavigate={setView}/>;
            case 'chart':
                return <InteractiveChart {...pageProps} onTokenUsed={handleTokenUpdate} />;
            case 'history':
                return <HistoryPage {...pageProps} />;
            case 'profile':
                return <ProfilePage {...pageProps} onLogout={handleLogout} />;
            case 'buyTokens':
                return <BuyTokensPage {...pageProps} onPurchaseSuccess={fetchUserAndProfile} />;
            case 'purchaseHistory':
                return <PurchaseHistoryPage {...pageProps} />;
             case 'admin':
                return user.profile.is_admin ? <AdminPage /> : <ErrorAlert message="You are not authorized to view this page." />;
            case 'referrals':
                return <ReferralPage {...pageProps} />;
            case 'withdraw':
                return <WithdrawPage {...pageProps} onWithdrawSuccess={fetchUserAndProfile} />;
            case 'withdrawalHistory':
                return <WithdrawalHistoryPage {...pageProps} />;
            case 'about':
                return <AboutUsPage />;
            case 'contact':
                return <ContactUsPage {...pageProps} />;
            case 'disclaimer':
                return <LegalDisclaimerPage />;
            case 'derivTrader':
                return <DerivTraderPage />;
            case 'derivSmartTrader':
                return <DerivSmartTraderPage />;
             case 'compoundingAgent':
                return <CompoundingAgentPage />;
            default:
                return <DashboardPage {...pageProps} />;
        }
    };
    
    const onNotificationsViewed = () => {
        setUnreadNotifications(0);
        fetchUserAndProfile(); // Re-fetch to get latest counts if some are marked read individually
    }


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            <Header
                user={user}
                currentView={view}
                onNavigate={setView}
                onLogout={handleLogout}
                unreadCount={unreadNotifications}
                onNotificationsViewed={onNotificationsViewed}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {error && <ErrorAlert message={error} />}
                {isUserLoading ? (
                    <DashboardSkeleton />
                ) : (
                    <React.Suspense fallback={<div className="flex justify-center items-center h-64"><LoadingSpinner /></div>}>
                       {renderView()}
                    </React.Suspense>
                )}
            </main>
        </div>
    );
};