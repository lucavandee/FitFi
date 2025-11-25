# Storage Bucket Setup - CRITICAL

## Problem Identified

The photo upload feature is failing with 400 errors because **Storage buckets exist in the database but are not registered with the Supabase Storage API**.

**Root Cause:**
- Buckets created via SQL INSERT are recorded in `storage.buckets` table
- BUT the Storage API maintains its own internal state
- Buckets must be created via Storage API or Supabase Dashboard
- Currently `curl https://[project].supabase.co/storage/v1/bucket` returns `[]` (empty)

## Solution: Manual Bucket Creation

You need to create the `outfit-photos` bucket via the Supabase Dashboard:

### Step 1: Access Storage Dashboard

1. Go to https://supabase.com/dashboard/project/wojexzgjyhijuxzperhq
2. Log in with your Supabase account
3. Click **Storage** in the left sidebar

### Step 2: Create Bucket

Click **New bucket** and configure:

```
Bucket name: outfit-photos
Public bucket: ✅ Yes (checked)
File size limit: 10 MB
Allowed MIME types: image/jpeg, image/png, image/webp, image/jpg
```

### Step 3: Configure Policies

The RLS policies should already be in place from migrations, but verify:

**SELECT Policy:**
- Name: "Anyone can view outfit photos"
- Definition: `bucket_id = 'outfit-photos'`
- Target roles: `public`

**INSERT Policy:**
- Name: "Authenticated users can upload outfit photos"
- Definition: `bucket_id = 'outfit-photos' AND (storage.foldername(name))[1] = auth.uid()::text`
- Target roles: `authenticated`

**DELETE Policy:**
- Name: "Users can delete own outfit photos"
- Definition: `bucket_id = 'outfit-photos' AND (storage.foldername(name))[1] = auth.uid()::text`
- Target roles: `authenticated`

### Step 4: Verify

After creating the bucket, verify it exists:

```bash
curl "https://wojexzgjyhijuxzperhq.supabase.co/storage/v1/bucket/outfit-photos" \
  -H "Authorization: Bearer [ANON_KEY]"
```

Should return bucket metadata, not 404.

## Alternative: Use Existing Bucket

If you cannot access the Dashboard, we can modify the code to use an existing bucket like `user-photos` or `mood-photos` IF they are properly initialized in the Storage API.

## Technical Details

**What Happens During Upload:**

1. Frontend calls `supabase.storage.from('outfit-photos').upload(...)`
2. Supabase JS SDK makes POST to `/storage/v1/object/outfit-photos/[path]`
3. Storage API checks if bucket exists in its internal registry
4. If not found → 400 Bad Request
5. If found → checks RLS policies → allows/denies upload

**Current State:**
- Database has bucket record ✅
- RLS policies configured ✅
- Storage API registry EMPTY ❌ ← THIS IS THE PROBLEM

## Files to Update After Fix

Once bucket is created, no code changes needed! The current implementation will work:

- `src/services/nova/photoAnalysisService.ts` - upload logic is correct
- `src/components/nova/PhotoUploadModal.tsx` - UI is correct
- RLS policies - already configured

Photo upload will work immediately after bucket creation.

## Need Help?

If you cannot access the Supabase Dashboard, you need to either:

1. Get the `SERVICE_ROLE_KEY` from your Supabase project settings
2. Add it to `.env` as `SUPABASE_SERVICE_ROLE_KEY=...`
3. I can then create a migration script to initialize buckets via API

Let me know which approach you prefer!
