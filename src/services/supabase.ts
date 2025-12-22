import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const getEnvVar = (name: string): string | null => {
    if (typeof process !== 'undefined' && process.env?.[name]) {
        return process.env[name] as string;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.[name]) {
        // @ts-ignore
        return import.meta.env[name] as string;
    }
    return null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

export let supabase: SupabaseClient;
export let isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const initializeSupabase = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) return;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase configuration is missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.');
        isSupabaseConfigured = false;
        return;
    }

    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        // FIX: Cast supabase.auth to any to resolve getSession type error
        await (supabase.auth as any).getSession();
        isSupabaseConfigured = true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        isSupabaseConfigured = false;
    }
};