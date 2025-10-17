import React from 'react';
import { View } from '../MainApp';
import { AppLogo } from './AppLogo';

interface FooterProps {
    onNavigate: (view: View) => void;
}

const FooterLink: React.FC<{ view: View; onNavigate: (view: View) => void; children: React.ReactNode }> = ({ view, onNavigate, children }) => {
    return (
        <button onClick={() => onNavigate(view)} className="text-gray-400 hover:text-white transition-colors duration-200">
            {children}
        </button>
    );
};


export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="bg-gray-900/50 border-t border-gray-800 mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <AppLogo />
                        <span className="text-lg font-semibold text-white">Trade X</span>
                    </div>
                    <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                        <FooterLink view="about" onNavigate={onNavigate}>About Us</FooterLink>
                        <FooterLink view="contact" onNavigate={onNavigate}>Contact Us</FooterLink>
                        <FooterLink view="legalDisclaimer" onNavigate={onNavigate}>Legal Disclaimer</FooterLink>
                    </nav>
                    <div className="text-center md:text-right text-sm text-gray-500">
                        <p>&copy; {new Date().getFullYear()} Trade X. All Rights Reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
