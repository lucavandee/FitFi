import React from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Kleurcode, type KleurcodeKleur } from "@/components/v2/Kleurcode";
import { VOORBEELD_OUTFITS, euro, formaat, type VoorbeeldStuk } from "@/content/voorbeeldOutfits";
import { COLOR_PALETTES } from "@/data/colorPalettes";
import { toonNaam } from "@/utils/productNaam";

/**
 * Prototype van de nieuwe homepage (stap 2 van het plan van 21 oktober 2026,
 * ~/claude-artifacts/fitfi-beeld/2026-10-21-website/plan.md). Staat alleen
 * op /nieuw, niet in de navigatie en niet in zoekmachines, tot Luc kiest.
 *
 * - Hero A: het product in drie seconden. Een voorbeeldrapport bouwt zich op:
 *   eerst de kleurcode, dan de stukken van een goedgekeurde outfit.
 * - Hero B: de cast. Eén gegenereerd model (castproef, AI-label eronder,
 *   nooit eroverheen), met de kleurcode als beeldteken.
 * - Het rapport als tijdschrift, met de echte producten uit
 *   VOORBEELD_OUTFITS.
 * - Eén quizscherm in de nieuwe vorm: kiezen tussen twee.
 *
 * Alleen kleuren uit het palet van CLAUDE.md deel 2: de avondsecties zijn
 * #1A1A1A. Het designsysteem verandert pas na Lucs ja op dit prototype.
 */

const KLEURCODE: KleurcodeKleur[] = COLOR_PALETTES.winter.doColors.map((k) => ({ hex: k.hex, naam: k.name }));
const HERO_OUTFIT = VOORBEELD_OUTFITS[1];

const PAGINA = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const KNOP_PRIMAIR =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#A85740] px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#9A503B]";

