// supabase/functions/_shared/supabaseAdminClient.ts
// Standardized the type reference to ensure consistency across all edge functions.
// FIX: Use a more specific type reference for Supabase functions to assist local TypeScript environments.
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-functions.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { Database } from '../_shared/database.types.ts'

// Create a new Supabase client with the Service Role key
// This will allow us to bypass RLS policies
export const supabaseAdmin = createClient<Database>(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
