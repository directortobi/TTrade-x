// supabase/functions/use-token/index.ts
// FIX: Use a more reliable CDN for Supabase edge function type definitions to resolve Deno type errors.
// [FIX] Use a more reliable CDN for Supabase edge function type definitions to resolve Deno type errors.
/// <reference types="https://esm.sh/@supabase/functions-js@2.4.1/src/edge-runtime.d.ts" />

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4'
import { corsHeaders } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabaseAdminClient.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Function 'use-token' invoked.");
    // 1. Get auth header to identify the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error("❌ Missing authorization header in 'use-token'.");
      throw new Error('Missing authorization header');
    }
    
    // 2. Create a temporary Supabase client with the user's JWT to validate it
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )
    
    // 3. Get the user from the JWT.
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error("❌ Invalid token or user not found in 'use-token':", userError?.message);
      throw userError || new Error('User not found or invalid token');
    }

    console.log(`✅ Authenticated user: ${user.id}`);

    // 4. Call the 'decrement_user_tokens' RPC function.
    console.log(`Attempting to decrement tokens for user ${user.id}...`);
    const { data, error: rpcError } = await supabaseAdmin.rpc('decrement_user_tokens', {
      p_user_id: user.id,
      p_amount: 1,
    })

    if (rpcError) {
      console.error(`❌ RPC error for user ${user.id}:`, rpcError.message);
      throw rpcError;
    }
    
    console.log(`✅ Successfully decremented tokens for user ${user.id}. New balance: ${data}`);
    
    // 5. Return the new token balance.
    return new Response(JSON.stringify({ new_balance: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    const errorMessage = error.message || JSON.stringify(error);
    console.error("❌ Final error in 'use-token' function:", errorMessage);
    
    let status = 400; // Bad Request
    if (errorMessage.includes('Insufficient tokens')) status = 402; // Payment Required
    if (errorMessage.includes('authorization') || errorMessage.includes('token')) status = 401; // Unauthorized

    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    })
  }
})
