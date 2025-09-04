/**
 * Codemod: verwijder React.lazy usage voor ConsoleInspector in LandingPage
 * en vervang door veilige <DevConsoleMount/>.
 * 
 * Werking:
 * - Verwijdert "lazy" uit import { ... } from "react"
 * - Vervangt import van ConsoleInspector door DevConsoleMount
 * - Verwijdert const/variabele definities voor ConsoleInspector met lazy(...)
 * - Vervangt <ConsoleInspector .../> (evt. omwikkeld door <Suspense>) door <DevConsoleMount/>
 * 
 * Gebruik:
 * node scripts/codemods/fix-landing-console.mjs
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FILE = path.join(ROOT, "src/pages/LandingPage.tsx");

if (!fs.existsSync(FILE)) {
  console.error("❌ Niet gevonden:", FILE);
  process.exit(1);
}

let src = fs.readFileSync(FILE, "utf8");
let changed = false;

// 1) Verwijder "lazy" uit react import
src = src.replace(
  /import\s*\{\s*([^}]+)\}\s+from\s+["']react["'];?/g,
  (full, inner) => {
    const names = inner
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((n) => n !== "lazy"); // strip lazy
    const cleaned = names.join(", ");
    changed = true;
    return names.length ? `import { ${cleaned} } from "react";` : `import "react";`;
  }
);

// 2) Verwijder lazy-definitie van ConsoleInspector (ruime regex)
src = src.replace(
  /const\s+ConsoleInspector\s*[:=][\s\S]*?;\s*/g,
  (full) => {
    changed = true;
    return "";
  }
);

// 3) Vervang directe imports van ConsoleInspector door DevConsoleMount
// a) verwijder bestaande import naar ConsoleInspector
src = src.replace(
  /import\s+ConsoleInspector\s+from\s+["']@\/components\/dev\/ConsoleInspector["'];?\s*/g,
  () => {
    changed = true;
    return "";
  }
);

// b) zorg voor import van DevConsoleMount (als die nog niet bestaat)
if (!/from\s+["']@\/components\/dev\/DevConsoleMount["']/.test(src)) {
  // insert bovenaan na 1ste import
  src = src.replace(
    /(^\s*import[\s\S]+?;)/,
    (firstImport) => `${firstImport}\nimport DevConsoleMount from "@/components/dev/DevConsoleMount";`
  );
  changed = true;
}

// 4) Vervang usages
// a) <Suspense> <ConsoleInspector/> </Suspense> → <DevConsoleMount/>
src = src.replace(
  /<Suspense[^>]*>\s*<ConsoleInspector\s*\/>\s*<\/Suspense>/g,
  () => {
    changed = true;
    return "<DevConsoleMount />";
  }
);

// b) losse <ConsoleInspector/> → <DevConsoleMount/>
src = src.replace(
  /<ConsoleInspector\s*\/>/g,
  () => {
    changed = true;
    return "<DevConsoleMount />";
  }
);

if (changed) {
  fs.writeFileSync(FILE, src, "utf8");
  console.log("✅ LandingPage bijgewerkt – ConsoleInspector via DevConsoleMount zonder React.lazy");
} else {
  console.log("ℹ Geen wijzigingen nodig – LandingPage lijkt al up-to-date.");
}