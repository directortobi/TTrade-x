import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Access environment variables with multi-source fallback.
 */
const getEnvVar = (name: string): string | null => {
    if (typeof process !== 'undefined' && process.env?.[name]) {
        return process.env[name] as string;
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.[name]) {
        // @ts-ignore
        return import.meta.env[name] as string;
    }
    if (typeof window !== 'undefined' && (window as any)._env_?.[name]) {
        return (window as any)._env_[name];
    }
    return null;
};

// --- CONFIGURATION START ---
// 1. You can set these in your Environment Variables panel (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)
// 2. OR: Paste your strings directly inside the quotes below if environment variables aren't working.
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || ''; // PASTE URL HERE inside ''
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY') || ''; // PASTE KEY HERE inside ''
// --- CONFIGURATION END ---

export let supabase: SupabaseClient;
export let isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Initializes the Supabase client and verifies connectivity.
 */
export const initializeSupabase = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) return;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase configuration is missing. Please paste your URL and Key in services/supabase.ts');
        isSupabaseConfigured = false;
        return;
    }

    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Cast to any to bypass problematic type definitions for getSession in some environments
        const { error } = await (supabase.auth as any).getSession();
        
        if (error) {
            console.warn('Supabase initialization check warning:', error.message);
        }

        isSupabaseConfigured = true;
        console.log('✅ Supabase initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        isSupabaseConfigured = false;
    }
};