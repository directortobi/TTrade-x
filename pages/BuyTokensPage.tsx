
import React, { useState, useRef } from 'react';
// FIX: Removed extensions from import paths.
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

    const handleSubmit = async () => {
        if (!selectedPackage || !paymentProof) return;
        setIsLoading(true);
        try {
            await createTokenPurchaseRequest({ userId: user.auth.id, pkg: selectedPackage, proofFile: paymentProof });
            onPurchaseSuccess();
        } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white">Buy Tokens</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {TOKEN_PACKAGES.map(pkg => (
                    <button key={pkg.id} onClick={() => setSelectedPackage(pkg)} className={`p-6 rounded-lg border-2 ${selectedPackage?.id === pkg.id ? 'border-green-500 bg-green-900/30' : 'border-gray-700 bg-gray-900/50'}`}>
                        <h3 className="text-white font-bold">{pkg.name}</h3>
                        <p className="text-green-400 text-3xl font-extrabold">{pkg.tokens} Tokens</p>
                        <p className="text-white">${pkg.price}</p>
                    </button>
                ))}
            </div>
            {selectedPackage && (
                <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                    <input type="file" onChange={(e) => setPaymentProof(e.target.files?.[0] || null)} className="text-white" />
                    <button onClick={handleSubmit} disabled={isLoading || !paymentProof} className="mt-4 px-8 py-3 bg-green-600 text-white rounded-lg">
                        {isLoading ? <LoadingSpinner /> : 'Submit'}
                    </button>
                </div>
            )}
            {error && <ErrorAlert message={error} />}
        </div>
    );
};

export default BuyTokensPage;
