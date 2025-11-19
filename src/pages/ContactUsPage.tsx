
import React, { useState } from 'react';
import { AppUser } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ContactUsPageProps {
    user: AppUser;
}

const ContactUsPage: React.FC<ContactUsPageProps> = ({ user }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState(user.auth.email || '');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate an API call
        setTimeout(() => {
            setIsLoading(false);
            setSuccess("Your message has been sent successfully! Our team will get back to you shortly.");
            // Reset form
            setName('');
            setSubject('');
            setMessage('');
        }, 1500);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in text-gray-300">
            <div className="bg-emerald-900/50 p-8 rounded-2xl border border-green-800 shadow-lg">
                <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400 mb-2">
                    Contact Us
                </h1>
                <p className="text-center text-gray-400 mb-8">We're here to help. Send us a message and we'll get back to you as soon as possible.</p>

                {success ? (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg text-center" role="alert">
                        {success}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
                                <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                                <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-300">Subject</label>
                            <input type="text" id="subject" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 block w-full h-12 px-3 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500" />
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-300">Message</label>
                            <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} required rows={5} className="mt-1 block w-full px-3 py-2 text-white bg-gray-700/50 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500"></textarea>
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading} className="w-full h-12 flex justify-center items-center text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:bg-gray-600">
                                {isLoading ? <LoadingSpinner /> : 'Send Message'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ContactUsPage;
