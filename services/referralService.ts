import { supabase } from './supabase';
import { ReferralEarningWithEmail, ReferredUser } from '../types';

interface ReferralStats {
    totalReferrals: number;
    pendingEarnings: number;
    availableEarnings: number;
    lifetimeEarnings: number;
}

export const referralService = {
    async getReferralStats(userId: string, userReferralCode: string): Promise<ReferralStats> {
        // 1. Get total referrals
        const { count: totalReferrals, error: countError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('referred_by', userReferralCode);

        if (countError) throw countError;

        // 2. Get earnings stats
        const { data: earnings, error: earningsError } = await supabase
            .from('referral_earnings')
            .select('commission_amount, status')
            .eq('referrer_id', userId);

        if (earningsError) throw earningsError;

        const stats = earnings.reduce((acc, earning) => {
            const amount = Number(earning.commission_amount) || 0;
            if (earning.status === 'approved') {
                acc.availableEarnings += amount;
            } else if (earning.status === 'pending') {
                acc.pendingEarnings += amount;
            }
            acc.lifetimeEarnings += amount;
            return acc;
        }, { pendingEarnings: 0, availableEarnings: 0, lifetimeEarnings: 0 });
        
        // This query sums approved earnings that haven't been withdrawn yet.
        const { data: withdrawnData, error: withdrawnError } = await supabase
            .from('referral_withdrawals')
            .select('amount_usd, status')
            .eq('user_id', userId);
        
        if (withdrawnError) throw withdrawnError;
        
        const totalWithdrawnOrPending = withdrawnData.reduce((acc, w) => {
            if(w.status === 'approved' || w.status === 'pending') {
                return acc + Number(w.amount_usd);
            }
            return acc;
        }, 0);

        return {
            totalReferrals: totalReferrals ?? 0,
            pendingEarnings: stats.pendingEarnings,
            availableEarnings: Math.max(0, stats.availableEarnings - totalWithdrawnOrPending),
            lifetimeEarnings: stats.lifetimeEarnings,
        };
    },

    async getReferredUsers(userReferralCode: string): Promise<ReferredUser[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, created_at')
            .eq('referred_by', userReferralCode)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
    },

    async getEarningsHistory(userId: string): Promise<ReferralEarningWithEmail[]> {
         const { data, error } = await supabase
            .from('referral_earnings')
            .select(`
                *,
                referred_user_profile:profiles!referral_earnings_referred_user_id_fkey(email)
            `)
            .eq('referrer_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
             // Provide a more helpful error if the join fails due to RLS on the profiles table
            if (error.message.includes('permission denied')) {
                throw new Error("Could not fetch earnings details. Please ensure the 'profiles' table has the correct RLS policies for read access.");
            }
            throw error;
        }
        return data as unknown as ReferralEarningWithEmail[];
    },

    async createReferralWithdrawalRequest(userId: string, amount: number, address: string): Promise<void> {
        const { error } = await supabase
            .from('referral_withdrawals')
            .insert({
                user_id: userId,
                amount_usd: amount,
                wallet_address: address,
                status: 'pending'
            });

        if (error) {
            console.error('Error creating referral withdrawal request:', error);
            throw new Error('Failed to submit your withdrawal request. Please try again.');
        }
    }
};
