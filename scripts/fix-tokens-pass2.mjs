#!/usr/bin/env node
// Second pass: brand-specific colors
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// These colors are FitFi brand colors that should use our warm beige palette
const replacements = [
  { hex: '#bfae9f', token: 'var(--ff-color-beige-400)' },
  { hex: '#F5F1ED', token: 'var(--ff-color-beige-100)' },
  { hex: '#E5DED5', token: 'var(--ff-color-beige-200)' },
  { hex: '#7A614A', token: 'var(--ff-color-beige-700)' },
  { hex: '#2C3E50', token: 'var(--color-text)' },
  { hex: '#F5F0E8', token: 'var(--ff-color-beige-50)' },
  { hex: '#A6886A', token: 'var(--ff-color-beige-500)' },
  { hex: '#D8CABA', token: 'var(--ff-color-beige-300)' },
  { hex: '#0077B5', token: 'var(--ff-color-primary-600)' }, // LinkedIn blue -> primary
];

const filesToFix = [
  'src/components/landing/StyleReportPreview.tsx',
  'src/components/quiz/CompletionCelebration.tsx',
  'src/components/landing/PreviewCarousel.tsx',
  'src/components/landing/UGCGallery.tsx',
  'src/components/quiz/ProgressMotivation.tsx',
  'src/components/quiz/StyleDNAVisualizer.tsx',
  'src/components/quiz/StylePreview.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/ui/SmartImage.tsx',
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
        console.log(`  → Replaced ${hex} with ${token}`);
      }
    }

    if (changed) {
      await fs.writeFile(fullPath, content, 'utf8');
      console.log(`✓ Fixed: ${filePath}\n`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🎨 Fixing brand colors (pass 2)...\n');

  let fixed = 0;
  for (const file of filesToFix) {
    if (await fixFile(file)) {
      fixed++;
    }
  }

  console.log(`\n✅ Fixed ${fixed}/${filesToFix.length} files`);
}

main();
