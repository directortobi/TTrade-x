import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Access environment variables with multi-source fallback.
 */
const getEnvVar = (name: string): string | null => {
    // 1. Check process.env (Node/Standard)
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

// --- CONFIGURATION START ---
// We check for both VITE_ prefixed and standard variable names.
// Fallback values are provided from the project's known working configuration.
const supabaseUrl = 
    getEnvVar('VITE_SUPABASE_URL') || 
    getEnvVar('SUPABASE_URL') || 
    'https://ripmsswicdbflbkqfpbu.supabase.co/';

const supabaseAnonKey = 
    getEnvVar('VITE_SUPABASE_ANON_KEY') || 
    getEnvVar('SUPABASE_ANON_KEY') || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpcG1zc3dpY2RiZmxia3FmcGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMTg1MzcsImV4cCI6MjA4MTU5NDUzN30.4_voAjcOXEYMU73G3uZe0B8hQgp721tUDAL9PgrAvTE';
// --- CONFIGURATION END ---

export let supabase: SupabaseClient;
export let isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

/**
 * Initializes the Supabase client and verifies connectivity.
 */
export const initializeSupabase = async (): Promise<void> => {
    if (isSupabaseConfigured && supabase) return;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase configuration is missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.');
        isSupabaseConfigured = false;
        return;
    }

    try {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Basic session check to ensure the client is functional
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
