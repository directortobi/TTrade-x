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
    if (typeof window !== 'undefined' && (window as any)._env_?.[name]) {
        return (window as any)._env_[name];
    }
    return null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('SUPABASE_URL') || 'https://ripmsswicdbflbkqfpbu.supabase.co/';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpcG1zc3dpY2RiZmxia3FmcGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMTg1MzcsImV4cCI6MjA4MTU5NDUzN30.4_voAjcOXEYMU73G3uZe0B8hQgp721tUDAL9PgrAvTE';

export let supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
export let isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const initializeSupabase = async (): Promise<void> => {
    if (!supabaseUrl || !supabaseAnonKey) {
        isSupabaseConfigured = false;
        return;
    }

    try {
        const { error } = await (supabase.auth as any).getSession();
        if (error) console.warn('Supabase session check:', error.message);
        isSupabaseConfigured = true;
    } catch (error) {
        console.error('Supabase init error:', error);
        isSupabaseConfigured = false;
    }
};