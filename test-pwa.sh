#!/bin/bash

echo "🧪 Testing PWA Push Notification Setup..."
echo ""

# Check if VAPID key is set
if grep -q "VITE_VAPID_PUBLIC_KEY=BA" .env; then
  echo "✅ VAPID public key found in .env"
else
  echo "❌ VAPID public key NOT found in .env"
  echo "   Run: npx web-push generate-vapid-keys"
  exit 1
fi

# Check Service Worker
if [ -f "public/sw.js" ]; then
  echo "✅ Service Worker exists"

  if grep -q "addEventListener('push'" public/sw.js; then
    echo "✅ Push event handler found"
  else
    echo "❌ Push event handler NOT found"
  fi

  if grep -q "addEventListener('notificationclick'" public/sw.js; then
    echo "✅ Notification click handler found"
  else
    echo "❌ Notification click handler NOT found"
  fi
else
  echo "❌ Service Worker NOT found"
fi

echo ""

# Check database migration
if [ -f "supabase/migrations/20251110130000_create_push_notifications.sql" ]; then
  echo "✅ Database migration exists"
else
  echo "❌ Database migration NOT found"
fi

echo ""

# Check Admin Dashboard
if [ -f "src/pages/AdminPWADashboard.tsx" ]; then
  echo "✅ Admin PWA Dashboard exists"
else
  echo "❌ Admin PWA Dashboard NOT found"
fi

echo ""

# Check Push Service
if [ -f "src/services/pwa/pushNotificationService.ts" ]; then
  echo "✅ Push Notification Service exists"
else
  echo "❌ Push Notification Service NOT found"
fi

echo ""
echo "================================="
echo "🎯 QUICK TEST INSTRUCTIONS:"
echo "================================="
echo ""
echo "1. Start dev server:"
echo "   npm run dev"
echo ""
echo "2. Open http://localhost:5173"
echo "   → Check console for PWA Health Check (after 2s)"
echo ""
echo "3. Login and go to: http://localhost:5173/admin/pwa"
echo "   → Send test notification"
echo ""
echo "4. Accept notification permission when asked"
echo ""
echo "5. Verify notification appears!"
echo ""
echo "================================="
