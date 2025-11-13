import React from 'react';

interface ConfigurationErrorPageProps {
    missingConfig: 'Supabase' | 'Gemini';
}

const CONFIG_DETAILS = {
    Supabase: {
        title: 'Supabase Configuration Missing',
        message: 'Your application needs to be connected to a Supabase project to handle user authentication.',
        file: 'Environment Variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY',
        instructions: 'Please set your Supabase URL and Anon Key in a .env file at the project root. Follow the setup instructions in your project README or documentation for details.'
    },
    Gemini: {
        title: 'Google Gemini API Key Missing',
        message: 'The AI analysis features require a Google Gemini API key to function.',
        file: 'Vite Environment Variable: VITE_API_KEY',
        instructions: 'This application requires a Google Gemini API key to be configured in your .env file as a variable named VITE_API_KEY.'
    }
};

export const ConfigurationErrorPage: React.FC<ConfigurationErrorPageProps> = ({ missingConfig }) => {
    const details = CONFIG_DETAILS[missingConfig];

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 border border-red-500/50 rounded-2xl shadow-2xl p-8 text-white">
                <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h1 className="text-3xl font-bold text-red-400">{details.title}</h1>
                    <p className="mt-4 text-gray-300">{details.message}</p>
                </div>
                <div className="mt-8 bg-gray-900 p-6 rounded-lg">
                    <p className="text-lg text-gray-400">To fix this, check your environment configuration:</p>
                    <code className="block bg-gray-700 text-cyan-300 p-3 rounded-md my-3 text-lg">
                        {details.file}
                    </code>
                    <p className="text-gray-400">{details.instructions}</p>
                </div>
                 <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">After updating the configuration, please rebuild and reload the application.</p>
                </div>
            </div>
        </div>
    );
};