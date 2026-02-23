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

type AccordionProps = {
  items: QA[];
  categoryId: string;
  openId: string | null;
  onToggle: (id: string) => void;
  highlightTerm?: string;
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

function Accordion({ items, categoryId, openId, onToggle, highlightTerm = "" }: AccordionProps) {
  return (
    <div
      className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-soft)]"
      role="list"
    >
      {items.map((item, i) => {
        const id = `${categoryId}-${i}`;
        const isOpen = openId === id;
        const panelId = `panel-${id}`;
        const headingId = `heading-${id}`;

        return (
          <div
            key={id}
            className="border-t border-[var(--color-border)] first:border-t-0"
            role="listitem"
          >
            <h3 id={headingId}>
              <button
                onClick={() => onToggle(id)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-[var(--ff-color-primary-50)] transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ff-color-primary-400)]"
                aria-expanded={isOpen}
                aria-controls={panelId}
                id={headingId}
              >
                <span className="font-medium text-sm sm:text-base text-[var(--color-text)] group-hover:text-[var(--ff-color-primary-700)] transition-colors leading-snug">
                  {highlightTerm ? highlightText(item.q, highlightTerm) : item.q}
                </span>
                <span
                  className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                    isOpen
                      ? "bg-[var(--ff-color-primary-700)] border-[var(--ff-color-primary-700)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-text)] group-hover:border-[var(--ff-color-primary-400)] group-hover:text-[var(--ff-color-primary-700)]"
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
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-[var(--color-muted)] leading-relaxed text-sm">
                    {highlightTerm && typeof item.a === "string"
                      ? highlightText(item.a, highlightTerm)
                      : item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
      <section className="ff-container py-12 md:py-16">
        <div className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text)] mb-3 leading-tight">
            Veelgestelde vragen
          </h1>
          <p className="text-[var(--color-muted)] text-base sm:text-lg leading-relaxed">
            Staat je vraag er niet tussen? Stuur ons een mail via{" "}
            <a
              href="mailto:contact@fitfi.ai"
              className="text-[var(--ff-color-primary-700)] underline underline-offset-2 hover:text-[var(--ff-color-primary-600)] transition-colors"
            >
              contact@fitfi.ai
            </a>
            .
          </p>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="ff-container pb-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
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
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <article
                key={i}
                className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-5 shadow-[var(--shadow-soft)]"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-3">
                  <Icon className="h-5 w-5 text-[var(--ff-color-primary-700)]" aria-hidden />
                </div>
                <h3 className="font-semibold text-[var(--color-text)] mb-1 text-sm sm:text-base">{c.title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{c.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ── SEARCH BAR ── */}
      <section className="ff-container pb-4">
        <div className="max-w-xl relative">
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
            placeholder="Zoek een vraag, onderwerp of trefwoord…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
            className="w-full pl-10 pr-10 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-transparent transition-shadow shadow-[var(--shadow-soft)]"
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
      </section>

      {/* ── CATEGORY TABS (hidden during search) ── */}
      {!isSearching && (
        <section className="ff-container pb-5">
          <div
            className="flex gap-2 overflow-x-auto pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-hide snap-x"
            role="tablist"
            aria-label="FAQ categorieën"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`faq-panel-${cat.id}`}
                  id={`faq-tab-${cat.id}`}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`snap-start flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 whitespace-nowrap ${
                    isActive
                      ? "bg-[var(--ff-color-primary-700)] text-white border-[var(--ff-color-primary-700)] shadow-sm"
                      : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-50)]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── ACCORDION PANEL ── */}
      <section className="ff-container pb-12">
        <AnimatePresence mode="wait">
          {isSearching ? (
            /* Search results across all categories */
            <motion.div
              key="search-results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--ff-color-primary-600)] mb-4">
                {searchResults.length === 0
                  ? "Geen resultaten"
                  : `${searchResults.length} ${searchResults.length === 1 ? "resultaat" : "resultaten"} voor "${searchTerm}"`}
              </p>

              {searchResults.length === 0 ? (
                <div className="rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-8 text-center shadow-[var(--shadow-soft)]">
                  <p className="text-[var(--color-muted)] text-sm mb-3">
                    Geen vragen gevonden voor{" "}
                    <strong className="text-[var(--color-text)]">"{searchTerm}"</strong>.
                  </p>
                  <button
                    onClick={clearSearch}
                    className="text-sm font-semibold text-[var(--ff-color-primary-700)] hover:underline"
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
            /* Category panel */
            <motion.div
              key={activeCategory}
              id={`faq-panel-${currentCategory.id}`}
              role="tabpanel"
              aria-labelledby={`faq-tab-${currentCategory.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--ff-color-primary-600)] mb-4">
                {currentCategory.label} — {currentCategory.items.length} vragen
              </p>
              <Accordion
                items={currentCategory.items}
                categoryId={currentCategory.id}
                openId={openId}
                onToggle={handleToggle}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── DISCRETE FOOTER HELP LINK ── */}
      <section className="ff-container pb-16 sm:pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-t border-[var(--color-border)] pt-6">
          <HelpCircle className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0 mt-0.5 sm:mt-0" aria-hidden />
          <p className="text-sm text-[var(--color-muted)]">
            Nog een vraag?{" "}
            <a
              href="mailto:contact@fitfi.ai"
              className="text-[var(--ff-color-primary-700)] font-medium hover:underline underline-offset-2 transition-colors"
            >
              Stuur ons een bericht
            </a>{" "}
            of{" "}
            <NavLink
              to="/onboarding"
              className="inline-flex items-center gap-1 text-[var(--ff-color-primary-700)] font-medium hover:underline underline-offset-2 transition-colors"
            >
              start de quiz
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>{" "}
            en ontdek direct je stijl.
          </p>
        </div>
      </section>
    </main>
  );
}
