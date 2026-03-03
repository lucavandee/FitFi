import React, { useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleHelp,
  ShieldCheck,
  CreditCard,
  Clock,
  Plus,
  Minus,
  Package,
  Search,
  X,
  ArrowRight,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import Seo from "@/components/seo/Seo";

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
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
  { id: "algemeen", label: "Algemeen",           Icon: CircleHelp,  items: FAQ_GENERAL  },
  { id: "privacy",  label: "Privacy & gegevens",  Icon: ShieldCheck, items: FAQ_PRIVACY  },
  { id: "prijzen",  label: "Prijzen",              Icon: CreditCard,  items: FAQ_PRICING  },
  { id: "product",  label: "Product & gebruik",    Icon: Package,     items: FAQ_PRODUCT  },
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

/* ─────────────────────────────────────────────────────────────
   HIGHLIGHT helper
───────────────────────────────────────────────────────────── */
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
            className="bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-800)] rounded px-0.5"
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

/* ─────────────────────────────────────────────────────────────
   ACCORDION ITEM
───────────────────────────────────────────────────────────── */
function AccordionItem({
  item, id, isOpen, onToggle, highlight, isLast,
}: {
  item: QA;
  id: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  highlight: string;
  isLast: boolean;
}) {
  return (
    <div className={isLast ? "" : "border-b border-[var(--color-border)]"}>
      <h3 className="m-0">
        <button
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          aria-controls={`panel-${id}`}
          className={[
            "w-full min-h-[56px] flex items-center justify-between gap-4",
            "px-6 py-4 text-left border-none cursor-pointer",
            "transition-colors duration-150",
            isOpen
              ? "bg-[var(--ff-color-primary-50)]"
              : "bg-transparent hover:bg-[var(--ff-color-primary-50)]",
          ].join(" ")}
        >
          <span
            className={[
              "flex-1 text-sm sm:text-base font-medium leading-snug",
              isOpen
                ? "text-[var(--ff-color-primary-700)]"
                : "text-[var(--color-text)]",
            ].join(" ")}
          >
            <Highlight text={item.q} term={highlight} />
          </span>
          <span
            className={[
              "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150",
              isOpen
                ? "bg-[var(--ff-color-primary-700)] text-white"
                : "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]",
            ].join(" ")}
            aria-hidden="true"
          >
            {isOpen ? <Minus size={11} strokeWidth={2.5} /> : <Plus size={11} strokeWidth={2.5} />}
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`panel-${id}`}
            role="region"
            aria-labelledby={`label-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p className="m-0 px-6 pb-5 pt-0 text-sm sm:text-base leading-relaxed text-[var(--color-muted)]">
              <Highlight text={item.a} term={highlight} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PAGE
───────────────────────────────────────────────────────────── */
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
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="Veelgestelde vragen — FitFi"
        description="Antwoorden op de meest gestelde vragen over FitFi: hoe het werkt, privacy, prijzen en je account."
        path="/veelgestelde-vragen"
        structuredData={FAQ_SCHEMA}
      />

      {/* ════════════════════════════════════════════════
          HERO  — zelfde gradient als Prijzen & Blog
      ════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] border-b border-[var(--color-border)]">
        <div className="ff-container py-12 sm:py-16 md:py-20">
          <div className="max-w-3xl mx-auto text-center">

            {/* Badge — zelfde patroon als Prijzen */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] text-xs font-bold tracking-widest uppercase mb-5">
              <Sparkles className="w-3 h-3" aria-hidden="true" />
              Hulp &amp; informatie
            </div>

            {/* H1 — zelfde grootte als Prijzen & Blog */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight text-[var(--color-text)] mb-4">
              Veelgestelde{" "}
              <span className="text-[var(--ff-color-primary-700)]">vragen</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-muted)] leading-relaxed max-w-xl mx-auto mb-6">
              Alles wat je wilt weten over FitFi. Staat je vraag er niet bij?{" "}
              <a
                href="mailto:contact@fitfi.ai"
                className="text-[var(--ff-color-primary-700)] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Stuur ons een bericht.
              </a>
            </p>

            {/* Trust pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { Icon: ShieldCheck, label: "Privacybewust"    },
                { Icon: CreditCard,  label: "Eerlijk geprijsd"  },
                { Icon: Clock,       label: "Direct resultaat"  },
              ].map(({ Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[var(--color-border)] shadow-[var(--shadow-soft)] text-xs font-semibold text-[var(--color-text)]"
                >
                  <Icon className="w-3 h-3 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CONTENT
      ════════════════════════════════════════════════ */}
      <section className="ff-container py-10 sm:py-14 md:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start max-w-5xl mx-auto">

          {/* ── SIDEBAR ── */}
          <aside className="w-full lg:w-56 flex-shrink-0">

            {/* Search */}
            <div className="relative mb-5">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)] pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="faq-search" className="sr-only">
                Zoek in veelgestelde vragen
              </label>
              <input
                id="faq-search"
                type="search"
                placeholder="Zoek een vraag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text)] shadow-[var(--shadow-soft)] outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent transition-shadow"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  aria-label="Wissen"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Category label */}
            <p className="text-xs font-bold tracking-widest uppercase text-[var(--color-muted)] mb-2 px-1">
              Categorieën
            </p>

            {/* Category nav */}
            <nav aria-label="FAQ categorieën">
              <ul className="flex flex-col gap-1 list-none m-0 p-0">
                {CATEGORIES.map(({ id, label, Icon, items }) => {
                  const active = !isSearching && activeCat === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => changeCat(id)}
                        aria-pressed={active}
                        className={[
                          "w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-xl border-none cursor-pointer text-left text-sm font-semibold transition-all duration-150",
                          active
                            ? "bg-[var(--ff-color-primary-700)] text-white shadow-[var(--shadow-soft)]"
                            : "bg-transparent text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] hover:text-[var(--ff-color-primary-700)]",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]",
                          ].join(" ")}
                        >
                          <Icon size={12} aria-hidden="true" />
                        </span>
                        <span className="flex-1 truncate">{label}</span>
                        <span
                          className={[
                            "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                            active
                              ? "bg-white/20 text-white"
                              : "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]",
                          ].join(" ")}
                        >
                          {items.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Contact card */}
            <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-4">
              <div className="w-8 h-8 rounded-xl bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] flex items-center justify-center mb-3">
                <MessageCircle size={14} aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-[var(--color-text)] mb-1">Nog een vraag?</p>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-3">
                Wij reageren binnen 24 uur.
              </p>
              <a
                href="mailto:contact@fitfi.ai"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--ff-color-primary-700)] hover:underline min-h-[44px]"
              >
                contact@fitfi.ai
                <ArrowRight size={11} />
              </a>
            </div>
          </aside>

          {/* ── ACCORDION ── */}
          <div className="flex-1 min-w-0">
            {/* Live region voor schermlezers */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {isSearching &&
                (searchResults.length === 0
                  ? "Geen resultaten gevonden"
                  : `${searchResults.length} resultaten gevonden`)}
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-[var(--ff-color-primary-600)]">
                {isSearching
                  ? searchResults.length === 0
                    ? "Geen resultaten"
                    : `${searchResults.length} resultaat${searchResults.length !== 1 ? "en" : ""} voor "${search}"`
                  : currentCat.label}
              </span>
              {!isSearching && (
                <span className="text-xs text-[var(--color-muted)] font-medium">
                  {currentCat.items.length} vragen
                </span>
              )}
            </div>

            {/* Accordion panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSearching ? `s-${search}` : activeCat}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {displayItems.length === 0 ? (
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-12 text-center">
                    <div className="w-10 h-10 rounded-2xl bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-400)] flex items-center justify-center mx-auto mb-4">
                      <Search size={18} aria-hidden="true" />
                    </div>
                    <p className="text-sm text-[var(--color-muted)] mb-4">
                      Geen vragen gevonden voor{" "}
                      <strong className="text-[var(--color-text)]">"{search}"</strong>.
                    </p>
                    <button
                      onClick={clearSearch}
                      className="text-sm font-bold text-[var(--ff-color-primary-700)] underline underline-offset-2 hover:opacity-80 transition-opacity min-h-[44px] px-2 bg-transparent border-none cursor-pointer"
                    >
                      Toon alle vragen
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden">
                    {displayItems.map((item, i) => (
                      <AccordionItem
                        key={`${displayKey}-${i}`}
                        item={item}
                        id={`${displayKey}-${i}`}
                        isOpen={openId === `${displayKey}-${i}`}
                        onToggle={toggle}
                        highlight={isSearching ? search : ""}
                        isLast={i === displayItems.length - 1}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          BOTTOM CTA  — zelfde stijl als Newsletter in Blog
      ════════════════════════════════════════════════ */}
      <section className="ff-container pb-14 sm:pb-16 md:pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] px-8 py-10 sm:px-10 sm:py-12">
            {/* Decoratieve cirkels — zelfde als Blog newsletter */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" aria-hidden="true" />

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-lg sm:text-xl font-bold text-white mb-1 tracking-tight">
                  Klaar om je stijl te ontdekken?
                </p>
                <p className="text-sm text-white/70 font-light">
                  De quiz duurt minder dan twee minuten. Geen creditcard nodig.
                </p>
              </div>
              <NavLink
                to="/onboarding"
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3.5 min-h-[52px] rounded-xl bg-white text-[var(--ff-color-primary-700)] font-bold text-sm hover:bg-white/90 transition-colors shadow-[var(--shadow-soft)] whitespace-nowrap active:scale-[0.98]"
              >
                Start gratis
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
