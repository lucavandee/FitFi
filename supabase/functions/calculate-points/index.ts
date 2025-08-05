import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PointsRequest {
  action_type: 'quiz_complete' | 'challenge_complete' | 'daily_checkin' | 'outfit_save' | 'outfit_share' | 'referral_signup';
  points?: number;
  metadata?: Record<string, any>;
}

serve(async (req) => {
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

    const body: PointsRequest = await req.json()
    
    // Determine points based on action type
    const pointsMap: Record<string, number> = {
      'quiz_complete': 50,
      'challenge_complete': 25,
      'daily_checkin': 10,
      'outfit_save': 15,
      'outfit_share': 30,
      'referral_signup': 100
    }

    const pointsToAward = body.points || pointsMap[body.action_type] || 10

    // Call the calculate_points function
    const { data: result, error: pointsError } = await supabaseClient
      .rpc('calculate_points', {
        user_uuid: user.id,
        points_to_add: pointsToAward,
        action_type: body.action_type,
        source_info: JSON.stringify(body.metadata || {})
      })

    if (pointsError) {
      console.error('Error calculating points:', pointsError)
      return new Response(
        JSON.stringify({ error: 'Failed to calculate points' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const pointsResult = result[0]

    // Award automatic badges based on action
    const badgeMap: Record<string, { id: string, name: string, icon: string }> = {
      'quiz_complete': { id: 'quiz_master', name: 'Quiz Master', icon: '🧠' },
      'daily_checkin': { id: 'daily_warrior', name: 'Daily Warrior', icon: '📅' },
      'outfit_share': { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋' }
    }

    if (badgeMap[body.action_type]) {
      const badge = badgeMap[body.action_type]
      await supabaseClient.rpc('award_badge', {
        user_uuid: user.id,
        badge_id_param: badge.id,
        badge_name_param: badge.name,
        badge_icon_param: badge.icon,
        metadata_param: body.metadata || {}
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        points_awarded: pointsToAward,
        new_total: pointsResult?.new_total_points || 0,
        level_up: pointsResult?.level_changed || false,
        new_level: pointsResult?.new_level,
        badges_earned: pointsResult?.badges_earned || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Points calculation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})