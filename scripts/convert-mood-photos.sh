#!/bin/bash

# Batch Convert Mood Photos to WebP
# This script calls the Edge Function to convert all existing JPEG/PNG mood photos to WebP

echo "🔄 Starting batch WebP conversion..."
echo ""

# Get Supabase credentials from .env
SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
SUPABASE_ANON_KEY=$(grep VITE_SUPABASE_ANON_KEY .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ Error: Could not find Supabase credentials in .env"
  exit 1
fi

echo "📡 Calling Edge Function..."
echo "URL: $SUPABASE_URL/functions/v1/batch-convert-mood-photos"
echo ""

# Call the Edge Function
RESPONSE=$(curl -s -X POST \
  "$SUPABASE_URL/functions/v1/batch-convert-mood-photos" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json")

echo "📊 Response:"
echo "$RESPONSE" | jq '.'

echo ""
echo "✅ Batch conversion complete!"
echo ""
echo "Check Supabase Dashboard for detailed logs:"
echo "→ Edge Functions → batch-convert-mood-photos → Logs"
