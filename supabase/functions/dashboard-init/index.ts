import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the user from the Authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('Profile error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get referral stats
    const { data: referralStats, error: statsError } = await supabaseClient
      .rpc('get_referral_stats', { uid: user.id })

    if (statsError) {
      console.error('Referral stats error:', statsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch referral stats' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user stats
    const { data: userStats, error: userStatsError } = await supabaseClient
      .from('user_stats')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (userStatsError) {
      console.error('User stats error:', userStatsError)
    }

    // Generate share link
    const shareLink = profile?.referral_code 
      ? `${req.headers.get('origin') || 'https://fitfi.ai'}?ref=${profile.referral_code}`
      : null

    const dashboardData = {
      profile: {
        id: user.id,
        full_name: profile?.full_name || user.email?.split('@')[0] || 'Friend',
        avatar_url: profile?.avatar_url,
        referral_code: profile?.referral_code,
        referral_count: profile?.referral_count || 0
      },
      referrals: referralStats || { total: 0, rank: 1, is_founding_member: false },
      stats: {
        quiz_completed: userStats?.quiz_completed || false,
        outfits_viewed: userStats?.outfits_viewed || 0,
        last_active: userStats?.last_active
      },
      shareLink
    }

    return new Response(
      JSON.stringify(dashboardData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Dashboard init error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})