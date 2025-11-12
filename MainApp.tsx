import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AssetSelector } from './components/results/ForexSelector';
import { ErrorAlert } from './components/ErrorAlert';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { ResultsPage } from './pages/ResultsPage';
import MarketAnalystPage from './pages/MarketAnalystPage';
import ProfilePage from './pages/ProfilePage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import BuyTokensPage from './pages/BuyTokensPage';
import WithdrawPage from './pages/WithdrawPage';
import WithdrawalHistoryPage from './pages/WithdrawalHistoryPage';
import AboutUsPage from './pages/AboutUsPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import CompoundingAgentPage from './pages/CompoundingAgentPage';
import HistoryPage from './pages/HistoryPage';
import ReferralPage from './pages/ReferralPage';
import ContactUsPage from './pages/ContactUsPage';
import LegalDisclaimerPage from './pages/LegalDisclaimerPage';
import DerivTraderPage from './pages/DerivTraderPage';
import DerivSmartTraderPage from './pages/DerivSmartTraderPage'; // New Import
import { CandlestickSpinner } from './components/CandlestickSpinner';
import TradingViewAdvancedChartWidget from './components/TradingViewAdvancedChartWidget';
import { getSignalFromImage, isGeminiConfigured } from './services/geminiService';
import { useTokenForAnalysis } from './services/tokenService';
import { logService } from './services/logService';
import { AnalysisResult, Asset, ImageData, AppUser, Signal, Notification } from './types';
import { AVAILABLE_ASSETS } from './constants';
import { ConfigurationErrorPage } from './pages/ConfigurationErrorPage';
import { notificationService } from './services/notificationService';
import { Chatbot } from './components/chatbot/Chatbot';

interface MainAppProps {
    user: AppUser;
    onLogout: () => void;
    setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
}

export type View = 'dashboard' | 'marketScan' | 'forexScanner' | 'compoundingAgent' | 'buyTokens' | 'purchaseHistory' | 'history' | 'referralProgram' | 'about' | 'adminDashboard' | 'profile' | 'withdraw' | 'withdrawalHistory' | 'contact' | 'legalDisclaimer' | 'derivTrader' | 'derivSmartTrader';

