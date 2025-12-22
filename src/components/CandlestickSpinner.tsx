
import React from 'react';

export const CandlestickSpinner: React.FC = () => {
    return (
        <div className="flex items-end gap-1 h-12 w-fit">
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="w-[1px] h-2 bg-green-500 animate-pulse"></div>
                    <div 
                        className={`w-3 h-8 bg-green-500/80 rounded-sm animate-bounce`}
                        style={{ animationDelay: `${i * 0.15}s` }}
                    ></div>
                    <div className="w-[1px] h-2 bg-green-500 animate-pulse"></div>
                </div>
            ))}
        </div>
    );
};
