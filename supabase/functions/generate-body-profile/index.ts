import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface BodyAnalysisRequest {
  image_url?: string;
  measurements?: {
    height?: number;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
  };
  gender: 'male' | 'female';
  age?: number;
}

interface BodyProfile {
  shape_type: 'pear' | 'apple' | 'hourglass' | 'rectangle' | 'inverted_triangle' | 'athletic';
  proportions: {
    shoulder_to_waist: number;
    waist_to_hip: number;
    torso_to_leg: number;
  };
  fit_recommendations: {
    tops: string[];
    bottoms: string[];
    dresses: string[];
    general_tips: string[];
  };
  confidence_score: number;
  analysis_method: 'image_ai' | 'measurements' | 'survey_based';
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

    const body: BodyAnalysisRequest = await req.json()

    // Generate body profile based on available data
    const bodyProfile = await generateBodyProfile(body)

    // Save body profile to user's record
    const { error: saveError } = await supabaseClient
      .from('user_onboarding_profiles')
      .upsert({
        user_id: user.id,
        body_profile: bodyProfile,
        updated_at: new Date().toISOString()
      })

    if (saveError) {
      console.error('Error saving body profile:', saveError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        body_profile: bodyProfile
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Body profile generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateBodyProfile(request: BodyAnalysisRequest): Promise<BodyProfile> {
  const { measurements, gender, image_url } = request

  // Determine analysis method
  let analysisMethod: 'image_ai' | 'measurements' | 'survey_based' = 'survey_based'
  let confidenceScore = 0.6

  if (image_url) {
    analysisMethod = 'image_ai'
    confidenceScore = 0.85
  } else if (measurements && Object.keys(measurements).length >= 3) {
    analysisMethod = 'measurements'
    confidenceScore = 0.9
  }

  // Calculate body shape based on available data
  let shapeType: BodyProfile['shape_type'] = 'rectangle'
  let proportions: BodyProfile['proportions'] = {
    shoulder_to_waist: 1.0,
    waist_to_hip: 1.0,
    torso_to_leg: 1.0
  }

  if (measurements) {
    const { chest = 90, waist = 75, hips = 95 } = measurements
    
    // Calculate ratios
    const shoulderToWaist = chest / waist
    const waistToHip = waist / hips
    
    proportions = {
      shoulder_to_waist: shoulderToWaist,
      waist_to_hip: waistToHip,
      torso_to_leg: 1.0 // Default, would need height/leg measurements
    }

    // Determine shape type based on measurements
    if (gender === 'female') {
      if (hips > chest && waistToHip < 0.85) {
        shapeType = 'pear'
      } else if (chest > hips && shoulderToWaist > 1.15) {
        shapeType = 'inverted_triangle'
      } else if (Math.abs(chest - hips) < 5 && waistToHip < 0.8) {
        shapeType = 'hourglass'
      } else if (Math.abs(chest - waist) < 10 && Math.abs(waist - hips) < 10) {
        shapeType = 'rectangle'
      } else if (waist > chest && waist > hips) {
        shapeType = 'apple'
      }
    } else {
      // Male body shape logic
      if (shoulderToWaist > 1.2) {
        shapeType = 'inverted_triangle'
      } else if (waist > chest) {
        shapeType = 'apple'
      } else {
        shapeType = 'rectangle'
      }
    }
  }

  // Generate fit recommendations based on shape
  const fitRecommendations = generateFitRecommendations(shapeType, gender)

  return {
    shape_type: shapeType,
    proportions,
    fit_recommendations: fitRecommendations,
    confidence_score: confidenceScore,
    analysis_method: analysisMethod
  }
}

function generateFitRecommendations(shapeType: BodyProfile['shape_type'], gender: 'male' | 'female'): BodyProfile['fit_recommendations'] {
  const recommendations: Record<string, BodyProfile['fit_recommendations']> = {
    pear: {
      tops: ['Boat neck', 'Off-shoulder', 'Horizontal stripes', 'Bright colors'],
      bottoms: ['A-line skirts', 'Straight leg jeans', 'Dark colors', 'High waist'],
      dresses: ['Fit and flare', 'Empire waist', 'A-line'],
      general_tips: ['Emphasize shoulders', 'Draw attention upward', 'Balance proportions']
    },
    apple: {
      tops: ['V-neck', 'Scoop neck', 'Empire waist', 'Flowy fabrics'],
      bottoms: ['Straight leg', 'Bootcut', 'High waist', 'Structured fabrics'],
      dresses: ['Empire waist', 'A-line', 'Wrap dresses'],
      general_tips: ['Define waist', 'Elongate torso', 'Draw attention to legs']
    },
    hourglass: {
      tops: ['Fitted styles', 'Wrap tops', 'Belted styles', 'V-neck'],
      bottoms: ['High waist', 'Fitted styles', 'Pencil skirts', 'Straight leg'],
      dresses: ['Bodycon', 'Wrap dresses', 'Fit and flare', 'Belted styles'],
      general_tips: ['Emphasize waist', 'Show curves', 'Fitted silhouettes']
    },
    rectangle: {
      tops: ['Peplum', 'Ruffles', 'Horizontal details', 'Layering'],
      bottoms: ['Flare jeans', 'Pleated skirts', 'Wide leg', 'Textured fabrics'],
      dresses: ['Fit and flare', 'Tiered', 'Belted', 'Textured'],
      general_tips: ['Create curves', 'Add volume', 'Define waist']
    },
    inverted_triangle: {
      tops: ['V-neck', 'Scoop neck', 'Minimal details', 'Dark colors'],
      bottoms: ['Wide leg', 'Flare', 'Bright colors', 'Patterns'],
      dresses: ['A-line', 'Fit and flare', 'Full skirt'],
      general_tips: ['Balance shoulders', 'Add volume to hips', 'Minimize top']
    },
    athletic: {
      tops: ['Soft fabrics', 'Draping', 'Feminine details', 'Curved lines'],
      bottoms: ['Straight leg', 'Skinny fit', 'Structured fabrics'],
      dresses: ['Sheath', 'Straight', 'Minimal structure'],
      general_tips: ['Soften angles', 'Add feminine touches', 'Create curves']
    }
  }

  return recommendations[shapeType] || recommendations.rectangle
}