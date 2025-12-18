
import React, { useState } from 'react';
// FIX: Removed extensions from import paths.
import { AppUser, View } from '../types';
import { authService } from '../services/authService';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface ProfilePageProps {
    user: AppUser;
    onLogout: () => void;
    onNavigate: (view: View) => void;
}

const InfoCard: React.FC<{ label: string; value: string | number; isCode?: boolean }> = ({ label, value, isCode }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
        <span className="text-gray-400">{label}</span>
        <span className={`font-mono text-white ${isCode ? 'bg-gray-700 px-2 py-1 rounded' : ''}`}>{value}</span>
    </div>
);

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onLogout, onNavigate }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) { setError("Too short."); return; }
        if (newPassword !== confirmPassword) { setError("Mismatched."); return; }
        setIsLoading(true);
        try {
            await authService.updatePassword(newPassword);
            alert("Success!");
        } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white">Profile</h1>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-green-400">Account</h2>
                    <button onClick={() => onNavigate('buyTokens')} className="px-4 py-2 bg-green-600 text-white rounded-lg">Buy Tokens</button>
                </div>
                <InfoCard label="Email" value={user.profile.email} />
                <InfoCard label="Tokens" value={user.profile.tokens} />
            </div>
            <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                <h2 className="text-xl font-semibold text-green-400 mb-4">Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-12 bg-gray-700 text-white rounded-lg" placeholder="New Password" />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-12 bg-gray-700 text-white rounded-lg" placeholder="Confirm" />
                    {error && <p className="text-red-400">{error}</p>}
                    <button type="submit" disabled={isLoading} className="h-12 px-6 bg-green-600 text-white rounded-lg">
                        {isLoading ? <LoadingSpinner /> : 'Update'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
