import { supabase } from './supabase';
import { PurchaseWithEmail, WithdrawalWithEmail, ReferralWithdrawalWithEmail } from '../types';

/**
 * Safely invokes a Supabase function. If it fails with "Failed to fetch" (usually 404 or CORS),
 * it returns a graceful error or empty data for demo purposes.
 */
const safeInvoke = async <T>(functionName: string, body?: object): Promise<T | null> => {
    try {
        const { data, error } = await supabase.functions.invoke(functionName, { body });
        if (error) {
            console.warn(`Edge Function "${functionName}" returned an error:`, error.message);
            return null;
        }
        return data as T;
    } catch (err) {
        console.error(`CRITICAL: Failed to fetch Edge Function "${functionName}". This usually means the function is not deployed to your Supabase project.`);
        return null;
    }
};

export const adminService = {
    async getPendingPurchases(): Promise<PurchaseWithEmail[]> {
        const data = await safeInvoke<PurchaseWithEmail[]>('get-pending-purchases');
        return data || [];
    },

    async approvePurchase(purchaseId: string): Promise<void> {
        await safeInvoke('handle-purchase-approval', { purchase_id: purchaseId });
    },

    async rejectPurchase(purchaseId: string): Promise<void> {
        await safeInvoke('reject-purchase', { purchase_id: purchaseId });
    },

    async getPendingWithdrawals(): Promise<WithdrawalWithEmail[]> {
        const data = await safeInvoke<WithdrawalWithEmail[]>('get-pending-withdrawals');
        return data || [];
    },
    
    async approveWithdrawal(withdrawalId: string): Promise<void> {
        await safeInvoke('approve-withdrawal', { withdrawal_id: withdrawalId });
    },

    async rejectWithdrawal(withdrawalId: string): Promise<void> {
        await safeInvoke('reject-withdrawal', { withdrawal_id: withdrawalId });
    },

    async getPendingReferralWithdrawals(): Promise<ReferralWithdrawalWithEmail[]> {
        const data = await safeInvoke<ReferralWithdrawalWithEmail[]>('get-pending-referral-withdrawals');
        return data || [];
    },

    async approveReferralWithdrawal(withdrawalId: string): Promise<void> {
        await safeInvoke('update-referral-withdrawal', { withdrawal_id: withdrawalId, new_status: 'approved' });
    },

    async rejectReferralWithdrawal(withdrawalId: string): Promise<void> {
        await safeInvoke('update-referral-withdrawal', { withdrawal_id: withdrawalId, new_status: 'rejected' });
    },
};