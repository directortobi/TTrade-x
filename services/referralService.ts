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
            .eq('referrer_id', userId);

        if (countError) throw countError;

        // 2. Get earnings stats
        const { data: earnings, error: earningsError } = await supabase
            .from('referral_earnings')
            .select('commission_amount, status')
            .eq('referrer_id', userId);

        if (earningsError) throw earningsError;

        const earningsSummary = earnings.reduce((acc, earning) => {
            const amount = Number(earning.commission_amount) || 0;
            if (earning.status === 'approved') {
                acc.approved += amount;
            } else if (earning.status === 'pending') {
                acc.pending += amount;
            }
            acc.lifetime += amount;
            return acc;
        }, { pending: 0, approved: 0, lifetime: 0 });
        
        // 3. Get total withdrawn or pending withdrawal amount
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
            pendingEarnings: earningsSummary.pending,
            availableEarnings: Math.max(0, earningsSummary.approved - totalWithdrawnOrPending),
            lifetimeEarnings: earningsSummary.lifetime,
        };
    },

    async getReferredUsers(userId: string): Promise<ReferredUser[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, email, created_at')
            .eq('referrer_id', userId)
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
