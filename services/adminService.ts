import { supabase } from './supabase';
import { PurchaseWithEmail, WithdrawalWithEmail, ReferralWithdrawalWithEmail } from '../types';

/**
 * Robust wrapper for Edge Functions.
 * Returns empty data or safe errors instead of throwing "Failed to fetch"
 * if the function doesn't exist yet.
 */
const safeInvoke = async <T>(name: string, body?: any): Promise<T | null> => {
    try {
        const { data, error } = await supabase.functions.invoke(name, { body });
        if (error) {
            console.warn(`Edge Function ${name} warning:`, error.message);
            return null;
        }
        return data as T;
    } catch (err) {
        console.warn(`Edge Function ${name} is not available (failed to fetch). Using fallback data.`);
        return null;
    }
};

export const adminService = {
    async getPendingPurchases(): Promise<PurchaseWithEmail[]> {
        return (await safeInvoke<PurchaseWithEmail[]>('get-pending-purchases')) || [];
    },

    async approvePurchase(purchaseId: string): Promise<void> {
        await safeInvoke('handle-purchase-approval', { purchase_id: purchaseId });
    },

    async rejectPurchase(purchaseId: string): Promise<void> {
        await safeInvoke('reject-purchase', { purchase_id: purchaseId });
    },

    async getPendingWithdrawals(): Promise<WithdrawalWithEmail[]> {
        return (await safeInvoke<WithdrawalWithEmail[]>('get-pending-withdrawals')) || [];
    },
    
    async approveWithdrawal(withdrawalId: string): Promise<void> {
        await safeInvoke('approve-withdrawal', { withdrawal_id: withdrawalId });
    },

    async rejectWithdrawal(withdrawalId: string): Promise<void> {
        await safeInvoke('reject-withdrawal', { withdrawal_id: withdrawalId });
    },

    async getPendingReferralWithdrawals(): Promise<ReferralWithdrawalWithEmail[]> {
        return (await safeInvoke<ReferralWithdrawalWithEmail[]>('get-pending-referral-withdrawals')) || [];
    },

    async approveReferralWithdrawal(withdrawalId: string): Promise<void> {
        await safeInvoke('update-referral-withdrawal', { 
            withdrawal_id: withdrawalId, 
            new_status: 'approved' 
        });
    },

    async rejectReferralWithdrawal(withdrawalId: string): Promise<void> {
        await safeInvoke('update-referral-withdrawal', { 
            withdrawal_id: withdrawalId, 
            new_status: 'rejected' 
        });
    },
};