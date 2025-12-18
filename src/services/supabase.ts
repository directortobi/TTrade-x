import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

export let supabase: SupabaseClient;
export let isSupabaseConfigured = false;

export const initializeSupabase = async (): Promise<void> => {
    if (isSupabaseConfigured) return;

    if (supabaseUrl && supabaseAnonKey) {
        supabase = createClient(supabaseUrl, supabaseAnonKey);
        isSupabaseConfigured = true;
    } else {
        console.error('Supabase URL or Anon Key is missing.');
        isSupabaseConfigured = false;
    }
};