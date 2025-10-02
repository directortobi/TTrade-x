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

export const useTokenForAnalysis = async (userId: string): Promise<number> => {
    const { data, error } = await supabase.rpc('decrement_user_tokens', {
        p_user_id: userId,
        p_amount: 1
    });

    if (error) {
        console.error('Error decrementing tokens:', error);
        if (error.message.includes('Insufficient tokens')) {
            throw new Error('You do not have enough tokens for this analysis.');
        }
        throw new Error('Could not use a token for analysis. Please try again.');
    }
    
    return data;
};