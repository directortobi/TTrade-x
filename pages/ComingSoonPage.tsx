import React from 'react';

interface ComingSoonPageProps {
    title: string;
    description: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ title, description }) => {
    return (
        <div className="max-w-4xl mx-auto text-center py-16 animate-fade-in">
            <div className="bg-blue-900/50 p-12 rounded-2xl border border-blue-800 shadow-lg">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-400 mb-4">
                    {title}
                </h1>
                <p className="text-lg text-gray-400 mb-2">
                    This feature is coming soon!
                </p>
                <p className="text-gray-500">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default ComingSoonPage;
