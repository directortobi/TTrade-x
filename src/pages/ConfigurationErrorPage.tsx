import React from 'react';

interface ConfigurationErrorPageProps {
    missingConfig: 'Supabase' | 'Gemini';
}

const CONFIG_DETAILS = {
    Supabase: {
        title: 'Supabase Config Missing',
        message: 'Trade X requires a connection to Supabase for authentication and real-time data. Without this, the app cannot operate.',
        keys: ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'],
        location: 'Supabase Project Dashboard > Settings > API',
        instructions: 'Add these keys to your "Environment Variables" or "Secrets" panel in your deployment settings.'
    },
    Gemini: {
        title: 'Gemini API Key Missing',
        message: 'The AI technical analysis features require a Google Gemini API key to function.',
        keys: ['API_KEY'],
        location: 'Google AI Studio > Get API Key',
        instructions: 'Ensure the variable "API_KEY" is set in your environment variables dashboard.'
    }
};

export const ConfigurationErrorPage: React.FC<ConfigurationErrorPageProps> = ({ missingConfig }) => {
    const details = CONFIG_DETAILS[missingConfig];

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 font-sans">
            <div className="w-full max-w-xl bg-gray-800 border-2 border-red-500/20 rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="bg-red-500/10 p-8 border-b border-red-500/10 text-center">
                    <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">{details.title}</h1>
                    <p className="mt-4 text-gray-400 text-lg leading-relaxed">{details.message}</p>
                </div>
                
                <div className="p-8 space-y-6">
                    <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700">
                        <p className="text-xs font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4">Required Keys:</p>
                        <div className="space-y-3">
                            {details.keys.map(key => (
                                <div key={key} className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
                                    <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                    <code className="font-mono text-sm text-emerald-400 font-bold">{key}</code>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                         <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">Where to fix this:</p>
                            <p className="text-sm text-gray-400 mt-1">{details.instructions}</p>
                            <p className="text-xs text-blue-400 mt-2 font-medium">Find them in: {details.location}</p>
                         </div>
                    </div>

                    <div className="pt-4 flex flex-col gap-3">
                        <button 
                            onClick={() => window.location.reload()} 
                            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all font-bold shadow-lg shadow-cyan-900/20 active:scale-95"
                        >
                            I've set the keys, try again
                        </button>
                        <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest font-medium">
                            Note: You may need to restart your development server.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};