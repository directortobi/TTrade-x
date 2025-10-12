// supabase/functions/update-referral-withdrawal/index.ts
// FIX: Use a version-pinned CDN URL for Supabase edge function type definitions to resolve Deno type errors.
// FIX: Corrected the Supabase Edge Function type definition path to use index.d.ts.
// FIX: Corrected the Supabase Edge Function type definition path to point to the 'dist' folder, resolving the type error and enabling Deno types.
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/dist/index.d.ts" />

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

    if (data && data.length > 0) {
      const withdrawal = data[0];
      const message = new_status === 'approved'
        ? `Your referral withdrawal of $${withdrawal.amount_usd} has been approved.`
        : `Your referral withdrawal of $${withdrawal.amount_usd} was rejected.`;
    
      await supabaseAdmin.from('notifications').insert({
        user_id: withdrawal.user_id,
        type: `referral_withdrawal_${new_status}`,
        message: message,
        link: 'referralProgram'
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
