// supabase/functions/handle-purchase-approval/index.ts
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
    const { purchase_id } = await req.json()
    if (!purchase_id) {
      throw new Error('purchase_id is required.')
    }

    // Call the PostgreSQL function to handle the transaction
    const { error: rpcError } = await supabaseAdmin.rpc('handle_purchase_approval', {
      p_purchase_id: purchase_id,
    })

    if (rpcError) {
      if (rpcError.message.includes('Purchase not found or not pending')) {
         return new Response(JSON.stringify({ error: 'Purchase request not found or has already been processed.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      throw rpcError
    }

    return new Response(JSON.stringify({ message: 'Purchase approved and tokens/commission processed successfully.' }), {
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
