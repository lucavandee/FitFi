// scripts/doctor.mjs
// FitFi "doctor": snelle, niet-blokkerende checks voor build hygiëne.
// - Waarschuwt bij hard-coded HEX-kleuren buiten src/styles/tokens.css
// - Waarschuwt bij 'fitfi.app' restanten
// - Waarschuwt bij ruwe 'https://fitfi.ai' hardcodes (centraliseren via utils/urls.ts)
// - (Optioneel) voert tsc --noEmit uit als waarschuwing (niet fataal)

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(PROJECT_ROOT, "src");

// ---- helpers ---------------------------------------------------------------

const isTextFile = (p) => {
  const ext = path.extname(p).toLowerCase();
  return [
    ".ts", ".tsx", ".js", ".jsx",
    ".css", ".scss", ".sass",
    ".md", ".mdx", ".html", ".json"
  ].includes(ext);
};

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (/(^|\/)(node_modules|dist|build|.next|.vercel|.netlify|coverage|.turbo|.cache)(\/|$)/.test(full)) continue;
      out.push(...(await walk(full)));
    } else {
      out.push(full);
    }
  }
  return out;
}

function rel(p) { return path.relative(PROJECT_ROOT, p).replaceAll(path.sep, "/"); }

// ---- checks ----------------------------------------------------------------

const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
const TOKENS_ALLOWLIST = new Set([
  "src/styles/tokens.css"
]);

async function checkHexColors() {
  const files = (await walk(SRC_DIR)).filter(isTextFile);
  const offenders = [];

  for (const f of files) {
    const relPath = rel(f);
    if (TOKENS_ALLOWLIST.has(relPath)) continue;

    const text = await fs.readFile(f, "utf8");
    const matches = text.match(HEX_RE);
    if (matches && matches.length) {
      offenders.push({
        file: relPath,
        samples: Array.from(new Set(matches)).slice(0, 5)
      });
    }
  }

  if (offenders.length) {
    console.warn("\n⚠️  Tokens-lint: hard-coded HEX-kleuren gevonden buiten src/styles/tokens.css");
    for (const o of offenders.slice(0, 50)) {
      console.warn(`   • ${o.file}  →  ${o.samples.join(", ")}`);
    }
    if (offenders.length > 50) {
      console.warn(`   … +${offenders.length - 50} extra bestanden`);
    }
    console.warn("   Actie: vervang deze kleuren door CSS-custom properties uit tokens.css (bijv. var(--color-text)).");
  } else {
    console.log("✅ Tokens-lint: geen hard-coded HEX-kleuren buiten tokens.css gevonden.");
  }

  return offenders.length;
}

async function checkHostLeftovers() {
  const files = (await walk(SRC_DIR)).filter(isTextFile);
  const offendersApp = [];
  const offendersAi = [];

  for (const f of files) {
    const relPath = rel(f);
    const text = await fs.readFile(f, "utf8");
    if (text.includes("fitfi.app")) offendersApp.push(relPath);

    // Waarschuw voor ruwe 'https://fitfi.ai' hardcodes (liever utils/urls.ts)
    // Laat absolute OG-afbeeldingen in Seo door; deze check is enkel voor source-bestanden.
    if (text.includes("https://fitfi.ai")) offendersAi.push(relPath);
  }

  if (offendersApp.length) {
    console.warn("\n⚠️  Canonical-lint: verwijzingen naar 'fitfi.app' gevonden (verwacht: 'https://fitfi.ai').");
    for (const p of offendersApp.slice(0, 100)) console.warn(`   • ${p}`);
    if (offendersApp.length > 100) console.warn(`   … +${offendersApp.length - 100} extra bestanden`);
  } else {
    console.log("✅ Canonical-lint: geen 'fitfi.app' verwijzingen gevonden.");
  }

  if (offendersAi.length) {
    console.warn("\n⚠️  URL-centralisatie: ruwe 'https://fitfi.ai' hardcodes gevonden.");
    console.warn("   Gebruik 'src/utils/urls.ts' (canonicalUrl/buildShareUrl/buildReferralUrl) i.p.v. ruwe hoststrings.");
    for (const p of offendersAi.slice(0, 100)) console.warn(`   • ${p}`);
    if (offendersAi.length > 100) console.warn(`   … +${offendersAi.length - 100} extra bestanden`);
  } else {
    console.log("✅ URL-centralisatie: geen ruwe 'https://fitfi.ai' hardcodes gevonden.");
  }

  return { offendersApp, offendersAi };
}

async function runTscNoEmit() {
  return new Promise((resolve) => {
    try {
      const proc = spawn(/^win/.test(process.platform) ? "npx.cmd" : "npx", ["tsc", "--noEmit"], {
        cwd: PROJECT_ROOT,
        stdio: "pipe",
        env: process.env
      });

      let out = "";
      proc.stdout.on("data", (d) => (out += d.toString()));
      proc.stderr.on("data", (d) => (out += d.toString()));

      proc.on("close", (code) => {
        if (code === 0) {
          console.log("✅ TypeScript: tsc --noEmit succesvol (geen type-errors).");
        } else {
          console.warn("\n⚠️  TypeScript: tsc --noEmit meldingen (niet fataal voor build):\n");
          console.warn(out.trim().slice(0, 8000));
        }
        resolve(code);
      });
    } catch {
      console.warn("ℹ️  tsc niet uitgevoerd (npx/tsc niet beschikbaar).");
      resolve(0);
    }
  });
}

// ---- main ------------------------------------------------------------------

(async function main() {
  console.log("🩺  FitFi Doctor — hygiëne-checks (warn-only)\n");

  const hex = await checkHexColors();
  const { offendersApp, offendersAi } = await checkHostLeftovers();
  await runTscNoEmit();

  const summary = [
    `HEX-kleur overtredingen: ${hex}`,
    `fitfi.app verwijzingen: ${offendersApp.length}`,
    `harde 'fitfi.ai' strings: ${offendersAi.length}`
  ].join(" | ");

  console.log(`\n🧾  Samenvatting: ${summary}`);
  console.log("\nℹ️  Deze checks falen de build NIET. Zet later CI_TOKENS_STRICT=1 om ze hard te maken.");
  process.exit(0);
})();