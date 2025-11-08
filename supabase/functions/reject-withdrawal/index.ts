import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdminClient.ts'

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { withdrawal_id } = await req.json()
    if (!withdrawal_id) {
      throw new Error('Missing required parameter: withdrawal_id')
    }

    // Use a database function (RPC) for atomicity
    const { error: rpcError } = await supabaseAdmin.rpc('reject_token_withdrawal', {
        withdrawal_id_to_reject: withdrawal_id
    })

    if (rpcError) {
        console.error('RPC Error:', rpcError);
        throw rpcError;
    }

    return new Response(JSON.stringify({ message: 'Withdrawal rejected successfully' }), {
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
