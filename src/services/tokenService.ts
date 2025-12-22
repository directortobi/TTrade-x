
import { supabase } from './supabase';
import { TokenPackage, TokenPurchase } from '../types';

interface PurchaseRequest {
    userId: string;
    pkg: TokenPackage;
    proofFile: File;
}

export const createTokenPurchaseRequest = async ({ userId, pkg, proofFile }: PurchaseRequest): Promise<void> => {
    const fileExt = proofFile.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(filePath, proofFile);

    if (uploadError) throw new Error('Failed to upload proof. Please ensure "payment_proofs" bucket exists.');

    const { data: urlData } = supabase.storage.from('payment_proofs').getPublicUrl(filePath);

    const { error: insertError } = await supabase.from('token_purchases').insert({
        user_id: userId,
        package_name: pkg.name,
        tokens_purchased: pkg.tokens,
        price_usd: pkg.price,
        payment_proof_url: urlData.publicUrl,
        status: 'pending'
    });

    if (insertError) throw insertError;
};

export const getPurchaseHistory = async (userId: string): Promise<TokenPurchase[]> => {
    const { data, error } = await supabase.from('token_purchases').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};

export const useTokenForAnalysis = async (currentTokens: number): Promise<number> => {
    if (currentTokens < 1) throw new Error("Insufficient tokens.");
    const newBalance = currentTokens - 1;
    await supabase.functions.invoke('use-token');
    return newBalance;
};
