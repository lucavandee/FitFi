import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface ReferralRequest {
  code?: string;
  action: 'click' | 'signup';
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    
    if (req.method === 'GET') {
      // Handle referral click tracking
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Referral code required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verify referral code exists
      const { data: referral, error } = await supabaseClient
        .from('referrals')
        .select('id, user_id, code')
        .eq('code', code)
        .single()

      if (error || !referral) {
        return new Response(
          JSON.stringify({ error: 'Invalid referral code' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Return success with referral info
      return new Response(
        JSON.stringify({ 
          success: true, 
          code: referral.code,
          message: 'Referral code validated' 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Set-Cookie': `ref_code=${code}; Path=/; Max-Age=2592000; SameSite=Lax` // 30 days
          } 
        }
      )
    }

    if (req.method === 'POST') {
      // Handle referral signup completion
      const body: ReferralRequest = await req.json()
      
      if (body.action === 'signup' && body.user_id && code) {
        // Find the referrer
        const { data: referrer, error: referrerError } = await supabaseClient
          .from('referrals')
          .select('id, user_id')
          .eq('code', code)
          .single()

        if (referrerError || !referrer) {
          return new Response(
            JSON.stringify({ error: 'Invalid referral code' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Create referral record for the new user
        const { error: insertError } = await supabaseClient
          .from('referrals')
          .update({ 
            referred_user_id: body.user_id,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('code', code)

        if (insertError) {
          console.error('Error completing referral:', insertError)
          return new Response(
            JSON.stringify({ error: 'Failed to complete referral' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Referral completed successfully' 
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Set-Cookie': `ref_code=; Path=/; Max-Age=0` // Clear cookie
            } 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request' }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Referral API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})