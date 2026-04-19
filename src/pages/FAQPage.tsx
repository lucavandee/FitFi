import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleHelp,
  ShieldCheck,
  CreditCard,
  Plus,
  Package,
  Search,
  X,
} from "lucide-react";
import Seo from "@/components/seo/Seo";

type QA = { q: string; a: string };

const FAQ_GENERAL: QA[] = [
  {
    q: "Wat krijg ik precies als ik start?",
    a: "Je krijgt minimaal vijf complete outfits met uitleg waarom ze bij je passen. Elke outfit heeft directe shoplinks naar webshops. Je hoeft geen account te maken om te beginnen.",
  },
  {
    q: "Werkt FitFi op mijn telefoon?",
    a: "Ja, volledig. Wij bouwen mobile-first: de ervaring op je telefoon is even snel en overzichtelijk als op desktop.",
  },
  {
    q: "Is dit stijladvies persoonlijk of generiek?",
    a: 'Persoonlijk. Je antwoorden worden vertaald naar jouw unieke stijlprofiel — bijvoorbeeld "65% Minimalistisch, 25% Casual Chic". Outfits worden hier direct op afgestemd.',
  },
];

const FAQ_PRIVACY: QA[] = [
  {
    q: "Hoe gaan jullie met mijn gegevens om?",
    a: "Wij bewaren alleen je quizantwoorden en outfitvoorkeuren. Geen doorverkoop, geen reclame-tracking. Je kunt je gegevens altijd laten verwijderen via info@fitfi.ai.",
  },
  {
    q: "Moet ik foto's uploaden?",
    a: "Nee. De quiz werkt zonder foto's. Premium-leden kunnen later optioneel een foto uploaden voor kleuranalyse op basis van ondertoon. Dat is volledig vrijwillig.",
  },
  {
    q: "Waarom passen deze outfits bij mij?",
    a: "Elke outfit toont een korte uitleg: waarom de kleuren kloppen, welke pasvorm aansluit bij je voorkeur en hoe de stijl past bij je profiel. Je ziet altijd het waarom.",
  },
];

const FAQ_PRICING: QA[] = [
  {
    q: "Blijft er een gratis optie?",
    a: "Ja. Met het gratis plan krijg je toegang tot je stijlprofiel en je eerste outfits. Je kunt altijd gratis blijven.",
  },
  {
    q: "Kan ik maandelijks opzeggen of van plan wisselen?",
    a: "Ja. Geen lange contracten, geen boetes. Je kunt elk moment opzeggen of wisselen. Wij factureren maandelijks.",
  },
  {
    q: "Welke betaalmethodes ondersteunen jullie?",
    a: "iDEAL, creditcard en Apple Pay via Stripe.",
  },
];

const FAQ_PRODUCT: QA[] = [
  {
    q: "Kan ik de quiz opnieuw doen?",
    a: "Ja, zo vaak als je wilt. Je krijgt dan nieuwe outfits op basis van je nieuwe antwoorden. Je vorige profiel blijft bewaard.",
  },
  {
    q: "Kan ik outfits opslaan?",
    a: "Ja. Je kunt favoriete outfits opslaan in je dashboard. De shoplinks blijven beschikbaar zodat je later kunt winkelen.",
  },
  {
    q: "Wat als ik hulp nodig heb?",
    a: "Stuur een mail naar info@fitfi.ai. Wij reageren binnen 24 uur en denken graag mee over je stijlvragen.",
  },
];

const CATEGORIES = [
  { id: "algemeen", label: "Algemeen",  Icon: CircleHelp,  items: FAQ_GENERAL  },
  { id: "privacy",  label: "Privacy",   Icon: ShieldCheck, items: FAQ_PRIVACY  },
  { id: "prijzen",  label: "Prijzen",   Icon: CreditCard,  items: FAQ_PRICING  },
  { id: "product",  label: "Product",   Icon: Package,     items: FAQ_PRODUCT  },
];

const ALL_QUESTIONS = CATEGORIES.flatMap((c) =>
  c.items.map((item) => ({ ...item, catId: c.id }))
);

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_QUESTIONS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

