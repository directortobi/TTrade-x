// supabase/functions/update-referral-withdrawal/index.ts
// Standardized the type reference to ensure consistency across all edge functions.
/// <reference types="https://esm.sh/@supabase/functions-js@2" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdminClient.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { withdrawal_id, new_status } = await req.json()
    if (!withdrawal_id || !new_status) {
      throw new Error('withdrawal_id and new_status are required.')
    }

    if (new_status !== 'approved' && new_status !== 'rejected') {
        throw new Error("Invalid status provided. Must be 'approved' or 'rejected'.");
    }

    const { data, error } = await supabaseAdmin
      .from('referral_withdrawals')
      .update({ status: new_status })
      .eq('id', withdrawal_id)
      .eq('status', 'pending') // Only update if it's currently pending
      .select()

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
        return new Response(JSON.stringify({ error: 'Withdrawal not found or already processed.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404,
        });
    }

    return new Response(JSON.stringify({ message: `Referral withdrawal status updated to ${new_status}.` }), {
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