import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Access environment variables with multi-source fallback.
 * Checks process.env (Node/Sandboxes), import.meta.env (Vite), 
 * and window._env_ (Direct injection).
 */
const getEnvVar = (name: string): string | null => {
    // 1. Check process.env (Standard Node/Sandboxes)
    if (typeof process !== 'undefined' && process.env?.[name]) {
        return process.env[name] as string;
    }
    // 2. Check import.meta.env (Vite)
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env?.[name]) {
        // @ts-ignore
        return import.meta.env[name] as string;
    }
    // 3. Check window (Injection fallback)
    if (typeof window !== 'undefined' && (window as any)._env_?.[name]) {
        return (window as any)._env_[name];
    }
    return null;
};

// Check for both VITE_ prefixed and standard names to maximize compatibility
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY');

export let supabase: SupabaseClient;
export let isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Initializes the Supabase client and verifies connectivity.
 * If you see "Configuration Missing", you must set your keys in the 
 * Environment Variables / Secrets panel of your deployment or editor.
 */
export const initializeSupabase = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) return;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase configuration is missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment variables.');
        isSupabaseConfigured = false;
        return;
    }

    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Quick session check to confirm the key/url work
        // Using type casting to bypass property existence checks on auth if types are mismatching
        const { error } = await (supabase.auth as any).getSession();
        
        if (error) {
            console.warn('Supabase session check warning:', error.message);
        }

        isSupabaseConfigured = true;
        console.log('✅ Supabase initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        isSupabaseConfigured = false;
    }
};
