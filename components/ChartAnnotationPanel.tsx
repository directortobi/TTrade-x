import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface ChartAnnotationPanelProps {
    isAnalyzing: boolean;
    onAnalyze: () => void;
    notes: string;
    onNotesChange: (notes: string) => void;
}

export const ChartAnnotationPanel: React.FC<ChartAnnotationPanelProps> = ({
    isAnalyzing,
    onAnalyze,
    notes,
    onNotesChange
}) => {
    return (
        <div className="bg-[#050505] p-6 rounded-[2rem] border border-white/5 shadow-2xl space-y-6">
            <div>
                <h3 className="text-lg font-bold text-white tracking-tight">AI Analysis</h3>
                <p className="text-xs text-gray-500 mt-1 uppercase font-black tracking-widest">Enhanced with Custom Notes</p>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Strategy Observations</label>
                <textarea
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="e.g., Identifying head & shoulders pattern on higher timeframe..."
                    className="w-full h-40 p-4 bg-black border border-white/10 rounded-2xl text-gray-300 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-700 resize-none"
                />
            </div>

            <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="group relative w-full overflow-hidden py-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 text-white font-black rounded-2xl transition-all shadow-lg shadow-cyan-900/20 active:scale-[0.98]"
            >
                <div className="relative z-10 flex items-center justify-center gap-2">
                    {isAnalyzing ? (
                        <>
                            <LoadingSpinner />
                            <span className="text-sm uppercase tracking-widest">Processing...</span>
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="text-sm uppercase tracking-widest">Generate Signal</span>
                        </>
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            
            <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-widest">
                Costs 1 Analysis Token
            </p>
        </div>
    );
};