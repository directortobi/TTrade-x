import React, { useState, useRef, useCallback } from 'react';
import { AnalysisResult, ImageData as ImageData_ } from '../types';
import { getSignalFromImage } from '../services/geminiService';
import { useTokenForAnalysis } from '../services/tokenService';
import { logService } from '../services/logService';
import { AppUser, Signal, View } from '../types';
import { ResultsPage } from '../pages/ResultsPage';
import { ErrorAlert } from './ErrorAlert';
import { CandlestickSpinner } from './CandlestickSpinner';

interface ImageAnalyzerProps {
    user: AppUser;
    onTokenUsed: (newBalance: number) => void;
    onNavigate: (view: View) => void;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ user, onTokenUsed, onNavigate }) => {
    const [imageData, setImageData] = useState<ImageData_ | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [userAnnotations, setUserAnnotations] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) { // 4MB limit for Gemini
                setError("Image size cannot exceed 4MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setImageData({
                    mimeType: file.type,
                    data: base64String.split(',')[1],
                });
                setAnalysisResult(null);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = useCallback(async () => {
        if (!imageData) {
            setError("Please upload an image first.");
            return;
        }
         if (user.profile.tokens < 1) {
            setError("You have 0 tokens. Please buy more to perform a new analysis.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            let result = await getSignalFromImage(imageData, userAnnotations);
            
            const tokensUsed = result.confidenceLevel > 50 ? 1 : 0;
            await logService.createLog(result, user.auth.email!, tokensUsed, user.auth.id);
            
            if (tokensUsed > 0) {
                const newBalance = await useTokenForAnalysis(user.profile.tokens);
                onTokenUsed(newBalance);
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

        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(`Analysis failed: ${err.message}`);
            } else {
                setError("An unknown error occurred during analysis.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [imageData, userAnnotations, user, onTokenUsed]);

    const handleReset = useCallback(() => {
        setAnalysisResult(null);
        setImageData(null);
        setImagePreview(null);
        setUserAnnotations('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    if (isLoading) {
        return (
             <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center pt-16">
                <CandlestickSpinner />
                <p className="text-xl text-gray-300 mt-6 animate-pulse font-semibold">Analyzing your chart image...</p>
                <p className="text-gray-500 mt-2">This may take a few moments.</p>
            </div>
        );
    }
    
    if (analysisResult) {
        return <ResultsPage result={analysisResult} onGoBack={handleReset} onNavigate={onNavigate} />;
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
             <div className="bg-gray-800/50 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-700 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300">Chart Image Analyzer</h2>
                    <p className="text-gray-400">Upload a screenshot of any trading chart for an instant AI-powered analysis.</p>
                </div>
                
                <div 
                    className="relative border-2 border-dashed border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-green-500 hover:bg-gray-800/60 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/gif, image/webp"
                        onChange={handleFileChange}
                    />
                    {imagePreview ? (
                        <img src={imagePreview} alt="Chart preview" className="max-h-80 mx-auto rounded-lg object-contain" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="font-semibold">Click to upload or drag & drop</p>
                            <p className="text-sm">PNG, JPG, GIF, or WEBP (Max 4MB)</p>
                        </div>
                    )}
                </div>
                
                <div>
                    <label htmlFor="annotations" className="block text-sm font-medium text-gray-400 mb-2">
                        Your Notes & Analysis (Optional)
                    </label>
                    <textarea
                        id="annotations"
                        rows={3}
                        value={userAnnotations}
                        onChange={(e) => setUserAnnotations(e.target.value)}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="e.g., 'Looking for a reversal at 1.0850...'"
                    ></textarea>
                </div>

                <div className="pt-2">
                    <button
                        onClick={handleAnalyze}
                        disabled={!imageData || isLoading}
                        className="w-full h-14 px-6 text-lg text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        Analyze Image (1 Token)
                    </button>
                </div>
            </div>
            {error && <div className="mt-4"><ErrorAlert message={error} /></div>}
        </div>
    );
};

export default ImageAnalyzer;