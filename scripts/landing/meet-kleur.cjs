// Meet de lichtgang in de kleurpiek (plan "Onder de hero", 4.2; K2) in een echte
// browser: per scrollstand de dekking van de dimming en van elke lapuitsnede.
// Desktop (1440 x 900) scrolt over de hele sectie, met sticky beeld en lijst;
// mobiel (390 x 844) volgt het beeld van "start 0.8" tot "end 0.45".
//
// Verwacht: aan begin en eind dimming 0; in de reeks precies een lap (vrijwel)
// volledig aan; nooit twee tegelijk vol aan; terug vóór de sectie weer dimming 0.
//
// Playwright staat niet in package.json; gebruik die van ScrollCraft:
//   NODE_PATH=$HOME/.cache/scrollcraft-node/node_modules node scripts/landing/meet-kleur.cjs http://localhost:4202/
// Met BROWSER=webkit in WebKit in plaats van Chrome.
const { chromium, webkit } = require("playwright");

const URL_ = process.argv[2] || "http://localhost:4202/";

async function lees(page) {
  return page.evaluate(() => {
    const figuur = document.querySelector("#kleur figure");
    const lagen = [...figuur.querySelectorAll(":scope > div")];
    const dim = lagen.find((d) => d.className.includes("bg-[#1A1A1A]"));
    const uitsneden = lagen.filter((d) => (d.getAttribute("style") || "").includes("clip-path"));
    const dekking = (el) => Number(getComputedStyle(el).opacity);
    return { dim: dim ? dekking(dim) : null, lappen: uitsneden.map(dekking) };
  });
}

(async () => {
  const motor = process.env.BROWSER === "webkit" ? webkit : chromium;
  const browser = await motor.launch(process.env.BROWSER === "webkit" ? { headless: true } : { channel: "chrome", headless: true });
  for (const [naam, viewport, mobiel] of [
    ["desktop", { width: 1440, height: 900 }, false],
    ["mobiel", { width: 390, height: 844 }, true],
  ]) {
    const page = await (await browser.newContext({ viewport, isMobile: mobiel, hasTouch: mobiel })).newPage();
    await page.goto(URL_, { waitUntil: "load" });
    await page.waitForSelector("#kleur figure", { timeout: 15000 });
    const maat = await page.evaluate(() => {
      const s = document.querySelector("#kleur");
      const f = s.querySelector("figure");
      return {
        top: s.getBoundingClientRect().top + scrollY,
        hoogte: s.offsetHeight,
        beeldTop: f.getBoundingClientRect().top + scrollY,
        beeldHoogte: f.offsetHeight,
      };
    });
    const rijen = [];
    for (let i = 0; i <= 20; i++) {
      const p = i / 20;
      const y = mobiel
        ? maat.beeldTop - viewport.height * 0.8 + p * (maat.beeldHoogte + viewport.height * 0.35)
        : maat.top + p * (maat.hoogte - viewport.height);
      await page.evaluate((v) => window.scrollTo(0, v), Math.round(y));
      await page.waitForTimeout(120);
      const m = await lees(page);
      rijen.push({
        p,
        dim: m.dim,
        vol: m.lappen.filter((d) => d > 0.98).length,
        som: m.lappen.reduce((a, b) => a + b, 0),
      });
    }
    await page.evaluate((v) => window.scrollTo(0, v), Math.round(maat.top - 300));
    await page.waitForTimeout(200);
    const terug = await lees(page);
    console.log(naam);
    for (const r of rijen) console.log(`  p ${r.p.toFixed(2)}  dim ${r.dim?.toFixed(2)}  vol aan ${r.vol}  som ${r.som.toFixed(2)}`);
    console.log(`  terug vóór de sectie: dim ${terug.dim}`);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
