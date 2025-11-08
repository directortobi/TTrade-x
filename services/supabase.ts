import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables safely.
const supabaseUrl = (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) ? process.env.SUPABASE_URL : undefined;
const supabaseAnonKey = (typeof process !== 'undefined' && process.env && process.env.SUPABASE_ANON_KEY) ? process.env.SUPABASE_ANON_KEY : undefined;


export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Create a Supabase client.
// If the credentials are not configured, the app will show a configuration error page.
// We still create a dummy client to prevent other parts of the app from crashing on import.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createClient('http://localhost:54321', 'dummy-key');