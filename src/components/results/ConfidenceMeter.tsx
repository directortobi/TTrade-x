
import React from 'react';

interface ConfidenceMeterProps {
    level: number;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ level }) => {
    // Gauge Configuration
    const radius = 40;
    const strokeWidth = 8;
    const center = 60; // SVG Viewbox center
    
    // Calculate Arc
    // A semi-circle has a circumference of PI * r. 
    // We draw a full circle path but use stroke-dasharray to hide the bottom half.
    const arcLength = Math.PI * radius; 
    const arcOffset = arcLength * ((100 - level) / 100);

    // Determine Color based on confidence
    const getColor = (val: number) => {
        if (val >= 80) return '#22c55e'; // Green-500 (High)
        if (val >= 50) return '#eab308'; // Yellow-500 (Medium)
        return '#ef4444'; // Red-500 (Low)
    };

    const color = getColor(level);

    return (
        <div className="flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-xl border border-gray-700 shadow-inner">
            <div className="relative w-48 h-28 flex items-end justify-center overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 120 70" className="overflow-visible">
                    {/* Definitions for gradient (optional polish) */}
                    <defs>
                        <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#eab308" />
                            <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                    </defs>

                    {/* Background Track (Gray) */}
                    <path
                        d={`M 20 60 A ${radius} ${radius} 0 0 1 100 60`}
                        fill="none"
                        stroke="#374151"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                    />

                    {/* Foreground Value (Colored) */}
                    <path
                        d={`M 20 60 A ${radius} ${radius} 0 0 1 100 60`}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        strokeDashoffset={arcOffset}
                        className="transition-all duration-1000 ease-out"
                        style={{ transitionProperty: 'stroke-dashoffset, stroke' }}
                    />
                </svg>
                
                {/* Center Text */}
                <div className="absolute bottom-0 flex flex-col items-center mb-2">
                    <span className="text-4xl font-bold text-white tracking-tighter shadow-black drop-shadow-md">
                        {level}%
                    </span>
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-medium mt-1">
                        Confidence
                    </span>
                </div>
            </div>
            
            {/* Context Label */}
            <div className="mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-700/50 border border-gray-600 text-gray-300">
                {level >= 80 ? 'Strong Signal' : level >= 50 ? 'Moderate Signal' : 'Weak Signal'}
            </div>
        </div>
    );
};
