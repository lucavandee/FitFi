/* eslint-disable no-console */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');
const QUAR = path.join(ROOT, '.quarantine');
const TS_EXTS = ['.tsx', '.ts', '.jsx', '.js'];
const ENTRY_CANDIDATES = [
  'src/main.tsx',
  'src/main.ts',
  'src/App.tsx',
];
const ALWAYS_KEEP = new Set([
  'src/App.tsx',
  'src/main.tsx',
  'src/main.ts',
  'src/vite-env.d.ts',
]);

// Alias resolver for '@/...' → 'src/...'
function resolveAlias(p) {
  if (p.startsWith('@/')) return path.join(ROOT, 'src', p.slice(2));
  return null;
}

// Try resolve an import path to an existing file
function tryResolve(fromFile, imp) {
  // external dep?
  if (!imp.startsWith('.') && !imp.startsWith('@/')) return null;

  let base;
  if (imp.startsWith('@/')) base = resolveAlias(imp);
  else base = path.resolve(path.dirname(fromFile), imp);

  const candidates = [];
  // exact provided (with ext)
  candidates.push(base);
  // add extensions
  for (const ext of TS_EXTS) candidates.push(base + ext);
  // index files
  for (const ext of TS_EXTS) candidates.push(path.join(base, 'index' + ext));

  for (const c of candidates) {
    try {
      const st = fs.statSync(c);
      if (st.isFile()) return c;
    } catch {}
  }
  return null;
}

function listSrcFiles() {
  const out = [];
  function walk(dir) {
    const ents = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        // skip obvious non-runtime dirs
        if (p.includes('/__tests__') || p.includes('/stories/') || p.includes('/.quarantine/')) continue;
        walk(p);
      } else {
        const ext = path.extname(p);
        if (TS_EXTS.includes(ext) || p.endsWith('.d.ts')) out.push(p);
      }
    }
  }
  if (fs.existsSync(SRC)) walk(SRC);
  return out;
}

function parseImports(filePath) {
  let content = '';
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return []; }
  const imps = new Set();

  // import ... from 'x'
  const re1 = /import\s+(?:type\s+)?[^'"]*?from\s+['"]([^'"]+)['"]/g;
  // export ... from 'x'
  const re2 = /export\s+(?:type\s+)?[^'"]*?from\s+['"]([^'"]+)['"]/g;
  // dynamic import('x')
  const re3 = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const re of [re1, re2, re3]) {
    let m;
    while ((m = re.exec(content))) imps.add(m[1]);
  }
  return Array.from(imps);
}

function buildReachability(entryPoints) {
  const reachable = new Set();
  const q = [];

  for (const ep of entryPoints) {
    if (fs.existsSync(ep)) { reachable.add(path.resolve(ep)); q.push(path.resolve(ep)); }
  }

  while (q.length) {
    const cur = q.shift();
    const deps = parseImports(cur);
    for (const d of deps) {
      const resolved = tryResolve(cur, d);
      if (resolved && !reachable.has(resolved)) {
        reachable.add(resolved);
        q.push(resolved);
      }
    }
  }
  return reachable;
}

function run(cmd, args, opts={}) {
  const r = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  return r.status === 0;
}

async function moveToQuarantine(files) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const base = path.join(QUAR, `cleanup-${stamp}`);
  for (const f of files) {
    const src = path.resolve(f);
    const dest = path.join(base, path.relative(ROOT, src));
    await fsp.mkdir(path.dirname(dest), { recursive: true });
    await fsp.rename(src, dest);
  }
  return base;
}

async function moveBackFromQuarantine(base) {
  // Move back exact same files
  const files = [];
  function walk(d) {
    const ents = fs.readdirSync(d, { withFileTypes: true });
    for (const e of ents) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(p);
    }
  }
  if (fs.existsSync(base)) walk(base);
  // reverse order to create dirs first
  for (const qb of files) {
    const rel = path.relative(base, qb);
    const dst = path.join(ROOT, rel);
    await fsp.mkdir(path.dirname(dst), { recursive: true });
    await fsp.rename(qb, dst);
  }
  // cleanup empty dirs
  await fsp.rm(base, { recursive: true, force: true });
}

(async () => {
  console.log('== FitFi safe cleanup: start ==');

  // 1) Collect all src files
  const allFiles = listSrcFiles().map(p => path.resolve(p));

  // 2) Determine entrypoints
  const entry = ENTRY_CANDIDATES.filter(p => fs.existsSync(p)).map(p => path.resolve(p));
  if (entry.length === 0) {
    console.error('No entrypoints found (expected src/main.tsx or src/App.tsx). Aborting.');
    process.exit(1);
  }

  // 3) Reachability graph
  const reachable = buildReachability(entry);

  // 4) Unused candidates = (all - reachable) minus ALWAYS_KEEP and .d.ts
  const unused = allFiles.filter(p => {
    const rel = path.relative(ROOT, p);
    if (ALWAYS_KEEP.has(rel)) return false;
    if (rel.endsWith('.d.ts')) return false;
    return !reachable.has(p);
  });

  if (unused.length === 0) {
    console.log('No unused source files found. Nothing to do.');
    process.exit(0);
  }

  console.log(`Found ${unused.length} unused files:`);
  unused.slice(0, 50).forEach(u => console.log('  -', path.relative(ROOT, u)));
  if (unused.length > 50) console.log(`  ...and ${unused.length - 50} more`);

  // 5) Quarantine them
  const quarantineBase = await moveToQuarantine(unused);
  console.log(`Moved to quarantine: ${path.relative(ROOT, quarantineBase)}`);

  // 6) Typecheck + build
  console.log('Running typecheck/build to verify...');
  const hasTypecheck = fs.existsSync(path.join(ROOT, 'package.json')) && JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'))).scripts?.typecheck;
  const okType = hasTypecheck ? run('npm', ['run', 'typecheck']) : true;
  const okBuild = run('npm', ['run', 'build']);

  if (!okType || !okBuild) {
    console.error('Build/typecheck failed. Restoring quarantined files...');
    await moveBackFromQuarantine(quarantineBase);
    console.error('Restored. Cleanup aborted with no changes.');
    process.exit(2);
  }

  // 7) Commit deletion (quarantine removed as well)
  await fsp.rm(quarantineBase, { recursive: true, force: true });

  // Remove the .quarantine dir if empty
  try { await fsp.rmdir(QUAR); } catch {}

  // Auto-commit if in git repo
  const inGit = run('git', ['rev-parse', '--is-inside-work-tree']);
  if (inGit) {
    run('git', ['add', '-A']);
    run('git', ['commit', '-m', `chore(cleanup): remove ${unused.length} unused source files (safe verified)`]);
    console.log('Committed cleanup.');
  } else {
    console.log('Not a git repo; files have been removed without commit.');
  }

  console.log('== FitFi safe cleanup: done ==');
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  process.exit(1);
});