import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface AltTextRequest {
  image_url: string;
  context?: 'outfit' | 'product' | 'user_avatar';
  product_type?: string;
  brand?: string;
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

    const body: AltTextRequest = await req.json()
    
    if (!body.image_url) {
      return new Response(
        JSON.stringify({ error: 'Image URL required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if alt text already exists in cache
    const { data: cached, error: cacheError } = await supabaseClient
      .from('alt_cache')
      .select('alt_text')
      .eq('image_url', body.image_url)
      .maybeSingle()

    if (cached?.alt_text) {
      return new Response(
        JSON.stringify({ alt_text: cached.alt_text, cached: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate alt text using AI (mock implementation)
    const altText = generateAltText(body)

    // Cache the result
    const { error: insertError } = await supabaseClient
      .from('alt_cache')
      .insert({
        image_url: body.image_url,
        alt_text: altText,
        context: body.context || 'general',
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error caching alt text:', insertError)
    }

    return new Response(
      JSON.stringify({ alt_text: altText, cached: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Alt text generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateAltText(request: AltTextRequest): string {
  const { context, product_type, brand } = request
  
  // Generate contextual alt text based on available information
  switch (context) {
    case 'outfit':
      return `Stijlvolle outfit combinatie met ${product_type || 'kledingstukken'} ${brand ? `van ${brand}` : ''} - perfect voor jouw persoonlijke stijl`
    
    case 'product':
      return `${brand ? `${brand} ` : ''}${product_type || 'kledingstuk'} - hoogwaardige mode voor jouw garderobe`
    
    case 'user_avatar':
      return 'Gebruiker profielfoto - persoonlijke stijl avatar'
    
    default:
      return `Stijlvolle mode afbeelding ${brand ? `van ${brand}` : ''} - ontdek jouw perfecte look`
  }
}