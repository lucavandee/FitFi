import fs from "node:fs";

const MUST_EXIST = [
  "src/main.tsx",
  "index.html",
  "netlify/functions/nova.ts",
  "src/lib/supabaseClient.ts",
  "src/providers/AuthProvider.tsx",
  "src/pages/RegisterPage.tsx"
];

export default function fitfiBoltGuard() {
  const strict = process.env.VITE_FITFI_GUARD_STRICT === "true";
  const warn = (m: string) => console.warn(`⚠️ FitFi Guard: ${m}`);
  const fail = (m: string) => { if (strict) throw new Error(m); else warn(m); };

  return {
    name: "fitfi-bolt-guard",
    buildStart() {
      for (const p of MUST_EXIST) {
        if (!fs.existsSync(p)) fail(`Ontbrekend bestand: ${p}`);
      }
    }
  };
}
