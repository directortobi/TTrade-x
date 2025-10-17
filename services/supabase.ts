import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Load Supabase credentials from environment variables.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// A more robust check to see if the variables are not only present but also not placeholders or invalid.
const isUrlValid = supabaseUrl && supabaseUrl.startsWith('http');
const isKeyValid = supabaseAnonKey && !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = isUrlValid && isKeyValid;

// Create a Supabase client.
// If the credentials are not configured, the app will show a configuration error page.
// We still create a dummy client to prevent other parts of the app from crashing on import.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('http://localhost:54321', 'dummy-key');
