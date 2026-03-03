import React, { useState, useMemo, useId } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  CircleHelp as HelpCircle,
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

type QA = { q: string; a: React.ReactNode; category: string };

const FAQ_GENERAL: QA[] = [
  {
    q: "Wat krijg ik precies als ik start?",
    a: "Je krijgt minimaal vijf complete outfits met uitleg waarom ze bij je passen. Elke outfit heeft directe shoplinks naar webshops. Je hoeft geen account te maken om te beginnen.",
    category: "algemeen",
  },
  {
    q: "Werkt FitFi op mijn telefoon?",
    a: "Ja, volledig. Wij bouwen mobile-first: de ervaring op je telefoon is even snel en overzichtelijk als op desktop.",
    category: "algemeen",
  },
  {
    q: "Is dit stijladvies persoonlijk of generiek?",
    a: 'Persoonlijk. Je antwoorden worden vertaald naar jouw unieke stijlprofiel — bijvoorbeeld "65% Minimalistisch, 25% Casual Chic". Outfits worden hier direct op afgestemd.',
    category: "algemeen",
  },
];

const FAQ_PRIVACY: QA[] = [
  {
    q: "Hoe gaan jullie met mijn gegevens om?",
    a: "Wij bewaren alleen je quizantwoorden en outfitvoorkeuren. Geen doorverkoop, geen reclame-tracking. Je kunt je gegevens altijd laten verwijderen via contact@fitfi.ai.",
    category: "privacy",
  },
  {
    q: "Moet ik foto's uploaden?",
    a: "Nee. De quiz werkt zonder foto's. Premium-leden kunnen later optioneel een foto uploaden voor kleuranalyse op basis van ondertoon. Dat is volledig vrijwillig.",
    category: "privacy",
  },
  {
    q: "Waarom passen deze outfits bij mij?",
    a: "Elke outfit toont een korte uitleg: waarom de kleuren kloppen, welke pasvorm aansluit bij je voorkeur en hoe de stijl past bij je profiel. Je ziet altijd het waarom.",
    category: "privacy",
  },
];

const FAQ_PRICING: QA[] = [
  {
    q: "Blijft er een gratis optie?",
    a: "Ja. Met het gratis plan krijg je toegang tot je stijlprofiel en je eerste outfits. Je kunt altijd gratis blijven.",
    category: "prijzen",
  },
  {
    q: "Kan ik maandelijks opzeggen of van plan wisselen?",
    a: "Ja. Geen lange contracten, geen boetes. Je kunt elk moment opzeggen of wisselen. Wij factureren maandelijks.",
    category: "prijzen",
  },
  {
    q: "Welke betaalmethodes ondersteunen jullie?",
    a: "iDEAL, creditcard en Apple Pay via Stripe.",
    category: "prijzen",
  },
];

const FAQ_PRODUCT: QA[] = [
  {
    q: "Kan ik de quiz opnieuw doen?",
    a: "Ja, zo vaak als je wilt. Je krijgt dan nieuwe outfits op basis van je nieuwe antwoorden. Je vorige profiel blijft bewaard.",
    category: "product",
  },
  {
    q: "Kan ik outfits opslaan?",
    a: "Ja. Je kunt favoriete outfits opslaan in je dashboard. De shoplinks blijven beschikbaar zodat je later kunt winkelen.",
    category: "product",
  },
  {
    q: "Wat als ik hulp nodig heb?",
    a: "Stuur een mail naar contact@fitfi.ai. Wij reageren binnen 24 uur en denken graag mee over je stijlvragen.",
    category: "product",
  },
];

const ALL_QUESTIONS: QA[] = [
  ...FAQ_GENERAL,
  ...FAQ_PRIVACY,
  ...FAQ_PRICING,
  ...FAQ_PRODUCT,
];