// NOTE: This is a temporary, insecure way to identify an admin.
// In a real application, this should be a role-based system in your database.
const ADMIN_EMAIL = 'admin@tradex.com';

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, setUser }) => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [currentPage, setCurrentPage] = useState<'home' | 'results'>('home');
  const [selectedAsset, setSelectedAsset] = useState<Asset>(AVAILABLE_ASSETS[0]);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const isAdmin = user.auth.email === ADMIN_EMAIL;
  
  const fetchNotifications = useCallback(async () => {
      try {
          const data = await notificationService.getNotifications();
          setNotifications(data);
      } catch (error) {
          console.error("Failed to fetch notifications:", (error as Error).message || error);
      }
  }, []);

  useEffect(() => {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
  }, [fetchNotifications]);
  
  const handleTokenUsed = useCallback((newBalance: number) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        return {
            ...currentUser,
            profile: {
                ...currentUser.profile,
                tokens: newBalance,
            },
        };
    });
  }, [setUser]);

  const handleAnalysis = useCallback(async () => {
    if (!imageData) {
        setError("Please upload an image to analyze.");
        return;
    }
    if (user.profile.tokens < 1) {
        setError("You have 0 tokens. Please buy more to perform a new analysis.");
        return;
    }
    
    setLoadingStep("Analyzing chart image with AI...");
    setError(null);
    setAnalysisResult(null);

    try {
      let result: AnalysisResult;
      result = await getSignalFromImage(imageData);
      
      setLoadingStep("Finalizing analysis...");
      const tokensUsed = result.confidenceLevel > 50 ? 1 : 0;
      await logService.createLog(result, user.auth.email!, tokensUsed, user.auth.id);
      
      if (tokensUsed > 0) {
          fetchNotifications(); // Refresh notifications after analysis might have created one
          const newBalance = await useTokenForAnalysis(user.profile.tokens);
          handleTokenUsed(newBalance);
      } else {
          const originalRationale = result.rationale;
          const originalSignal = result.signal;
          result.signal = Signal.HOLD;
          result.entryPrice = 0;
          result.takeProfit = 0;
          result.stopLoss = 0;
          result.pips = { takeProfit: 0, stopLoss: 0 };
          result.riskRewardRatio = 'N/A';
          result.rationale = `AI Confidence (${result.confidenceLevel}%) is at or below the 50% threshold. Signal converted to HOLD (no token charged).\nIt is advisable to wait for a clearer market setup.\n\n--- Original AI Rationale (Signal: ${originalSignal}) ---\n${originalRationale}`;
      }
      
      setAnalysisResult(result);
      setCurrentPage('results');

    } catch (err: unknown)
    {
      if (err instanceof Error) {
        setError(`Analysis failed: ${err.message}`);
      } else {
        setError("An unknown error occurred during analysis.");
      }
      console.error(err);
    } finally {
      setLoadingStep(null);
    }
  }, [imageData, user, handleTokenUsed, fetchNotifications]);

  const handleGoHome = useCallback(() => {
    setCurrentPage('home');
    setAnalysisResult(null);
    setImageData(null);
    setError(null);
  }, []);

  const renderActiveView = () => {
    if (!isGeminiConfigured) {
      return <ConfigurationErrorPage missingConfig="Gemini" />;
    }
  
    switch (activeView) {
      case 'dashboard':
        return <DashboardPage user={user} onNavigate={setActiveView} />;
      case 'derivTrader':
        return <DerivTraderPage />;
      case 'derivSmartTrader':
        return <DerivSmartTraderPage />;
      case 'forexScanner':
        return (
          <>
            {currentPage === 'home' && (
              <div className="space-y-8">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                      {/* Left Column: Controls */}
                      <div className="lg:col-span-1 space-y-6">
                           <div className="bg-blue-900/50 p-6 rounded-2xl border border-blue-800">
                                <h2 className="text-xl font-bold text-white mb-4">Live Chart</h2>
                                <p className="text-gray-400 text-sm mb-4">Select an asset to view the full-featured TradingView chart.</p>
                                <AssetSelector
                                  assets={AVAILABLE_ASSETS}
                                  selectedAsset={selectedAsset}
                                  onSelectAsset={setSelectedAsset}
                                />
                           </div>
                           <div className="bg-blue-900/50 p-6 rounded-2xl border border-blue-800">
                                <h2 className="text-xl font-bold text-white mb-4">AI Image Analysis</h2>
                                <p className="text-gray-400 text-sm mb-4">Alternatively, upload a chart screenshot for an AI-powered analysis.</p>
                                <ImageAnalyzer
                                  imageData={imageData}
                                  onImageDataChange={setImageData}
                                  disabled={!!loadingStep}
                                />
                                <div className="mt-6">
                                    <button
                                      onClick={handleAnalysis}
                                      disabled={!!loadingStep || !imageData}
                                      className="w-full h-14 px-6 text-lg text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-950 transition-all duration-300 disabled:opacity-50 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                      {loadingStep ? <CandlestickSpinner /> : 'Analyze Image (1 Token)'}
                                    </button>
                                     {loadingStep && (
                                        <p className="text-center text-sm text-gray-300 mt-3 animate-pulse">
                                            {loadingStep}
                                        </p>
                                     )}
                                     {error && <div className="mt-4"><ErrorAlert message={error} /></div>}
                                </div>
                            </div>
                      </div>
                      
                      {/* Right Column: Chart */}
                      <div className="lg:col-span-3 h-[80vh] bg-blue-950/50 rounded-xl border border-blue-800 p-1">
                          <TradingViewAdvancedChartWidget 
                              user={user}
                              symbol={selectedAsset.tradingViewTicker}
                              key={selectedAsset.tradingViewTicker} // Force re-mount on symbol change
                           />
                      </div>
                  </div>
              </div>
            )}
            
            {currentPage === 'results' && analysisResult && (
              <ResultsPage result={analysisResult} onGoBack={handleGoHome} onNavigate={setActiveView} />
            )}
          </>
        );
      case 'marketScan':
        return <MarketAnalystPage user={user} onTokenUsed={handleTokenUsed} />;
      case 'compoundingAgent':
         return <CompoundingAgentPage />;
      case 'history':
         return <HistoryPage user={user} />;
      case 'referralProgram':
        return <ReferralPage user={user} />;
      case 'purchaseHistory':
        return <PurchaseHistoryPage user={user} onNavigate={setActiveView} />;
      case 'buyTokens':
        return <BuyTokensPage user={user} onPurchaseSuccess={() => { /* Can add a user profile refresh logic here */ }} />;
      case 'withdraw':
        return <WithdrawPage user={user} onWithdrawSuccess={() => { /* Can add a user profile refresh logic here */ }} />;
      case 'withdrawalHistory':
        return <WithdrawalHistoryPage user={user} />;
       case 'profile':
        return <ProfilePage user={user} onLogout={onLogout} onNavigate={setActiveView} />;
      case 'about':
        return <AboutUsPage />;
      case 'contact':
        return <ContactUsPage user={user} />;
      case 'legalDisclaimer':
        return <LegalDisclaimerPage />;
      case 'adminDashboard':
        return isAdmin ? <AdminPage /> : <p>Access Denied.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans flex flex-col">
      <Header 
        activeView={activeView} 
        onNavigate={setActiveView} 
        user={user} 
        onLogout={onLogout} 
        isAdmin={isAdmin}
        notifications={notifications}
        setNotifications={setNotifications} 
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        {renderActiveView()}
      </main>
      <Chatbot />
      <Footer onNavigate={setActiveView} />
    </div>
  );
};

export default MainApp;