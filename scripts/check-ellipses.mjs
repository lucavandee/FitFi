/**
 * Ellipses guard - blokkeert letterlijke "..." in source files
 * Draait als onderdeel van build pipeline
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SRC_DIRS = ['src', 'netlify', 'functions'].map(p => path.join(ROOT, p))
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'])

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (EXTS.has(path.extname(p))) out.push(p)
  }
  return out
}

const files = SRC_DIRS.flatMap(d => walk(d))
const errors = []

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8')
  
  // Check for literal ellipses (not in comments or strings)
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip comments and strings (basic check)
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
    
    // Look for standalone ellipses
    if (/(?:^|[^.])\.\.\.(?:[^.]|$)/.test(line) && !/\/\*.*\.\.\.*\*\//.test(line)) {
      // Allow spread operator patterns
      if (!/\.\.\.\w/.test(line)) {
        errors.push(`${file}:${i + 1} - Found literal ellipses`)
      }
    }
  }
}

if (errors.length) {
  console.error('⛔ Ellipses check failed:')
  errors.forEach(err => console.error(`  ${err}`))
  process.exit(1)
} else {
  console.log('✅ No literal ellipses found')
}