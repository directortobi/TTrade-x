// supabase/functions/_shared/supabaseAdminClient.ts
// FIX: Use a version-pinned CDN URL for Supabase edge function type definitions to resolve Deno type errors.
// FIX: Corrected the Supabase Edge Function type definition path to use index.d.ts.
// FIX: Corrected the Supabase Edge Function type definition path to point to the 'dist' folder, resolving the type error and enabling Deno types.
// FIX: Switched to unpkg for the type definitions to resolve module loading errors with esm.sh.
// FIX: Switched Supabase functions type reference from unpkg to esm.sh to fix Deno type resolution errors.
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1" />

import { createClient } from 'https://unpkg.com/@supabase/supabase-js@2.43.4/dist/module/index.js'
import type { Database } from '../_shared/database.types.ts'

// Create a new Supabase client with the Service Role key
// This will allow us to bypass RLS policies
export const supabaseAdmin = createClient<Database>(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
