import React from 'react';

interface TableSkeletonProps {
    rows?: number;
    cols?: number;
    header?: boolean;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, cols = 5, header = true }) => {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
                {header && (
                    <thead className="text-xs text-transparent bg-gray-900/70 select-none">
                        <tr>
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="px-4 py-3">
                                    <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i} className="border-b border-gray-700">
                            {Array.from({ length: cols }).map((_, j) => (
                                <td key={j} className="px-4 py-4">
                                    <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};