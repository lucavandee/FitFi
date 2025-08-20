/* eslint-disable no-console */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const GLOBS = [
  'src/pages',
  'src/features',
  'src/sections',
];

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (/\.(tsx|ts|jsx|js)$/.test(p)) out.push(p);
  }
  return out;
}

const premiumImportRe = /(import\s+[^;]*?from\s+['"]@\/components\/layout\/PremiumFooter['"];?\s*\n)/g;
const premiumAnyImportRe = /(import\s+[^;]*?PremiumFooter[^;]*?from\s+['"][^'"]*PremiumFooter[^'"]*['"];?\s*\n)/g;
const premiumJsxSelf = /<PremiumFooter(\s[^>]*)?\/>\s*\n?/g;
const premiumJsxOpenClose = /<PremiumFooter(\s[^>]*)?>[\s\S]*?<\/PremiumFooter>\s*\n?/g;

let changed = 0;
for (const root of GLOBS) {
  for (const file of walk(path.join(ROOT, root))) {
    // skip App.tsx — it must keep the single footer
    if (file.replace(/\\/g,'/').endsWith('src/App.tsx')) continue;

    let src = fs.readFileSync(file, 'utf8');
    const before = src;

    // Remove imports of PremiumFooter (any path)
    src = src.replace(premiumImportRe, '');
    src = src.replace(premiumAnyImportRe, '');

    // Remove JSX usages (self-closing or wrapped)
    src = src.replace(premiumJsxOpenClose, '');
    src = src.replace(premiumJsxSelf, '');

    if (src !== before) {
      await fsp.writeFile(file, src, 'utf8');
      console.log('Cleaned page-level footer in', path.relative(ROOT, file));
      changed++;
    }
  }
}
console.log(`Done: cleaned ${changed} file(s).`);