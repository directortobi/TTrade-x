
import React from 'react';
import { View } from '../MainApp';

interface InstructionsPageProps {
    onNavigate: (view: View) => void;
}

const GuideSection: React.FC<{ title: string; icon: React.ReactNode; steps: string[] }> = ({ title, icon, steps }) => (
    <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 hover:border-gray-600 transition-colors duration-300">
        <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gray-900/80 rounded-lg text-cyan-400 shadow-lg">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        <ul className="space-y-3">
            {steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-gray-400 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-gray-700 text-gray-300 rounded-full text-xs font-mono mt-0.5">
                        {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                </li>
            ))}
        </ul>
    </div>
);

// Icons
const AnalyzeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
const ImageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.5