import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdminClient.ts'

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { purchase_id } = await req.json()
    if (!purchase_id) {
        throw new Error('Missing purchase_id parameter.')
    }

    // Use a database function (RPC) to handle the transaction atomically
    const { error: rpcError } = await supabaseAdmin.rpc('approve_token_purchase', {
        purchase_id_to_approve: purchase_id
    })

    if (rpcError) {
        console.error('RPC Error:', rpcError);
        throw rpcError;
    }

    return new Response(JSON.stringify({ message: 'Purchase approved successfully.' }), {
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
