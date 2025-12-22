
import React, { useState, useRef, useCallback } from 'react';
import { AnalysisResult, ImageData as ImageData_, View, AppUser, Signal } from '../types';
import { getSignalFromImage } from '../services/geminiService';
import { useTokenForAnalysis } from '../services/tokenService';
import { logService } from '../services/logService';
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
            if (file.size > 4 * 1024 * 1024) {
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
            setError("You have 0 tokens. Please buy more to perform an analysis.");
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
                result.signal = Signal.HOLD;
                result.rationale = `Confidence too low (${result.confidenceLevel}%). Signal converted to HOLD. (No token deducted). \n\n ${result.rationale}`;
            }

            setAnalysisResult(result);
        } catch (err: any) {
            setError(err.message || "Analysis failed.");
        } finally {
            setIsLoading(false);
        }
    }, [imageData, userAnnotations, user, onTokenUsed]);

    const handleReset = () => {
        setAnalysisResult(null);
        setImageData(null);
        setImagePreview(null);
        setUserAnnotations('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (isLoading) {
        return (
             <div className="max-w-3xl mx-auto flex flex-col items-center justify-center text-center pt-16">
                <CandlestickSpinner />
                <p className="text-xl text-gray-300 mt-6 animate-pulse font-semibold">Analyzing chart screenshot...</p>
            </div>
        );
    }
    
    if (analysisResult) {
        return <ResultsPage result={analysisResult} onGoBack={handleReset} onNavigate={onNavigate} />;
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
             <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700 space-y-6 shadow-2xl">
                <div>
                    <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300">Image Analyst</h2>
                    <p className="text-gray-400">Upload a screenshot of your chart for instant AI feedback.</p>
                </div>
                
                <div 
                    className="relative border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-green-500 hover:bg-gray-800/60 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="max-h-80 mx-auto rounded-lg shadow-xl" />
                    ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500 space-y-4">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                             <p className="text-lg">Click to select or drag & drop</p>
                        </div>
                    )}
                </div>

                <textarea
                    value={userAnnotations}
                    onChange={(e) => setUserAnnotations(e.target.value)}
                    placeholder="Ask specific questions about this setup (Optional)..."
                    className="w-full h-24 p-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 outline-none"
                />

                {error && <ErrorAlert message={error} />}

                <button
                    onClick={handleAnalyze}
                    disabled={!imageData || isLoading}
                    className="w-full h-14 bg-gradient-to-r from-green-600 to-teal-600 text-white font-bold rounded-xl shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                >
                    Analyze Screenshot (1 Token)
                </button>
            </div>
        </div>
    );
};

export default ImageAnalyzer;
