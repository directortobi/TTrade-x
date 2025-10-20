import React from 'react';
import { CandlestickSpinner } from './CandlestickSpinner';

export const PageLoader: React.FC = () => (
    <div className="flex-grow flex items-center justify-center h-full w-full py-20">
        <CandlestickSpinner />
    </div>
);
