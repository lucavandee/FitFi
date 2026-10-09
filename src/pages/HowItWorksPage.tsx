import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Plus } from "lucide-react";
import { track as trackFunnel } from "@/utils/analytics";
import { quizSteps } from "@/data/quizSteps";

const PAGE = "how-it-works";

// Tellingen uit de quiz zelf, zoals PrivacyPage: de tekst loopt mee als er een
// stap bij komt of afgaat. Optioneel is wat de quiz laat overslaan.
const AANTAL_VRAGEN = quizSteps.length;
const AANTAL_OPTIONEEL = quizSteps.filter((stap) => !stap.required).length;

/* ─── Scrolldiepte ────────────────────────────────────────────────────────── */
/*
 * Meet 25/50/75/100 procent, elk hoogstens een keer per paginabezoek.
 * Bewust een kopie in dit bestand en geen import uit een ander paginabestand:
 * pagina's worden lazy geladen, en zo'n import trekt die hele pagina mee in de
 * chunk van deze pagina.
 */
function useScrollDepth(page: string) {
  // LET OP: dit meet scrollafstand, niet gelezen content. Een vastgezette
  // scene van 200vh telt als twee schermen scrollen terwijl er een sectie
  // voorbijkomt. De drempels zijn dus alleen vergelijkbaar tussen versies
  // met dezelfde pagina-opbouw, niet met een pagina zonder pins.
  useEffect(() => {
    const drempels = [25, 50, 75, 100];
    let hoogstGemeld = 0;
    let frame = 0;

    const meet = () => {
      frame = 0;
      const scrollbaar =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollbaar <= 0) return;

      const pct = (window.scrollY / scrollbaar) * 100;
      for (const drempel of drempels) {
        // Marge van 0,5 procent: op 100 procent komt scrollY door afronding
        // en zoom zelden exact op de maximale waarde uit.
        if (drempel > hoogstGemeld && pct >= drempel - 0.5) {
          hoogstGemeld = drempel;
          trackFunnel("scroll_depth", { page, depth: drempel });
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(meet);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [page]);
}

/* ─── Reveal hook ─────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  // Bij reduced motion staat scroll-behavior: smooth uit, dus een ankerlink,
  // Ctrl+F of terugnavigatie springt echt. De observer vuurt dan niet voor wat
  // je overslaat en het blok blijft permanent op opacity 0. Daarom meteen tonen.
  const [visible, setVisible] = useState(() => {
    try {
      return (
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible]);
  return { ref, visible };
}

/* ─── Reveal wrapper ──────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.9s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.9s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Data ────────────────────────────────────────────────────────────────── */
const faqs = [
  {
    q: "Moet ik foto's uploaden?",
    a: "Nee, dat is optioneel. De quiz werkt volledig op basis van je antwoorden. Met een selfie kijkt de kleuranalyse ook naar je huid, haar en ogen; die foto gaat daarvoor naar OpenAI in de VS.",
  },
  {
    q: "Werkt het voor mannen en vrouwen?",
    a: "Ja. FitFi past de stijladviezen, outfits en winkelsuggesties aan op basis van je profiel.",
  },
  {
    q: "Wat als het niet klopt?",
    a: "Je kunt de quiz opnieuw doen en je antwoorden aanpassen. Je rapport wordt direct bijgewerkt.",
  },
  {
    q: "Hoeveel kost FitFi?",
    // Het kleurpalet staat voor iedereen in het rapport (ColorPaletteSection
    // kent geen premiumpoort). Wat Premium toevoegt, staat in de tabel op
    // PricingPage: onbeperkte outfits.
    a: "Starten is gratis. Met een gratis account zie je je rapport: je kleurpalet, je stijlprofiel en outfits met links naar winkels. Premium geeft onbeperkte outfits.",
  },
];

// Nergens op deze pagina een invultijd: die is nooit gemeten (stond er als
// "ongeveer 5 minuten", "~5 minuten" en in de HowTo als PT2M). Ook geen
// "direct": je rapport zie je pas met een gratis account (RequireAuth op
// /results in App.tsx).
const compRows = [
  { old: "Uren zoeken in winkels", next: "Een quiz en een rapport met links naar winkels", highlight: false },
  { old: "Kast vol \"draag ik nooit\"", next: "Outfits op basis van wat je graag draagt", highlight: false },
  { old: "Geen idee welke kleuren passen", next: "Een kleurpalet op basis van je antwoorden", highlight: false },
  { old: "Elke ochtend twijfelen", next: "Een rapport dat je kunt bewaren", highlight: true },
];

/* ─── Step visual placeholders (warm gradients) ───────────────────────────── */
function Step3Visual() {
  return (
    <div className="bg-[#C9BFB4] flex items-center justify-center p-12 lg:p-16 min-h-[600px] h-full">
      <div className="w-full max-w-[320px] rounded-2xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.12)]">
        <img
          src="/images/cabef3fa-fe8f-467c-a8a9-ba2e732e2ee0.webp"
          alt="FitFi outfit shoppen: directe shoplinks"
          className="w-full h-auto"
          width={2048}
          height={2048}
          loading="lazy"
        />
      </div>
    </div>
  );
}

/* ─── Step badge ──────────────────────────────────────────────────────────── */
function StepBadge({ num, label }: { num: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-3 mb-6">
      <div className="w-8 h-8 rounded-full border-2 border-[#A85740] flex items-center justify-center text-sm font-extrabold text-[#A85740] flex-shrink-0">
        {num}
      </div>
      <span className="text-xs font-semibold tracking-[3px] uppercase text-[#A85740]">{label}</span>
    </div>
  );
}

/* ─── Step detail item ────────────────────────────────────────────────────── */
function StepDetail({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-start gap-0">
      <div className="w-2 h-2 rounded-full bg-[#A85740] mt-[6px] flex-shrink-0 mr-3" />
      <div>
        <p className="text-[15px] font-semibold text-[#1A1A1A] leading-snug">{title}</p>
        <p className="text-sm text-[#6E6E6E] mt-1">{sub}</p>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useScrollDepth(PAGE);

  const handleQuizClick = (position: string) => {
    trackFunnel("cta_click", { page: PAGE, position });
    trackFunnel("quiz_start", { page: PAGE, position });
  };

  return (
    <>
      <Seo
        title="Hoe het werkt: van quiz naar stijladvies | FitFi"
        description="Je beantwoordt vragen over kleur, pasvorm en gelegenheden, FitFi stelt outfits samen en je klikt door naar de winkel. Voor je rapport maak je een gratis account."
        path="/hoe-het-werkt"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Hoe FitFi werkt: van quiz naar stijladvies",
          description: "Je beantwoordt vragen, FitFi stelt outfits samen en je klikt door naar de winkel.",
          step: [
            { "@type": "HowToStep", position: 1, name: "Vertel ons over jouw stijl", text: `${AANTAL_VRAGEN} vragen over kleur, pasvorm, gelegenheden en budget.` },
            { "@type": "HowToStep", position: 2, name: "Ontvang je persoonlijke rapport", text: "Voor je rapport heb je een gratis account nodig. In het rapport zie je je kleurpalet, je stijlprofiel en outfits met links naar winkels." },
            { "@type": "HowToStep", position: 3, name: "Shop outfits die bij je passen", text: "Elke outfit is samengesteld op basis van je stijlprofiel. Je klikt door naar de winkel en koopt daar." },
          ],
        }}
      />

      {/* Geen eigen skip-link: de shell in App.tsx levert er al een. */}

      {/* Geen geneste <main>: de shell heeft er al een. */}
      <div id="main-content" className="bg-[#FAFAF8]">

        {/* ════════════════════════════════════════════════════
            PAGE HERO
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F0EB] pt-44 pb-16 md:pt-52 md:pb-24 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-center justify-center gap-3 mb-10">
                <span className="w-8 h-px bg-[#A85740]" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#A85740]">
                  Hoe het werkt
                </span>
                <span className="w-8 h-px bg-[#A85740]" aria-hidden="true" />
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <h1 className="text-[32px] md:text-[64px] text-[#1A1A1A] leading-[1.05] max-w-[760px] mx-auto mb-6">
                <span className="font-serif italic">Van vraag naar </span>
                <span className="font-sans font-bold" style={{ letterSpacing: "-2px" }}>outfit</span>
                <span className="font-serif italic"> in drie stappen</span>
              </h1>
            </Reveal>

            <Reveal delay={0.24}>
              <p className="text-[17px] text-[#4A4A4A] leading-[1.7] max-w-[480px] mx-auto mb-12 text-center">
                Je beantwoordt vragen over kleur, pasvorm en gelegenheden.
                Daarna krijg je een rapport met je kleurpalet en outfits met
                links naar winkels. Voor het rapport maak je een gratis account.
              </p>
            </Reveal>

            <Reveal delay={0.36}>
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-[#4A4A4A]">
                {[`${AANTAL_VRAGEN} vragen`, "Gratis starten", "Rapport met gratis account"].map((tag) => (
                  <div key={tag} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#A85740] flex-shrink-0" aria-hidden="true" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            STAP 1: quiz. Hier stond een beeld met ingebakken cijfers
            ("12+", "98%") zonder bron. Zonder beeld tot de poster van
            de quizopname er is.
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <Reveal
              className="flex flex-col justify-center max-w-xl mx-auto"
              delay={0.12}
            >
              <StepBadge num="1" label="Stap één" />
              <h2 className="font-serif italic text-[28px] md:text-[44px] text-[#1A1A1A] leading-[1.1] mb-5">
                Vertel ons over jouw stijl
              </h2>
              <p className="text-base text-[#4A4A4A] leading-[1.8] max-w-[400px] mb-8">
                {AANTAL_VRAGEN} vragen over kleur, pasvorm, gelegenheden en budget. Je kunt er {AANTAL_OPTIONEEL} overslaan. Starten kan zonder account.
              </p>
              <div className="flex flex-col gap-4 mb-8">
                <StepDetail
                  title="Kies je kleurtonen en stijlvoorkeuren"
                  sub="Van warm en minimalistisch tot koel en expressief"
                />
                <StepDetail
                  title="Geef je budget en gelegenheden aan"
                  sub="Werk, weekend, uitgaan, wij stemmen af"
                />
                {/* Hier stond "Lokaal verwerkt, niet opgeslagen". De selfie gaat
                    naar de opslag in Frankfurt en via een link van 60 seconden
                    naar OpenAI (PhotoUpload.tsx, analyze-selfie-color). */}
                <StepDetail
                  title="Optioneel: upload een selfie voor kleuranalyse"
                  sub="Opgeslagen in Frankfurt, geanalyseerd door OpenAI in de VS"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            STAP 2: rapport. Hier stond een telefoonmockup met ingebakken
            claims ("2 min", "6-12 vragen") die de quiz tegenspreken.
            Zonder beeld, zoals stap 1.
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F0EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <Reveal
              className="flex flex-col justify-center max-w-xl mx-auto"
              delay={0.12}
            >
              <StepBadge num="2" label="Stap twee" />
              <h2 className="font-serif italic text-[28px] md:text-[44px] text-[#1A1A1A] leading-[1.1] mb-5">
                Ontvang je persoonlijke rapport
              </h2>
              <p className="text-base text-[#4A4A4A] leading-[1.8] max-w-[400px] mb-8">
                Voor je rapport heb je een gratis account nodig. In het rapport zie je je kleurpalet, je stijlprofiel en outfits met links naar winkels.
              </p>
              <div className="flex flex-col gap-4 mb-8">
                <StepDetail
                  title="Jouw persoonlijke kleurpalet"
                  sub="Welke tinten bij je passen; met een geanalyseerde selfie ook welke je beter vermijdt"
                />
                <StepDetail
                  title="Stijlprofiel met uitleg"
                  sub="Wat je seizoenstype, contrast en kleurtemperatuur betekenen"
                />
                <StepDetail
                  title="Do's en don'ts per gelegenheid"
                  sub="Concrete tips voor werk, weekend en uitgaan"
                />
              </div>
              {/* Hier stond de pil "Direct beschikbaar". Je rapport zie je pas
                  met een account, dus direct is het niet. */}
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            STAP 3: shop (visual left, content right)
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF8]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <Reveal className="relative overflow-hidden">
              <Step3Visual />
            </Reveal>

            <Reveal
              className="flex flex-col justify-center p-8 md:p-12 lg:p-20 bg-[#FAFAF8]"
              delay={0.12}
            >
              <StepBadge num="3" label="Stap drie" />
              <h2 className="font-serif italic text-[28px] md:text-[44px] text-[#1A1A1A] leading-[1.1] mb-5">
                Shop outfits die bij je passen
              </h2>
              <p className="text-base text-[#4A4A4A] leading-[1.8] max-w-[400px] mb-8">
                Elke outfit is samengesteld op basis van je stijlprofiel. Je klikt door naar de winkel en koopt daar.
              </p>
              {/* Hier stond ook "Matchscore per item": het rapport toont geen
                  score per kledingstuk (ResultsOutfitCard krijgt hoogstens een
                  score per outfit). */}
              <div className="flex flex-col gap-4 mb-8">
                <StepDetail
                  title="Outfitcombinaties per profiel"
                  sub="Voor werk, weekend, date en avond uit"
                />
                <StepDetail
                  title="Links naar winkels"
                  sub="FitFi verkoopt zelf geen kleding"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            VERGELIJKINGSTABEL
        ════════════════════════════════════════════════════ */}
        <section className="pt-44 md:pt-52 pb-40 bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center max-w-[680px] mx-auto mb-20">
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[#A85740]">
                  Vergelijk
                </span>
                <h2 className="font-serif italic text-[28px] md:text-[48px] text-[#1A1A1A] leading-[1.1] mt-4 mb-4">
                  Waarom dit anders is
                </h2>
                <p className="text-base md:text-[17px] text-[#4A4A4A] leading-[1.7]">
                  De meeste mensen kiezen kleding op gevoel. FitFi geeft je een systeem.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="max-w-[800px] mx-auto">
                {/* Header rij */}
                <div className="grid grid-cols-[1fr_40px_1fr] items-center pb-4 mb-2 border-b-2 border-[#E5E5E5]">
                  <div className="text-sm font-semibold text-[#6E6E6E] uppercase tracking-[1px] text-right pr-6">
                    Zonder FitFi
                  </div>
                  <div />
                  <div className="text-sm font-bold text-[#A85740] uppercase tracking-[1px] text-left pl-6">
                    Met FitFi
                  </div>
                </div>

                {compRows.map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[1fr_40px_1fr] items-center border-b border-[#E5E5E5] last:border-none ${row.highlight ? "pt-5 pb-10" : "py-5"}`}
                  >
                    <div className="text-[15px] text-[#6E6E6E] text-right pr-6">
                      {row.old}
                    </div>
                    <div className="text-sm font-bold text-[#E5E5E5] text-center">
                      →
                    </div>
                    <div className={`text-[15px] font-semibold text-left pl-6 ${row.highlight ? "text-[#A85740]" : "text-[#1A1A1A]"}`}>
                      {row.next}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FAQ MINI
        ════════════════════════════════════════════════════ */}
        <section className="py-28 bg-[#F5F0EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center max-w-[680px] mx-auto mb-16">
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[#A85740]">
                  Veelgestelde vragen
                </span>
                <h2 className="font-serif italic text-[28px] md:text-[48px] text-[#1A1A1A] leading-[1.1] mt-4 mb-4">
                  Nog twijfels?
                </h2>
                <p className="text-base md:text-[17px] text-[#4A4A4A]">
                  De vier meest gestelde vragen over FitFi.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[900px] mx-auto">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl p-7 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-[15px] font-semibold text-[#1A1A1A]">
                          {faq.q}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                            isOpen ? "bg-[#F4E8E3]" : "bg-[#F5F0EB]"
                          }`}
                          aria-hidden="true"
                        >
                          <motion.div
                            animate={{ rotate: isOpen ? 45 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Plus className="w-4 h-4 text-[#A85740]" />
                          </motion.div>
                        </div>
                      </div>

                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-[#4A4A4A] leading-[1.7] mt-4">
                              {faq.a}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="text-center mt-10">
                <Link
                  to="/veelgestelde-vragen"
                  className="inline-flex items-center min-h-[44px] gap-2 text-sm font-semibold text-[#A85740] hover:text-[#9A503B] transition-colors duration-200"
                >
                  Bekijk alle veelgestelde vragen
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            CTA
        ════════════════════════════════════════════════════ */}
        <section className="py-[120px] md:py-[200px] bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center">
                <h2 className="font-serif italic text-[32px] md:text-[64px] text-[#1A1A1A] leading-[1.05]">
                  Klaar om te beginnen?
                </h2>
                <p className="text-base md:text-[17px] text-[#4A4A4A] mt-8 mb-14 md:mb-16">
                  Je kunt zonder account beginnen. Voor je rapport maak je een gratis account.
                </p>
                <Link
                  to="/onboarding"
                  onClick={() => handleQuizClick("footer")}
                  className="group inline-flex items-center gap-3 bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base md:text-[17px] py-5 px-12 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
                  style={{ boxShadow: "0 12px 40px rgba(194,101,74,0.3)" }}
                >
                  Begin gratis
                  <ArrowRight
                    className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  );
}
