# Photo Upload & AI Color Analysis - Implementation Plan

## ✅ DONE - Phase 1: All Quiz Data to Nova

**Status:** IMPLEMENTED & DEPLOYED

**What was done:**
1. ✅ Backend accepts: baseColors, preferredBrands, allQuizAnswers
2. ✅ Frontend sends: ALL quiz data via headers
3. ✅ Nova prompt includes: baseColors + brands + complete quiz JSON
4. ✅ Database migration: photo_url + color_analysis columns added

**Result:**
Nova now uses ALL quiz data for recommendations, not just bodyType + stylePrefs!

**Test:**
```
1. Complete quiz with baseColors="neutral" + preferred brands
2. Open Nova
3. Check Netlify logs → should see "Basis kleurvoorkeur: neutral"
4. Nova recommendations should mention user's color preferences
```

---

## 🚧 TODO - Phase 2: Photo Upload & AI Color Analysis

### Overview

Enable users to upload a selfie during quiz. Use OpenAI Vision API to analyze:
- Skin undertone (warm/cool/neutral)
- Seasonal color type (spring/summer/autumn/winter)
- Hair color, eye color
- Best colors that flatter them
- Colors to avoid

### Architecture

```
Quiz Step 4 (NEW) → Photo Upload Component
    ↓
Supabase Storage (user-photos bucket)
    ↓
Edge Function: analyze-color
    ↓
OpenAI Vision API (GPT-4V)
    ↓
style_profiles.color_analysis (JSONB)
    ↓
Nova Context → Personalized color recommendations
```

### Database Schema

**Already created:**
```sql
ALTER TABLE style_profiles
ADD COLUMN photo_url text;
ADD COLUMN color_analysis jsonb;

-- color_analysis format:
{
  "undertone": "warm" | "cool" | "neutral",
  "skin_tone": "fair" | "light" | "medium" | "tan" | "deep",
  "hair_color": "blonde" | "brown" | "black" | "red" | "grey",
  "eye_color": "blue" | "green" | "brown" | "hazel" | "grey",
  "seasonal_type": "spring" | "summer" | "autumn" | "winter",
  "best_colors": ["olive", "camel", "rust", "cream", "terracotta"],
  "avoid_colors": ["bright pink", "icy blue", "pure white"],
  "analysis_date": "2025-10-07T12:00:00Z",
  "confidence": 0.85,
  "analyzed_by": "openai-gpt-4-vision"
}
```

**Helper functions created:**
- `has_color_analysis(user_id)` → boolean
- `get_best_colors(user_id)` → text[]
- `get_color_summary(user_id)` → complete analysis

---

## Implementation Steps

### Step 1: Create Supabase Storage Bucket

**Via Supabase Dashboard:**
```
1. Go to Storage
2. Create new bucket: "user-photos"
3. Make it: Private (not public)
4. Set file size limit: 5MB
5. Allowed MIME types: image/jpeg, image/png, image/webp
```

**RLS Policies:**
```sql
-- Users can upload their own photos
CREATE POLICY "Users can upload own photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can read their own photos
CREATE POLICY "Users can read own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### Step 2: Create Photo Upload Component

**File:** `src/components/quiz/PhotoUpload.tsx`

```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { Upload, Camera, Check, AlertCircle } from 'lucide-react';

interface PhotoUploadProps {
  userId: string;
  onPhotoUploaded: (url: string) => void;
  onAnalysisComplete: (analysis: ColorAnalysis) => void;
}

