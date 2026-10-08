// Meet de wipe van de kleurpiek (plan "Onder de hero", 4.2; K2).
//
// Leest de clip-path van de stalenlaag op 21 scrollstanden op desktop
// (1440 x 900, de voortgang loopt over de hele sectie) en 11 op mobiel
// (390 x 844, de voortgang volgt het beeld van "start 0.8" tot "end 0.5"), en
// daarna terug naar het begin. Verwacht: 100 procent tot p = b, 0 vanaf p = c,
// daartussen niet stijgend, en terug op p = 0 weer 100.
//
// Playwright staat niet in package.json; gebruik die van ScrollCraft:
//   NODE_PATH=$HOME/.cache/scrollcraft-node/node_modules node scripts/landing/meet-kleur.cjs http://localhost:4202/
// Met BROWSER=webkit in WebKit in plaats van Chrome.
const { chromium, webkit } = require("playwright");

const URL_ = process.argv[2] || "http://localhost:4202/";
// beatBereik(0.15, 0.90), zie src/components/landing/sections/KleurPiek.tsx.
const [A, B, C, D] = [0.09, 0.21, 0.84, 0.96];
const MARGE = 0.6; // procentpunt, voor afronding en een half frame

const SCHERMEN = [
  { naam: "desktop 1440x900", w: 1440, h: 900, mobiel: false, standen: 21 },
  { naam: "mobiel 390x844", w: 390, h: 844, mobiel: true, standen: 11 },
];

async function leesInset(page) {
  return page.evaluate(() => {
    const laag = document.querySelector("#kleur [data-stalenlaag]");
    if (!laag) return null;
    const cp = getComputedStyle(laag).clipPath;
    // inset(a b c d) met de verkorting van CSS: de browser schrijft
    // inset(0% 0% 0% 0%) terug als inset(0%). De onderkant is de derde waarde,
    // of de eerste als er hoogstens twee staan.
    const m = cp.match(/^inset\(([^)]*)\)$/);
    if (!m) return cp;
    const waarden = m[1].trim().split(/\s+/).map((w) => parseFloat(w));
    const onder = waarden.length >= 3 ? waarden[2] : waarden[0];
    return Number.isFinite(onder) ? onder : cp;
  });
}

async function naarVoortgang(page, p, mobiel) {
  await page.evaluate(({ p, mobiel }) => {
    const vh = window.innerHeight;
    let y;
    if (!mobiel) {
      const s = document.getElementById("kleur");
      const top = s.getBoundingClientRect().top + window.scrollY;
      y = top + p * (s.offsetHeight - vh);
    } else {
      const f = document.querySelector("#kleur figure");
      const top = f.getBoundingClientRect().top + window.scrollY;
      y = top - 0.8 * vh + p * (f.offsetHeight + 0.3 * vh);
    }
    window.scrollTo({ top: y, behavior: "instant" });
  }, { p, mobiel });
  // Twee frames: framer-motion zet de waarde in de volgende animatieframe.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  await page.waitForTimeout(120);
}

(async () => {
  const browser = process.env.BROWSER === "webkit"
    ? await webkit.launch({ headless: true })
    : await chromium.launch({ channel: "chrome", headless: true });
  let fout = false;
  for (const s of SCHERMEN) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2, hasTouch: s.mobiel });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem("fitfi.cookiePrefs.v1", JSON.stringify({ necessary: true, analytics: false, marketing: false, consented: true }));
      } catch {}
    });
    const page = await ctx.newPage();
    const fouten = [];
    page.on("pageerror", (e) => fouten.push(e.message));
    page.on("console", (m) => m.type() === "error" && fouten.push(m.text()));
    await page.goto(URL_, { waitUntil: "load" });
    await page.waitForTimeout(800);

    const rij = [];
    let vorige = Infinity;
    for (let i = 0; i < s.standen; i++) {
      const p = i / (s.standen - 1);
      await naarVoortgang(page, p, s.mobiel);
      const x = await leesInset(page);
      let oordeel = "goed";
      if (typeof x !== "number") oordeel = `geen inset (${x})`;
      else if (p <= B && Math.abs(x - 100) > MARGE) oordeel = "had 100 moeten zijn";
      else if (p >= C && x > MARGE) oordeel = "had 0 moeten zijn";
      else if (x > vorige + MARGE) oordeel = "stijgt";
      if (oordeel !== "goed") fout = true;
      if (typeof x === "number") vorige = x;
      rij.push(`  p ${p.toFixed(2)}  inset ${typeof x === "number" ? x.toFixed(1).padStart(5) : x}  ${oordeel}`);
    }
    await naarVoortgang(page, 0, s.mobiel);
    const terug = await leesInset(page);
    const terugGoed = typeof terug === "number" && Math.abs(terug - 100) <= MARGE;
    if (!terugGoed || fouten.length) fout = true;
    console.log(`${s.naam} (${process.env.BROWSER || "chrome"}), bereik [${A}, ${B}, ${C}, ${D}]`);
    console.log(rij.join("\n"));
    console.log(`  terug naar p 0: ${terug} ${terugGoed ? "goed" : "FOUT"}`);
    console.log(`  fouten op de pagina: ${fouten.length ? fouten.join(" | ") : "geen"}`);
    await ctx.close();
  }
  await browser.close();
  process.exitCode = fout ? 1 : 0;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
