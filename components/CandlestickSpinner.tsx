import React from 'react';

export const CandlestickSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center space-x-1 h-12 w-24">
            <style>
                {`
                @keyframes candle-anim {
                    0%, 100% { transform: scaleY(0.2); background-color: #ef5350; }
                    50% { transform: scaleY(1.0); background-color: #26a69a; }
                }
                .candle {
                    display: block;
                    width: 8px;
                    height: 100%;
                    background-color: #374151;
                    transform-origin: bottom;
                    animation: candle-anim 1.5s ease-in-out infinite;
                }
                .candle-1 { animation-delay: 0s; }
                .candle-2 { animation-delay: 0.2s; }
                .candle-3 { animation-delay: 0.4s; }
                .candle-4 { animation-delay: 0.6s; }
                `}
            </style>
            <span className="candle candle-1"></span>
            <span className="candle candle-2"></span>
            <span className="candle candle-3"></span>
            <span className="candle candle-4"></span>
        </div>
    );
};