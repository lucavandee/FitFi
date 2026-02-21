#!/usr/bin/env node
// Third pass: remaining common colors
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

const replacements = [
  { hex: '#89CFF0', token: 'var(--ff-color-primary-500)' },
  { hex: '#0D1B2A', token: 'var(--color-text)' },
  { hex: '#ECF7FF', token: 'var(--ff-color-primary-50)' },
  { hex: '#2B6AF3', token: 'var(--ff-color-primary-600)' },
  { hex: '#fff', token: 'white' },
  { hex: '#FFF', token: 'white' },
  { hex: '#000', token: 'black' },
  { hex: '#FFFFFF', token: 'white' },
  { hex: '#000000', token: 'black' },
];

const filesToFix = [
  'src/components/quiz/AchievementNotification.tsx',
  'src/components/quiz/SocialShareModal.tsx',
  'src/components/tribes/JoinButton.tsx',
  'src/components/tribes/PostComposer.tsx',
  'src/components/tribes/PostsList.tsx',
  'src/components/ui/GradientWord.tsx',
  'src/components/ui/MarkdownPage.tsx',
  'src/components/ui/ToastXp.tsx',
  'src/components/nova/ProductRail.tsx',
  'src/components/shop/ProductRail.tsx',
  'src/components/results/ColorSwatchWithLabel.tsx',
];

async function fixFile(filePath) {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  try {
    let content = await fs.readFile(fullPath, 'utf8');
    let changed = false;

    for (const { hex, token } of replacements) {
      const regex = new RegExp(hex, 'g');
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
  console.log('🔧 Fixing remaining common colors (pass 3)...\n');

  let fixed = 0;
  for (const file of filesToFix) {
    if (await fixFile(file)) {
      fixed++;
    }
  }

  console.log(`\n✅ Fixed ${fixed}/${filesToFix.length} files`);
}

main();