export default function PhotoUpload({ userId, onPhotoUploaded, onAnalysisComplete }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError(null);
    setPreview(URL.createObjectURL(file));

    // Upload to Supabase Storage
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/selfie-${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from('user-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-photos')
        .getPublicUrl(fileName);

      onPhotoUploaded(publicUrl);

      // Trigger AI analysis
      setAnalyzing(true);
      const response = await fetch('/.netlify/functions/analyze-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: publicUrl, userId })
      });

      if (!response.ok) throw new Error('Color analysis failed');

      const analysis = await response.json();
      onAnalysisComplete(analysis);

    } catch (err) {
      console.error('Upload failed:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Upload een selfie</h3>
        <p className="text-sm text-gray-600 mb-4">
          Voor de beste kleurenanalyse: natuurlijk licht, geen filters, frontaal gezicht
        </p>
      </div>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-w-sm mx-auto rounded-lg"
          />
          {analyzing && (
            <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mx-auto mb-2" />
                <p>Analyzing colors...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <label className="block">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading || analyzing}
          className="hidden"
        />
        <Button
          as="span"
          variant="primary"
          fullWidth
          disabled={uploading || analyzing}
          icon={uploading || analyzing ? undefined : <Upload />}
        >
          {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Choose Photo'}
        </Button>
      </label>

      <p className="text-xs text-gray-500 text-center">
        Je foto wordt veilig opgeslagen en alleen gebruikt voor kleurenanalyse.
        Je kunt deze later verwijderen.
      </p>
    </div>
  );
}
```

### Step 3: Create Color Analysis Edge Function

**File:** `netlify/functions/analyze-color.ts`

```typescript
import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const handler: Handler = async (event) => {
  // CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { photoUrl, userId } = JSON.parse(event.body || '{}');

    if (!photoUrl || !userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'photoUrl and userId required' })
      };
    }

    // Call OpenAI Vision API
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a professional color analyst. Analyze the person's photo and determine:
1. Skin undertone (warm/cool/neutral)
2. Skin tone depth (fair/light/medium/tan/deep)
3. Hair color (blonde/brown/black/red/grey)
4. Eye color (blue/green/brown/hazel/grey)
5. Seasonal color type (spring/summer/autumn/winter)
6. Best colors that flatter them (10 specific colors)
7. Colors to avoid (5 colors)

