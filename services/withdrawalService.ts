import { supabase } from './supabase';

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
    }
};
