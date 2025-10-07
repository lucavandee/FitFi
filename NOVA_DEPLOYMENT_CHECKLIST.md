# Nova OpenAI Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables in Netlify

Ga naar Netlify Dashboard → Site Settings → Environment variables

**Vereist:**
```
NOVA_UPSTREAM = on
OPENAI_API_KEY = sk-proj-xxxxxxxxxxxxx
```

**BELANGRIJK:**
- Zorg dat `NOVA_UPSTREAM` exact `on` is (lowercase)
- OpenAI key begint met `sk-proj-` of `sk-`
- Geen spaties voor/na de waarden

### 2. Deploy Trigger

**Nadat je env vars hebt toegevoegd:**

**Optie A - Auto redeploy:**
Netlify detecteert env var changes en triggert auto-redeploy

**Optie B - Manual trigger:**
1. Ga naar Deploys tab
2. Click "Trigger deploy" → "Clear cache and deploy site"

**Optie C - Git push:**
```bash
git commit --allow-empty -m "trigger redeploy for env vars"
git push origin main
```

### 3. Code Verification

✅ Check deze punten in de code (already done):

- [x] `upstreamEnabled` check exists (line 290)
- [x] OpenAI called when `responseType === "conversational"` (line 367)
- [x] Fallback logic in place (line 383-386)
- [x] `callOpenAI` function implemented (line 214-285)
- [x] Messages array passed to OpenAI (line 372-376)

## 🧪 Testing After Deploy

### 1. Check Netlify Function Logs

1. Ga naar Netlify Dashboard
2. Functions tab
3. Find `nova` function
4. Check recent invocations

**What to look for:**
```
✅ "Using OpenAI for conversational response"
✅ OpenAI API call successful
❌ "OpenAI failed, falling back" (betekent API issue)
❌ No log = env vars niet geladen
```

### 2. Test Conversation Flow

Open de app en test:

**Test 1 - Greeting:**
```
You: hoi
Expected: OpenAI response (intelligent, contextual)
NOT: "Hey! Leuk dat je er bent..." (local mock)
```

**Test 2 - Vague input:**
```
You: uitgaan
Expected: Smart follow-up questions (Where? What vibe?)
NOT: "Hmm, vertel me wat meer!" (generic mock)
```

**Test 3 - Context building:**
```
You: hoi
Nova: [asks question]
You: uitgaan
Nova: [remembers "uitgaan", asks specific follow-up]
You: restaurant, chic
Nova: [builds on accumulated context, gives specific advice]
```

**Key indicator OpenAI is working:**
- Responses are unique each time
- Nova remembers previous messages
- No repetitive loops
- Smart, contextual follow-ups

### 3. Verify in Browser DevTools

Open DevTools → Network tab → Filter: "nova"

**Check request:**
- Status: 200 OK
- Response has streaming chunks

**Check console:**
- No errors about missing env vars
- No CORS errors
- No 500 errors from function

## 🐛 Troubleshooting

### Issue: Still getting local mock responses

**Possible causes:**

1. **Env vars not loaded**
   - Solution: Redeploy after adding vars
   - Verify: Check Netlify function logs

2. **Typo in NOVA_UPSTREAM**
   - Must be exactly: `on` (lowercase)
   - Not: `ON`, `On`, `true`, `1`

3. **OpenAI API key invalid**
   - Verify key starts with `sk-`
   - Test key at platform.openai.com
   - Check API usage/billing

4. **Function not picking up new env vars**
   - Solution: Clear cache and redeploy
   - Netlify → Deploys → Trigger deploy → Clear cache

### Issue: OpenAI errors in logs

**Error: "OpenAI failed, falling back"**

Check logs for specific error:

- `401 Unauthorized` = Invalid API key
- `429 Rate limit` = Too many requests (upgrade plan)
- `500 Server error` = OpenAI API down
- `Network error` = Connection issue

**Solutions:**
- 401: Verify API key is correct
- 429: Wait or upgrade OpenAI plan
- 500: Wait for OpenAI to recover
- Network: Check Netlify function timeout

### Issue: Conversation not intelligent

**If responses are still generic:**

1. Check if `responseType` is actually `"conversational"`
   - Add console.log in function
   - Check Netlify logs

2. Verify messages array is passed correctly
   - Should contain full conversation history
   - Format: `[{role: "user", content: "..."}, ...]`

3. Check if `upstreamEnabled` is true
   - Log it in function
   - Verify both env vars are set

## 📊 Monitoring

### OpenAI Usage Dashboard

1. Go to [platform.openai.com](https://platform.openai.com)
2. Usage tab
3. Monitor:
   - Requests per day
   - Token usage
   - Costs
   - Errors

### Expected Usage

**Per conversation:**
- ~5-10 messages
- ~200-500 tokens per response
- ~€0.001-0.005 per conversation

**Daily (100 users):**
- ~500-1000 requests
- €0.50-1.00 per day
- €15-30 per month

### Alerts Setup

Set up alerts in OpenAI dashboard:
- Budget limit (e.g., €50/month)
- Rate limit warnings
- Error rate threshold

## ✅ Success Criteria

**You know it's working when:**

1. ✅ Netlify logs show: "Using OpenAI for conversational response"
2. ✅ Conversations are contextual and intelligent
3. ✅ No repetitive loops or generic responses
4. ✅ Nova remembers previous messages
5. ✅ Follow-up questions are specific and relevant
6. ✅ OpenAI dashboard shows usage
7. ✅ Users report better conversation quality

**If ALL these are true → OpenAI integration is LIVE! 🚀**

## 🔄 Rollback Plan

If issues occur:

1. **Temporary fix:**
   ```
   Set in Netlify: NOVA_UPSTREAM = off
   ```
   This disables OpenAI, falls back to local mock

2. **Full rollback:**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Debug mode:**
   Add more logging to function:
   ```typescript
   console.log("upstreamEnabled:", upstreamEnabled);
   console.log("responseType:", responseType);
   console.log("messages:", JSON.stringify(body.messages));
   ```

## 📞 Support

**Issues with:**
- OpenAI API: [help.openai.com](https://help.openai.com)
- Netlify Functions: [docs.netlify.com/functions](https://docs.netlify.com/functions)
- FitFi code: Check CHANGELOG.md + NOVA_SETUP.md

---

**Current Status:** Implementation complete, ready for deployment with env vars! 🎉
