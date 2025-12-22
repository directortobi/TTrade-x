
import React from 'react';

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
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 space-y-4">
            <h3 className="text-lg font-bold text-white">Analysis Notes</h3>
            <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Add your own analysis or observations here..."
                className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <button
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 text-white font-bold rounded-lg transition-colors"
            >
                {isAnalyzing ? 'Analyzing...' : 'AI Analysis (1 Token)'}
            </button>
        </div>
    );
};
