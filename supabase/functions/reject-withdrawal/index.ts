// supabase/functions/reject-withdrawal/index.ts
// FIX: Use a version-pinned CDN URL for Supabase edge function type definitions to resolve Deno type errors.
// FIX: Corrected the Supabase Edge Function type definition path to use index.d.ts.
// FIX: Corrected the Supabase Edge Function type definition path to point to the 'dist' folder, resolving the type error and enabling Deno types.
// FIX: Switched to unpkg for the type definitions to resolve module loading errors with esm.sh.
// FIX: Switched Supabase functions type reference from unpkg to esm.sh to fix Deno type resolution errors.
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1" />

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

    const { data, error } = await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'rejected' })
      .eq('id', withdrawal_id)
      .eq('status', 'pending')
      .select('user_id, tokens_to_withdraw')
      .single();

    if (error) {
      throw error
    }

    if (data) {
      await supabaseAdmin.from('notifications').insert({
        user_id: data.user_id,
        type: 'withdrawal_rejected',
        message: `Your withdrawal request for ${data.tokens_to_withdraw} tokens was rejected.`,
        link: 'withdraw'
      });
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
