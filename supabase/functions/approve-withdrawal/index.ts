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

    // This function assumes that the token debit logic is handled by a database trigger or RPC
    // upon status update for atomicity. Directly updating status here for simplicity.
    const { error } = await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'approved' })
      .eq('id', withdrawal_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ message: 'Withdrawal approved successfully' }), {
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
