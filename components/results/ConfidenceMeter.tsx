
import React from 'react';

interface ConfidenceMeterProps {
    level: number;
}

// Visual gauge for AI signal confidence level
export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ level }) => {
    const radius = 40;
    const arcLength = Math.PI * radius; 
    const arcOffset = arcLength * ((100 - level) / 100);

    const getColor = (val: number) => {
        if (val >= 80) return '#22c55e';
        if (val >= 50) return '#eab308';
        return '#ef4444';
    };

    const color = getColor(level);

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 shadow-inner">
            <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 120 70" className="overflow-visible">
                    <path d={`M 20 60 A ${radius} ${radius} 0 0 1 100 60`} fill="none" stroke="#374151" strokeWidth="8" strokeLinecap="round" />
                    <path d={`M 20 60 A ${radius} ${radius} 0 0 1 100 60`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={arcLength} strokeDashoffset={arcOffset} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute bottom-0 flex flex-col items-center mb-2">
                    <span className="text-4xl font-bold text-white">{level}%</span>
                    <span className="text-xs uppercase text-gray-400 font-medium">Confidence</span>
                </div>
            </div>
        </div>
    );
};
