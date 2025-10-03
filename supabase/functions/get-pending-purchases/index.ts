// supabase/functions/get-pending-purchases/index.ts
// Fix: Use correct types for Supabase Edge Functions to resolve Deno namespace errors.
/// <reference types="npm:@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdminClient.ts'

serve(async (_req) => {
  if (_req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('token_purchases')
      .select(`
          *,
          profiles (
              email
          )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      throw error
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
