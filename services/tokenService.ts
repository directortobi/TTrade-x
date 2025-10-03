import { supabase } from './supabase';
import { TokenPackage } from '../types';

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

/**
 * Invokes a secure edge function to decrement the current user's token balance by 1.
 * This function includes retry logic to handle transient network errors.
 * @returns The new token balance.
 */
export const useTokenForAnalysis = async (): Promise<number> => {
    const maxAttempts = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const { data, error } = await supabase.functions.invoke('use-token');

            if (error) {
                // Throw to trigger the catch block for retry logic
                throw error;
            }

            // Validate the response data
            if (!data || typeof data.new_balance !== 'number') {
                const validationError = new Error('Invalid response format from token service.');
                console.error(`❌ Attempt ${attempt}/${maxAttempts}:`, validationError.message, data);
                throw validationError;
            }
            
            console.log("✅ Token service communication successful.");
            return data.new_balance;

        } catch (err) {
            lastError = err instanceof Error ? err : new Error(JSON.stringify(err));
            console.error(
                `❌ Error invoking 'use-token' (attempt ${attempt}/${maxAttempts}):`,
                lastError.message
            );
            
            if (attempt >= maxAttempts) {
                break; // Exit loop after final attempt
            }
            
            // Wait before retrying
            await new Promise(res => setTimeout(res, 500 * attempt));
        }
    }

    // If all attempts failed, throw a user-friendly error.
    console.error("All attempts to communicate with the token service failed.");

    if (lastError) {
        if (lastError.message.includes('Insufficient tokens')) {
            throw new Error('You do not have enough tokens for this analysis.');
        }
        if (lastError.message.toLowerCase().includes('failed to fetch') || lastError.message.toLowerCase().includes('networkerror')) {
            throw new Error('Failed to communicate with the token service after multiple attempts. Please check your network connection.');
        }
    }
    
    throw new Error('An unexpected error occurred while using a token. Please try again.');
};
