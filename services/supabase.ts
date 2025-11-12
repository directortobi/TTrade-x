
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// The client and configuration status will be initialized asynchronously.
// Initialize with a dummy client to prevent import-time errors in other services.
export let supabase: SupabaseClient = createClient('http://localhost:54321', 'dummy-key');
export let isSupabaseConfigured = false;

/**
 * Waits for the aistudio.env object to be available on the window object.
 * This is necessary to prevent race conditions during app initialization.
 * @returns A promise that resolves with the aistudio.env object.
 */
const getEnv = (): Promise<any> => {
    return new Promise((resolve) => {
        const checkEnv = () => {
            if ((window as any).aistudio && (window as any).aistudio.env) {
                resolve((window as any).aistudio.env);
            } else {
                setTimeout(checkEnv, 100); // Check again in 100ms
            }
        };
        checkEnv();
    });
};


/**
 * Initializes the Supabase client by asynchronously fetching credentials
 * from the environment. This must be called once when the app starts.
 */
export const initializeSupabase = async (): Promise<void> => {
    // Prevent re-initialization
    if (isSupabaseConfigured) {
        return;
    }

    try {
        // Wait for the environment accessor to be ready.
        const env = await getEnv();
        
        // Asynchronously fetch credentials.
        const supabaseUrl = await env.get('SUPABASE_URL');
        const supabaseAnonKey = await env.get('SUPABASE_ANON_KEY');

        if (supabaseUrl && supabaseAnonKey) {
            supabase = createClient(supabaseUrl, supabaseAnonKey);
            isSupabaseConfigured = true;
        } else {
            console.error('Supabase URL or Anon Key is missing from environment.');
            isSupabaseConfigured = false;
        }
    } catch (e) {
         console.error('Failed to initialize Supabase:', e);
         isSupabaseConfigured = false;
    }
};
