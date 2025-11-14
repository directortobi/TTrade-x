import { supabase } from './supabase.ts';
// FIX: Add .ts extension to import path.
import { PurchaseWithEmail, WithdrawalWithEmail, ReferralWithdrawalWithEmail } from '../types.ts';

/**
 * A service for handling all administrative actions.
 * All methods in this service invoke secure Supabase Edge Functions,
 * which use the service_role key to bypass RLS policies safely.
 * This prevents "Failed to fetch" errors caused by client-side permission issues.
 */
export const adminService = {
    async getPendingPurchases(): Promise<PurchaseWithEmail[]> {
        const { data, error } = await supabase.functions.invoke('get-pending-purchases');
        if (error) throw new Error(error.message);
        return data;
    },

    async approvePurchase(purchaseId: string): Promise<void> {
        const { error } = await supabase.functions.invoke('handle-purchase-approval', {
            body: { purchase_id: purchaseId },
        });
        if (error) throw new Error(error.message);
    },

    async rejectPurchase(purchaseId: string): Promise<void> {
        const { error } = await supabase.functions.invoke('reject-purchase', {
            body: { purchase_id: purchaseId },
        });
        if (error) throw new Error(error.message);
    },

    async getPendingWithdrawals(): Promise<WithdrawalWithEmail[]> {
        const { data, error } = await supabase.functions.invoke('get-pending-withdrawals');
        if (error) throw new Error(error.message);
        return data;
    },
    
    async approveWithdrawal(withdrawalId: string): Promise<void> {
        const { error } = await supabase.functions.invoke('approve-withdrawal', {
            body: { withdrawal_id: withdrawalId },
        });
        if (error) throw new Error(error.message);
    },

    async rejectWithdrawal(withdrawalId: string): Promise<void> {
        const { error } = await supabase.functions.invoke('reject-withdrawal', {
            body: { withdrawal_id: withdrawalId },
        });
        if (error) throw new Error(error.message);
    },

    // New functions for Referral Withdrawals
    async getPendingReferralWithdrawals(): Promise<ReferralWithdrawalWithEmail[]> {
        const { data, error } = await supabase.functions.invoke('get-pending-referral-withdrawals');
        if (error) throw new Error(error.message);
        return data;
    },

    async approveReferralWithdrawal(withdrawalId: string): Promise<void> {
        const { error } = await supabase.functions.invoke('update-referral-withdrawal', {
            body: { withdrawal_id: withdrawalId, new_status: 'approved' },
        });
        if (error) throw new Error(error.message);
    },

    async rejectReferralWithdrawal(withdrawalId: string): Promise<void> {
        const { error } = await supabase.functions.invoke('update-referral-withdrawal', {
            body: { withdrawal_id: withdrawalId, new_status: 'rejected' },
        });
        if (error) throw new Error(error.message);
    },
};