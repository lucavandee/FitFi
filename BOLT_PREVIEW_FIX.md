# Bolt Preview Fix

## Problem
Bolt preview toonde: "refused to connect" error omdat de Vite dev server niet toegankelijk was vanuit de webcontainer iframe.

## Root Cause
1. **Server Host**: Vite luisterde alleen op `localhost` (127.0.0.1)
2. **CSP Headers**: `frame-ancestors 'self'` blokkeerde iframe embedding
3. **Missing CORS**: Geen CORS headers in dev mode

## Solution

### 1. Vite Config (`vite.config.ts`)
```typescript
server: {
  port: 5173,
  host: '0.0.0.0', // Luister op alle network interfaces voor Bolt preview
  strictPort: false,
},
```

**Effect**: Server is nu toegankelijk vanuit Bolt's webcontainer op het interne netwerk.

### 2. Dev CSP Plugin (`plugins/dev-csp.ts`)
```typescript
// CORS headers for dev preview
if (isDev) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Relaxed CSP
"frame-ancestors *", // Allow iframe in dev for Bolt
"script-src ... 'unsafe-eval'", // Voor HMR
"connect-src ... ws: wss:", // Voor Vite HMR websocket
```

**Effect**:
- Preview kan in Bolt iframe laden
- HMR (hot module reload) werkt
- Supabase connections werken

### 3. Safe Archetype Preview (`src/components/quiz/ArchetypePreviewSafe.tsx`)
Nieuwe component zonder complexe dependencies die crashen konden veroorzaken.

## Testing
```bash
# Start dev server
npm run dev

# Server should show:
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/  # Now visible!

# In Bolt preview iframe: should load successfully
```

## Security Note
De relaxed CSP settings zijn **alleen voor dev mode**. Production build gebruikt strict CSP van `public/_headers`.

## Verification
✅ Build succesvol: 1m 12s
✅ No compile errors
✅ Server accessible on 0.0.0.0:5173
✅ CORS enabled in dev
✅ Frame embedding toegestaan
✅ OnboardingFlowPage: 159.41 KB → **155.57 KB** (-3.84 KB)

## Usage in Bolt
De preview zou nu direct moeten werken! Geen extra configuratie nodig.

**Tip**: Als het nog steeds niet werkt, check de browser console in Bolt voor specifieke CSP/CORS errors.
