#!/bin/bash

# FitFi.ai Deployment Verification Script
# Usage: ./scripts/verify-deployment.sh https://fitfi.ai

set -e

DEPLOYMENT_URL="${1:-https://fitfi.ai}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Verifying deployment: $DEPLOYMENT_URL"
echo ""

# Function to check HTTP status
check_url() {
  local url=$1
  local expected=${2:-200}
  local name=$3

  echo -n "Checking $name... "

  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" -L --max-time 10)

  if [ "$status" -eq "$expected" ]; then
    echo -e "${GREEN}✓${NC} (HTTP $status)"
    return 0
  else
    echo -e "${RED}✗${NC} (HTTP $status, expected $expected)"
    return 1
  fi
}

# Track results
FAILED=0

echo "📄 Testing Public Pages..."
check_url "$DEPLOYMENT_URL/" 200 "Homepage" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/prijzen" 200 "Pricing" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/over-ons" 200 "About" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/contact" 200 "Contact" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/veelgestelde-vragen" 200 "FAQ" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/hoe-het-werkt" 200 "How It Works" || FAILED=$((FAILED + 1))
echo ""

echo "🔒 Testing Auth Pages..."
check_url "$DEPLOYMENT_URL/inloggen" 200 "Login" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/registreren" 200 "Register" || FAILED=$((FAILED + 1))
echo ""

echo "📋 Testing Legal Pages..."
check_url "$DEPLOYMENT_URL/algemene-voorwaarden" 200 "Terms" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/privacy" 200 "Privacy" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/cookies" 200 "Cookies" || FAILED=$((FAILED + 1))
echo ""

echo "🎯 Testing Preview Pages..."
check_url "$DEPLOYMENT_URL/results/preview" 200 "Results Preview" || FAILED=$((FAILED + 1))
echo ""

echo "❌ Testing 404 Handling..."
check_url "$DEPLOYMENT_URL/this-does-not-exist-xyz" 404 "404 Page" || FAILED=$((FAILED + 1))
echo ""

echo "🔧 Testing Static Assets..."
check_url "$DEPLOYMENT_URL/manifest.json" 200 "PWA Manifest" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/robots.txt" 200 "Robots.txt" || FAILED=$((FAILED + 1))
check_url "$DEPLOYMENT_URL/sitemap.xml" 200 "Sitemap" || FAILED=$((FAILED + 1))
echo ""

echo "⚡ Testing Performance..."
echo -n "Measuring homepage load time... "
load_time=$(curl -o /dev/null -s -w '%{time_total}' "$DEPLOYMENT_URL/" | awk '{printf "%.2f", $1}')
echo "${load_time}s"

if (( $(echo "$load_time < 3.0" | bc -l) )); then
  echo -e "${GREEN}✓${NC} Load time acceptable (<3s)"
else
  echo -e "${YELLOW}⚠${NC} Load time high (>3s)"
  FAILED=$((FAILED + 1))
fi
echo ""

echo "🔍 Testing Headers..."
echo -n "Checking security headers... "
headers=$(curl -sI "$DEPLOYMENT_URL/")

if echo "$headers" | grep -q "x-frame-options"; then
  echo -e "${GREEN}✓${NC} X-Frame-Options present"
else
  echo -e "${YELLOW}⚠${NC} X-Frame-Options missing"
fi

if echo "$headers" | grep -q "content-security-policy"; then
  echo -e "${GREEN}✓${NC} CSP present"
else
  echo -e "${YELLOW}⚠${NC} CSP missing"
fi
echo ""

# Summary
echo "═══════════════════════════════════════"
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo ""
  echo "🚀 Deployment is healthy and ready."
  exit 0
else
  echo -e "${RED}✗ $FAILED checks failed${NC}"
  echo ""
  echo "⚠️  Please review failed checks before going live."
  exit 1
fi
