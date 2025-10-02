// FIX: Corrected the triple-slash directive to use a more stable version range for Supabase Edge Function types.
// This resolves issues with the compiler not finding the type definition file and subsequent "Cannot find name 'Deno'" errors.
/// <reference types="https://esm.sh/@supabase/functions-js@2/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { Database } from '../_shared/database.types.ts'

// Create a new Supabase client with the Service Role key
// This will allow us to bypass RLS policies
export const supabaseAdmin = createClient<Database>(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
