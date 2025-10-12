import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables.
// These must be prefixed with VITE_ to be exposed to the client-side code.
// FIX: Use process.env to access environment variables, as import.meta.env is specific to Vite and was causing a type error.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
// FIX: Use process.env to access environment variables, as import.meta.env is specific to Vite and was causing a type error.
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

// Create a Supabase client.
// If the credentials are not configured, the app will show a configuration error page.
// We still create a dummy client to prevent other parts of the app from crashing on import.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('http://localhost:54321', 'dummy-key');
