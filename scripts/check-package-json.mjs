/**
 * Verifieert dat package.json geldige JSON is en toont exacte foutlocatie.
 * Exit: 1 bij fout.
 */
import fs from "node:fs";

const raw = fs.readFileSync("package.json", "utf8");

try {
  JSON.parse(raw);
  console.log("✅ package.json is geldige JSON.");
} catch (e) {
  console.error("⛔ package.json is geen geldige JSON.");
  if (e instanceof SyntaxError && typeof e.message === "string") {
    console.error("Fout:", e.message);
    // Toon ~80 tekens context rond de foutindex (indien aanwezig)
    const match = e.message.match(/position (\d+)/);
    if (match) {
      const pos = Number(match[1]);
      const start = Math.max(0, pos - 80);
      const end = Math.min(raw.length, pos + 80);
      const snippet = raw.slice(start, end);
      console.error(`Context (pos ${pos}):\n---\n${snippet}\n---`);
    }
  } else {
    console.error(e);
  }
  process.exit(1);
}