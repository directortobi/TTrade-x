import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase project credentials.
const supabaseUrl = 'https://xwpkfgvbyzgqaappnetg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cGtmZ3ZieXpncWFhcHBuZXRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDg5MjMsImV4cCI6MjA3NDkyNDkyM30.9qyTrbdPkwI-FP3LwAidZR3IEW4rDmEHT6DSNRFUnFk';

export const isSupabaseConfigured =
  !supabaseUrl.includes('PASTE_YOUR') && !supabaseAnonKey.includes('PASTE_YOUR');

// Create a Supabase client.
// If the credentials are not configured, the app will show a configuration error page.
// We still create a dummy client to prevent other parts of the app from crashing on import.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('http://localhost:54321', 'dummy-key');