import React, { useState, useCallback } from 'react';
import { AssetSelector } from '../components/results/ForexSelector';
import { ErrorAlert } from '../components/ErrorAlert';
import { ResultsPage } from './ResultsPage';
import { getMarketAnalystPrediction, getTimeframeAnalysis } from '../services/geminiService';
import { fetchCandlestickData } from '../services/marketDataService';
import { useTokenForAnalysis } from '../services/tokenService';
import { logService } from '../services/logService';
import { AnalysisResult, AppUser, Asset, TradingStyle, Timeframe, Signal, View } from '../types';
import { AVAILABLE_ASSETS, TRADING_STYLES } from '../constants';
import { CandlestickSpinner } from '../components/CandlestickSpinner';

interface MarketAnalystPageProps {
    user: AppUser;
    onTokenUsed: (newBalance: number) => void;
    onNavigate: (view: View) => void;
}

type AnalysisMode = 'expert' | Timeframe;

const MODES: { id: AnalysisMode, name: string }[] = [
    { id: 'expert', name: 'Expert Analyst' },
    { id: '1min', name: '1 Min' },
    { id: '5min', name: '5 Min' },
    { id: '15min', name: '15 Min'