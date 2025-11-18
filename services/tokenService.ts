import { supabase } from './supabase';
// FIX: Add .ts extension to import path.
import { TokenPackage, TokenPurchase } from '../types';

interface PurchaseRequest {
    userId: string;
    pkg: TokenPackage;
    proofFile: File;
}

export const createTokenPurchaseRequest = async ({ userId, pkg, proofFile }: PurchaseRequest): Promise<void> => {
    // 1. Upload the file to Supabase Storage
    const fileExt = proofFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(filePath, proofFile);

    if (uploadError) {
        console.error('Storage upload error:', uploadError);
        // Check for the specific "Bucket not found" error to provide a better message.
        if (uploadError.message.toLowerCase().includes('bucket not found')) {
            throw new Error('Storage configuration error: The "payment_proofs" bucket is missing. Please ensure you have run the full database setup script from INSTRUCTIONS.md.');
        }
        throw new Error('Failed to upload payment proof. Please try again.');
    }

    // 2. Get the public URL of the uploaded file
    const { data: urlData } = supabase.storage
        .from('payment_proofs')
        .getPublicUrl(filePath);

    if (!urlData || !urlData.publicUrl) {
        throw new Error('Could not retrieve file URL after upload.');
    }

    // 3. Create a record in the token_purchases table
    const { error: insertError } = await supabase
        .from('token_purchases')
        .insert({
            user_id: userId,
            package_name: pkg.name,
            tokens_purchased: pkg.tokens,
            price_usd: pkg.price,
            payment_proof_url: urlData.publicUrl,
            status: 'pending'
        });

    if (insertError) {
        console.error('DB insert error:', insertError);
        // Attempt to delete the orphaned file from storage
        await supabase.storage.from('payment_proofs').remove([filePath]);
        throw new Error('Failed to submit purchase request. Please try again.');
    }
};

export const getPurchaseHistory = async (userId: string): Promise<TokenPurchase[]> => {
    const { data, error } = await supabase
        .from('token_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching purchase history:", error);
        if (error.message.includes('relation "public.token_purchases" does not exist')) {
            throw new Error('The token_purchases table is missing. Please run the setup script in INSTRUCTIONS.md.');
        }
        throw new Error(error.message);
    }

    return data;
};


/**
 * Optimistically decrements the user's token balance on the client and
 * sends a non-blocking request to the server to synchronize the change.
 * This approach ensures the UI is not blocked by network or server errors
 * related to token usage.
 * @param currentTokens The user's current token balance from the client state.
 * @returns The new, optimistically updated token balance.
 */
export const useTokenForAnalysis = async (currentTokens: number): Promise<number> => {
    // The initial check is still done client-side before calling this.
    // But as a safeguard:
    if (currentTokens < 1) {
        // This should ideally not be hit if the UI checks first, but it's good practice.
        throw new Error("Insufficient tokens for analysis.");
    }

    const newBalance = currentTokens - 1;

    // Fire-and-forget the backend update.
    // We don't await this, and we log errors instead of throwing them
    // to prevent blocking the user experience.
    supabase.functions.invoke('use-token').then(({ data, error }) => {
        if (error) {
            console.error(
                "Failed to sync token balance with server. The user's token count may be out of sync until the next refresh. Error:",
                error.message
            );
            // In a production app, you might send this error to a logging service.
        } else if (data) {
            console.log(
                `Server token balance updated successfully. Client thinks balance is ${newBalance}, server confirms ${data.new_balance}.`
            );
            // If there's a mismatch, the server is the source of truth,
            // but we don't force a UI update here to keep the experience smooth.
            // The balance will correct on the next full user profile fetch (e.g., page refresh).
        }
    });

    // Return the optimistically updated balance immediately.
    return newBalance;
};