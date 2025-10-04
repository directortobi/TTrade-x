import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { AssetSelector } from './components/results/ForexSelector';
import { ErrorAlert } from './components/ErrorAlert';
import { ImageAnalyzer } from './components/ImageAnalyzer';
import { ResultsPage } from './pages/ResultsPage';
import MarketAnalystPage from './pages/MarketAnalystPage';
import ProfilePage from './pages/ProfilePage';
import PurchaseHistoryPage from './pages/PurchaseHistoryPage';
import BuyTokensPage from './pages/BuyTokensPage';
import WithdrawPage from './pages/WithdrawPage';
import AboutUsPage from './pages/AboutUsPage';
import AdminPage from './pages/AdminPage';
import DashboardPage from './pages/DashboardPage';
import ComingSoonPage from './pages/ComingSoonPage';
import HistoryPage from './pages/HistoryPage';
import ReferralPage from './pages/ReferralPage';
import TradingViewWidget from './components/TradingViewWidget';
import { CandlestickSpinner } from './components/CandlestickSpinner';
import { getTradingSignal, getSignalFromImage, isGeminiConfigured } from './services/geminiService';
import { fetchCandlestickData, fetchNewsSentiment } from './services/marketDataService';
import { useTokenForAnalysis } from './services/tokenService';
import { logService } from './services/logService';
import { AnalysisResult, Asset, ImageData, AppUser, Signal } from './types';
import { AVAILABLE_ASSETS } from './constants';
import { ConfigurationErrorPage } from './pages/ConfigurationErrorPage';

interface MainAppProps {
    user: AppUser;
    onLogout: () => void;
    setUser: React.Dispatch<React.SetStateAction<AppUser | null>>;
}

export type View = 'dashboard' | 'marketScan' | 'forexScanner' | 'strategies' | 'buyTokens' | 'purchaseHistory' | 'history' | 'referralProgram' | 'about' | 'adminDashboard' | 'profile' | 'withdraw';

// NOTE: This is a temporary, insecure way to identify an admin.
// In a real application, this should be a role-based system in your database.
const ADMIN_EMAIL = 'admin@tradex.com';

const MainApp: React.FC<MainAppProps> = ({ user, onLogout, setUser }) => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [currentPage, setCurrentPage] = useState<'home' | 'results'>('home');
  const [selectedAsset, setSelectedAsset] = useState<Asset>(AVAILABLE_ASSETS[0]);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user.auth.email === ADMIN_EMAIL;
  
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
    if (user.profile.tokens < 1) {
        setError("You have 0 tokens. Please buy more to perform a new analysis.");
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      let result: AnalysisResult;
      if (imageData) {
        result = await getSignalFromImage(imageData);
      } else {
        const [data1m, data15m, data1h, newsSentiment] = await Promise.all([
          fetchCandlestickData(selectedAsset.ticker, '1min'),
          fetchCandlestickData(selectedAsset.ticker, '15min'),
          fetchCandlestickData(selectedAsset.ticker, '1hour'),
          fetchNewsSentiment(selectedAsset.ticker)
        ]);

        result = await getTradingSignal({
          pair: selectedAsset.ticker,
          data1m,
          data15m,
          data1h,
          newsSentiment
        });
      }
      
      const tokensUsed = result.confidenceLevel > 50 ? 1 : 0;
      await logService.createLog(result, user.auth.email!, tokensUsed);

      if (tokensUsed > 0) {
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
      setIsLoading(false);
    }
  }, [selectedAsset, imageData, user, handleTokenUsed]);

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
      case 'forexScanner':
        return (
          <>
            {currentPage === 'home' && (
              <>
                <div className="max-w-3xl mx-auto bg-blue-900/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-lg border border-blue-800">
                  <div className={`space-y-4 transition-opacity duration-300 ${imageData ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                    <AssetSelector
                      assets={AVAILABLE_ASSETS}
                      selectedAsset={selectedAsset}
                      onSelectAsset={setSelectedAsset}
                    />
                    
                    <div className="h-[60vh] bg-gray-900/30 rounded-lg border border-gray-700 flex items-center justify-center">
                        <TradingViewWidget ticker={selectedAsset.ticker} />
                    </div>
                  </div>

                  <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 font-semibold">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                  </div>

                  <ImageAnalyzer
                    imageData={imageData}
                    onImageDataChange={setImageData}
                    disabled={isLoading}
                  />

                  <div className="mt-8">
                    <button
                      onClick={handleAnalysis}
                      disabled={isLoading}
                      className="w-full h-14 px-6 text-lg text-white font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-950 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? <CandlestickSpinner /> : 'Analyze Now (1 Token)'}
                    </button>
                  </div>
                </div>

                <div className="mt-10 max-w-3xl mx-auto">
                  {error && <ErrorAlert message={error} />}
                  {isLoading && (
                    <div className="text-center p-8 flex flex-col items-center justify-center">
                        <CandlestickSpinner />
                        <p className="text-lg text-gray-300 mt-4">AI is analyzing the market...</p>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {currentPage === 'results' && analysisResult && (
              <ResultsPage result={analysisResult} onGoBack={handleGoHome} />
            )}
          </>
        );
      case 'marketScan':
        return <MarketAnalystPage user={user} onTokenUsed={handleTokenUsed} />;
      case 'strategies':
         return <ComingSoonPage title="Strategies" description="Create, backtest, and manage your custom AI-powered trading strategies." />;
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
       case 'profile':
        return <ProfilePage user={user} onLogout={onLogout} onNavigate={setActiveView} />;
      case 'about':
        return <AboutUsPage />;
      case 'adminDashboard':
        return isAdmin ? <AdminPage /> : <p>Access Denied.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-gray-200 font-sans">
      <Header activeView={activeView} onNavigate={setActiveView} user={user} onLogout={onLogout} isAdmin={isAdmin} />
      <main className="container mx-auto px-4 py-8">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default MainApp;