const TRUST_STATS = [
  { label: "2.500+ gebruikers"    },
  { label: "Reactie binnen 24 uur" },
  { label: "GDPR-compliant"        },
  { label: "12 vragen beantwoord"  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: "easeOut" },
  }),
};

function Highlight({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${esc})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="bg-[#F4E8E3] text-[#C2654A] rounded px-0.5 not-italic">
            {p}
          </mark>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </>
  );
}

function AccordionItem({
  item, id, isOpen, onToggle, highlight,
}: {
  item: QA; id: string; isOpen: boolean;
  onToggle: (id: string) => void; highlight: string;
}) {
  return (
    <div className={`border-b border-[#E5E5E5]`}>
      <h3 className="m-0">
        <button
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          aria-controls={`panel-${id}`}
          className="w-full flex justify-between items-center py-6 gap-4 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/40 focus-visible:ring-offset-2 rounded"
        >
          <span className="text-base font-semibold text-[#1A1A1A] flex-1 leading-snug">
            <Highlight text={item.q} term={highlight} />
          </span>
          <span
            className={[
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
              isOpen ? "bg-[#F4E8E3]" : "bg-[#F5F0EB]",
            ].join(" ")}
            aria-hidden="true"
          >
            <Plus
              className={[
                "w-4 h-4 text-[#C2654A] transition-transform duration-300",
                isOpen ? "rotate-45" : "",
              ].join(" ")}
            />
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`panel-${id}`}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="text-[15px] text-[#4A4A4A] leading-[1.7] pb-6 max-w-[600px]">
              <Highlight text={item.a} term={highlight} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [activeCat, setActiveCat] = useState("algemeen");
  const [openId,    setOpenId]    = useState<string | null>(null);
  const [search,    setSearch]    = useState("");

  const isSearching = search.trim().length > 0;
  const currentCat  = CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = search.trim().toLowerCase();
    return ALL_QUESTIONS.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [search, isSearching]);

  const displayItems = isSearching ? searchResults : currentCat.items;
  const displayKey   = isSearching ? "search" : activeCat;

  function toggle(id: string)    { setOpenId((p) => (p === id ? null : id)); }
  function changeCat(id: string) { setActiveCat(id); setOpenId(null); setSearch(""); }
  function clearSearch()         { setSearch(""); setOpenId(null); }

  return (
    <>
      <Seo
        title="Veelgestelde vragen — FitFi"
        description="Antwoorden op de meest gestelde vragen over FitFi: hoe het werkt, privacy, prijzen en je account."
        path="/veelgestelde-vragen"
        structuredData={FAQ_SCHEMA}
        ogImage="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
      />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[#C2654A] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold"
      >
        Spring naar hoofdinhoud
      </a>

      <main id="main-content" className="bg-[#FAFAF8]">

        {/* ── HERO ── */}
        <section
          className="bg-[#F5F0EB] pt-44 pb-12 md:pt-52 md:pb-16 text-center"
          aria-labelledby="faq-hero-heading"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2.5 mb-8"
            >
              <span className="w-6 h-px bg-[#C2654A]" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A]">
                Veelgestelde vragen
              </span>
              <span className="w-6 h-px bg-[#C2654A]" aria-hidden="true" />
            </motion.div>

            <motion.h1
              id="faq-hero-heading"
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] max-w-[700px] mx-auto mb-6"
            >
              <span className="font-serif italic">Alles wat je wilt </span>
              <span className="font-sans font-bold">weten</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-lg text-[#4A4A4A] leading-[1.7] max-w-[520px] mx-auto"
            >
              Staat je vraag er niet bij?{" "}
              <Link
                to="/contact"
                className="text-[#C2654A] hover:text-[#A8513A] underline underline-offset-4 transition-colors duration-200"
              >
                Stuur ons een bericht
              </Link>
              , wij reageren binnen 24 uur.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex items-center justify-center gap-6 mt-8 flex-wrap"
            >
              {TRUST_STATS.map(({ label }) => (
                <div key={label} className="flex items-center gap-2 text-sm font-medium text-[#4A4A4A]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C2654A] flex-shrink-0" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </motion.div>

          </div>
        </section>

        {/* ── FAQ CONTENT ── */}
        <section className="bg-[#FAFAF8] pt-16 pb-8" aria-label="Zoeken en filteren">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Search */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="relative w-full max-w-[600px] mx-auto"
            >
              <Search
                className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8A8A8A] pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="faq-search" className="sr-only">Zoek in veelgestelde vragen</label>
              <input
                id="faq-search"
                type="search"
                placeholder="Zoek een vraag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                className="w-full bg-white border border-[#E5E5E5] rounded-2xl py-3.5 px-5 text-base text-[#1A1A1A] placeholder:text-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#C2654A]/20 focus:border-[#C2654A] transition-colors duration-200"
                style={{ paddingLeft: '3rem' }}
              />
              {search && (
                <button
                  onClick={clearSearch}
                  aria-label="Zoekopdracht wissen"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </motion.div>

            {/* Category filters */}
            {!isSearching && (
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                custom={1}
                role="tablist"
                aria-label="FAQ categorieën"
                className="flex items-center justify-center gap-3 mt-8 mb-12 flex-wrap"
              >
                {CATEGORIES.map(({ id, label }) => {
                  const active = activeCat === id;
                  return (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={active}
                      onClick={() => changeCat(id)}
                      className={[
                        "px-5 py-2.5 rounded-full border text-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A]/40 focus-visible:ring-offset-2",
                        active
                          ? "border-[#C2654A] bg-[#C2654A] text-white font-semibold"
                          : "border-[#E5E5E5] bg-white text-[#4A4A4A] font-medium hover:border-[#C2654A]",
                      ].join(" ")}
                    >
                      {label}
                    </button>
                  );
                })}
              </motion.div>
            )}

          </div>
        </section>

        {/* ── ACCORDION ── */}
        <section className="bg-[#FAFAF8] pb-24" aria-label="Veelgestelde vragen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {isSearching && (
                searchResults.length === 0
                  ? "Geen resultaten gevonden"
                  : `${searchResults.length} resultaten gevonden voor ${search}`
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isSearching ? `s-${search}` : activeCat}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="max-w-[720px] mx-auto"
              >
                {displayItems.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#F5F0EB] flex items-center justify-center mx-auto mb-4">
                      <Search className="w-6 h-6 text-[#8A8A8A]" />
                    </div>
                    <p className="text-sm text-[#4A4A4A] mb-4">
                      Geen vragen gevonden voor{" "}
                      <strong className="text-[#1A1A1A]">"{search}"</strong>.
                    </p>
                    <button
                      onClick={clearSearch}
                      className="min-h-[44px] px-5 py-2 text-sm font-semibold rounded-xl border border-[#E5E5E5] text-[#C2654A] hover:border-[#C2654A] hover:bg-[#F4E8E3] transition-all bg-white cursor-pointer"
                    >
                      Toon alle vragen
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-[#E5E5E5]">
                    {displayItems.map((item, i) => (
                      <motion.div
                        key={`${displayKey}-${i}`}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={i * 0.5}
                      >
                        <AccordionItem
                          item={item}
                          id={`${displayKey}-${i}`}
                          isOpen={openId === `${displayKey}-${i}`}
                          onToggle={toggle}
                          highlight={isSearching ? search : ""}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="bg-[#F5F0EB] py-40 text-center" aria-label="Start met FitFi">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              className="text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] mb-6"
            >
              <span className="font-serif italic">Klaar om te beginnen?</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              className="text-[17px] text-[#4A4A4A] mb-12"
            >
              Gratis. Twee minuten. Geen account nodig.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              className="flex items-center justify-center gap-4 flex-wrap"
            >
              <Link
                to="/onboarding"
                className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-[15px] transition-colors duration-200"
              >
                Begin gratis →
              </Link>
              <Link
                to="/resultaten-voorbeeld"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-[15px] transition-colors duration-200 bg-white"
              >
                Bekijk voorbeeld
              </Link>
            </motion.div>

          </div>
        </section>

      </main>
    </>
  );
}
