import React from 'react';

interface ConfidenceMeterProps {
    level: number; // 0-100
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({ level }) => {
    const circumference = 2 * Math.PI * 52; // 2 * pi * r
    const offset = circumference - (level / 100) * circumference;
    const color = level > 70 ? 'text-green-400' : level > 40 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle
                    className="text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${color} transition-all duration-1000 ease-in-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className={`text-3xl font-bold ${color}`}>{level}%</span>
                <span className="text-xs text-gray-400">Confidence</span>
            </div>
        </div>
    );
};
