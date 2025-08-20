/* eslint-disable no-console */
import fs from 'fs';
const app = 'src/App.tsx';

function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }

let ok = true;

// (a) ensure no PremiumFooter outside App.tsx
function scan(dir) {
  const out = [];
  if (!exists(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...scan(p));
    else if (/\.(tsx|ts|jsx|js)$/.test(p)) out.push(p);
  }
  return out;
}

const pages = [...scan('src/pages'), ...scan('src/features'), ...scan('src/sections')];
const offenders = [];
for (const f of pages) {
  const s = fs.readFileSync(f, 'utf8');
  if (s.match(/<\s*PremiumFooter\b/)) offenders.push(f);
}
if (offenders.length) {
  ok = false;
  console.error('❌ Page-level PremiumFooter usage found (should be only in App.tsx):');
  offenders.forEach(o => console.error('   -', o));
}

// (b) ensure wildcard route is last
if (exists(app)) {
  const s = fs.readFileSync(app, 'utf8');
  const routes = Array.from(s.matchAll(/<Route\s+path=("[^"]+"|'[^']+')/g)).map(m=>m[1].slice(1,-1));
  const starIndex = routes.lastIndexOf('*');
  if (starIndex !== -1 && starIndex !== routes.length - 1) {
    ok = false;
    console.error('❌ Wildcard 404 route (path="*") is not the last route in src/App.tsx');
  }
}

// (c) ensure AffiliateDisclosureNote has import where used
const adFiles = pages.filter(f => /AffiliateDisclosureNote\b/.test(fs.readFileSync(f, 'utf8')));
for (const f of adFiles) {
  const s = fs.readFileSync(f, 'utf8');
  const hasImport = /from\s+['"]@\/components\/legal\/AffiliateDisclosureNote['"]/.test(s);
  if (!hasImport) {
    ok = false;
    console.error(`❌ Missing import for AffiliateDisclosureNote in ${f}`);
  }
}

if (!ok) {
  console.error('\nPreflight failed. Fix issues above.');
  process.exit(2);
}
console.log('✅ Preflight OK');