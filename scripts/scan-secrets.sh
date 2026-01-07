#!/bin/bash
# FitFi Secret Scanner
# Scans codebase for accidentally committed secrets

set -e

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "🔒 FitFi Secret Scanner"
echo "======================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

VIOLATIONS=0

# Check 1: Supabase service_role key in src/
echo "📋 Checking for Supabase service_role key in src/..."
if grep -r "SUPABASE_SERVICE_ROLE\|SERVICE_ROLE_KEY" src/ 2>/dev/null | grep -v "node_modules" | grep -v ".test." | grep -v ".spec."; then
  echo -e "${RED}❌ CRITICAL: Supabase service_role key reference found in client code!${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo -e "${GREEN}✅ No service_role key references in src/${NC}"
fi
echo ""

# Check 2: OpenAI API keys in src/
echo "📋 Checking for OpenAI API keys in src/..."
# Only flag actual API key values (sk-proj-, sk-...) or suspicious assignments
# Exclude documentation strings like "Zet OPENAI_API_KEY in..."
if grep -r "sk-proj-\|sk-[a-zA-Z0-9]\{48\}" src/ 2>/dev/null | grep -v "node_modules" | grep -v ".test." | grep -v ".spec."; then
  echo -e "${RED}❌ CRITICAL: Actual OpenAI API key VALUE found in client code!${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  # Check for suspicious assignments (OPENAI_API_KEY = '...')  but not documentation strings
  if grep -r "OPENAI_API_KEY.*=.*['\"]" src/ 2>/dev/null | grep -v "node_modules" | grep -v ".test." | grep -v ".spec." | grep -v "Zet OPENAI_API_KEY" | grep -v "content ="; then
    echo -e "${RED}❌ CRITICAL: OpenAI API key assignment found in client code!${NC}"
    VIOLATIONS=$((VIOLATIONS + 1))
  else
    echo -e "${GREEN}✅ No OpenAI API keys in src/ (documentation strings OK)${NC}"
  fi
fi
echo ""

# Check 3: Stripe secret keys in src/
echo "📋 Checking for Stripe secret keys in src/..."
# Exclude documentation references AND error message checks
if grep -r "STRIPE_SECRET_KEY\|STRIPE_WEBHOOK_SECRET" src/ 2>/dev/null | grep -v "node_modules" | grep -v "Secret name:" | grep -v ".test." | grep -v ".spec." | grep -v "includes.*STRIPE" | grep -v "errorMsg"; then
  echo -e "${RED}❌ CRITICAL: Stripe secret key found in client code!${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo -e "${GREEN}✅ No Stripe secret keys in src/${NC}"
fi
echo ""

# Check 4: .env files in git
echo "📋 Checking for .env files in version control..."
if git ls-files | grep -E "\.env$|\.env\.local$|\.env\.production$" 2>/dev/null; then
  echo -e "${RED}❌ CRITICAL: .env files tracked in git!${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo -e "${GREEN}✅ No .env files in version control${NC}"
fi
echo ""

# Check 5: Hardcoded JWT tokens
echo "📋 Checking for hardcoded JWT tokens..."
if grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" src/ 2>/dev/null | grep -v "node_modules"; then
  echo -e "${RED}❌ WARNING: Hardcoded JWT token found!${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo -e "${GREEN}✅ No hardcoded JWT tokens${NC}"
fi
echo ""

# Check 6: Build output (if exists)
if [ -d "dist" ]; then
  echo "📋 Checking build output for leaked secrets..."
  SECRETS_IN_BUILD=0

  # Check for service_role in build
  if grep -r "service.role\|SERVICE_ROLE_KEY" dist/ 2>/dev/null | grep -v "node_modules"; then
    echo -e "${RED}❌ CRITICAL: service_role key in build output!${NC}"
    SECRETS_IN_BUILD=1
  fi

  # Check for OpenAI keys in build
  if grep -r "OPENAI_API_KEY\|sk-proj-" dist/ 2>/dev/null | grep -v "node_modules"; then
    echo -e "${RED}❌ CRITICAL: OpenAI key in build output!${NC}"
    SECRETS_IN_BUILD=1
  fi

  # Check for Stripe keys in build (actual values, not error message strings)
  # Look for patterns like: "sk_test_" or actual API key formats
  if grep -r "sk_test_\|sk_live_\|whsec_" dist/ 2>/dev/null | grep -v "node_modules"; then
    echo -e "${RED}❌ CRITICAL: Stripe secret VALUE in build output!${NC}"
    SECRETS_IN_BUILD=1
  else
    # The string "STRIPE_SECRET_KEY" in error messages is fine
    echo -e "${GREEN}✅ No Stripe secret values in dist/ (error message strings OK)${NC}"
  fi

  if [ $SECRETS_IN_BUILD -eq 0 ]; then
    echo -e "${GREEN}✅ No secrets found in dist/${NC}"
  else
    VIOLATIONS=$((VIOLATIONS + SECRETS_IN_BUILD))
  fi
else
  echo -e "${YELLOW}⚠️  dist/ not found (run 'npm run build' first)${NC}"
fi
echo ""

# Check 7: VITE_ prefix check (secrets should NOT have VITE_ prefix)
echo "📋 Checking for dangerous VITE_ prefixes..."
if grep -r "VITE_.*SERVICE_ROLE\|VITE_.*OPENAI\|VITE_.*STRIPE_SECRET" .env.example src/ 2>/dev/null; then
  echo -e "${RED}❌ CRITICAL: Secret has VITE_ prefix (will be exposed to client)!${NC}"
  VIOLATIONS=$((VIOLATIONS + 1))
else
  echo -e "${GREEN}✅ No secrets with VITE_ prefix${NC}"
fi
echo ""

# Summary
echo "======================="
if [ $VIOLATIONS -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed! No secrets found.${NC}"
  exit 0
else
  echo -e "${RED}❌ Found $VIOLATIONS security violation(s)${NC}"
  echo ""
  echo "IMMEDIATE ACTIONS REQUIRED:"
  echo "1. Remove the exposed secrets from the code"
  echo "2. Rotate all compromised keys immediately"
  echo "3. Review git history: git log -p -S 'secret_pattern'"
  echo "4. If committed to public repo, treat as fully compromised"
  echo ""
  exit 1
fi
