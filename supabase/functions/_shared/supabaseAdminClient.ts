// supabase/functions/_shared/supabaseAdminClient.ts
// Standardized the type reference to ensure consistency across all edge functions.
/// <reference types="https://esm.sh/@supabase/functions-js@2" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import type { Database } from '../_shared/database.types.ts'

// Create a new Supabase client with the Service Role key
// This will allow us to bypass RLS policies
export const supabaseAdmin = createClient<Database>(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)