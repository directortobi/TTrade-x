import { supabase } from './supabase';
import { TokenPackage, TokenPurchase } from '../types';

interface PurchaseRequest {
    userId: string;
    pkg: TokenPackage;
    proofFile: File;
}

export const createTokenPurchaseRequest = async ({ userId, pkg, proofFile }: PurchaseRequest): Promise<void> => {
    const fileExt = proofFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('payment_proofs')
        .upload(filePath, proofFile);

    if (uploadError) {
        throw new Error('Storage error: Ensure the "payment_proofs" bucket is created and public.');
    }

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
    const { data, error } = await supabase
        .from('token_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
};

export const useTokenForAnalysis = async (currentTokens: number): Promise<number> => {
    if (currentTokens < 1) throw new Error("Insufficient tokens.");
    
    // We try to invoke the backend to sync, but allow local deduction if it fails (Failed to fetch)
    try {
        const { error } = await supabase.functions.invoke('use-token');
        if (error) console.warn("Backend token sync warning:", error.message);
    } catch (err) {
        console.warn("Backend token sync unavailable. Tokens deducted locally.");
    }
    
    return Math.max(0, currentTokens - 1);
};