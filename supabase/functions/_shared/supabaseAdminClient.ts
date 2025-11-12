// FIX: Add Deno to global scope for TypeScript to avoid "Cannot find name 'Deno'" error.
declare const Deno: any;

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// The SERVICE_ROLE_KEY is set in the function's environment variables.
// This client can bypass RLS policies and should only be used in server-side functions.
export const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)