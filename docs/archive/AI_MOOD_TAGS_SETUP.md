# AI Mood Tag Suggestions Setup

## Overzicht

Het admin mood photos systeem heeft nu AI-powered tag suggestions via OpenAI's GPT-4 Vision API.

## Features

- **Automatische analyse** van outfit foto's
- **5-8 relevante mood tags** gesuggereerd per foto
- **Context-aware**: houdt rekening met gender (male/female)
- **Smart suggestions**: selecteert uit 45+ voorgedefinieerde tags
- **Confidence score** en reasoning van AI
- **One-click accept**: accepteer individuele of alle suggesties

## Setup

### 1. OpenAI API Key Configureren

De Edge Function `analyze-mood-photo` vereist een OpenAI API key als secret.

**In Supabase Dashboard:**

1. Ga naar Project Settings → Edge Functions → Secrets
2. Voeg een nieuwe secret toe:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-proj-...` (je OpenAI API key)

**Via Supabase CLI (alternatief):**

```bash
supabase secrets set OPENAI_API_KEY=sk-proj-...
```

### 2. OpenAI API Key Verkrijgen

1. Ga naar [platform.openai.com](https://platform.openai.com)
2. Log in of maak een account
3. Navigeer naar API Keys
4. Klik "Create new secret key"
5. Kopieer de key (je ziet hem maar één keer!)

### 3. Kosten

De functie gebruikt het **gpt-4o-mini** model met:
- Vision capability: ~$0.00015 per image
- Low detail mode: kostenefficiënt
- Max 500 tokens per response

**Schatting:** ~$0.001-0.002 per analyse (zeer betaalbaar!)

## Gebruik

### In Admin Mood Photos Page

1. **Upload een foto**
2. Selecteer gender (male/female)
3. **Klik "Analyze with AI"** (paarse knop met sparkles ✨)
4. Wacht 2-5 seconden op analyse
5. **Review suggesties**:
   - Klik individuele tags om toe te voegen
   - Of klik "Accept All" voor alle tags
6. AI reasoning legt uit waarom tags gekozen zijn
7. Upload foto met geselecteerde tags

### Workflow Voordelen

**Voor:**
- Handmatig 6 tags typen per foto
- ~60 seconden per foto
- Inconsistente tagging

**Nu:**
- AI analyseert in 3 seconden
- One-click acceptance
- Consistente, kwalitatieve tags
- ~10-15 seconden per foto
- **4x sneller!**

## Technische Details

### Edge Function: `analyze-mood-photo`

**Endpoint:** `/.netlify/functions/v1/analyze-mood-photo`

**Request:**
```typescript
FormData {
  image: File,
  gender: 'male' | 'female'
}
```

**Response:**
```typescript
{
  success: true,
  moodTags: string[],      // 5-8 tags
  confidence: number,       // 0.0-1.0
  reasoning: string         // Why these tags
}
```

### Available Tags (45 total)

**Style (15):**
minimal, maximalist, scandinavian, bohemian, industrial, vintage, modern, classic, avant-garde, streetwear, preppy, romantic, edgy, elegant, casual

**Mood (15):**
confident, relaxed, sophisticated, playful, bold, understated, dramatic, serene, energetic, refined, cozy, polished, effortless, luxe, laid-back

**Aesthetic (15):**
clean, layered, structured, flowing, fitted, oversized, tailored, artistic, athletic, chic, timeless, contemporary, eclectic, monochrome, colorful

### AI Prompt Strategy

De AI krijgt:
1. Foto (base64, low detail)
2. Gender context
3. Lijst van 45 beschikbare tags
4. Duidelijke instructies over wat te analyseren
5. JSON response format

De AI overweegt:
- Overall vibe en aesthetic
- Kleurpallet
- Fit en silhouette
- Formaliteit
- Styling approach

## Error Handling

De Edge Function handelt deze scenario's af:

1. **Geen OpenAI API key**: `AI service not configured`
2. **Rate limiting**: `AI analysis failed`
3. **Invalid image**: `No image provided`
4. **Timeout**: 30s timeout in frontend
5. **No admin**: `Admin access required`

## Security

- ✅ Admin-only access (JWT verificatie)
- ✅ Service role voor Supabase queries
- ✅ OpenAI API key als secret (niet in code)
- ✅ CORS configured
- ✅ Timeout protection

## Monitoring

Check Edge Function logs in Supabase Dashboard:
```
Edge Functions → analyze-mood-photo → Logs
```

Log output bevat:
- 🎨 Function called
- ✅ Admin verified
- 🖼️ Analyzing image
- 🤖 Calling OpenAI Vision API
- 📊 OpenAI response received
- ✅ Analysis complete

## Troubleshooting

### "AI service not configured"
→ OpenAI API key ontbreekt in Edge Function secrets

### "AI analyse timeout"
→ Network issue of OpenAI rate limit; probeer opnieuw

### "Geen tags gevonden"
→ AI kon geen JSON parsen; edge case, retry meestal OK

### Lege suggesties
→ Check Edge Function logs voor details

## Future Improvements

Mogelijke uitbreidingen:

1. **Batch processing**: meerdere foto's tegelijk analyseren
2. **Tag confidence scores**: per-tag confidence
3. **Custom tags**: AI kan ook nieuwe tags voorstellen
4. **Multi-language**: NL tags in plaats van EN
5. **Image embeddings**: similarity search met bestaande foto's
6. **Cost tracking**: monitor OpenAI API kosten

## Support

Bij vragen of problemen:
- Check Supabase Edge Function logs
- Verify OpenAI API key geldig is
- Test met verschillende foto's
- Check API usage in OpenAI dashboard
