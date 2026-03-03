import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleHelp,
  ShieldCheck,
  CreditCard,
  Plus,
  Minus,
  Package,
  Search,
  X,
  ArrowRight,
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
    a: "Wij bewaren alleen je quizantwoorden en outfitvoorkeuren. Geen doorverkoop, geen reclame-tracking. Je kunt je gegevens altijd laten verwijderen via contact@fitfi.ai.",
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
    a: "Stuur een mail naar contact@fitfi.ai. Wij reageren binnen 24 uur en denken graag mee over je stijlvragen.",
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

function Highlight({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${esc})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-800)] rounded px-0.5 not-italic">
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
    <div
      className={[
        "rounded-xl border transition-all duration-200",
        isOpen
          ? "bg-[var(--color-surface)] border-[var(--ff-color-primary-200)]"
          : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--ff-color-primary-200)]",
      ].join(" ")}
    >
      <h3 className="m-0">
        <button
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          aria-controls={`panel-${id}`}
          className="w-full min-h-[56px] flex items-center justify-between gap-4 px-5 py-4 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
        >
          <span className={[
            "flex-1 text-[0.9375rem] leading-snug",
            isOpen ? "font-semibold text-[var(--ff-color-primary-700)]" : "font-medium text-[var(--color-text)]",
          ].join(" ")}>
            <Highlight text={item.q} term={highlight} />
          </span>
          <span
            className="w-6 h-6 shrink-0 flex items-center justify-center transition-colors duration-200"
            style={{ color: isOpen ? 'var(--ff-color-primary-700)' : 'var(--color-muted)' }}
            aria-hidden="true"
          >
            {isOpen
              ? <Minus className="w-4 h-4" strokeWidth={2} />
              : <Plus className="w-4 h-4" strokeWidth={2} />
            }
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
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 pt-0">
              <div className="pt-3 border-t border-[var(--color-border)]">
                <p className="m-0 text-sm leading-relaxed text-[var(--color-muted)]">
                  <Highlight text={item.a} term={highlight} />
                </p>
              </div>
            </div>
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

      <div
        className="bg-[var(--color-bg)] text-[var(--color-text)]"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >

        {/* ── HERO ── */}
        <section className="ff-section" style={{ paddingBottom: '2rem' }}>
          <div className="ff-container">
            <div className="max-w-2xl">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: 'var(--ff-color-primary-600)' }}
              >
                Hulp &amp; informatie
              </p>
              <h1
                className="font-heading font-bold tracking-tight mb-4"
                style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', lineHeight: 1.08 }}
              >
                Veelgestelde vragen
              </h1>
              <p className="text-base text-[var(--color-muted)] leading-relaxed">
                Staat je vraag er niet bij?{" "}
                <a
                  href="mailto:contact@fitfi.ai"
                  className="text-[var(--ff-color-primary-700)] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  Stuur ons een bericht
                </a>{" "}
                — wij reageren binnen 24 uur.
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ CONTENT ── */}
        <section className="pb-20 sm:pb-28">
          <div className="ff-container">

            {/* Search */}
            <div className="relative mb-8 max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" aria-hidden="true" />
              <label htmlFor="faq-search" className="sr-only">Zoek in veelgestelde vragen</label>
              <input
                id="faq-search"
                type="search"
                placeholder="Zoek een vraag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                className="w-full pl-11 pr-11 py-3.5 min-h-[52px] text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-[var(--ff-color-primary-400)] transition-all"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  aria-label="Zoekopdracht wissen"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category tabs */}
            {!isSearching && (
              <div
                role="tablist"
                aria-label="FAQ categorieën"
                className="flex gap-2 mb-8 flex-wrap"
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
                        "px-4 py-2 min-h-[40px] rounded-full text-sm font-semibold transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2",
                        active
                          ? "text-[var(--color-bg)]"
                          : "bg-[var(--color-surface)] text-[var(--color-muted)] border border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--ff-color-primary-200)]",
                      ].join(" ")}
                      style={active ? { background: 'var(--ff-color-primary-700)' } : undefined}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* a11y live region */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {isSearching && (
                searchResults.length === 0
                  ? "Geen resultaten gevonden"
                  : `${searchResults.length} resultaten gevonden voor ${search}`
              )}
            </div>

            {/* Accordion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSearching ? `s-${search}` : activeCat}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="max-w-3xl"
              >
                {displayItems.length === 0 ? (
                  <div className="py-14 text-center">
                    <p className="text-sm text-[var(--color-muted)] mb-4">
                      Geen vragen gevonden voor{" "}
                      <strong className="text-[var(--color-text)]">"{search}"</strong>.
                    </p>
                    <button
                      onClick={clearSearch}
                      className="min-h-[44px] px-4 text-sm font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer"
                      style={{ color: 'var(--ff-color-primary-700)' }}
                    >
                      Toon alle vragen
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {displayItems.map((item, i) => (
                      <AccordionItem
                        key={`${displayKey}-${i}`}
                        item={item}
                        id={`${displayKey}-${i}`}
                        isOpen={openId === `${displayKey}-${i}`}
                        onToggle={toggle}
                        highlight={isSearching ? search : ""}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section
          className="ff-section border-t border-[var(--color-border)]"
          style={{ background: 'var(--ff-color-primary-50)' }}
        >
          <div className="ff-container">
            <div className="max-w-xl">
              <h2
                className="font-heading font-bold tracking-tight mb-3"
                style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', lineHeight: 1.1 }}
              >
                Klaar om te starten?
              </h2>
              <p className="text-base text-[var(--color-muted)] leading-relaxed mb-8">
                Ontdek gratis in minder dan 2 minuten welke stijl echt bij jou past.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/onboarding"
                  className="group inline-flex items-center justify-center gap-2.5 px-7 min-h-[52px] rounded-xl text-base font-bold transition-all duration-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2 active:scale-[0.98]"
                  style={{
                    background: 'var(--ff-color-primary-700)',
                    color: 'var(--color-bg)',
                    boxShadow: '0 4px 20px rgba(166,136,106,0.35)',
                  }}
                >
                  Start gratis — 2 minuten
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <a
                  href="mailto:contact@fitfi.ai"
                  className="inline-flex items-center justify-center px-7 min-h-[52px] rounded-xl text-base font-semibold border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--ff-color-primary-400)] hover:text-[var(--ff-color-primary-700)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
                >
                  Stel een vraag
                </a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
