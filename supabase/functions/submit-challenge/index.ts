import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChallengeRequest {
  challenge_id: string;
  challenge_type: 'daily' | 'weekly' | 'special';
  points_reward?: number;
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

    const body: ChallengeRequest = await req.json()
    
    if (!body.challenge_id) {
      return new Response(
        JSON.stringify({ error: 'Challenge ID required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if challenge already completed today/week
    const timeFilter = body.challenge_type === 'daily' 
      ? "completed_at >= CURRENT_DATE"
      : body.challenge_type === 'weekly'
      ? "week_number = EXTRACT(week FROM NOW()) AND year_number = EXTRACT(year FROM NOW())"
      : "TRUE" // Special challenges can be completed multiple times

    const { data: existingCompletion, error: checkError } = await supabaseClient
      .from('challenge_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('challenge_id', body.challenge_id)
      .filter('completed_at', 'gte', timeFilter)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing completion:', checkError)
      return new Response(
        JSON.stringify({ error: 'Failed to check challenge status' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingCompletion && body.challenge_type !== 'special') {
      return new Response(
        JSON.stringify({ 
          error: 'Challenge already completed',
          message: `${body.challenge_type} challenge already completed`
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Determine points reward
    const pointsReward = body.points_reward || (
      body.challenge_type === 'daily' ? 25 :
      body.challenge_type === 'weekly' ? 75 :
      50 // special
    )

    // Record challenge completion
    const { error: completionError } = await supabaseClient
      .from('challenge_completions')
      .insert({
        user_id: user.id,
        challenge_id: body.challenge_id,
        challenge_type: body.challenge_type,
        points_earned: pointsReward,
        completed_at: new Date().toISOString()
      })

    if (completionError) {
      console.error('Error recording completion:', completionError)
      return new Response(
        JSON.stringify({ error: 'Failed to record completion' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Award points using the calculate_points function
    const { data: pointsResult, error: pointsError } = await supabaseClient
      .rpc('calculate_points', {
        user_uuid: user.id,
        points_to_add: pointsReward,
        action_type: 'challenge_complete',
        source_info: body.challenge_id
      })

    if (pointsError) {
      console.error('Error awarding points:', pointsError)
      return new Response(
        JSON.stringify({ error: 'Failed to award points' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        points_earned: pointsReward,
        new_total: pointsResult[0]?.new_total_points || 0,
        level_up: pointsResult[0]?.level_changed || false,
        new_level: pointsResult[0]?.new_level,
        badges_earned: pointsResult[0]?.badges_earned || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Challenge submission error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})