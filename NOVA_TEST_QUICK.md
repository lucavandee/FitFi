# Nova Quick Test - After 502 Fix

## Test Goal

Verify Nova function works zonder 502 errors na de fixes.

---

## Prerequisites

```bash
# Check je bent in project root
pwd
# Should show: /path/to/fitfi

# Check Netlify CLI (optioneel, maar aanbevolen)
npm list netlify-cli
# Of global:
netlify --version
```

---

## Test 1: Local Function Test (Direct)

**Start Netlify Dev:**
```bash
npm run dev:netlify
```

**Wait for:**
```
◈ Server listening on http://localhost:8888
```

**In another terminal, test function directly:**
```bash
curl -X POST http://localhost:8888/.netlify/functions/nova \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8888" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

**Expected output:**
```
data: {"type":"meta","model":"fitfi-nova-local","traceId":"..."}

data: {"type":"chunk","delta":"We kozen voor een cleane..."}

data: {"type":"chunk","delta":"<<<FITFI_JSON>>>...<<<END_FITFI_JSON>>>"}

data: {"type":"chunk","delta":"... rest of text ..."}

data: {"type":"done"}

```

**NOT expected:**
- `502 Bad Gateway`
- Empty response
- Connection refused
- JSON parse errors

---

## Test 2: UI Test

**With Netlify Dev still running:**

1. Open browser: `http://localhost:8888`
2. Click Nova chat bubble (rechtsonder)
3. Type: "hi"
4. Press Enter

**Expected:**
- Loading indicator shows
- Response appears binnen 2-5s
- No error messages in chat
- Browser console: No 502 errors

**Browser console (F12) should show:**
```
POST http://localhost:8888/.netlify/functions/nova 200 OK
```

**NOT:**
```
POST http://localhost:8888/.netlify/functions/nova 502 Bad Gateway
```

---

## Test 3: Longer Query

**In Nova chat, type:**
```
Stel een casual outfit samen
```

**Expected:**
- Response binnen 5s
- 3-4 product cards shown
- Console: `✅ Loaded 50 products from Supabase`
- No errors

---

## Test 4: Multiple Queries

**Send 3 queries rapidly:**
1. "hi"
2. "Stel een outfit samen"
3. "Wat zijn goede kleuren voor mij?"

**Expected:**
- All 3 get responses
- No connection pool exhaustion
- No 502 errors
- Each response independent

---

## Troubleshooting

### Issue: "Cannot GET /.netlify/functions/nova"

**Cause:** Function verwacht POST, niet GET

**Fix:** Use curl with `-X POST` or test via UI

---

### Issue: "CORS error"

**Cause:** Origin header mismatch

**Fix:**
```bash
# Ensure Origin header matches:
-H "Origin: http://localhost:8888"
```

---

### Issue: "Response is empty"

**Check:**
1. Netlify Dev terminal - any error logs?
2. Function returned body?
3. Response Content-Type is `text/event-stream`?

**Debug:**
```bash
# Add verbose curl
curl -v -X POST http://localhost:8888/.netlify/functions/nova \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:8888" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

Check response headers for:
```
HTTP/1.1 200 OK
Content-Type: text/event-stream; charset=utf-8
```

---

### Issue: Still getting 502

**Possible causes:**
1. Function has syntax error
2. Supabase credentials missing
3. Dependency issue

**Debug steps:**

**Step 1: Check function logs**
```bash
# In Netlify Dev terminal, look for:
✅ Loaded 50 products from Supabase
Response build complete
```

**Step 2: Check env vars**
```bash
cat .env | grep SUPABASE
# Should show:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

**Step 3: Test Supabase connection**
```bash
# In browser console (http://localhost:8888):
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_ANON_KEY'
);
const { data, error } = await supabase.from('products').select('count');
console.log(data, error);
```

---

## Success Criteria

**All tests pass if:**
- ✅ No 502 errors in ANY test
- ✅ All responses complete (no hanging)
- ✅ SSE format correct (`data: {...}\n\n`)
- ✅ Done event received (`{"type":"done"}`)
- ✅ UI shows responses properly
- ✅ Multiple queries work sequentially

**If ANY test fails with 502:**
→ See `NOVA_502_FIX.md` for detailed debugging

---

## Deploy to Production

**After all tests pass:**

```bash
git add netlify/functions/nova.ts CHANGELOG.md NOVA_502_FIX.md
git commit -m "fix(nova): resolve 502 error - convert streaming to buffered responses"
git push origin main
```

**Netlify auto-deploys in ~2-3 minutes**

**Then test production:**
```bash
curl -X POST https://jouw-site.netlify.app/.netlify/functions/nova \
  -H "Content-Type: application/json" \
  -H "Origin: https://jouw-site.netlify.app" \
  -d '{"messages":[{"role":"user","content":"hi"}]}'
```

Expected: Same SSE formatted response, no 502!

---

## Monitoring Production

**In Netlify Dashboard:**
1. Go to **Functions** tab
2. Click `nova` function
3. Check **Logs** for:

**Success pattern:**
```
✅ Loaded 50 products from Supabase
Response build complete: 1234 bytes
```

**Error pattern (investigate):**
```
❌ Response build error: ...
❌ Supabase query failed: ...
```

**Real-time logs:**
```bash
netlify functions:log nova
```

---

## Clean Up

**Stop Netlify Dev:**
```
Ctrl+C in terminal
```

**Optional: Clear local cache**
```bash
rm -rf .netlify/
```

---

## Summary

**Fixed issues:**
1. ✅ NodeJS.Timeout → ReturnType<typeof setInterval>
2. ✅ ReadableStream → Buffered string response
3. ✅ Uninitialized responseBody → Default ""

**Expected result:**
- No more 502 errors
- Stable Nova responses
- Ready for production

**Status:** 🟢 PRODUCTION READY
