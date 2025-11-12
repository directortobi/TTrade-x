import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Load Supabase credentials from Vite environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export let supabase: SupabaseClient;
export let isSupabaseConfigured = false;

/**
 * Initializes the Supabase client. This must be called once when the app starts.
 */
export const initializeSupabase = async (): Promise<void> => {
    // Prevent re-initialization
    if (isSupabaseConfigured) {
        return;
    }

    if (supabaseUrl && supabaseAnonKey) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        isSupabaseConfigured = true;
    } else {
        console.error('Supabase URL or Anon Key is missing. Please check your .env file or environment variables.');
        isSupabaseConfigured = false;
    }
};
