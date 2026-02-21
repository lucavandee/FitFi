#!/usr/bin/env node
// Script to replace hex colors with CSS tokens
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const replacements = [
  { hex: '#89CFF0', token: 'var(--ff-color-primary-500)' },
  { hex: '#5FB7E6', token: 'var(--ff-color-primary-600)' },
  { hex: '#0D1B2A', token: 'var(--color-text)' },
  { hex: '#ECF7FF', token: 'var(--ff-color-primary-50)' },
  { hex: '#6b21a8', token: 'var(--ff-color-primary-700)' },
  { hex: '#FFFFFF', token: 'white' },
  { hex: '#fff', token: 'white' },
];

const filesToFix = [
  'src/components/Tribes/ChallengeDetail.tsx',
  'src/components/Tribes/ChallengeAdminForm.tsx',
  'src/components/Tribes/SubmissionsList.tsx',
  'src/components/admin/PremiumMetricCard.tsx',
  'src/components/admin/TierDistributionChart.tsx',
  'src/components/ai/ContextSwitcher.tsx',
  'src/components/ai/EmptyNova.tsx',
  'src/components/ai/NovaChat.tsx',
  'src/components/ai/OutfitCards.tsx',
  'src/components/ai/TypingSkeleton.tsx',
  'src/components/ai/markdown.ts',
  'src/components/analytics/AnalyticsDashboard.tsx',
  'src/components/analytics/FunnelVisualizer.tsx',
  'src/components/auth/NovaLoginPrompt.tsx',
  'src/components/dashboard/PremiumGamificationPanel.tsx',
  'src/components/gamification/ChallengeHub.tsx',
  'src/components/gamification/GamificationDashboard.tsx',
  'src/components/gamification/Leaderboard.tsx',
  'src/components/gamification/LevelProgress.tsx',
  'src/components/landing/PreviewCarousel.tsx',
  'src/components/landing/StickyCTA.tsx',
  'src/components/landing/StyleReportPreview.tsx',
  'src/components/landing/UGCGallery.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/legal/AffiliateDisclosureNote.tsx',
];

async function fixFile(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  try {
    let content = await fs.readFile(fullPath, 'utf8');
    let changed = false;

    for (const { hex, token } of replacements) {
      const regex = new RegExp(hex, 'gi');
      if (regex.test(content)) {
        content = content.replace(regex, token);
        changed = true;
      }
    }

    if (changed) {
      await fs.writeFile(fullPath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fixing hex colors in components...\n');

  let fixed = 0;
  for (const file of filesToFix) {
    if (await fixFile(file)) {
      fixed++;
    }
  }

  console.log(`\n✅ Fixed ${fixed}/${filesToFix.length} files`);
}

main();
