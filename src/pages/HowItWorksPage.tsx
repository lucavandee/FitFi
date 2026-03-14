import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, Zap, Heart, ArrowRight, Plus } from "lucide-react";

/* ─── Reveal hook ─────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
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
    a: "Nee, dat is optioneel. De quiz werkt volledig op basis van je antwoorden. Een foto kan de kleuranalyse preciezer maken, maar is niet nodig.",
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
    a: "Je kunt gratis starten en een basisrapport ontvangen. Voor het volledige kleurpalet en meer outfits is er een premium plan.",
  },
];

const compRows = [
  { old: "Uren zoeken in winkels", next: "2 minuten, direct resultaat", highlight: false },
  { old: "€200+ aan spijt-aankopen per jaar", next: "Alleen items die bij je passen", highlight: false },
  { old: "Kast vol \"draag ik nooit\"", next: "Outfits die je echt draagt", highlight: false },
  { old: "Geen idee welke kleuren passen", next: "Persoonlijk kleurpalet op basis van jou", highlight: false },
  { old: "Elke ochtend twijfelen", next: "Zelfverzekerd je deur uit", highlight: true },
];

/* ─── Step visual placeholders (warm gradients) ───────────────────────────── */
function Step1Visual() {
  return (
    <div className="bg-[#E8DDD2] flex items-center justify-center p-12 lg:p-16 min-h-[600px] h-full">
      <div className="w-full max-w-[380px] rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.12)]">
        <img
          src="/images/3afbe258-11f3-4a98-b82e-a2939fd1de19.webp"
          alt="FitFi stijlquiz — kleurtonen en stijlvoorkeuren"
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function Step2Visual() {
  return (
    <div className="bg-[#D4C0AD] flex items-center justify-center p-12 lg:p-16 min-h-[600px] h-full">
      <div className="w-full max-w-[480px] rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.12)]">
        <img
          src="/images/caa9958f-d96f-4d6c-8dff-b192665376c8.webp"
          alt="FitFi stijlrapport — kleurprofiel en aanbevelingen"
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
    </div>
  );
}

function Step3Visual() {
  return (
    <div className="bg-[#C9BFB4] flex items-center justify-center p-12 lg:p-16 min-h-[600px] h-full">
      <div className="w-full max-w-[320px] rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.12)]">
        <img
          src="/images/cabef3fa-fe8f-467c-a8a9-ba2e732e2ee0.webp"
          alt="FitFi outfit shoppen — directe shoplinks"
          className="w-full h-auto"
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
      <div className="w-8 h-8 rounded-full border-2 border-[#C2654A] flex items-center justify-center text-sm font-extrabold text-[#C2654A] flex-shrink-0">
        {num}
      </div>
      <span className="text-xs font-semibold tracking-[3px] uppercase text-[#C2654A]">{label}</span>
    </div>
  );
}

/* ─── Step detail item ────────────────────────────────────────────────────── */
function StepDetail({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex items-start gap-0">
      <div className="w-2 h-2 rounded-full bg-[#C2654A] mt-[6px] flex-shrink-0 mr-3" />
      <div>
        <p className="text-[15px] font-semibold text-[#1A1A1A] leading-snug">{title}</p>
        <p className="text-[13px] text-[#8A8A8A] mt-1">{sub}</p>
      </div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Seo
        title="Hoe het werkt — Jouw stijladvies in 2 minuten | FitFi"
        description="In 2 minuten van quiz naar compleet stijladvies. 3 stappen: beantwoord vragen, wij matchen outfits, jij shopt direct. Zo simpel werkt FitFi."
        path="/hoe-het-werkt"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "Hoe FitFi werkt — stijladvies in 2 minuten",
          description: "In 2 minuten van quiz naar compleet stijladvies. Beantwoord vragen, wij matchen outfits, jij shopt direct.",
          totalTime: "PT2M",
          step: [
            { "@type": "HowToStep", position: 1, name: "Vertel ons over jouw stijl", text: "Een korte quiz over je voorkeuren, kleuren en levensstijl." },
            { "@type": "HowToStep", position: 2, name: "Ontvang je persoonlijke rapport", text: "Direct na de quiz krijg je een volledig stijlrapport." },
            { "@type": "HowToStep", position: 3, name: "Shop outfits die bij je passen", text: "Echte items die je direct kunt kopen." },
          ],
        }}
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[#C2654A] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold"
      >
        Spring naar hoofdinhoud
      </a>

      <main id="main-content" className="bg-[#FAFAF8]">

        {/* ════════════════════════════════════════════════════
            PAGE HERO
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F0EB] pt-56 pb-28 md:pt-64 md:pb-32 text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-center justify-center gap-3 mb-10">
                <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A]">
                  Hoe het werkt
                </span>
                <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
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
                Geen eindeloze vragenlijsten, geen vage tips. In twee
                minuten heb je een persoonlijk stijlrapport met kleuren,
                outfits en directe shoplinks.
              </p>
            </Reveal>

            <Reveal delay={0.36}>
              <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-[#4A4A4A]">
                {["2 minuten", "Geen foto's nodig", "Direct resultaat"].map((tag) => (
                  <div key={tag} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#C2654A] flex-shrink-0" aria-hidden="true" />
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            STAP 1 — quiz (visual left, content right)
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF8]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <Reveal className="relative overflow-hidden">
              <Step1Visual />
            </Reveal>

            <Reveal
              className="flex flex-col justify-center p-8 md:p-12 lg:p-20 bg-[#FAFAF8]"
              delay={0.12}
            >
              <StepBadge num="1" label="Stap één" />
              <h2 className="font-serif italic text-[28px] md:text-[44px] text-[#1A1A1A] leading-[1.1] mb-5">
                Vertel ons over jouw stijl
              </h2>
              <p className="text-base text-[#4A4A4A] leading-[1.8] max-w-[400px] mb-8">
                Een korte quiz over je voorkeuren, kleuren en levensstijl. Geen account nodig om te starten, geen foto's vereist.
              </p>
              <div className="flex flex-col gap-4 mb-8">
                <StepDetail
                  title="Kies je kleurtonen en stijlvoorkeuren"
                  sub="Van warm en minimalistisch tot koel en expressief"
                />
                <StepDetail
                  title="Geef je budget en gelegenheden aan"
                  sub="Werk, weekend, uitgaan — wij stemmen af"
                />
                <StepDetail
                  title="Optioneel: upload een foto voor kleuranalyse"
                  sub="Lokaal verwerkt, niet opgeslagen"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F0EB] rounded-full text-[13px] font-semibold text-[#C2654A] w-fit">
                <Clock className="w-4 h-4" aria-hidden="true" />
                ~2 minuten
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            STAP 2 — rapport (content left, visual right) — gespiegeld
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F0EB]">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <Reveal
              className="flex flex-col justify-center p-8 md:p-12 lg:p-20 bg-[#F5F0EB] order-2 lg:order-1"
              delay={0.12}
            >
              <StepBadge num="2" label="Stap twee" />
              <h2 className="font-serif italic text-[28px] md:text-[44px] text-[#1A1A1A] leading-[1.1] mb-5">
                Ontvang je persoonlijke rapport
              </h2>
              <p className="text-base text-[#4A4A4A] leading-[1.8] max-w-[400px] mb-8">
                Direct na de quiz krijg je een volledig stijlrapport. Geen wachttijd, geen vage aanbevelingen — concreet en visueel.
              </p>
              <div className="flex flex-col gap-4 mb-8">
                <StepDetail
                  title="Jouw persoonlijke kleurpalet"
                  sub="Welke tinten bij je passen en welke je beter kunt vermijden"
                />
                <StepDetail
                  title="Stijlprofiel met uitleg"
                  sub="Wat je seizoenstype, contrast en ondertoon betekenen"
                />
                <StepDetail
                  title="Do's en don'ts per gelegenheid"
                  sub="Concrete tips voor werk, weekend en uitgaan"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[13px] font-semibold text-[#C2654A] w-fit">
                <Zap className="w-4 h-4" aria-hidden="true" />
                Direct beschikbaar
              </div>
            </Reveal>

            <Reveal className="relative overflow-hidden order-1 lg:order-2">
              <Step2Visual />
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            STAP 3 — shop (visual left, content right)
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
                Geen moodboards, maar echte items die je direct kunt kopen. Elke outfit is samengesteld op basis van jouw stijlprofiel.
              </p>
              <div className="flex flex-col gap-4 mb-8">
                <StepDetail
                  title="50+ outfitcombinaties per profiel"
                  sub="Voor werk, weekend, date en avond uit"
                />
                <StepDetail
                  title="Directe links naar webshops"
                  sub="Klik door en bestel bij je favoriete winkels"
                />
                <StepDetail
                  title="Matchscore per item"
                  sub="Zie direct hoe goed elk kledingstuk bij jouw profiel past"
                />
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F5F0EB] rounded-full text-[13px] font-semibold text-[#C2654A] w-fit">
                <Heart className="w-4 h-4" aria-hidden="true" />
                50+ looks
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            VERGELIJKINGSTABEL
        ════════════════════════════════════════════════════ */}
        <section className="pt-28 pb-40 bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center max-w-[680px] mx-auto mb-20">
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[#C2654A]">
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
                  <div className="text-[13px] font-semibold text-[#8A8A8A] uppercase tracking-[1px] text-right pr-6">
                    Zonder FitFi
                  </div>
                  <div />
                  <div className="text-[13px] font-bold text-[#C2654A] uppercase tracking-[1px] text-left pl-6">
                    Met FitFi
                  </div>
                </div>

                {compRows.map((row, i) => (
                  <div
                    key={i}
                    className={`grid grid-cols-[1fr_40px_1fr] items-center border-b border-[#E5E5E5] last:border-none ${row.highlight ? "pt-5 pb-10" : "py-5"}`}
                  >
                    <div className="text-[15px] text-[#8A8A8A] text-right pr-6">
                      {row.old}
                    </div>
                    <div className="text-[11px] font-bold text-[#E5E5E5] text-center">
                      →
                    </div>
                    <div className={`text-[15px] font-semibold text-left pl-6 ${row.highlight ? "text-[#C2654A]" : "text-[#1A1A1A]"}`}>
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
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[#C2654A]">
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
                      className="bg-white rounded-[20px] p-7 cursor-pointer transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
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
                            <Plus className="w-4 h-4 text-[#C2654A]" />
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
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#C2654A] hover:text-[#A8513A] transition-colors duration-200"
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
                  Gratis. Twee minuten. Geen account nodig.
                </p>
                <Link
                  to="/onboarding"
                  className="group inline-flex items-center gap-3 bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base md:text-[17px] py-5 px-12 rounded-full transition-all duration-200 hover:-translate-y-0.5"
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

      </main>
    </>
  );
}
