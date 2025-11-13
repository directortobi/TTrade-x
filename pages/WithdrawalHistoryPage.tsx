import React, { useState, useEffect, useCallback } from 'react';
// FIX: Add .ts extension to import path.
import { AppUser, Withdrawal, ReferralWithdrawal, WithdrawalStatus } from '../types.ts';
import { withdrawalService } from '../services/withdrawalService';
// FIX: Add .tsx extension to import path.
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
// FIX: Add .tsx extension to import path.
import { ErrorAlert } from '../components/ErrorAlert.tsx';

interface WithdrawalHistoryPageProps {
    user: AppUser;
}

const StatusBadge: React.FC<{ status: WithdrawalStatus }> = ({ status }) => {
    const styles = {
        'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        'approved': 'bg-green-500/20 text-green-300 border-green-500/30',
        'rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};


const WithdrawalHistoryPage: React.FC<WithdrawalHistoryPageProps> = ({ user }) => {
    const [tokenWithdrawals, setTokenWithdrawals] = useState<Withdrawal[]>([]);
    const [referralWithdrawals, setReferralWithdrawals] = useState<ReferralWithdrawal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [tokenData, referralData] = await Promise.all([
