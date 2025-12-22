import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './services/supabase';
import { profileService } from './services/profileService';
import { AppUser, Profile, View } from './types';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorAlert } from './components/ErrorAlert';
import { notificationService } from './services/notificationService';
import { DashboardSkeleton } from './components/skeletons/DashboardSkeleton';

// Lazy load pages for better initial performance
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const MarketAnalystPage = React.lazy(() => import('./pages/MarketAnalystPage'));
const ImageAnalyzer = React.lazy(() => import('./components/ImageAnalyzer'));
const InteractiveChart = React.lazy(() => import('./components/InteractiveChart'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const BuyTokensPage = React.lazy(() => import('./pages/BuyTokensPage'));
const PurchaseHistoryPage = React.lazy(() => import('./pages/PurchaseHistoryPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const ReferralPage = React.lazy(() => import('./pages/ReferralPage'));
const WithdrawPage = React.lazy(() => import('./pages/WithdrawPage'));
const WithdrawalHistoryPage = React.lazy(() => import('./pages/WithdrawalHistoryPage'));
const AboutUsPage = React.lazy(() => import('./pages/AboutUsPage'));
const ContactUsPage = React.lazy(() => import('./pages/ContactUsPage'));
const LegalDisclaimerPage = React.lazy(() => import('./pages/LegalDisclaimerPage'));
const DerivTraderPage = React.lazy(() => import('./pages/DerivTraderPage'));
const DerivSmartTraderPage = React.lazy(() => import('./pages/DerivSmartTraderPage'));
const CompoundingAgentPage = React.lazy(() => import('./pages/CompoundingAgentPage'));
const InstructionsPage = React.lazy(() => import('./pages/InstructionsPage'));

const DEFAULT_PROFILE: Profile = {
    id: '',
    email: '',
    tokens: 0,
    is_admin: false,
    referral_code: 'N/A',
    referred_by: null,
};

export const MainApp: React.FC<{ session: any }> = ({ session }) => {
    const [user, setUser] = useState<AppUser | null>(null);
    const [isUserLoading, setIsUserLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [view, setView] = useState<View>('dashboard');
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const fetchUserAndProfile = useCallback(async () => {
        if (!session?.user) {
            setIsUserLoading(false);
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
    }, [session]);

    useEffect(() => {
        fetchUserAndProfile();
    }, [fetchUserAndProfile]);

    const handleTokenUpdate = (newBalance: number) => {
        if (user) {
            setUser({ ...user, profile: { ...user.profile, tokens: newBalance } });
        }
    };

    const handleLogout = async () => {
        if (supabase) {
            await (supabase.auth as any).signOut();
        }
    };

    const renderView = () => {
        if (!user) return null;
        
        const pageProps = { user, onNavigate: setView };

        switch (view) {
            case 'dashboard':
                return <DashboardPage {...pageProps} />;
            case 'market_analyst':
                return <MarketAnalystPage user={user} onTokenUsed={handleTokenUpdate} onNavigate={setView} />;
            case 'image_analyst':
                 return <ImageAnalyzer {...pageProps} onTokenUsed={handleTokenUpdate} onNavigate={setView}/>;
            case 'chart':
                return <InteractiveChart {...pageProps} onTokenUsed={handleTokenUpdate} onNavigate={setView} />;
            case 'history':
                return <HistoryPage {...pageProps} />;
            case 'profile':
                return <ProfilePage {...pageProps} onLogout={handleLogout} onNavigate={setView} />;
            case 'buyTokens':
                return <BuyTokensPage {...pageProps} onPurchaseSuccess={fetchUserAndProfile} />;
            case 'purchaseHistory':
                return <PurchaseHistoryPage {...pageProps} onNavigate={setView} />;
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
            case 'instructions':
                return <InstructionsPage onNavigate={setView} />;
            default:
                return <DashboardPage {...pageProps} />;
        }
    };
    
    const onNotificationsViewed = () => {
        setUnreadNotifications(0);
        fetchUserAndProfile();
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