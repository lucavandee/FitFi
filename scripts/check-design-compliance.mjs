#!/usr/bin/env node
/**
 * Design System Compliance Checker
 *
 * Scans codebase for design system violations.
 * Run: node scripts/check-design-compliance.mjs
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const projectRoot = process.cwd();
const srcDir = join(projectRoot, 'src');

// Violation tracking
const violations = {
  hardcodedColors: [],
  inconsistentSpacing: [],
  invalidTypography: [],
  incorrectButtonSize: [],
  customShadows: [],
};

let scannedFiles = 0;
let totalViolations = 0;

/**
 * Recursively get all TypeScript/TSX files
 */
function getAllFiles(dir, files = []) {
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, etc.
      if (!['node_modules', 'dist', 'build', '.git'].includes(item)) {
        getAllFiles(fullPath, files);
      }
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Check for hardcoded hex colors
 */
function checkHardcodedColors(content, filePath) {
  const lines = content.split('\n');
  const relativePath = relative(projectRoot, filePath);

  // Patterns to match hardcoded colors
  const hexInClassName = /className=["'][^"']*\[(#[0-9A-Fa-f]{3,8})\]/g;
  const hexInStyle = /style=\{[^}]*color:\s*["']?(#[0-9A-Fa-f]{3,8})["']?/g;
  const bgHex = /bg-\[#[0-9A-Fa-f]{3,8}\]/g;
  const textHex = /text-\[#[0-9A-Fa-f]{3,8}\]/g;
  const borderHex = /border-\[#[0-9A-Fa-f]{3,8}\]/g;

  const patterns = [
    { regex: hexInClassName, type: 'className with hex' },
    { regex: hexInStyle, type: 'style with hex' },
    { regex: bgHex, type: 'bg-[#...]' },
    { regex: textHex, type: 'text-[#...]' },
    { regex: borderHex, type: 'border-[#...]' },
  ];

  for (const { regex, type } of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      // Get line number
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1]?.trim();

      violations.hardcodedColors.push({
        file: relativePath,
        line: lineNumber,
        type,
        code: line,
        match: match[1] || match[0],
      });
      totalViolations++;
    }
  }
}

/**
 * Check for non-8px spacing
 */
function checkInconsistentSpacing(content, filePath) {
  const lines = content.split('\n');
  const relativePath = relative(projectRoot, filePath);

  // Spacing that's NOT 8px multiples
  // Tailwind: 1=4px, 2=8px, 3=12px, 4=16px, 5=20px, 6=24px, 7=28px, 8=32px
  // We want: 2, 4, 6, 8, 10, 12, 16, 20, 24
  // We DON'T want: 1, 3, 5, 7, 9, 11, 13-15, 17-19, etc.
  const badSpacing = /(gap|space|p|m|px|py|mx|my|mt|mb|ml|mr)-(1|3|5|7|9|11|13|14|15|17|18|19|21|22|23)/g;

  let match;
  while ((match = badSpacing.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = lines[lineNumber - 1]?.trim();

    violations.inconsistentSpacing.push({
      file: relativePath,
      line: lineNumber,
      type: 'Non-8px spacing',
      code: line,
      match: match[0],
    });
    totalViolations++;
  }
}

/**
 * Check for invalid typography sizes
 */
function checkInvalidTypography(content, filePath) {
  const lines = content.split('\n');
  const relativePath = relative(projectRoot, filePath);

  // Random font sizes (not in our scale)
  // Valid: text-xs, text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl, text-4xl, text-5xl
  // Invalid: text-[17px], text-[1.3rem], etc.
  const customFontSize = /text-\[(?!var\()([\d.]+)(px|rem|em)\]/g;

  let match;
  while ((match = customFontSize.exec(content)) !== null) {
    const size = match[1];
    const unit = match[2];

    // Check if it's in our scale
    // Our scale in px: 12, 14, 16, 18, 20, 24, 32, 40, 56
    // Our scale in rem: 0.75, 0.875, 1, 1.125, 1.25, 1.5, 2, 2.5, 3.5
    const validPx = ['12', '14', '16', '18', '20', '24', '32', '40', '56'];
    const validRem = ['0.75', '0.875', '1', '1.125', '1.25', '1.5', '2', '2.5', '3.5'];

    const isValid = (unit === 'px' && validPx.includes(size)) ||
                    (unit === 'rem' && validRem.includes(size));

    if (!isValid) {
      const lineNumber = content.substring(0, match.index).split('\n').length;
      const line = lines[lineNumber - 1]?.trim();

      violations.invalidTypography.push({
        file: relativePath,
        line: lineNumber,
        type: 'Invalid font size',
        code: line,
        match: match[0],
      });
      totalViolations++;
    }
  }
}

/**
 * Check for incorrect button sizes
 */
function checkIncorrectButtonSize(content, filePath) {
  const lines = content.split('\n');
  const relativePath = relative(projectRoot, filePath);

  // Buttons should have min-h-[48px] or min-h-[44px]
  // Check for other heights
  const buttonHeights = /(<button|<Button)[^>]*min-h-\[(?!48px|44px)(\d+px)\]/g;

  let match;
  while ((match = buttonHeights.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = lines[lineNumber - 1]?.trim();

    violations.incorrectButtonSize.push({
      file: relativePath,
      line: lineNumber,
      type: 'Incorrect button height',
      code: line,
      match: match[2],
    });
    totalViolations++;
  }
}

/**
 * Check for custom shadows
 */
function checkCustomShadows(content, filePath) {
  const lines = content.split('\n');
  const relativePath = relative(projectRoot, filePath);

  // Custom shadows (not using our tokens)
  const customShadow = /shadow-(?!none|soft|ring|\[var\()[a-z]+/g;

  let match;
  while ((match = customShadow.exec(content)) !== null) {
    const lineNumber = content.substring(0, match.index).split('\n').length;
    const line = lines[lineNumber - 1]?.trim();

    violations.customShadows.push({
      file: relativePath,
      line: lineNumber,
      type: 'Custom shadow (not token)',
      code: line,
      match: match[0],
    });
    totalViolations++;
  }
}

/**
 * Scan a single file
 */
function scanFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    scannedFiles++;

    checkHardcodedColors(content, filePath);
    checkInconsistentSpacing(content, filePath);
    checkInvalidTypography(content, filePath);
    checkIncorrectButtonSize(content, filePath);
    checkCustomShadows(content, filePath);
  } catch (err) {
    console.error(`Error scanning ${filePath}:`, err.message);
  }
}

/**
 * Print results
 */
function printResults() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║         FITFI DESIGN SYSTEM COMPLIANCE REPORT                 ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log(`📁 Scanned Files: ${scannedFiles}`);
  console.log(`🚨 Total Violations: ${totalViolations}\n`);

  // Print each category
  const categories = [
    { name: 'Hardcoded Colors', violations: violations.hardcodedColors, emoji: '🎨' },
    { name: 'Inconsistent Spacing', violations: violations.inconsistentSpacing, emoji: '📐' },
    { name: 'Invalid Typography', violations: violations.invalidTypography, emoji: '📝' },
    { name: 'Incorrect Button Size', violations: violations.incorrectButtonSize, emoji: '🔘' },
    { name: 'Custom Shadows', violations: violations.customShadows, emoji: '🌟' },
  ];

  for (const { name, violations: items, emoji } of categories) {
    if (items.length === 0) {
      console.log(`${emoji} ${name}: ✅ No violations`);
    } else {
      console.log(`\n${emoji} ${name}: ❌ ${items.length} violations`);

      // Group by file
      const byFile = {};
      for (const item of items) {
        if (!byFile[item.file]) byFile[item.file] = [];
        byFile[item.file].push(item);
      }

      // Print top 5 files
      const files = Object.keys(byFile).slice(0, 5);
      for (const file of files) {
        console.log(`  📄 ${file}`);
        const fileViolations = byFile[file].slice(0, 3);
        for (const v of fileViolations) {
          console.log(`     Line ${v.line}: ${v.match}`);
        }
        if (byFile[file].length > 3) {
          console.log(`     ... and ${byFile[file].length - 3} more`);
        }
      }

      if (Object.keys(byFile).length > 5) {
        console.log(`  ... and ${Object.keys(byFile).length - 5} more files`);
      }
    }
  }

  // Compliance score
  const maxViolations = 500; // Threshold for 0%
  const score = Math.max(0, Math.min(100, Math.round((1 - totalViolations / maxViolations) * 100)));

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log(`║  COMPLIANCE SCORE: ${score}%`.padEnd(64) + '║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  if (score < 70) {
    console.log('🚨 CRITICAL: Design consistency is below acceptable threshold.');
    console.log('   Action required: Fix violations before shipping.\n');
  } else if (score < 90) {
    console.log('⚠️  WARNING: Design consistency needs improvement.');
    console.log('   Action: Address violations in next sprint.\n');
  } else {
    console.log('✅ GOOD: Design system is mostly consistent.');
    console.log('   Keep it up!\n');
  }

  // Exit code
  if (score < 70) {
    process.exit(1); // Fail CI if score is too low
  }
}

/**
 * Main
 */
function main() {
  console.log('🔍 Scanning codebase for design system violations...\n');

  const files = getAllFiles(srcDir);

  for (const file of files) {
    scanFile(file);
  }

  printResults();
}

main();
