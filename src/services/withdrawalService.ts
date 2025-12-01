
import { supabase } from './supabase';
import { Withdrawal, ReferralWithdrawal } from '../types';

interface WithdrawalRequest {
    userId: string;
    tokens: number;
    address: string;
}

export const withdrawalService = {
    async createWithdrawalRequest({ userId, tokens, address }: WithdrawalRequest): Promise<void> {
        // Calls the secure database function to atomically check balance, deduct tokens, and create record.
        const { error } = await supabase.rpc('request_token_withdrawal', {
            p_user_id: userId,
            p_amount: tokens,
            p_address: address
        });
        
        if (error) {
            console.error('Error creating withdrawal request:', error);
            throw new Error(error.message || 'Failed to submit your withdrawal request. Please try again.');
        }
    },

    async getWithdrawalHistory(userId: string): Promise<Withdrawal[]> {
        const { data, error } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching token withdrawal history:", error);
            if (error.message.includes('relation "public.withdrawals" does not exist')) {
                throw new Error('The withdrawals table is missing. Please run the setup script in INSTRUCTIONS.md.');
            }
            throw new Error(error.message);
        }
        return data || [];
    },

    async getReferralWithdrawalHistory(userId: string): Promise<ReferralWithdrawal[]> {
        const { data, error } = await supabase
            .from('referral_withdrawals')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching referral withdrawal history:", error);
            if (error.message.includes('relation "public.referral_withdrawals" does not exist')) {
                throw new Error('The referral_withdrawals table is missing. Please run the setup script in INSTRUCTIONS.md.');
            }
            throw new Error(error.message);
        }
        return data || [];
    }
};
