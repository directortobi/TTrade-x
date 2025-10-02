import React, { useState, useRef } from 'react';
import { AppUser, TokenPackage } from '../types';
import { TOKEN_PACKAGES } from '../constants';
import { createTokenPurchaseRequest } from '../services/tokenService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';

interface BuyTokensPageProps {
    user: AppUser;
    onPurchaseSuccess: () => void;
}

const BuyTokensPage: React.FC<BuyTokensPageProps> = ({ user, onPurchaseSuccess }) => {
    const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError("File size cannot exceed 5MB.");
                return;
            }
            setPaymentProof(file);
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!selectedPackage || !paymentProof) {
            setError("Please select a package and upload your payment proof.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await createTokenPurchaseRequest({
                userId: user.auth.id,
                pkg: selectedPackage,
                proofFile: paymentProof
            });
            setSuccessMessage("Your request has been submitted! Your tokens will be credited after admin review (usually within 24 hours).");
            setSelectedPackage(null);
            setPaymentProof(null);
            if(fileInputRef.current) fileInputRef.current.value = "";
            onPurchaseSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
                    Buy Analysis Tokens
                </h1>
                <p className="text-gray-400 mt-1">
                    Your current balance: <span className="font-bold text-white">{user.profile.tokens} Tokens</span>
                </p>
            </div>

            {successMessage && (
                 <div className="bg-green-500/10 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Success! </strong>
                    <span className="block sm:inline">{successMessage}</span>
                </div>
            )}

            <div className="bg-emerald-900/50 p-6 rounded-2xl border border-green-800">
                <h2 className="text-xl font-semibold text-green-400 mb-4">1. Select a Token Package</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {TOKEN_PACKAGES.map(pkg => (
                        <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg)}
                            className={`p-6 rounded-lg border-2 text-left transition-all duration-200 ${selectedPackage?.id === pkg.id ? 'border-green-500 bg-green-900/30' : 'border-gray-700 hover:border-green-600 bg-gray-900/50'}`}
                        >
                            <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                            <p className="text-3xl font-extrabold text-green-400 my-2">{pkg.tokens} <span className="text-lg font-semibold text-gray-300">Tokens</span></p>
                            <p className="text-xl font-semibold text-white">${pkg.price} USD</p>
                            <p className="text-sm text-gray-400 mt-2">{pkg.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {selectedPackage && (
                <div className="bg-emerald-900/50 p-6 rounded-2xl border border-green-800 animate-fade-in">
                    <h2 className="text-xl font-semibold text-green-400 mb-4">2. Make Payment</h2>
                    <div className="bg-gray-900/70 p-4 rounded-lg">
                        <p className="text-gray-300">Please make a manual bank transfer of <span className="font-bold text-white">${selectedPackage.price} USD</span> to the account details below.</p>
                        <div className="mt-3 space-y-1 font-mono text-cyan-300">
                            <p>Bank Name: OPay</p>
                            <p>Account Name: Emmanuel Olawuyi</p>
                            <p>Account Number: 9123835585</p>
                            <p>Reference: {user.profile.referral_code}-{selectedPackage.id}</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-green-400 mt-6 mb-4">3. Upload Proof of Payment</h2>
                    <div className="flex items-center gap-4">
                        <label htmlFor="file-upload" className="cursor-pointer h-12 px-6 flex items-center bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                            {paymentProof ? "Change File" : "Choose File"}
                        </label>
                        <input id="file-upload" ref={fileInputRef} type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                        {paymentProof && <span className="text-gray-400">{paymentProof.name}</span>}
                    </div>

                     <div className="mt-6 border-t border-gray-700 pt-6">
                         <button
                            onClick={handleSubmit}
                            disabled={isLoading || !paymentProof}
                            className="w-full sm:w-auto h-12 px-8 text-lg text-white font-semibold bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-emerald-950 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? <LoadingSpinner /> : `Submit Request for ${selectedPackage.tokens} Tokens`}
                        </button>
                    </div>
                </div>
            )}

            {error && <ErrorAlert message={error} />}

        </div>
    );
};

export default BuyTokensPage;