Respond ONLY in valid JSON format:
{
  "undertone": "warm",
  "skin_tone": "medium",
  "hair_color": "brown",
  "eye_color": "brown",
  "seasonal_type": "autumn",
  "best_colors": ["olive", "camel", "rust", "cream", "terracotta", "chocolate", "teal", "coral", "gold", "burgundy"],
  "avoid_colors": ["bright pink", "icy blue", "pure white", "neon yellow", "cool grey"],
  "confidence": 0.85,
  "reasoning": "Short explanation why"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this person\'s coloring for a personal color analysis'
              },
              {
                type: 'image_url',
                image_url: { url: photoUrl }
              }
            ]
          }
        ],
        max_tokens: 500
      })
    });

    if (!visionResponse.ok) {
      throw new Error(`OpenAI Vision API failed: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json();
    const content = visionData.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI Vision');
    }

    // Parse JSON response
    const analysis = JSON.parse(content);

    // Add metadata
    analysis.analysis_date = new Date().toISOString();
    analysis.analyzed_by = 'openai-gpt-4-vision';

    // Save to database
    const supabase = createClient(SUPABASE_URL!, SUPABASE_KEY!);

    const { error: updateError } = await supabase
      .from('style_profiles')
      .update({
        photo_url: photoUrl,
        color_analysis: analysis
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Failed to save analysis:', updateError);
      // Continue anyway - user still gets analysis
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(analysis)
    };

  } catch (error) {
    console.error('Color analysis error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Color analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
```

### Step 4: Add Photo Step to Quiz

**File:** `src/data/quizSteps.ts`

Add new step after style preferences:

```typescript
{
  id: 'photo',
  question: 'Upload een selfie voor persoonlijke kleurenanalyse',
  description: 'We analyseren je huid undertone en aanbevelen kleuren die je perfect flatteren',
  type: 'photo',
  optional: true,  // Make it optional so users can skip
  component: PhotoUpload
}
```

### Step 5: Update Nova to Use Color Analysis

**Already prepared in migration!**

Nova will receive color analysis via `get_color_summary(user_id)` and use it in recommendations:

```typescript
KLEURENANALYSE (AI uit foto):
${colorAnalysis ? `
✅ Persoonlijke kleurenanalyse beschikbaar!
- Undertone: ${colorAnalysis.undertone}
- Seizoenstype: ${colorAnalysis.seasonal_type}
- Beste kleuren: ${colorAnalysis.best_colors.join(', ')}
- Vermijd: ${colorAnalysis.avoid_colors.join(', ')}

KRITIEKE REGEL - KLEUR MATCHING:
- Raad ALLEEN kleuren aan uit best_colors lijst
- Leg uit WAAROM kleur flatteert (undertone/seasonal match)
- Vermijd altijd de avoid_colors

Voorbeeld:
"Camel chino (past perfect bij je warme undertone!)
 Olijfgroen shirt (autumn palette match)
 Cream sneakers (flatteert je skin tone)"
` : 'Geen kleurenanalyse - gebruik algemene richtlijnen'}
```

---

## Cost Calculation

**Per user:**
- Photo storage: ~1MB = €0.00002 (negligible)
- OpenAI Vision API: ~€0.01 per analysis
- **Total: ~€0.01 per user**

**100 users:**
- Total cost: €1
- Revenue (if premium €10/mo): €1000
- **ROI: 1000x** (worth it!)

---

## Privacy & Data Handling

**Storage:**
- Photos stored in private Supabase bucket
- Only user can access their own photo (RLS)
- Photo URL in database, actual file in Storage

**Deletion:**
- User can delete photo anytime
- Cascade delete: photo deleted → analysis removed
- GDPR compliant

**Analysis:**
- Stored as JSONB in database
- No PII in analysis (just colors)
- Can be regenerated if photo still exists

---

## Testing Plan

### Manual Testing

1. **Upload flow:**
   ```
   - Navigate to quiz step 4
   - Upload selfie
   - See upload progress
   - See analysis in progress
   - See results displayed
   ```

2. **Storage verification:**
   ```sql
   SELECT photo_url, color_analysis->>'undertone', color_analysis->>'seasonal_type'
   FROM style_profiles
   WHERE user_id = 'test-user-id';
   ```

3. **Nova integration:**
   ```
   - Complete quiz with photo
   - Open Nova
   - Ask: "Welke kleur shirt past bij mij?"
   - Verify: Nova mentions YOUR specific best colors
   ```

### Edge Cases

- Large file (>5MB) → Show error
- Invalid file type → Show error
- Network failure during upload → Retry option
- OpenAI API failure → Graceful fallback (continue without analysis)
- User skips photo → Quiz completes normally

---

## Deployment Checklist

### Pre-deployment:

- [ ] Create Supabase Storage bucket "user-photos"
- [ ] Set up RLS policies on storage bucket
- [ ] Test photo upload locally
- [ ] Test OpenAI Vision API locally
- [ ] Verify cost limits in OpenAI dashboard

### Deployment:

- [ ] Deploy database migration (already done!)
- [ ] Deploy Edge Function: analyze-color
- [ ] Deploy frontend with PhotoUpload component
- [ ] Add quiz step with photo upload
- [ ] Update Nova context fetching

### Post-deployment:

- [ ] Test complete flow on production
- [ ] Monitor OpenAI API costs
- [ ] Monitor error rates
- [ ] Collect user feedback

---

## Next Steps

**Immediate (Phase 2A - Core Feature):**
1. Create Supabase Storage bucket
2. Implement PhotoUpload component
3. Implement analyze-color Edge Function
4. Add to quiz flow
5. Test & deploy

**Future (Phase 2B - Enhancements):**
- Show color palette visually in dashboard
- Allow re-analysis (update photo)
- Filter products by personal colors
- "Why this color?" explanations in results
- A/B test: with photo vs without → conversion impact

---

## Status Summary

| Task | Status | Notes |
|------|--------|-------|
| All quiz data to Nova | ✅ DONE | Base colors, brands, full quiz JSON |
| Database schema | ✅ DONE | photo_url + color_analysis columns |
| Storage bucket | ⏳ TODO | Create in Supabase Dashboard |
| PhotoUpload component | ⏳ TODO | React component for quiz |
| analyze-color function | ⏳ TODO | Edge Function with OpenAI Vision |
| Quiz integration | ⏳ TODO | Add photo step to quiz flow |
| Nova color matching | ⏳ TODO | Use analysis in recommendations |

**Current Phase:** Phase 1 complete! Ready for Phase 2 when you are.

**Estimated effort for Phase 2:**
- Storage setup: 15 min
- PhotoUpload component: 2 hours
- analyze-color function: 1 hour
- Quiz integration: 30 min
- Testing: 1 hour
- **Total: ~5 hours**

Wil je dat ik Phase 2 ga implementeren? 🚀