function Packshot({ stuk, sizes, className = "" }: { stuk: VoorbeeldStuk; sizes: string; className?: string }) {
  return (
    <div className={`aspect-[2/3] overflow-hidden rounded-xl bg-[#FAFAF8] ${className}`}>
      <img
        src={formaat(stuk.beeld, 600)}
        srcSet={`${formaat(stuk.beeld, 400)} 400w, ${formaat(stuk.beeld, 800)} 800w`}
        sizes={sizes}
        alt={toonNaam({ name: stuk.naam, brand: stuk.merk })}
        className="h-full w-full object-contain"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function HeroKop({ licht }: { licht: boolean }) {
  return (
    <>
      <p className={`text-sm font-medium tracking-wide ${licht ? "text-[#E5E5E5]" : "text-[#4A4A4A]"}`}>
        Persoonlijk stijladvies
      </p>
      <h1
        className={`mt-5 font-serif text-[64px] leading-[0.95] sm:text-[80px] lg:text-[112px] xl:text-[128px] ${
          licht ? "text-[#FAFAF8]" : "text-[#1A1A1A]"
        }`}
      >
        <span className="italic">Draag wat</span>
        <br />
        bij je past.
      </h1>
      <p className={`mt-8 max-w-md text-lg leading-relaxed ${licht ? "text-[#E5E5E5]" : "text-[#4A4A4A]"}`}>
        Beantwoord veertien vragen. Je krijgt je kleuren, je stijl en outfits met links naar de winkel.
      </p>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <NavLink to="/onboarding" className={KNOP_PRIMAIR}>
          Begin gratis
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </NavLink>
        <NavLink
          to="/results/preview"
          className={`inline-flex min-h-[48px] items-center text-base font-medium underline underline-offset-4 transition-colors duration-200 ${
            licht ? "text-[#FAFAF8] hover:text-[#E5E5E5]" : "text-[#1A1A1A] hover:text-[#4A4A4A]"
          }`}
        >
          Bekijk een voorbeeld
        </NavLink>
      </div>
    </>
  );
}

/** Hero A: het voorbeeldrapport bouwt zich op naast de kop. */
function HeroProduct() {
  const rustig = useReducedMotion();
  return (
    <section className="bg-[#1A1A1A] pt-44 pb-20 md:pt-52 md:pb-28">
      <div className={`${PAGINA} grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]`}>
        <div>
          <HeroKop licht />
        </div>

        <motion.article
          aria-label="Voorbeeld van een rapport"
          className="rounded-2xl bg-white p-6 md:p-8"
          initial={rustig ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="font-serif text-3xl italic text-[#1A1A1A]">Minimalistisch</p>
            <span className="rounded-full bg-[#A85740]/10 px-3 py-1 text-sm font-medium text-[#A85740]">Voorbeeld</span>
          </div>
          <p className="mt-6 text-sm font-medium text-[#4A4A4A]">Kleurcode</p>
          <Kleurcode kleuren={KLEURCODE} hoogte={44} opbouwen vertraging={0.3} className="mt-2" />

          <p className="mt-8 text-sm font-medium text-[#4A4A4A]">
            {HERO_OUTFIT.gelegenheid}: {HERO_OUTFIT.titel.toLowerCase()}
          </p>
          <ul className="mt-3 grid grid-cols-3 gap-3">
            {HERO_OUTFIT.stukken.map((stuk, i) => (
              <motion.li
                key={stuk.beeld}
                initial={rustig ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 1 + i * 0.15 }}
              >
                <Packshot stuk={stuk} sizes="(min-width: 1024px) 160px, 30vw" />
              </motion.li>
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-[#E5E5E5] pt-4">
            <p className="text-sm text-[#4A4A4A]">{HERO_OUTFIT.stukken.length} stukken bij H&amp;M</p>
            <p className="text-base font-semibold text-[#1A1A1A]">
              {euro(HERO_OUTFIT.stukken.reduce((som, s) => som + s.prijs, 0))}
            </p>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

/** Hero B: de cast, met de kleurcode als beeldteken. */
function HeroCast() {
  return (
    <section className="bg-[#F5F0EB] pt-44 pb-20 md:pt-52 md:pb-28">
      <div className={`${PAGINA} grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]`}>
        <div>
          <HeroKop licht={false} />
          <div className="mt-14 max-w-sm">
            <Kleurcode kleuren={KLEURCODE} hoogte={28} opbouwen vertraging={0.2} />
            <p className="mt-3 text-sm text-[#4A4A4A]">
              Een kleurcode uit een voorbeeldrapport. Die van jou komt uit je antwoorden.
            </p>
          </div>
        </div>
        <figure>
          <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-[#E5E5E5]">
            <img
              src="/beeld/cast/cast-8e9e05d7-1200.webp"
              srcSet="/beeld/cast/cast-8e9e05d7-600.webp 600w, /beeld/cast/cast-8e9e05d7-1200.webp 1200w"
              sizes="(min-width: 1024px) 520px, 92vw"
              alt="Model in een zwarte jurk tegen een betonnen muur"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>
          <figcaption className="mt-3 text-sm text-[#6E6E6E]">Beeld gemaakt met AI. De persoon is een model.</figcaption>
        </figure>
      </div>
    </section>
  );
}

/** Het rapport als tijdschrift: een omslag, dan de outfits als spreads. */
function RapportAlsBlad() {
  const [eerste, tweede] = VOORBEELD_OUTFITS;
  return (
    <section className="bg-[#FAFAF8] py-16 md:py-24">
      <div className={PAGINA}>
        <p className="text-sm font-medium text-[#A85740]">Je rapport</p>
        <h2 className="mt-3 max-w-2xl text-2xl font-bold leading-snug text-[#1A1A1A] md:text-3xl">
          Je rapport leest als een tijdschrift over jou.
        </h2>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Omslag */}
          <article className="flex flex-col justify-between rounded-2xl bg-[#1A1A1A] p-8 md:p-10">
            <div>
              <p className="text-sm font-medium text-[#E5E5E5]">Jouw stijl</p>
              <p className="mt-4 font-serif text-[56px] italic leading-none text-[#FAFAF8] md:text-[72px]">Minimalistisch</p>
            </div>
            <div className="mt-16">
              <Kleurcode kleuren={KLEURCODE} hoogte={36} rand="donker" />
              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-[#4A4A4A] pt-6 text-[#FAFAF8]">
                <div>
                  <dt className="text-sm text-[#E5E5E5]">Kleurtype</dt>
                  <dd className="mt-1 text-base font-semibold">Winter</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#E5E5E5]">Contrast</dt>
                  <dd className="mt-1 text-base font-semibold">Hoog</dd>
                </div>
                <div>
                  <dt className="text-sm text-[#E5E5E5]">Basis</dt>
                  <dd className="mt-1 text-base font-semibold">Zwart, wit</dd>
                </div>
              </dl>
            </div>
          </article>

          {/* Eerste spread */}
          <article className="rounded-2xl border border-[#E5E5E5] bg-white p-6 md:p-8">
            <p className="text-sm font-medium text-[#A85740]">{eerste.gelegenheid}</p>
            <h3 className="mt-1 text-xl font-semibold text-[#1A1A1A] md:text-2xl">{eerste.titel}</h3>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-[#4A4A4A]">{eerste.uitleg}</p>
            <ul className="mt-6 grid grid-cols-2 gap-4 md:gap-6">
              {eerste.stukken.map((stuk) => (
                <li key={stuk.beeld}>
                  <Packshot stuk={stuk} sizes="(min-width: 1024px) 320px, 45vw" />
                  <p className="mt-3 text-sm font-medium text-[#1A1A1A]">{toonNaam({ name: stuk.naam, brand: stuk.merk })}</p>
                  <p className="text-sm text-[#4A4A4A]">
                    {stuk.merk} · {euro(stuk.prijs)}
                  </p>
                </li>
              ))}
            </ul>
          </article>
        </div>

        {/* Tweede spread over de volle breedte */}
        <article className="mt-6 grid gap-6 rounded-2xl border border-[#E5E5E5] bg-white p-6 md:grid-cols-[0.7fr_1.3fr] md:p-8">
          <div>
            <p className="text-sm font-medium text-[#A85740]">{tweede.gelegenheid}</p>
            <h3 className="mt-1 text-xl font-semibold text-[#1A1A1A] md:text-2xl">{tweede.titel}</h3>
            <p className="mt-3 max-w-prose text-base leading-relaxed text-[#4A4A4A]">{tweede.uitleg}</p>
            <p className="mt-6 text-base font-semibold text-[#1A1A1A]">
              {euro(tweede.stukken.reduce((som, s) => som + s.prijs, 0))}
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
            {tweede.stukken.map((stuk) => (
              <li key={stuk.beeld}>
                <Packshot stuk={stuk} sizes="(min-width: 768px) 240px, 30vw" />
                <p className="mt-3 text-sm font-medium text-[#1A1A1A]">{toonNaam({ name: stuk.naam, brand: stuk.merk })}</p>
                <p className="text-sm text-[#4A4A4A]">{euro(stuk.prijs)}</p>
              </li>
            ))}
          </ul>
        </article>
        <p className="mt-6 text-sm text-[#6E6E6E]">
          Outfits zoals FitFi ze samenstelde voor een voorbeeldprofiel, prijzen van 21 oktober 2026.
        </p>
      </div>
    </section>
  );
}

/** Eén quizscherm in de nieuwe vorm: kiezen tussen twee. */
function DezeOfDeze() {
  const [keuze, setKeuze] = React.useState<number | null>(null);
  const opties = [VOORBEELD_OUTFITS[0].stukken[0], VOORBEELD_OUTFITS[1].stukken[0]];
  return (
    <section className="bg-[#F5F0EB] py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-medium text-[#A85740]">De quiz</p>
        <h2 className="mt-3 text-2xl font-bold leading-snug text-[#1A1A1A] md:text-3xl">Kies, in plaats van in te vullen.</h2>
        <p className="mt-3 max-w-prose text-base text-[#4A4A4A]">Zo ziet een vraag in de nieuwe quiz eruit.</p>

        <div className="mt-10 rounded-2xl border border-[#E5E5E5] bg-white p-6 md:p-10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#4A4A4A]">Vraag 3 van 14</p>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-[#E5E5E5]" aria-hidden="true">
              <div className="h-full w-[21%] bg-[#A85740]" />
            </div>
          </div>
          <p className="mt-6 font-serif text-[32px] italic leading-tight text-[#1A1A1A] md:text-[44px]">Welke jurk trek je eerder aan?</p>
          <div className="mt-8 grid grid-cols-2 gap-4 md:gap-8">
            {opties.map((stuk, i) => {
              const gekozen = keuze === i;
              return (
                <button
                  key={stuk.beeld}
                  type="button"
                  aria-pressed={gekozen}
                  onClick={() => setKeuze(i)}
                  className={`rounded-2xl border-2 p-3 text-left transition-colors duration-200 md:p-4 ${
                    gekozen ? "border-[#A85740] bg-[#F4E8E3]" : "border-[#E5E5E5] bg-white hover:border-[#A85740]"
                  }`}
                >
                  <Packshot stuk={stuk} sizes="(min-width: 768px) 380px, 45vw" />
                  <span className="mt-3 block text-base font-medium text-[#1A1A1A]">
                    {toonNaam({ name: stuk.naam, brand: stuk.merk })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Afsluiter() {
  return (
    <section className="bg-[#1A1A1A] py-40">
      <div className={`${PAGINA} text-center`}>
        <div className="mx-auto max-w-xs">
          <Kleurcode kleuren={KLEURCODE} hoogte={20} rand="donker" />
        </div>
        <h2 className="mt-10 font-serif text-[44px] italic leading-tight text-[#FAFAF8] md:text-[72px]">
          Wat is jouw kleurcode?
        </h2>
        <div className="mt-10">
          <NavLink to="/onboarding" className={KNOP_PRIMAIR}>
            Begin gratis
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </NavLink>
        </div>
      </div>
    </section>
  );
}

/** Alleen voor het prototype: wisselen tussen de twee heroes. */
function HeroWissel({ hero, zet }: { hero: "a" | "b"; zet: (h: "a" | "b") => void }) {
  return (
    <div className="absolute right-4 top-28 z-40 flex gap-1 rounded-full border border-[#E5E5E5] bg-white p-1 md:top-32">
      {(["a", "b"] as const).map((h) => (
        <button
          key={h}
          type="button"
          aria-pressed={hero === h}
          onClick={() => zet(h)}
          className={`min-h-[44px] rounded-full px-4 text-sm font-medium transition-colors duration-200 ${
            hero === h ? "bg-[#1A1A1A] text-[#FAFAF8]" : "text-[#1A1A1A] hover:bg-[#F5F0EB]"
          }`}
        >
          Hero {h.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function NieuwPage() {
  const [params, setParams] = useSearchParams();
  const hero = params.get("hero") === "b" ? "b" : "a";
  return (
    <main className="relative bg-[#FAFAF8]">
      <Helmet>
        <title>Prototype nieuwe homepage | FitFi</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      {hero === "a" ? <HeroProduct /> : <HeroCast />}
      <RapportAlsBlad />
      <DezeOfDeze />
      <Afsluiter />
      <HeroWissel hero={hero} zet={(h) => setParams(h === "b" ? { hero: "b" } : {}, { replace: true })} />
    </main>
  );
}
