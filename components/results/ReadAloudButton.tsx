import React, { useState, useEffect, useCallback } from 'react';

const SpeakerPlayIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
);

const SpeakerMuteIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l-5-5m0 5l5-5" />
    </svg>
);


interface ReadAloudButtonProps {
    textToRead: string;
}

export const ReadAloudButton: React.FC<ReadAloudButtonProps> = ({ textToRead }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    const cancelSpeech = useCallback(() => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    useEffect(() => {
        if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
            setIsSupported(true);
        }

        // Cleanup on unmount to stop any active speech
        return () => {
            cancelSpeech();
        };
    }, [cancelSpeech]);

    const handleToggleSpeech = () => {
        if (!isSupported) {
            console.warn("Speech synthesis is not supported in this browser.");
            return;
        }

        if (isSpeaking) {
            cancelSpeech();
        } else {
            // Cancel any previous speech to reset the engine.
            window.speechSynthesis.cancel(); 
            
            const utterance = new SpeechSynthesisUtterance(textToRead);
            
            utterance.onstart = () => {
                setIsSpeaking(true);
            };

            utterance.onend = () => {
                setIsSpeaking(false);
            };

            utterance.onerror = (event) => {
                console.error("An error occurred during speech synthesis:", event.error);
                // Ensure state is reset on error.
                setIsSpeaking(false);
            };
            
            window.speechSynthesis.speak(utterance);
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <button
            onClick={handleToggleSpeech}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-gray-900 mt-3"
            aria-live="polite"
            aria-label={isSpeaking ? "Stop reading summary" : "Read summary aloud"}
        >
            {isSpeaking ? (
                <>
                    <SpeakerMuteIcon className="w-5 h-5 mr-2" />
                    <span>Stop Reading</span>
                </>
            ) : (
                <>
                    <SpeakerPlayIcon className="w-5 h-5 mr-2" />
                    <span>Read Summary</span>
                </>
            )}
        </button>
    );
};