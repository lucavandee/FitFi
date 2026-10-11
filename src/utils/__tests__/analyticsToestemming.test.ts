/**
 * gtag.js laadt pas na toestemming voor analytics (PR A2).
 *
 * Gemeten op 8 oktober 2026, voor deze wijziging: zonder keuze, en ook na
 * "Alleen noodzakelijk", gingen gtag.js, een page_view en scroll-events naar
 * Google, omdat index.html gtag met consent mode "denied" laadde. Deze tests
 * leggen het nieuwe gedrag vast zonder browser: een nagebootst window met
 * localStorage en storage-luisteraars, en een document dat scripts telt.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CONSENT_KEY } from "@/utils/consent";

type Keuze = { analytics: boolean; marketing?: boolean; consented: boolean };

function omgeving(opgeslagen: Keuze | null) {
  const opslag = new Map<string, string>();
  if (opgeslagen) opslag.set(CONSENT_KEY, JSON.stringify(opgeslagen));
  const luisteraars: Array<(e: { key: string | null }) => void> = [];
  const scripts: Array<{ async: boolean; src: string }> = [];
  const win: Record<string, unknown> & { dataLayer?: unknown[]; gtag?: unknown } = {
    localStorage: {
      getItem: (k: string) => opslag.get(k) ?? null,
      setItem: (k: string, v: string) => void opslag.set(k, v),
    },
    addEventListener: (type: string, fn: (e: { key: string | null }) => void) => {
      if (type === "storage") luisteraars.push(fn);
    },
  };
  vi.stubGlobal("window", win);
  vi.stubGlobal("document", {
    createElement: () => ({ async: false, src: "" }),
    head: { appendChild: (el: { async: boolean; src: string }) => scripts.push(el) },
  });
  return {
    win,
    scripts,
    /** Wat setCookiePrefs doet: opslaan en een storage-event sturen. */
    kies(k: Keuze) {
      opslag.set(CONSENT_KEY, JSON.stringify(k));
      for (const fn of luisteraars) fn({ key: CONSENT_KEY });
    },
  };
}

async function laadModule() {
  vi.resetModules();
  return import("@/utils/analytics");
}

const isArguments = (x: unknown) => Object.prototype.toString.call(x) === "[object Arguments]";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("gtag na toestemming", () => {
  it("zonder keuze: geen script, geen gtag, geen dataLayer", async () => {
    const o = omgeving(null);
    const { initAnalytics, track } = await laadModule();
    initAnalytics();
    track("cta_click", { position: "hero" });
    expect(o.scripts).toHaveLength(0);
    expect(o.win.gtag).toBeUndefined();
    expect(o.win.dataLayer).toBeUndefined();
  });

  it("na 'Alleen noodzakelijk': niets, ook niet na het event", async () => {
    const o = omgeving(null);
    const { initAnalytics } = await laadModule();
    initAnalytics();
    o.kies({ analytics: false, marketing: false, consented: true });
    expect(o.scripts).toHaveLength(0);
    expect(o.win.gtag).toBeUndefined();
  });

  it("na 'Alles accepteren': een script, consent granted, js en config als arguments", async () => {
    const o = omgeving(null);
    const { initAnalytics, GA_ID } = await laadModule();
    initAnalytics();
    expect(o.scripts).toHaveLength(0);

    o.kies({ analytics: true, marketing: true, consented: true });
    expect(GA_ID).toMatch(/^G-[A-Z0-9]+$/);
    expect(o.scripts).toHaveLength(1);
    expect(o.scripts[0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
    expect(o.scripts[0].async).toBe(true);

    const laag = o.win.dataLayer as unknown[];
    expect(laag.every(isArguments)).toBe(true);
    const opdrachten = laag.map((a) => Array.from(a as ArrayLike<unknown>));
    expect(opdrachten[0][0]).toBe("consent");
    expect(opdrachten[0][1]).toBe("default");
    expect(opdrachten[0][2]).toMatchObject({ analytics_storage: "granted", ad_storage: "denied" });
    expect(opdrachten.some((a) => a[0] === "js" && a[1] instanceof Date)).toBe(true);
    expect(opdrachten.some((a) => a[0] === "config" && a[1] === GA_ID)).toBe(true);

    // Nog een keuze laadt geen tweede script.
    o.kies({ analytics: true, marketing: false, consented: true });
    expect(o.scripts).toHaveLength(1);
  });

  it("met eerder gegeven toestemming laadt hij meteen bij het starten", async () => {
    const o = omgeving({ analytics: true, marketing: false, consented: true });
    const { initAnalytics } = await laadModule();
    initAnalytics();
    expect(o.scripts).toHaveLength(1);
    expect(typeof o.win.gtag).toBe("function");
  });

  it("intrekken zet de uitschakelaar van gtag aan, opnieuw toestaan weer uit", async () => {
    const o = omgeving({ analytics: true, marketing: false, consented: true });
    const { initAnalytics, GA_ID } = await laadModule();
    initAnalytics();
    const uit = `ga-disable-${GA_ID}`;
    expect(o.win[uit]).toBe(false);

    o.kies({ analytics: false, marketing: false, consented: true });
    expect(o.win[uit]).toBe(true);
    const laatste = Array.from((o.win.dataLayer as unknown[]).at(-1) as ArrayLike<unknown>);
    expect(laatste).toEqual(["consent", "update", { analytics_storage: "denied" }]);

    o.kies({ analytics: true, marketing: false, consented: true });
    expect(o.win[uit]).toBe(false);
    expect(o.scripts).toHaveLength(1);
  });
});

describe("index.html", () => {
  const html = readFileSync(join(__dirname, "../../../index.html"), "utf-8");

  it("laadt geen gtag.js en roept gtag niet aan", () => {
    expect(html).not.toMatch(/googletagmanager\.com|google-analytics\.com/);
    expect(html).not.toMatch(/gtag\(/);
  });
});