const CATEGORIES = [
  { id: "algemeen", label: "Algemeen", icon: HelpCircle, items: FAQ_GENERAL },
  { id: "privacy", label: "Privacy & gegevens", icon: ShieldCheck, items: FAQ_PRIVACY },
  { id: "prijzen", label: "Prijzen", icon: CreditCard, items: FAQ_PRICING },
  { id: "product", label: "Product & gebruik", icon: Package, items: FAQ_PRODUCT },
];

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    title: "Privacybewust",
    body: "Alleen wat nodig is. Nooit doorverkocht.",
  },
  {
    icon: CreditCard,
    title: "Eerlijk geprijsd",
    body: "Begin gratis. Opzeggen altijd.",
  },
  {
    icon: Clock,
    title: "Direct resultaat",
    body: "Outfits binnen twee minuten.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_QUESTIONS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: typeof item.a === "string" ? item.a : String(item.a),
    },
  })),
};

function highlightText(text: string, term: string): React.ReactNode {
  if (!term.trim()) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark
        key={i}
        className="bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-800)] rounded px-0.5 not-italic"
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

type AccordionItemProps = {
  item: QA;
  id: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  highlightTerm?: string;
  isLast: boolean;
};

function AccordionItem({
  item,
  id,
  isOpen,
  onToggle,
  highlightTerm = "",
  isLast,
}: AccordionItemProps) {
  const panelId = `panel-${id}`;
  const headingId = `heading-${id}`;

  return (
    <div className={!isLast ? "border-b border-[var(--color-border)]" : ""}>
      <h3 id={headingId}>
        <button
          onClick={() => onToggle(id)}
          className="w-full min-h-[56px] px-6 py-4 flex items-center justify-between gap-4 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ff-color-primary-400)] transition-colors hover:bg-[var(--ff-color-primary-50)]"
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <span
            className={`font-medium text-base leading-snug transition-colors ${
              isOpen
                ? "text-[var(--ff-color-primary-700)]"
                : "text-[var(--color-text)] group-hover:text-[var(--ff-color-primary-700)]"
            }`}
          >
            {highlightTerm ? highlightText(item.q, highlightTerm) : item.q}
          </span>
          <span
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isOpen
                ? "bg-[var(--ff-color-primary-700)] text-white"
                : "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] group-hover:bg-[var(--ff-color-primary-200)]"
            }`}
            aria-hidden="true"
          >
            {isOpen ? (
              <Minus className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headingId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 pt-1 text-[var(--color-muted)] leading-relaxed text-base">
              {highlightTerm && typeof item.a === "string"
                ? highlightText(item.a, highlightTerm)
                : item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type AccordionProps = {
  items: QA[];
  categoryId: string;
  openId: string | null;
  onToggle: (id: string) => void;
  highlightTerm?: string;
};

function Accordion({
  items,
  categoryId,
  openId,
  onToggle,
  highlightTerm = "",
}: AccordionProps) {
  return (
    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-soft)]">
      {items.map((item, i) => {
        const id = `${categoryId}-${i}`;
        return (
          <AccordionItem
            key={id}
            item={item}
            id={id}
            isOpen={openId === id}
            onToggle={onToggle}
            highlightTerm={highlightTerm}
            isLast={i === items.length - 1}
          />
        );
      })}
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("algemeen");
  const [openId, setOpenId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const tablistId = useId();

  const isSearching = searchTerm.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = searchTerm.trim().toLowerCase();
    return ALL_QUESTIONS.filter(
      (item) =>
        item.q.toLowerCase().includes(q) ||
        (typeof item.a === "string" && item.a.toLowerCase().includes(q))
    );
  }, [searchTerm, isSearching]);

  const currentCategory =
    CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];

  function handleToggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function handleCategoryChange(id: string) {
    setActiveCategory(id);
    setOpenId(null);
    setSearchTerm("");
  }

  function clearSearch() {
    setSearchTerm("");
    setOpenId(null);
  }

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="Veelgestelde vragen — FitFi"
        description="Antwoorden op de meest gestelde vragen over FitFi: hoe het werkt, privacy, prijzen en je account."
        path="/veelgestelde-vragen"
        structuredData={FAQ_SCHEMA}
      />

      {/* ═══════════════════════════════════════════════════
          HERO — cinematic, donker, editorial
          Zelfde taal als HeroV3
      ═══════════════════════════════════════════════════ */}

      {/* MOBILE hero */}
      <section
        aria-labelledby="faq-heading"
        className="sm:hidden relative w-full overflow-hidden"
        style={{ height: '72svh', minHeight: '460px', background: '#1c120a' }}
      >
        <img
          src="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: '50% 30%' }}
          loading="eager"
          aria-hidden="true"
        />

        {/* Bovenste fade */}
        <div
          className="absolute top-0 inset-x-0 pointer-events-none"
          style={{
            height: '35%',
            background: 'linear-gradient(to bottom, rgba(28,18,10,0.70) 0%, rgba(28,18,10,0.20) 60%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Onderste fade */}
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{
            height: '80%',
            background: 'linear-gradient(to bottom, transparent 0%, rgba(20,13,8,0.55) 30%, rgba(20,13,8,0.88) 60%, rgba(20,13,8,0.98) 85%, rgba(20,13,8,1.0) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Vignet */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(20,13,8,0.28) 100%)' }}
          aria-hidden="true"
        />

        {/* AI badge */}
        <div
          className="absolute top-5 left-4 z-20 inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
          style={{
            background: 'rgba(247,243,236,0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(247,243,236,0.22)',
          }}
        >
          <Sparkles className="w-3 h-3" style={{ color: '#e8d5b0' }} aria-hidden="true" />
          <span className="text-[11px] font-bold tracking-[0.08em] uppercase" style={{ color: '#F7F3EC' }}>
            Hulp & informatie
          </span>
        </div>

        {/* Tekst + trust — vastgepind onderaan */}
        <div className="absolute bottom-0 inset-x-0 z-20 px-6 pb-9">
          <h1
            id="faq-heading"
            className="font-bold tracking-tight mb-3"
            style={{
              fontSize: 'clamp(2.25rem, 9.5vw, 2.9rem)',
              lineHeight: 1.06,
              color: '#F7F3EC',
              letterSpacing: '-0.02em',
            }}
          >
            Veelgestelde{' '}
            <em className="not-italic" style={{ color: '#d4a96a' }}>vragen</em>
          </h1>

          <p
            className="text-[14px] font-light leading-[1.6] mb-6"
            style={{ color: 'rgba(247,243,236,0.65)', maxWidth: '90%' }}
          >
            Alles wat je wilt weten over FitFi. Staat je vraag er niet bij?{' '}
            <a
              href="mailto:contact@fitfi.ai"
              className="font-semibold underline underline-offset-2"
              style={{ color: '#d4a96a' }}
            >
              Stuur ons een bericht.
            </a>
          </p>

          {/* Trust pills — horizontal row */}
          <div className="flex gap-2 flex-wrap">
            {TRUST_ITEMS.map((t, i) => {
              const Icon = t.icon;
              return (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{
                    background: 'rgba(247,243,236,0.08)',
                    border: '1px solid rgba(247,243,236,0.16)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
                >
                  <Icon className="w-3 h-3 flex-shrink-0" style={{ color: '#b8976a' }} aria-hidden="true" />
                  <span className="text-[11px] font-semibold tracking-wide" style={{ color: 'rgba(247,243,236,0.80)' }}>
                    {t.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DESKTOP hero */}
      <section
        aria-labelledby="faq-heading-desktop"
        className="hidden sm:block relative w-full overflow-hidden"
        style={{ minHeight: 'min(52vh, 520px)', background: '#2a1f14' }}
      >
        {/* Full-bleed foto */}
        <div className="absolute inset-0" aria-hidden="true">
          <img
            src="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
            alt=""
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 25%' }}
            loading="eager"
          />
          {/* Linker overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(100deg, rgba(30,20,10,0.90) 0%, rgba(30,20,10,0.68) 36%, rgba(30,20,10,0.22) 62%, transparent 100%)',
            }}
          />
          {/* Onderste fade naar site-achtergrond */}
          <div
            className="absolute bottom-0 inset-x-0 h-36"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(247,243,236,0.22) 100%)',
            }}
          />
        </div>

        {/* Tekstkolom */}
        <div
          className="relative z-10 w-full max-w-6xl mx-auto px-8 lg:px-14 flex items-center"
          style={{ minHeight: 'min(52vh, 520px)' }}
        >
          <div className="max-w-2xl py-20">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-7"
              style={{
                background: 'rgba(247,243,236,0.94)',
                color: 'var(--ff-color-primary-700)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              Hulp & informatie
            </div>

            <h1
              id="faq-heading-desktop"
              className="font-bold leading-[1.05] tracking-tight mb-5"
              style={{
                fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
                color: '#F7F3EC',
                letterSpacing: '-0.02em',
              }}
            >
              Veelgestelde{' '}
              <em className="not-italic" style={{ color: 'var(--ff-color-primary-300)' }}>
                vragen
              </em>
            </h1>

            <p
              className="text-lg leading-relaxed max-w-lg mb-9 font-light"
              style={{ color: 'rgba(247,243,236,0.76)' }}
            >
              Alles wat je wilt weten over FitFi. Staat je vraag er niet bij?{' '}
              <a
                href="mailto:contact@fitfi.ai"
                className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-80"
                style={{ color: '#d4a96a' }}
              >
                Stuur ons een bericht.
              </a>
            </p>

            {/* Trust badges — frosted glass pills */}
            <div className="flex flex-wrap gap-2.5">
              {TRUST_ITEMS.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{
                      background: 'rgba(247,243,236,0.09)',
                      border: '1px solid rgba(247,243,236,0.20)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#b8976a' }} aria-hidden="true" />
                    <span className="text-sm font-semibold" style={{ color: 'rgba(247,243,236,0.82)' }}>
                      {t.title}
                    </span>
                    <span className="hidden md:inline text-xs" style={{ color: 'rgba(247,243,236,0.50)' }}>
                      — {t.body}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════ */}
      <section className="ff-container py-12 sm:py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-12 xl:gap-16">

            {/* ── SIDEBAR ── */}
            <aside className="mb-10 lg:mb-0">

              {/* Search */}
              <div className="relative mb-6">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none"
                  aria-hidden="true"
                />
                <label htmlFor="faq-search" className="sr-only">
                  Zoek in veelgestelde vragen
                </label>
                <input
                  id="faq-search"
                  type="search"
                  inputMode="search"
                  placeholder="Zoek een vraag…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoComplete="off"
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-base placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-400)] focus:border-transparent transition-all shadow-[var(--shadow-soft)]"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] transition-colors"
                    aria-label="Zoekopdracht wissen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category nav */}
              <nav aria-label="FAQ categorieën">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-muted)] mb-3 px-1">
                  Categorieën
                </p>
                <ul
                  id={tablistId}
                  role="tablist"
                  aria-orientation="horizontal"
                  className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isActive = !isSearching && activeCategory === cat.id;
                    return (
                      <li
                        key={cat.id}
                        role="presentation"
                        className="flex-shrink-0 lg:flex-shrink"
                      >
                        <button
                          role="tab"
                          aria-selected={isActive}
                          onClick={() => handleCategoryChange(cat.id)}
                          className={`min-h-[48px] w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:outline-none ${
                            isActive
                              ? "bg-[var(--ff-color-primary-700)] text-white shadow-md"
                              : "text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] hover:text-[var(--ff-color-primary-700)]"
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                              isActive
                                ? 'bg-white/20'
                                : 'bg-[var(--ff-color-primary-100)]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                          <span className="whitespace-nowrap lg:whitespace-normal flex-1">
                            {cat.label}
                          </span>
                          <span
                            className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"
                            }`}
                          >
                            {cat.items.length}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Contact card */}
              <div
                className="mt-6 rounded-2xl p-5 border border-[var(--ff-color-primary-200)]"
                style={{
                  background: 'linear-gradient(135deg, var(--ff-color-primary-50) 0%, var(--ff-color-accent-50) 100%)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--ff-color-primary-100)' }}
                >
                  <MessageCircle className="w-4.5 h-4.5 text-[var(--ff-color-primary-700)]" aria-hidden="true" />
                </div>
                <p className="text-sm font-bold text-[var(--color-text)] mb-1">Nog een vraag?</p>
                <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-3">
                  Wij reageren binnen 24 uur.
                </p>
                <a
                  href="mailto:contact@fitfi.ai"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors min-h-[44px] py-1"
                >
                  contact@fitfi.ai
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </aside>

            {/* ── ACCORDION PANEL ── */}
            <div>
              {/* Screen reader live region */}
              <div aria-live="polite" aria-atomic="true" className="sr-only">
                {isSearching
                  ? searchResults.length === 0
                    ? "Geen resultaten gevonden"
                    : `${searchResults.length} ${searchResults.length === 1 ? "resultaat" : "resultaten"} gevonden`
                  : ""}
              </div>

              <AnimatePresence mode="wait">
                {isSearching ? (
                  <motion.div
                    key="search-results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ff-color-primary-600)] mb-5">
                      {searchResults.length === 0
                        ? "Geen resultaten"
                        : `${searchResults.length} ${searchResults.length === 1 ? "resultaat" : "resultaten"} voor "${searchTerm}"`}
                    </p>

                    {searchResults.length === 0 ? (
                      <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-12 text-center shadow-[var(--shadow-soft)]">
                        <div
                          className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                          style={{ background: 'var(--ff-color-primary-50)' }}
                        >
                          <Search className="w-5 h-5 text-[var(--ff-color-primary-400)]" aria-hidden="true" />
                        </div>
                        <p className="text-[var(--color-muted)] text-base mb-4">
                          Geen vragen gevonden voor{" "}
                          <strong className="text-[var(--color-text)]">"{searchTerm}"</strong>.
                        </p>
                        <button
                          onClick={clearSearch}
                          className="text-sm font-bold text-[var(--ff-color-primary-700)] hover:underline underline-offset-2 min-h-[44px] px-4"
                        >
                          Toon alle vragen
                        </button>
                      </div>
                    ) : (
                      <Accordion
                        items={searchResults}
                        categoryId="search"
                        openId={openId}
                        onToggle={handleToggle}
                        highlightTerm={searchTerm}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--ff-color-primary-600)]">
                          {currentCategory.label}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-muted)] font-medium">
                        {currentCategory.items.length} vragen
                      </span>
                    </div>
                    <Accordion
                      items={currentCategory.items}
                      categoryId={currentCategory.id}
                      openId={openId}
                      onToggle={handleToggle}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          BOTTOM CTA — donker, premium, editorial
      ═══════════════════════════════════════════════════ */}
      <section className="ff-container pb-20">
        <div className="max-w-5xl mx-auto">
          <div
            className="relative overflow-hidden rounded-3xl px-8 sm:px-12 py-12 sm:py-14"
            style={{
              background: 'linear-gradient(135deg, #2a1f14 0%, #3d2b1a 50%, #2a1f14 100%)',
            }}
          >
            {/* Decoratieve lichte cirkel */}
            <div
              className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(184,151,106,0.18) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(212,169,106,0.10) 0%, transparent 70%)',
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <p
                  className="font-bold text-xl sm:text-2xl mb-2 tracking-tight"
                  style={{ color: '#F7F3EC' }}
                >
                  Klaar om je stijl te ontdekken?
                </p>
                <p
                  className="text-sm font-light"
                  style={{ color: 'rgba(247,243,236,0.62)' }}
                >
                  De quiz duurt minder dan twee minuten. Geen creditcard nodig.
                </p>
              </div>

              <NavLink
                to="/onboarding"
                className="group flex-shrink-0 inline-flex items-center gap-2.5 px-7 py-3.5 min-h-[52px] rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, #9b7a52 0%, #7a5c38 100%)',
                  color: '#F7F3EC',
                  boxShadow: '0 4px 24px rgba(100,72,40,0.50)',
                }}
              >
                Start gratis
                <ArrowRight
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
