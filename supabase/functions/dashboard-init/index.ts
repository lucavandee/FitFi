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
      JSON.stringify({ ok: false, message: 'Method not allowed' }),
      { 
        status: 200, 
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
      console.error('[dashboard-init] No authorization header provided')
      return new Response(
        JSON.stringify({ ok: false, message: 'No authorization header' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let user;
    try {
      const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser(
        authHeader.replace('Bearer ', '')
      )

      if (userError || !authUser) {
        console.error('[dashboard-init] User authentication failed:', userError?.message)
        return new Response(
          JSON.stringify({ ok: false, message: 'Unauthorized' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      user = authUser
    } catch (authError) {
      console.error('[dashboard-init] Authentication error:', authError)
      return new Response(
        JSON.stringify({ ok: false, message: 'Authentication failed' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize dashboard data with proper error handling
    let profile = null
    let referralStats = null
    let userStats = null

    // Get user profile with error handling
    try {
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('[dashboard-init] Profile fetch error:', profileError.message)
      } else {
        profile = profileData
      }
    } catch (profileError) {
      console.error('[dashboard-init] Profile query failed:', profileError)
    }

    // Get referral stats with error handling
    try {
      const { data: statsData, error: statsError } = await supabaseClient
        .rpc('get_referral_stats', { uid: user.id })

      if (statsError) {
        console.error('[dashboard-init] Referral stats error:', statsError.message)
      } else {
        referralStats = statsData
      }
    } catch (statsError) {
      console.error('[dashboard-init] Referral stats query failed:', statsError)
    }

    // Get user stats from correct table with error handling
    try {
      const { data: userStatsData, error: userStatsError } = await supabaseClient
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (userStatsError) {
        console.error('[dashboard-init] User sessions error:', userStatsError.message)
      } else {
        userStats = userStatsData
      }
    } catch (userStatsError) {
      console.error('[dashboard-init] User sessions query failed:', userStatsError)
    }

    // Generate share link
    const shareLink = profile?.referral_code 
      ? `${req.headers.get('origin') || 'https://fitfi.ai'}?ref=${profile.referral_code}`
      : null

    // Always return successful response with available data
    const dashboardData = {
      ok: true,
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
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('[dashboard-init] Critical error:', error)
    
    // Always return 200 with error flag to prevent frontend crashes
    return new Response(
      JSON.stringify({ 
        ok: false, 
        message: 'init_failed',
        error: 'Dashboard initialization failed'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})