import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface ChallengeRequest {
  action: 'get_daily' | 'get_weekly' | 'complete' | 'generate_personalized';
  challenge_id?: string;
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

    if (req.method === 'GET') {
      // Get daily challenges
      const challenges = await generateDailyChallenges(user.id, supabaseClient)
      
      return new Response(
        JSON.stringify({ challenges }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (req.method === 'POST') {
      const body: ChallengeRequest = await req.json()
      
      switch (body.action) {
        case 'complete':
          if (!body.challenge_id) {
            return new Response(
              JSON.stringify({ error: 'Challenge ID required' }),
              { 
                status: 400, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
          
          const result = await completeChallenge(user.id, body.challenge_id, supabaseClient)
          
          return new Response(
            JSON.stringify(result),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        case 'generate_personalized':
          const personalizedChallenges = await generatePersonalizedChallenges(user.id, supabaseClient)
          
          return new Response(
            JSON.stringify({ challenges: personalizedChallenges }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )

        default:
          return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Challenges API error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateDailyChallenges(userId: string, supabase: any) {
  // Get user's style preferences and level
  const { data: userProfile } = await supabase
    .from('user_gamification')
    .select('level, points, completed_challenges')
    .eq('user_id', userId)
    .single()

  const userLevel = userProfile?.level || 'beginner'
  const userPoints = userProfile?.points || 0
  const completedChallenges = userProfile?.completed_challenges || []

  // Base challenges
  const baseChallenges = [
    {
      id: 'daily_checkin',
      type: 'daily',
      label: 'Dagelijkse Check-in',
      description: 'Log in en check je stijlupdates',
      points: 10,
      icon: '📅',
      difficulty: 'easy',
      maxProgress: 1
    },
    {
      id: 'view_recommendations',
      type: 'daily', 
      label: 'Bekijk 3 aanbevelingen',
      description: 'Ontdek nieuwe outfit ideeën',
      points: 20,
      icon: '👀',
      difficulty: 'easy',
      maxProgress: 3
    },
    {
      id: 'save_outfit',
      type: 'daily',
      label: 'Bewaar een outfit',
      description: 'Voeg een outfit toe aan je favorieten',
      points: 15,
      icon: '💾',
      difficulty: 'easy',
      maxProgress: 1
    }
  ]

  // Level-based challenges
  if (userPoints > 500) {
    baseChallenges.push({
      id: 'share_outfit',
      type: 'daily',
      label: 'Deel je stijl',
      description: 'Deel een outfit op social media',
      points: 30,
      icon: '📱',
      difficulty: 'medium',
      maxProgress: 1
    })
  }

  if (userLevel === 'master' || userLevel === 'guru') {
    baseChallenges.push({
      id: 'mentor_user',
      type: 'daily',
      label: 'Help een nieuwe gebruiker',
      description: 'Geef stijladvies aan een beginner',
      points: 50,
      icon: '🤝',
      difficulty: 'hard',
      maxProgress: 1
    })
  }

  // Filter out completed challenges
  return baseChallenges.filter(challenge => 
    !completedChallenges.includes(challenge.id)
  )
}

async function generatePersonalizedChallenges(userId: string, supabase: any) {
  // Get user's behavior and preferences
  const { data: userBehavior } = await supabase
    .from('onboarding_behavior_analytics')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: userPrefs } = await supabase
    .from('style_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Generate personalized challenges based on user data
  const personalizedChallenges = []

  // If user likes casual style, suggest casual challenges
  if (userPrefs?.casual > 3) {
    personalizedChallenges.push({
      id: 'casual_outfit_challenge',
      type: 'weekly',
      label: 'Casual Stijl Meester',
      description: 'Creëer 5 casual outfits deze week',
      points: 100,
      icon: '👕',
      difficulty: 'medium',
      maxProgress: 5,
      personalized: true
    })
  }

  // If user is active on mobile, suggest mobile-specific challenges
  const mobileActivity = userBehavior?.filter(b => b.metadata?.deviceType === 'mobile').length || 0
  if (mobileActivity > 5) {
    personalizedChallenges.push({
      id: 'mobile_stylist',
      type: 'weekly',
      label: 'Mobile Stylist',
      description: 'Gebruik FitFi 7 dagen op je telefoon',
      points: 75,
      icon: '📱',
      difficulty: 'medium',
      maxProgress: 7,
      personalized: true
    })
  }

  return personalizedChallenges
}

async function completeChallenge(userId: string, challengeId: string, supabase: any) {
  try {
    // Get challenge info
    const challengeData = {
      'daily_checkin': { points: 10, type: 'daily' },
      'view_recommendations': { points: 20, type: 'daily' },
      'save_outfit': { points: 15, type: 'daily' },
      'share_outfit': { points: 30, type: 'daily' },
      'weekly_streak': { points: 100, type: 'weekly' }
    }

    const challenge = challengeData[challengeId as keyof typeof challengeData]
    if (!challenge) {
      return { error: 'Invalid challenge ID' }
    }

    // Record completion
    const { error: completionError } = await supabase
      .from('challenge_completions')
      .insert({
        user_id: userId,
        challenge_id: challengeId,
        challenge_type: challenge.type,
        points_earned: challenge.points,
        completed_at: new Date().toISOString()
      })

    if (completionError) {
      console.error('Error recording completion:', completionError)
      return { error: 'Failed to record completion' }
    }

    // Award points using RPC function
    const { data: pointsResult, error: pointsError } = await supabase
      .rpc('award_points', {
        user_uuid: userId,
        points_to_add: challenge.points,
        action_type: 'challenge_completion',
        source_info: challengeId
      })

    if (pointsError) {
      console.error('Error awarding points:', pointsError)
      return { error: 'Failed to award points' }
    }

    return {
      success: true,
      points_earned: challenge.points,
      new_total: pointsResult[0]?.new_total_points || 0,
      level_up: pointsResult[0]?.level_changed || false,
      new_level: pointsResult[0]?.new_level
    }

  } catch (error) {
    console.error('Challenge completion error:', error)
    return { error: 'Internal server error' }
  }
}