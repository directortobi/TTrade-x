
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
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImagePreview(base64String);
                setImageData({ mimeType: file.type, data: base64String.split(',')[1] });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!imageData || user.profile.tokens < 1) return;
        setIsLoading(true);
        try {
            const result = await getSignalFromImage(imageData, userAnnotations);
            const tokensUsed = result.confidenceLevel > 50 ? 1 : 0;
            if (tokensUsed > 0) {
                const newBalance = await useTokenForAnalysis(user.profile.tokens);
                onTokenUsed(newBalance);
            }
            setAnalysisResult(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (analysisResult) return <ResultsPage result={analysisResult} onGoBack={() => setAnalysisResult(null)} onNavigate={onNavigate} />;

    return (
        <div className="max-w-3xl mx-auto p-6 bg-gray-800 rounded-2xl border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Chart Image Analyst</h2>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-600 h-64 flex items-center justify-center cursor-pointer hover:bg-gray-700/50 rounded-xl mb-4">
                {imagePreview ? <img src={imagePreview} className="max-h-full" alt="Preview" /> : <p>Click to upload chart screenshot</p>}
            </div>
            <textarea value={userAnnotations} onChange={e => setUserAnnotations(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg mb-4 h-24" placeholder="Optional notes..."></textarea>
            {error && <ErrorAlert message={error} />}
            <button onClick={handleAnalyze} disabled={!imageData || isLoading} className="w-full h-12 bg-cyan-600 rounded-lg font-bold">
                {isLoading ? <CandlestickSpinner /> : 'Analyze (1 Token)'}
            </button>
        </div>
    );
};

export default ImageAnalyzer;
