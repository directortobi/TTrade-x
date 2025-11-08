import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdminClient.ts'

serve(async (req) => {
  // Handle preflight requests for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { withdrawal_id, new_status } = await req.json()
    if (!withdrawal_id || !new_status) {
      throw new Error('Missing required parameters: withdrawal_id, new_status')
    }
    if (!['approved', 'rejected'].includes(new_status)) {
        throw new Error('Invalid status provided.')
    }

    const { error } = await supabaseAdmin
      .from('referral_withdrawals')
      .update({ status: new_status })
      .eq('id', withdrawal_id)

    if (error) {
      throw error
    }

    return new Response(JSON.stringify({ message: `Referral withdrawal status updated to ${new_status}` }), {
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
