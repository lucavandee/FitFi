import React, { useState, useMemo } from "react";
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
    body: "Wij verwerken alleen wat nodig is en verkopen niets door.",
  },
  {
    icon: CreditCard,
    title: "Eerlijk geprijsd",
    body: "Begin gratis. Upgraden kan later, opzeggen altijd.",
  },
  {
    icon: Clock,
    title: "Direct resultaat",
    body: "Beantwoord een paar vragen en zie outfits met uitleg binnen twee minuten.",
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
  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-800)] rounded px-0.5 not-italic">
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

function AccordionItem({ item, id, isOpen, onToggle, highlightTerm = "", isLast }: AccordionItemProps) {
  const panelId = `panel-${id}`;
  const headingId = `heading-${id}`;

  return (
    <div className={!isLast ? "border-b border-[var(--color-border)]" : ""}>
      <h3 id={headingId}>
        <button
          onClick={() => onToggle(id)}
          className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ff-color-primary-400)] transition-colors hover:bg-[var(--ff-color-primary-25)]"
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <span className={`font-medium text-sm sm:text-base leading-snug transition-colors ${isOpen ? "text-[var(--ff-color-primary-700)]" : "text-[var(--color-text)] group-hover:text-[var(--ff-color-primary-700)]"}`}>
            {highlightTerm ? highlightText(item.q, highlightTerm) : item.q}
          </span>
          <span
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isOpen
                ? "bg-[var(--ff-color-primary-700)] text-white shadow-sm"
                : "bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-700)] group-hover:bg-[var(--ff-color-primary-100)]"
            }`}
            aria-hidden="true"
          >
            {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
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
            transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-[var(--color-muted)] leading-relaxed text-sm">
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

function Accordion({ items, categoryId, openId, onToggle, highlightTerm = "" }: AccordionProps) {
  return (
    <div
      className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden"
      style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.06)" }}
      role="list"
    >
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

  const currentCategory = CATEGORIES.find((c) => c.id === activeCategory)!;

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

      {/* ── HERO ── */}
      <section className="ff-container pt-14 pb-12 md:pt-20 md:pb-16">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--ff-color-primary-600)] mb-5">
            <HelpCircle className="w-3.5 h-3.5" aria-hidden />
            Hulp & informatie
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4 leading-tight tracking-tight">
            Veelgestelde vragen
          </h1>
          <p className="text-[var(--color-muted)] text-base sm:text-lg leading-relaxed max-w-xl">
            Alles wat je wilt weten over FitFi. Staat je vraag er niet tussen?{" "}
            <a
              href="mailto:contact@fitfi.ai"
              className="text-[var(--ff-color-primary-700)] font-medium underline underline-offset-2 hover:text-[var(--ff-color-primary-600)] transition-colors"
            >
              Stuur ons een bericht
            </a>
            .
          </p>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="ff-container pb-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {TRUST_ITEMS.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 flex gap-4 items-start"
                style={{ boxShadow: "0 2px 12px rgba(30,35,51,0.05)" }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--ff-color-primary-50)] flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[var(--ff-color-primary-700)]" aria-hidden />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-text)] text-sm mb-0.5">{c.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{c.body}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ── MAIN CONTENT: sidebar + accordion ── */}
      <section className="ff-container pb-16 sm:pb-20">
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-10 xl:gap-14">

          {/* ── LEFT: SEARCH + CATEGORY NAV ── */}
          <aside className="mb-8 lg:mb-0">
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
                placeholder="Zoek een vraag…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-400)] focus:border-transparent transition-shadow"
                style={{ boxShadow: "0 1px 4px rgba(30,35,51,0.06)" }}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)]"
                  aria-label="Zoekopdracht wissen"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category nav */}
            <nav aria-label="FAQ categorieën">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-muted)] mb-3 px-1">
                Categorieën
              </p>
              <ul className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-1 lg:overflow-visible lg:pb-0" style={{ scrollbarWidth: "none" }}>
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = !isSearching && activeCategory === cat.id;
                  return (
                    <li key={cat.id} className="flex-shrink-0">
                      <button
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => handleCategoryChange(cat.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:outline-none ${
                          isActive
                            ? "bg-[var(--ff-color-primary-700)] text-white shadow-sm"
                            : "text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] hover:text-[var(--ff-color-primary-700)]"
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                        <span className="whitespace-nowrap lg:whitespace-normal">{cat.label}</span>
                        <span className={`ml-auto text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 ${isActive ? "bg-white/20 text-white" : "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]"}`}>
                          {cat.items.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Contact card */}
            <div className="hidden lg:block mt-8 rounded-2xl bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-100)] p-5">
              <div className="w-9 h-9 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-3">
                <MessageCircle className="w-4.5 h-4.5 text-[var(--ff-color-primary-700)]" aria-hidden />
              </div>
              <p className="text-sm font-semibold text-[var(--color-text)] mb-1">Nog een vraag?</p>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-3">
                Wij reageren binnen 24 uur op je bericht.
              </p>
              <a
                href="mailto:contact@fitfi.ai"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--ff-color-primary-700)] hover:text-[var(--ff-color-primary-600)] transition-colors"
              >
                contact@fitfi.ai
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </aside>

          {/* ── RIGHT: ACCORDION PANEL ── */}
          <div>
            <AnimatePresence mode="wait">
              {isSearching ? (
                <motion.div
                  key="search-results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ff-color-primary-600)] mb-5">
                    {searchResults.length === 0
                      ? "Geen resultaten"
                      : `${searchResults.length} ${searchResults.length === 1 ? "resultaat" : "resultaten"} voor "${searchTerm}"`}
                  </p>

                  {searchResults.length === 0 ? (
                    <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-10 text-center">
                      <p className="text-[var(--color-muted)] text-sm mb-4">
                        Geen vragen gevonden voor{" "}
                        <strong className="text-[var(--color-text)]">"{searchTerm}"</strong>.
                      </p>
                      <button
                        onClick={clearSearch}
                        className="text-sm font-semibold text-[var(--ff-color-primary-700)] hover:underline underline-offset-2"
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
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--ff-color-primary-600)]">
                      {currentCategory.label}
                    </p>
                    <span className="text-xs text-[var(--color-muted)]">
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
      </section>

      {/* ── BOTTOM CTA STRIP ── */}
      <section className="ff-container pb-20">
        <div className="rounded-2xl bg-[var(--ff-color-primary-700)] px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="font-bold text-lg text-white mb-1">Klaar om je stijl te ontdekken?</p>
            <p className="text-sm text-white/75">De quiz duurt minder dan twee minuten.</p>
          </div>
          <NavLink
            to="/onboarding"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-[var(--ff-color-primary-800)] font-semibold text-sm px-6 py-3 rounded-full hover:bg-[var(--ff-color-primary-50)] transition-colors shadow-sm"
          >
            Start gratis
            <ArrowRight className="w-4 h-4" />
          </NavLink>
        </div>
      </section>
    </main>
  );
}
