#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_DIR = process.argv.find(arg => !arg.startsWith('--')) || 'src';

let filesScanned = 0;
let filesModified = 0;
let logsReplaced = 0;

function getAllTsFiles(dir, files = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!entry.includes('node_modules') && !entry.startsWith('.')) {
        getAllTsFiles(fullPath, files);
      }
    } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }

  return files;
}

function inferScope(filePath) {
  const parts = filePath.split('/');
  const filename = parts[parts.length - 1].replace(/\.(ts|tsx)$/, '');

  if (parts.includes('services')) return filename;
  if (parts.includes('hooks')) return `hook:${filename}`;
  if (parts.includes('components')) return `component:${filename}`;
  if (parts.includes('pages')) return `page:${filename}`;
  if (parts.includes('utils')) return `util:${filename}`;
  if (parts.includes('engine')) return `engine:${filename}`;

  return filename;
}

function processFile(filePath) {
  filesScanned++;
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;

  const scope = inferScope(filePath);
  let modified = false;
  let localCount = 0;

  const patterns = [
    {
      regex: /console\.log\s*\((.*?)\);?/g,
      replacement: (match, args) => {
        localCount++;
        const cleanArgs = args.trim();
        if (cleanArgs.startsWith('"') || cleanArgs.startsWith("'") || cleanArgs.startsWith('`')) {
          return `logger.debug('${scope}', ${cleanArgs});`;
        }
        return `logger.debug('${scope}', 'Log', { data: ${cleanArgs} });`;
      }
    },
    {
      regex: /console\.error\s*\((.*?)\);?/g,
      replacement: (match, args) => {
        localCount++;
        return `logger.error('${scope}', 'Error', ${args});`;
      }
    },
    {
      regex: /console\.warn\s*\((.*?)\);?/g,
      replacement: (match, args) => {
        localCount++;
        return `logger.warn('${scope}', ${args});`;
      }
    },
    {
      regex: /console\.info\s*\((.*?)\);?/g,
      replacement: (match, args) => {
        localCount++;
        return `logger.info('${scope}', ${args});`;
      }
    }
  ];

  for (const pattern of patterns) {
    if (pattern.regex.test(content)) {
      content = content.replace(pattern.regex, pattern.replacement);
      modified = true;
    }
  }

  if (modified && !content.includes("import { logger }")) {
    const importStatement = "import { logger } from '@/utils/logger';\n";

    const firstImportMatch = content.match(/^import\s/m);
    if (firstImportMatch) {
      const insertPos = content.indexOf(firstImportMatch[0]);
      content = content.slice(0, insertPos) + importStatement + content.slice(insertPos);
    } else {
      content = importStatement + '\n' + content;
    }
  }

  if (modified && !DRY_RUN) {
    writeFileSync(filePath, content, 'utf-8');
    filesModified++;
    logsReplaced += localCount;
    console.log(`✓ ${filePath} (${localCount} logs replaced)`);
  } else if (modified && DRY_RUN) {
    console.log(`[DRY RUN] Would modify: ${filePath} (${localCount} logs)`);
    filesModified++;
    logsReplaced += localCount;
  }
}

console.log(`\n🔍 Scanning ${TARGET_DIR} for console.* statements...\n`);

const files = getAllTsFiles(TARGET_DIR);

for (const file of files) {
  try {
    processFile(file);
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files scanned: ${filesScanned}`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Logs replaced: ${logsReplaced}`);

if (DRY_RUN) {
  console.log(`\n💡 This was a dry run. Run without --dry-run to apply changes.\n`);
} else {
  console.log(`\n✅ Console logs have been replaced with logger calls.\n`);
}
