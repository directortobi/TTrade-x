// supabase/functions/approve-withdrawal/index.ts
// FIX: Use a version-pinned CDN URL for Supabase edge function type definitions to resolve Deno type errors.
// FIX: Corrected the Supabase Edge Function type definition path to use index.d.ts.
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/index.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdminClient.ts'

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { withdrawal_id } = await req.json()
    if (!withdrawal_id) {
      throw new Error('withdrawal_id is required.')
    }

    // Use a transaction to ensure atomicity
    const { error: rpcError } = await supabaseAdmin.rpc('approve_withdrawal_transaction', {
      p_withdrawal_id: withdrawal_id,
    })

    if (rpcError) {
      // Check for specific error messages from the function
      if (rpcError.message.includes('Withdrawal not found or not pending')) {
        return new Response(JSON.stringify({ error: 'Withdrawal request not found or has already been processed.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }
      if (rpcError.message.includes('Insufficient funds')) {
         return new Response(JSON.stringify({ error: 'User has insufficient funds for this withdrawal.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        })
      }
      throw rpcError
    }

    if (!rpcError) {
      const { data: withdrawalData } = await supabaseAdmin
        .from('withdrawals')
        .select('user_id, tokens_to_withdraw')
        .eq('id', withdrawal_id)
        .single();
  
      if (withdrawalData) {
        await supabaseAdmin.from('notifications').insert({
          user_id: withdrawalData.user_id,
          type: 'withdrawal_approved',
          message: `Your withdrawal of ${withdrawalData.tokens_to_withdraw} tokens has been approved.`,
          link: 'withdraw'
        });
      }
    }

    return new Response(JSON.stringify({ message: 'Withdrawal approved successfully.' }), {
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

/* 
  Note: Before this function can work, you must create the corresponding
  PostgreSQL function in your Supabase SQL Editor. This function will handle
  the transaction logic securely on the database side.

  Run this SQL in your Supabase project's SQL Editor:

  CREATE OR REPLACE FUNCTION approve_withdrawal_transaction(p_withdrawal_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
    v_user_id uuid;
    v_tokens_to_withdraw int;
    v_current_tokens int;
  BEGIN
    -- Step 1: Get withdrawal details and lock the row for update
    SELECT user_id, tokens_to_withdraw
    INTO v_user_id, v_tokens_to_withdraw
    FROM public.withdrawals
    WHERE id = p_withdrawal_id AND status = 'pending'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Withdrawal not found or not pending';
    END IF;

    -- Step 2: Get user's current token balance and lock the row
    SELECT tokens
    INTO v_current_tokens
    FROM public.profiles
    WHERE id = v_user_id
    FOR UPDATE;

    IF v_current_tokens IS NULL THEN
      RAISE EXCEPTION 'User profile not found';
    END IF;

    -- Step 3: Check for sufficient funds
    IF v_current_tokens < v_tokens_to_withdraw THEN
      RAISE EXCEPTION 'Insufficient funds';
    END IF;

    -- Step 4: Debit tokens from user's profile
    UPDATE public.profiles
    SET tokens = tokens - v_tokens_to_withdraw
    WHERE id = v_user_id;

    -- Step 5: Update withdrawal status to 'approved'
    UPDATE public.withdrawals
    SET status = 'approved'
    WHERE id = p_withdrawal_id;

  END;
  $$;

*/