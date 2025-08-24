#!/usr/bin/env bash
set -euo pipefail

# Build outputs & caches
rm -rf dist .next .nuxt .svelte-kit .output .vercel .netlify/functions-zip
rm -rf .turbo .parcel-cache .cache .vite .rollup.cache .rpt2_cache .esbuild

# Package managers & temp stores
rm -rf .pnpm-store .yarn/cache .yarn/unplugged .npm _tmp tmp temp .tmp

# Test reports & recordings
rm -rf coverage test-results junit.xml
rm -rf playwright-report playwright/.cache
rm -rf cypress/videos cypress/screenshots

# Logs & misc
rm -rf logs *.log

# Obvious large binaries not needed in source
find . -type f \( -iname "*.mp4" -o -iname "*.mov" -o -iname "*.avi" -o -iname "*.zip" -o -iname "*.tar" -o -iname "*.tar.gz" -o -iname "*.psd" -o -iname "*.ai" -o -iname "*.sketch" -o -iname "*.fig" \) -not -path "./.git/*" -print -delete || true
