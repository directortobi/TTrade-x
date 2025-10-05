// supabase/functions/_shared/supabaseAdminClient.ts
// FIX: Use a more reliable CDN for Supabase edge function type definitions to resolve Deno type errors.
// [FIX] Use a more reliable CDN for Supabase edge function type definitions to resolve Deno type errors.
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'
import type { Database } from '../_shared/database.types.ts'

// Create a new Supabase client with the Service Role key
// This will allow us to bypass RLS policies
export const supabaseAdmin = createClient<Database>(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
