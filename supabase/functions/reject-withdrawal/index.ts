// supabase/functions/reject-withdrawal/index.ts
// Fix: Use correct types for Supabase Edge Functions to resolve Deno namespace errors.
/// <reference types="npm:@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdminClient.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { withdrawal_id } = await req.json()
    if (!withdrawal_id) {
      throw new Error('withdrawal_id is required.')
    }

    const { error } = await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'rejected' })
      .eq('id', withdrawal_id)
      .eq('status', 'pending')

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ message: 'Withdrawal rejected successfully.' }), {
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
