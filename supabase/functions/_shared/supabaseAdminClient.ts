// supabase/functions/_shared/supabaseAdminClient.ts
// FIX: Replaced broken unpkg CDN with esm.sh for Supabase edge function type definitions to resolve Deno type errors.
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2.43.4/dist/module/index.js'
import type { Database } from '../_shared/database.types.ts'

// Create a new Supabase client with the Service Role key
// This will allow us to bypass RLS policies
export const supabaseAdmin = createClient<Database>(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
