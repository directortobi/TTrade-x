
import { supabase } from './supabase';
import { Withdrawal, ReferralWithdrawal } from '../types';

interface WithdrawalRequest {
    userId: string;
    tokens: number;
    address: string;
}

export const withdrawalService = {
    async createWithdrawalRequest({ userId, tokens, address }: WithdrawalRequest): Promise<void> {
        const { error } = await supabase
            .from('withdrawals')
            .insert({
                user_id: userId,
                tokens_to_withdraw: tokens,
                wallet_address: address,
                status: 'pending'
            });
        
        if (error) {
            console.error('Error creating withdrawal request:', error);
            throw new Error('Failed to submit your withdrawal request. Please try again.');
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