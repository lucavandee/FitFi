import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  function_call?: {
    name: string;
    arguments: string;
  };
}

interface NovaChatRequest {
  messages: ChatMessage[];
  context?: 'onboarding' | 'results' | 'general';
  user_profile?: {
    style_preferences?: any;
    gender?: string;
    name?: string;
  };
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

    const body: NovaChatRequest = await req.json()
    
    if (!body.messages || body.messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user's recent memories for context
    const lastUserMessage = body.messages[body.messages.length - 1]
    let relevantMemories: any[] = []

    if (lastUserMessage.role === 'user') {
      // Generate embedding for the user message (mock implementation)
      const mockEmbedding = generateMockEmbedding(lastUserMessage.content)
      
      // Search for relevant memories
      const { data: memories, error: memoriesError } = await supabaseClient
        .rpc('search_memories', {
          query_embedding: mockEmbedding,
          user_uuid: user.id,
          match_threshold: 0.7,
          match_count: 5
        })

      if (!memoriesError && memories) {
        relevantMemories = memories
      }
    }

    // Build system prompt with context
    const systemPrompt = buildNovaSystemPrompt(body.context, body.user_profile, relevantMemories)

    // Prepare messages for LLM
    const llmMessages = [
      { role: 'system', content: systemPrompt },
      ...body.messages
    ]

    // Generate Nova's response (mock implementation)
    const response = await generateNovaResponse(llmMessages, body.context)

    // Save conversation to database
    await saveConversationTurn(supabaseClient, user.id, lastUserMessage, response)

    // Create and save memory if significant
    if (isSignificantMessage(lastUserMessage.content)) {
      await createMemory(supabaseClient, user.id, lastUserMessage.content, 'conversation')
    }

    return new Response(
      JSON.stringify({
        message: response,
        memories_used: relevantMemories.length,
        context: body.context
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Nova chat error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function buildNovaSystemPrompt(
  context?: string, 
  userProfile?: any, 
  memories?: any[]
): string {
  const basePrompt = `Je bent Nova, een vriendelijke en enthousiaste AI-stylist voor FitFi. Je helpt gebruikers hun perfecte stijl ontdekken.

PERSOONLIJKHEID:
- Warm, ondersteunend en bemoedigend
- Gebruikt Nederlandse taal en emoji's
- Geeft concrete, actionable stijladvies
- Vraagt door om gebruikers beter te begrijpen

STIJL EXPERTISE:
- 6 hoofdarchetypen: klassiek, casual_chic, urban, streetstyle, retro, luxury
- Seizoensgebonden aanbevelingen
- Lichaamsbouw en kleuradvies
- Nederlandse mode retailers (Zalando, H&M, ASOS)

FUNCTIES:
- recommend_outfits: Genereer outfit aanbevelingen
- explain_choice: Leg stijlkeuzes uit
- suggest_accessories: Suggereer accessoires

GEDRAGSREGELS:
- Houd berichten kort en persoonlijk (max 150 woorden)
- Gebruik de naam van de gebruiker als je die hebt
- Verwijs naar eerdere gesprekken als relevant
- Geef altijd een reden waarom iets bij de gebruiker past`

  // Add context-specific instructions
  if (context === 'onboarding') {
    return basePrompt + `

ONBOARDING CONTEXT:
- Help de gebruiker hun stijlvoorkeuren ontdekken
- Stel gerichte vragen over gelegenheden en voorkeuren
- Moedig aan om eerlijk te zijn over hun comfort zone
- Leg uit hoe de quiz werkt en waarom vragen belangrijk zijn`
  }

  if (context === 'results') {
    return basePrompt + `

RESULTATEN CONTEXT:
- Leg de outfit aanbevelingen uit
- Help gebruikers begrijpen waarom iets bij hen past
- Suggereer hoe outfits aan te passen voor verschillende gelegenheden
- Moedig aan om feedback te geven op aanbevelingen`
  }

  // Add user profile context
  if (userProfile) {
    let profileContext = '\nGEBRUIKER PROFIEL:\n'
    if (userProfile.name) profileContext += `- Naam: ${userProfile.name}\n`
    if (userProfile.gender) profileContext += `- Geslacht: ${userProfile.gender}\n`
    if (userProfile.style_preferences) {
      profileContext += `- Stijlvoorkeuren: ${JSON.stringify(userProfile.style_preferences)}\n`
    }
    return basePrompt + profileContext
  }

  // Add memory context
  if (memories && memories.length > 0) {
    let memoryContext = '\nRECENTE GESPREKKEN:\n'
    memories.forEach((memory, index) => {
      memoryContext += `${index + 1}. ${memory.content} (${memory.memory_type})\n`
    })
    return basePrompt + memoryContext
  }

  return basePrompt
}

async function generateNovaResponse(
  messages: ChatMessage[], 
  context?: string
): Promise<ChatMessage> {
  // Mock Nova response generation
  // In production, this would call OpenAI API
  
  const lastMessage = messages[messages.length - 1]
  const userMessage = lastMessage.content.toLowerCase()

  // Check for function calls
  if (userMessage.includes('outfit') || userMessage.includes('aanbeveling')) {
    return {
      role: 'assistant',
      content: 'Ik ga perfect passende outfits voor je zoeken! 🎨',
      function_call: {
        name: 'recommend_outfits',
        arguments: JSON.stringify({
          occasion: extractOccasion(userMessage),
          style_preference: extractStylePreference(userMessage),
          count: 3
        })
      }
    }
  }

  if (userMessage.includes('waarom') || userMessage.includes('uitleg')) {
    return {
      role: 'assistant',
      content: 'Laat me uitleggen waarom deze keuze perfect bij je past! 💡',
      function_call: {
        name: 'explain_choice',
        arguments: JSON.stringify({
          item_type: 'outfit',
          reasoning_type: 'style_match'
        })
      }
    }
  }

  if (userMessage.includes('accessoire') || userMessage.includes('tas') || userMessage.includes('sieraden')) {
    return {
      role: 'assistant',
      content: 'Ik heb geweldige accessoires die je look compleet maken! ✨',
      function_call: {
        name: 'suggest_accessories',
        arguments: JSON.stringify({
          outfit_style: extractStylePreference(userMessage),
          occasion: extractOccasion(userMessage)
        })
      }
    }
  }

  // Generate contextual response
  const responses = {
    onboarding: [
      'Geweldig dat je je stijl wilt ontdekken! Vertel me, voor welke gelegenheden zoek je vooral outfits? 🌟',
      'Ik help je graag! Wat trekt je meer aan: comfortabele casual looks of elegante formele stijlen? 💫',
      'Leuk! Heb je al een idee van welke kleuren je het beste staan? Ik kan je helpen ontdekken wat bij je past! 🎨'
    ],
    results: [
      'Deze outfits zijn speciaal voor jou geselecteerd! Wat vind je van de eerste aanbeveling? 👗',
      'Ik ben benieuwd naar je reactie! Welke outfit spreekt je het meest aan? ✨',
      'Perfect! Deze combinaties passen bij jouw stijlprofiel. Heb je vragen over een specifieke look? 💖'
    ],
    general: [
      'Hoi! Ik ben Nova, je persoonlijke stylist. Hoe kan ik je vandaag helpen met je stijl? 🌟',
      'Leuk dat je er bent! Heb je vragen over outfits, kleuren of stijladvies? 💫',
      'Hallo! Ik help je graag met alles over mode en stijl. Waar kan ik je mee helpen? ✨'
    ]
  }

  const contextResponses = responses[context as keyof typeof responses] || responses.general
  const randomResponse = contextResponses[Math.floor(Math.random() * contextResponses.length)]

  return {
    role: 'assistant',
    content: randomResponse
  }
}

function extractOccasion(message: string): string {
  const occasions = {
    'werk': 'work',
    'kantoor': 'work',
    'business': 'work',
    'bruiloft': 'formal',
    'gala': 'formal',
    'formeel': 'formal',
    'feest': 'party',
    'uitgaan': 'party',
    'casual': 'casual',
    'weekend': 'casual',
    'vakantie': 'travel',
    'reizen': 'travel'
  }

  for (const [dutch, english] of Object.entries(occasions)) {
    if (message.includes(dutch)) {
      return english
    }
  }

  return 'casual'
}

function extractStylePreference(message: string): string {
  const styles = {
    'minimalist': 'minimalist',
    'klassiek': 'classic',
    'casual': 'casual_chic',
    'street': 'streetstyle',
    'urban': 'urban',
    'vintage': 'retro',
    'retro': 'retro',
    'luxe': 'luxury',
    'elegant': 'classic'
  }

  for (const [keyword, style] of Object.entries(styles)) {
    if (message.includes(keyword)) {
      return style
    }
  }

  return 'casual_chic'
}

async function saveConversationTurn(
  supabase: any,
  userId: string,
  userMessage: ChatMessage,
  assistantMessage: ChatMessage
): Promise<void> {
  try {
    // Save both messages
    const { error } = await supabase
      .from('chat_messages')
      .insert([
        {
          user_id: userId,
          role: userMessage.role,
          content: userMessage.content,
          created_at: new Date().toISOString()
        },
        {
          user_id: userId,
          role: assistantMessage.role,
          content: assistantMessage.content,
          function_call: assistantMessage.function_call,
          created_at: new Date().toISOString()
        }
      ])

    if (error) {
      console.error('Error saving conversation:', error)
    }
  } catch (error) {
    console.error('Error saving conversation turn:', error)
  }
}

async function createMemory(
  supabase: any,
  userId: string,
  content: string,
  memoryType: string = 'conversation'
): Promise<void> {
  try {
    // Generate mock embedding (in production, use OpenAI embeddings API)
    const embedding = generateMockEmbedding(content)

    const { error } = await supabase
      .from('nova_memories')
      .insert({
        user_id: userId,
        content: content,
        embedding: embedding,
        memory_type: memoryType,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error creating memory:', error)
    }
  } catch (error) {
    console.error('Error creating memory:', error)
  }
}

function generateMockEmbedding(text: string): number[] {
  // Mock embedding generation
  // In production, use OpenAI embeddings API
  const embedding = new Array(768).fill(0).map(() => Math.random() * 2 - 1)
  
  // Normalize the embedding
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

function isSignificantMessage(content: string): boolean {
  // Determine if a message should be stored as a memory
  const significantKeywords = [
    'ik hou van', 'ik vind', 'mijn stijl', 'niet leuk', 'perfect', 
    'favoriet', 'haat', 'altijd', 'nooit', 'belangrijk', 'voorkeur'
  ]

  return significantKeywords.some(keyword => 
    content.toLowerCase().includes(keyword)
  ) && content.length > 10
}