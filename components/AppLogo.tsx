
import React from 'react';

export const AppLogo: React.FC<{ large?: boolean }> = ({ large }) => (
    <div className="flex items-center gap-2">
        <div className={`${large ? 'w-12 h-12' : 'w-8 h-8'} bg-cyan-500 rounded-lg flex items-center justify-center shadow-lg`}>
            <span className={`text-white font-black ${large ? 'text-2xl' : 'text-lg'}`}>X</span>
        </div>
        <span className={`${large ? 'text-3xl' : 'text-xl'} font-bold text-white tracking-tighter`}>TRADE X</span>
    </div>
);
