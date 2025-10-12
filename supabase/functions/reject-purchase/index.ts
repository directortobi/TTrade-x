// supabase/functions/reject-purchase/index.ts
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
    const { purchase_id } = await req.json()
    if (!purchase_id) {
      throw new Error('purchase_id is required.')
    }

    const { data, error } = await supabaseAdmin
      .from('token_purchases')
      .update({ status: 'rejected' })
      .eq('id', purchase_id)
      .eq('status', 'pending') // Can only reject pending purchases
      .select('user_id, package_name')
      .single();

    if (error) {
      throw error
    }

    if (data) {
      await supabaseAdmin.from('notifications').insert({
        user_id: data.user_id,
        type: 'purchase_rejected',
        message: `Your purchase for the ${data.package_name} package was rejected.`,
        link: 'purchaseHistory'
      });
    }

    return new Response(JSON.stringify({ message: 'Purchase rejected successfully.' }), {
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
