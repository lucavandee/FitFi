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
  Sparkles,
  Clock,
  Users,
  MessageCircle,
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

const TRUST_STATS = [
  { icon: Users,          label: "2.500+ gebruikers"    },
  { icon: Clock,          label: "Reactie binnen 24 uur" },
  { icon: ShieldCheck,    label: "GDPR-compliant"        },
  { icon: MessageCircle,  label: "12 vragen beantwoord"  },
];

function Highlight({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${esc})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            className="bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-800)] rounded px-0.5 not-italic"
          >
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
  item, id, index, isOpen, onToggle, highlight,
}: {
  item: QA; id: string; index: number; isOpen: boolean;
  onToggle: (id: string) => void; highlight: string;
}) {
  return (
    <motion.div
      layout
      className={[
        "rounded-2xl border-2 transition-all duration-200 shadow-[var(--shadow-soft)]",
        isOpen
          ? "bg-[var(--color-surface)] border-[var(--ff-color-primary-400)]"
          : "bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--ff-color-primary-200)]",
      ].join(" ")}
    >
      <h3 className="m-0">
        <button
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          aria-controls={`panel-${id}`}
          className="w-full min-h-[52px] flex items-center gap-3.5 px-4 sm:px-5 py-3.5 text-left rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
        >
          <span
            className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{
              background: isOpen
                ? 'var(--ff-color-primary-700)'
                : 'var(--ff-color-primary-100)',
              color: isOpen ? '#fff' : 'var(--ff-color-primary-700)',
            }}
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <span
            className={[
              "flex-1 text-sm sm:text-[0.9375rem] leading-snug",
              isOpen
                ? "font-bold text-[var(--color-text)]"
                : "font-semibold text-[var(--color-text)]",
            ].join(" ")}
          >
            <Highlight text={item.q} term={highlight} />
          </span>
          <span
            className="w-8 h-8 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0 transition-colors"
            aria-hidden="true"
          >
            {isOpen
              ? <Minus className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
              : <Plus  className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={2.5} />
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
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0" style={{ paddingLeft: 'calc(1rem + 1.75rem + 0.875rem)' }}>
              <div className="pt-3 border-t border-[var(--ff-color-primary-100)]">
                <p className="m-0 text-sm leading-relaxed text-[var(--color-muted)]">
                  <Highlight text={item.a} term={highlight} />
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[var(--ff-color-primary-700)] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold"
      >
        Spring naar hoofdinhoud
      </a>

      <main
        id="main-content"
        className="bg-[var(--color-bg)] text-[var(--color-text)]"
        style={{ minHeight: 'calc(100vh - 64px)' }}
      >

        {/* ── HERO ── */}
        <section
          className="relative overflow-hidden bg-[var(--ff-color-primary-50)] py-14 sm:py-20 md:py-28"
          aria-labelledby="faq-hero-heading"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(166,136,106,0.10) 0%, transparent 70%)',
            }}
          />
          <div className="ff-container relative z-10 text-center">

            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full text-sm font-bold text-[var(--color-text)] shadow-[var(--shadow-soft)] mb-7"
              role="status"
              aria-label="12 vragen beantwoord"
            >
              <CircleHelp className="w-4 h-4 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
              12 veelgestelde vragen beantwoord
            </div>

            <h1
              id="faq-hero-heading"
              className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-5"
              style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 1.08 }}
            >
              Alles wat je wilt{" "}
              <em
                className="not-italic bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, var(--ff-color-primary-600), var(--ff-color-primary-800))' }}
              >
                weten
              </em>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] mb-10 max-w-xl mx-auto leading-relaxed font-light">
              Staat je vraag er niet bij?{" "}
              <a
                href="mailto:contact@fitfi.ai"
                className="text-[var(--ff-color-primary-700)] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Stuur ons een bericht
              </a>{" "}
              — wij reageren binnen 24 uur.
            </p>

            <div
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6"
              role="list"
              aria-label="Kernwaarden"
            >
              {TRUST_STATS.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5" role="listitem">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--ff-color-primary-100)' }}
                    aria-hidden="true"
                  >
                    <Icon className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
                  </div>
                  <span className="text-sm sm:text-base font-semibold text-[var(--color-text)]">{label}</span>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── FAQ CONTENT ── */}
        <section className="ff-section bg-[var(--color-surface)]" aria-label="Veelgestelde vragen">
          <div className="ff-container">

            {/* Search */}
            <div className="relative mb-8 max-w-lg mx-auto">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none"
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
                className="w-full pr-11 py-3.5 min-h-[52px] text-sm rounded-xl border-2 border-[var(--ff-color-primary-200)] bg-[var(--ff-color-primary-50)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-[var(--ff-color-primary-400)] transition-all"
                style={{ paddingLeft: '3rem' }}
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
                className="flex flex-wrap justify-center gap-2.5 mb-10"
              >
                {CATEGORIES.map(({ id, label, Icon }) => {
                  const active = activeCat === id;
                  return (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={active}
                      onClick={() => changeCat(id)}
                      className={[
                        "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2",
                        active
                          ? "shadow-lg"
                          : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--ff-color-primary-300)] hover:text-[var(--color-text)] shadow-[var(--shadow-soft)]",
                      ].join(" ")}
                      style={
                        active
                          ? {
                              background: 'linear-gradient(135deg, var(--ff-color-primary-700), var(--ff-color-primary-900))',
                              borderColor: 'var(--ff-color-primary-600)',
                              color: '#fff',
                            }
                          : undefined
                      }
                    >
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={
                          active
                            ? { background: 'rgba(255,255,255,0.18)' }
                            : { background: 'var(--ff-color-primary-100)' }
                        }
                        aria-hidden="true"
                      >
                        <Icon
                          className="w-3.5 h-3.5"
                          style={{ color: active ? '#fff' : 'var(--ff-color-primary-700)' }}
                        />
                      </span>
                      <span>{label}</span>
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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="max-w-3xl mx-auto"
              >
                {displayItems.length === 0 ? (
                  <div className="py-16 text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'var(--ff-color-primary-100)' }}
                    >
                      <Search className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                    </div>
                    <p className="text-sm text-[var(--color-muted)] mb-4">
                      Geen vragen gevonden voor{" "}
                      <strong className="text-[var(--color-text)]">"{search}"</strong>.
                    </p>
                    <button
                      onClick={clearSearch}
                      className="min-h-[44px] px-5 py-2 text-sm font-semibold rounded-xl border border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)] transition-all bg-transparent cursor-pointer"
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
                        index={i}
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
          className="ff-section bg-[var(--ff-color-primary-50)]"
          aria-label="Start met FitFi"
        >
          <div className="ff-container text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mx-auto mb-6 shadow-sm"
              style={{ background: 'linear-gradient(135deg, var(--ff-color-primary-600), var(--ff-color-primary-800))' }}
              aria-hidden="true"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2
              className="font-heading font-bold tracking-tight text-[var(--color-text)] mb-4"
              style={{ fontSize: 'clamp(1.75rem, 3vw + 0.75rem, 2.5rem)', lineHeight: 1.1 }}
            >
              Klaar om te starten?
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-muted)] mb-8 max-w-md mx-auto leading-relaxed font-light">
              Ontdek gratis in minder dan 2 minuten welke stijl echt bij jou past.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/onboarding"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 min-h-[56px] rounded-xl font-bold text-base transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                style={{
                  background: 'var(--ff-color-primary-700)',
                  color: 'var(--color-bg)',
                  boxShadow: '0 8px 40px rgba(166,136,106,0.45)',
                }}
              >
                Start gratis — 2 minuten
                <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <a
                href="mailto:contact@fitfi.ai"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 min-h-[52px] rounded-xl text-base font-semibold border-2 border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-800)] hover:border-[var(--ff-color-primary-500)] hover:bg-[var(--ff-color-primary-100)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]"
                style={{ background: 'transparent' }}
              >
                Stel een vraag
              </a>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
