# Nova AI Setup - OpenAI Integration

## Waarom OpenAI?

De locale mock is **niet intelligent genoeg** voor premium conversaties. Nova heeft echte AI nodig om:
- Context te onthouden over meerdere berichten
- Slimme vervolgvragen te stellen
- Niet in cirkels te praten
- Natuurlijke gesprekken te voeren

## Setup OpenAI API (Required for Production)

### 1. Get OpenAI API Key

1. Ga naar [platform.openai.com](https://platform.openai.com/)
2. Log in of maak een account
3. Ga naar **API keys** in je dashboard
4. Click **Create new secret key**
5. Kopieer de key (begint met `sk-...`)
6. **BEWAAR VEILIG** - deze key zie je maar 1x!

### 2. Add to Netlify Environment Variables

**BELANGRIJK:** Voeg deze toe aan **Netlify**, NIET aan `.env` in de repo!

1. Ga naar je Netlify dashboard
2. Site settings → Environment variables
3. Voeg toe:

```
NOVA_UPSTREAM = on
OPENAI_API_KEY = sk-your-actual-key-here
```

4. Deploy opnieuw of trigger een redeploy

### 3. Verify It Works

Na deploy:

```bash
# Check logs in Netlify dashboard
# Je moet zien: "Using OpenAI for conversational response"
```

Test in UI:
```
User: hoi
Nova: [Should give intelligent, contextual response]

User: uitgaan
Nova: [Should ask smart follow-up questions]

User: klassiek
Nova: [Should build on previous context, not repeat]
```

## Costs & Limits

**Model:** `gpt-4o-mini` (cheapest, still very good)

**Costs:**
- Input: $0.15 per 1M tokens
- Output: $0.60 per 1M tokens

**Typical conversation:**
- ~500 tokens per response
- ~€0.001 per message
- €1 = ~1000 messages

**Rate limits:**
- Free tier: 3 requests/min
- Tier 1 ($5+): 500 requests/min

## Fallback Behavior

Als OpenAI faalt (no key, API down, rate limit):
```
1. Tries OpenAI
2. Catches error
3. Falls back to local mock
4. Logs warning
5. User still gets response (degraded but working)
```

## Model Choice

**Current:** `gpt-4o-mini`
- Fast (300ms response)
- Cheap ($0.15/$0.60 per 1M tokens)
- Good for conversational AI

**Alternative:** `gpt-4o` (if budget allows)
- Even better quality
- 5x more expensive
- Change in `nova.ts`: `model: "gpt-4o"`

## System Prompt

De prompt is geoptimaliseerd voor FitFi:

```typescript
Je bent Nova, een premium style assistent voor FitFi.ai.

CONTEXT OVER USER:
- Archetype, huidsondertoon, maten, budget (from user profile)

JE TAAK:
1. Voer een natuurlijk gesprek over stijl en mode
2. Stel slimme vervolgvragen om context te verzamelen
3. Als je genoeg info hebt, genereer outfit advies
4. Wees persoonlijk, warm en professioneel (Apple × Lululemon niveau)

CONVERSATIE FLOW:
- Bij vage input: Vraag door naar specifieke gelegenheid, stijl, kleuren
- Bij context-rijke input: Geef concreet outfit advies
- Onthoud wat user al heeft gezegd en bouw daarop voort

Wees GEEN papegaai - als user vastloopt, help ze vooruit.
```

## Testing Locally

Voor local testing (zonder deploy):

1. Voeg toe aan `.env`:
   ```
   NOVA_UPSTREAM=on
   OPENAI_API_KEY=sk-your-key
   ```

2. Run:
   ```bash
   npm run dev:netlify
   ```

3. Test in browser op `http://localhost:8888`

**BELANGRIJK:** Commit `.env` NOOIT naar git!

## Monitoring

Check Netlify function logs voor:
- `"Using OpenAI for conversational response"` = ✅ Working
- `"OpenAI failed, falling back"` = ⚠️ API issue
- Check error messages voor debugging

## Security

✅ **SAFE:**
- Key in Netlify environment (server-side only)
- Never exposed to client
- Not in git repo

❌ **UNSAFE:**
- Key in `.env` and committed to git
- Key in client-side code
- Key hardcoded anywhere

## Performance

**Expected:**
- TTFB: ~300-500ms (OpenAI response time)
- Streaming: Implemented via SSE (real-time typing effect)
- Fallback: <50ms (local mock)

## Next Steps for Production

1. ✅ Add OpenAI key to Netlify
2. ✅ Set `NOVA_UPSTREAM=on`
3. ✅ Deploy
4. Test conversation quality
5. Monitor usage/costs in OpenAI dashboard
6. Adjust temperature (0.7-1.0) for creativity vs consistency
7. Add conversation history limit (prevent token overflow)

---

**Status Check:**
- Local mock: Always works (fallback)
- OpenAI: Works when `NOVA_UPSTREAM=on` + valid API key
- Fallback: Automatic on errors

**Result:** Premium AI conversation experience! 🚀
