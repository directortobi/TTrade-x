import React from 'react';

/**
 * A high-quality SVG replica of the provided Trade X application logo.
 * This SVG was created to be an identical match to the user's image,
 * featuring the distinct 'TX' design with a red-to-green gradient and a subtle shadow for depth.
 */
export const AppLogo: React.FC<{ large?: boolean }> = ({ large }) => (
    <svg
        viewBox="8 8 84 84"
        className={large ? "h-16 w-16" : "h-10 w-10"}
        aria-label="Trade X Logo"
    >
        <defs>
            <linearGradient id="logoGradient" x1="0.5" y1="0" x2="0.5" y2="1">
                <stop offset="0%" stopColor="#D81A1F" />
                <stop offset="50%" stopColor="#6D5D1B" />
                <stop offset="100%" stopColor="#48FF24" />
            </linearGradient>
            <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1.5" dy="2.5" stdDeviation="1.5" floodColor="#000" floodOpacity="0.7" />
            </filter>
        </defs>
        
        {/* The main logo shape with a drop shadow filter applied via a group element */}
        <g filter="url(#logoShadow)">
            <path 
                d="M25,23 L75,23 L90,33 L60,50 L90,67 L75,77 L54,66 L50,72 L46,66 L25,77 L10,67 L40,50 L10,33 L25,23 Z"
                fill="url(#logoGradient)" 
            />
        </g>
    </svg>
);
