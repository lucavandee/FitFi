import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EnrichPostRequest {
  post_id: string;
  content: string;
  image_url?: string;
  outfit_id?: string;
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

    const body: EnrichPostRequest = await req.json()
    
    if (!body.post_id) {
      return new Response(
        JSON.stringify({ error: 'Post ID required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enrich post with additional data
    const enrichments: any = {}

    // Add AI-generated alt text for images
    if (body.image_url) {
      try {
        const { data: altTextData } = await supabaseClient.functions.invoke('generate-alt-text', {
          body: {
            image_url: body.image_url,
            context: 'tribe_post',
            content: body.content
          }
        })

        if (altTextData?.alt_text) {
          enrichments.ai_alt_text = altTextData.alt_text
        }
      } catch (error) {
        console.warn('Failed to generate alt text:', error)
      }
    }

    // Add outfit preview data if outfit_id provided
    if (body.outfit_id) {
      try {
        const { data: outfitData, error: outfitError } = await supabaseClient
          .from('outfits')
          .select('id, title, image_url, match_percentage')
          .eq('id', body.outfit_id)
          .single()

        if (!outfitError && outfitData) {
          enrichments.outfit_preview = outfitData
        }
      } catch (error) {
        console.warn('Failed to load outfit preview:', error)
      }
    }

    // Extract hashtags and mentions from content
    const hashtags = extractHashtags(body.content)
    const mentions = extractMentions(body.content)

    if (hashtags.length > 0) {
      enrichments.hashtags = hashtags
    }

    if (mentions.length > 0) {
      enrichments.mentions = mentions
    }

    // Update post with enrichments
    const { data: updatedPost, error: updateError } = await supabaseClient
      .from('tribe_posts')
      .update({
        enrichments: enrichments,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.post_id)
      .eq('user_id', user.id) // Ensure user owns the post
      .select(`
        *,
        user_profile:profiles!tribe_posts_user_id_fkey(full_name, avatar_url),
        outfit:outfits(id, title, image_url, match_percentage)
      `)
      .single()

    if (updateError) {
      console.error('Error updating post:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to enrich post' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        post: updatedPost,
        enrichments
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Post enrichment error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi
  const matches = content.match(hashtagRegex)
  return matches ? matches.map(tag => tag.toLowerCase()) : []
}

function extractMentions(content: string): string[] {
  const mentionRegex = /@[\w\u00c0-\u024f\u1e00-\u1eff]+/gi
  const matches = content.match(mentionRegex)
  return matches ? matches.map(mention => mention.toLowerCase()) : []
}