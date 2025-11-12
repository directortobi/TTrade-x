import React from 'react';

export const StatCardSkeleton: React.FC = () => (
    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 flex items-center gap-4 animate-pulse">
        <div className="flex-shrink-0 bg-gray-700 h-8 w-8 rounded-full"></div>
        <div>
            <div className="h-3 bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-32"></div>
        </div>
    </div>
);
