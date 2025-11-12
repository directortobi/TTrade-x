import React from 'react';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto animate-pulse space-y-8">
            <div>
                <div className="h-10 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Card Skeleton */}
                    <div className="bg-blue-900/50 p-6 rounded-xl border border-blue-800">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="bg-gray-700 rounded-full h-8 w-8"></div>
                                <div>
                                    <div className="h-5 bg-gray-700 rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-gray-700 rounded w-40"></div>
                                </div>
                            </div>
                            <div className="h-7 w-16 bg-gray-700 rounded-md"></div>
                        </div>
                        <div className="mt-6 border-t border-blue-800 pt-4">
                            <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                            <div className="flex items-center gap-4 mt-2">
                                <div className="h-12 bg-gray-700 rounded w-20"></div>
                                <div className="bg-gray-700 rounded-full h-10 w-10"></div>
                            </div>
                            <div className="mt-4 w-full h-12 bg-gray-700 rounded-lg"></div>
                        </div>
                    </div>
                    {/* Recent Signals Skeleton */}
                    <div className="bg-blue-900/50 p-6 rounded-xl border border-blue-800">
                        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-600"></div>
                                        <div>
                                            <div className="h-4 w-24 bg-gray-600 rounded"></div>
                                            <div className="h-3 w-16 bg-gray-600 rounded mt-1"></div>
                                        </div>
                                    </div>
                                    <div className="h-4 w-12 bg-gray-600 rounded"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column Skeleton */}
                <div className="lg:col-span-3">
                     <div className="h-[65vh] bg-blue-950/50 rounded-xl border border-blue-800 p-1">
                        <div className="w-full h-full bg-gray-700/50 rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
