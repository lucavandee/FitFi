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
  Users,
  Sparkles,
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
  { id: "algemeen", label: "Algemeen",          Icon: CircleHelp,  items: FAQ_GENERAL  },
  { id: "privacy",  label: "Privacy",            Icon: ShieldCheck, items: FAQ_PRIVACY  },
  { id: "prijzen",  label: "Prijzen",             Icon: CreditCard,  items: FAQ_PRICING  },
  { id: "product",  label: "Product & gebruik",   Icon: Package,     items: FAQ_PRODUCT  },
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
  item, id, isOpen, onToggle, highlight, isLast,
}: {
  item: QA; id: string; isOpen: boolean;
  onToggle: (id: string) => void; highlight: string; isLast: boolean;
}) {
  return (
    <div
      className={[
        "bg-[var(--color-surface)] rounded-xl border transition-all duration-200 shadow-[var(--shadow-soft)]",
        isOpen
          ? "border-[var(--ff-color-primary-300)]"
          : "border-[var(--color-border)] hover:border-[var(--ff-color-primary-200)]",
      ].join(" ")}
    >
      <h3 className="m-0">
        <button
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          aria-controls={`panel-${id}`}
          className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2 rounded-xl min-h-[60px]"
        >
          <span className={[
            "flex-1 text-sm sm:text-base leading-snug font-medium",
            isOpen ? "text-[var(--ff-color-primary-700)] font-semibold" : "text-[var(--color-text)]",
          ].join(" ")}>
            <Highlight text={item.q} term={highlight} />
          </span>
          <span
            className={[
              "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200",
              isOpen
                ? "bg-[var(--ff-color-primary-700)] text-white"
                : "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]",
            ].join(" ")}
            aria-hidden="true"
          >
            {isOpen
              ? <Minus className="w-3 h-3" strokeWidth={2.5} />
              : <Plus className="w-3 h-3" strokeWidth={2.5} />
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
            <p className="m-0 px-5 pb-5 pt-0 text-sm leading-relaxed text-[var(--color-muted)] border-t border-[var(--color-border)]">
              <span className="block pt-3">
                <Highlight text={item.a} term={highlight} />
              </span>
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
    <main id="main-content" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="Veelgestelde vragen — FitFi"
        description="Antwoorden op de meest gestelde vragen over FitFi: hoe het werkt, privacy, prijzen en je account."
        path="/veelgestelde-vragen"
        structuredData={FAQ_SCHEMA}
      />

      {/* ══════════════════════════════════════════════════
          HERO — exact patroon van /hoe-het-werkt
      ══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-12 sm:py-16 md:py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">

          {/* Badge — identiek aan HowItWorks */}
          <div
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-white/95 backdrop-blur-sm border border-[var(--color-border)] rounded-full mb-6 shadow-md"
            role="status"
          >
            <CircleHelp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
            <span className="text-xs sm:text-sm font-bold text-[var(--color-text)]">Hulp &amp; informatie</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-5 sm:mb-6 leading-[1.1] tracking-tight">
            Veelgestelde{" "}
            <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] bg-clip-text text-transparent">
              vragen
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Alles wat je wilt weten over FitFi. Staat je vraag er niet bij?{" "}
            <a
              href="mailto:contact@fitfi.ai"
              className="text-[var(--ff-color-primary-700)] font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              Stuur ons een bericht.
            </a>
          </p>

          {/* Trust items — ronde icon containers, exact zoals HowItWorks */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6" role="list" aria-label="Kernwaarden">
            {[
              { Icon: ShieldCheck, bg: "bg-[var(--ff-color-primary-100)]",      color: "text-[var(--ff-color-primary-700)]",      label: "Privacybewust"    },
              { Icon: CreditCard,  bg: "bg-[var(--ff-color-success-100)]",      color: "text-[var(--ff-color-success-700)]",      label: "Eerlijk geprijsd" },
              { Icon: Sparkles,    bg: "bg-[var(--ff-color-accent-100)]",       color: "text-[var(--ff-color-accent-700)]",       label: "Direct resultaat" },
            ].map(({ Icon, bg, color, label }) => (
              <div key={label} className="flex items-center gap-2" role="listitem">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 ${bg} rounded-full flex items-center justify-center flex-shrink-0`} aria-hidden="true">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <span className="text-sm sm:text-base font-semibold text-[var(--color-text)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SEARCH + CATEGORIE TABS
      ══════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14 md:py-20 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Vind je antwoord
            </h2>
            <p className="text-sm sm:text-base text-[var(--color-muted)]">
              Zoek direct of blader per categorie
            </p>
          </div>

          {/* Search bar — compacte proportie */}
          <div className="relative max-w-lg mx-auto mb-5 sm:mb-6">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" aria-hidden="true" />
            <label htmlFor="faq-search" className="sr-only">Zoek in veelgestelde vragen</label>
            <input
              id="faq-search"
              type="search"
              placeholder="Zoek een vraag…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-[var(--ff-color-primary-400)] transition-all shadow-[var(--shadow-soft)]"
            />
            {search && (
              <button
                onClick={clearSearch}
                aria-label="Zoekopdracht wissen"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--ff-color-primary-50)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          {!isSearching && (
            <nav aria-label="FAQ categorieën" className="mb-6 sm:mb-8">
              <ul className="flex flex-wrap justify-center gap-2 list-none m-0 p-0">
                {CATEGORIES.map(({ id, label, Icon, items }) => {
                  const active = activeCat === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => changeCat(id)}
                        aria-pressed={active}
                        className={[
                          "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold",
                          "border transition-all duration-200 cursor-pointer min-h-[40px]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2",
                          active
                            ? "bg-[var(--ff-color-primary-700)] text-white border-[var(--ff-color-primary-700)] shadow-sm"
                            : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)]",
                        ].join(" ")}
                      >
                        <Icon size={13} aria-hidden="true" className={active ? "text-white opacity-80" : "text-[var(--ff-color-primary-600)]"} />
                        <span>{label}</span>
                        <span className={[
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0",
                          active ? "bg-white/20 text-white" : "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]",
                        ].join(" ")}>
                          {items.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}

          {/* Live region for a11y */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {isSearching && (
              searchResults.length === 0
                ? "Geen resultaten gevonden"
                : `${searchResults.length} resultaten gevonden voor ${search}`
            )}
          </div>

          {/* Section label */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 px-0.5">
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

          {/* Accordion — 1 kolom altijd voor consistente uitlijning */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isSearching ? `s-${search}` : activeCat}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {displayItems.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-soft)]">
                  <div className="w-10 h-10 rounded-2xl bg-[var(--ff-color-primary-50)] text-[var(--ff-color-primary-300)] flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-[var(--color-muted)] mb-4">
                    Geen vragen gevonden voor{" "}
                    <strong className="text-[var(--color-text)]">"{search}"</strong>.
                  </p>
                  <button
                    onClick={clearSearch}
                    className="text-sm font-bold text-[var(--ff-color-primary-700)] underline underline-offset-2 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer min-h-[44px] px-2"
                  >
                    Toon alle vragen
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
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

          {/* Contact block — onder accordion, zelfde stijl als HowItWorks tijdblok */}
          <div className="mt-8 sm:mt-12 text-center px-5 py-8 sm:px-10 sm:py-10 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl sm:rounded-[2rem] border-2 border-[var(--ff-color-primary-200)] shadow-md">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[var(--ff-color-primary-600)] rounded-xl flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-[var(--ff-color-primary-700)]">Nog een vraag?</span>
            </div>
            <p className="text-sm text-[var(--color-muted)] font-medium mb-6 max-w-sm mx-auto">
              Wij reageren binnen 24 uur. Stuur ons een bericht via e-mail.
            </p>
            <a
              href="mailto:contact@fitfi.ai"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 sm:px-10 sm:py-5 min-h-[52px] w-full sm:w-auto bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              contact@fitfi.ai
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          BOTTOM CTA — identiek aan HowItWorks
      ══════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 md:py-24 bg-[var(--color-bg)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 tracking-tight">
              Klaar om te starten?
            </h2>
            <p className="text-base sm:text-lg text-[var(--color-muted)] font-light">
              De quiz duurt minder dan 2 minuten
            </p>
          </div>

          <div className="flex flex-col sm:grid sm:grid-cols-2 sm:items-stretch gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10">
            <div className="bg-[var(--color-surface)] rounded-2xl border-2 border-[var(--color-border)] p-5 sm:p-7 shadow-md flex flex-col">
              <h3 className="font-bold text-lg sm:text-xl mb-4 text-center text-[var(--color-text)]">Zonder FitFi</h3>
              <ul className="space-y-3" role="list">
                {[
                  "Uren zoeken zonder resultaat",
                  "Foute aankopen die blijven hangen",
                  "Kast vol kleding die je niet draagt",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[var(--ff-color-danger-100)] flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--ff-color-danger-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base text-[var(--color-muted)] leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-2xl border-2 border-[var(--ff-color-primary-400)] p-5 sm:p-7 text-white shadow-xl flex flex-col">
              <div className="inline-block mb-3 px-3 py-1 bg-[var(--ff-color-accent-500)] text-white rounded-full text-xs font-bold self-start">
                MET FITFI
              </div>
              <h3 className="font-bold text-lg sm:text-xl mb-4 text-white">Stijl die klopt</h3>
              <ul className="space-y-3" role="list">
                {[
                  "Stijladvies in 2 minuten",
                  "Outfits die je écht draagt",
                  "Gratis starten, geen creditcard",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/25 flex items-center justify-center flex-shrink-0 mt-0.5" aria-hidden="true">
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm sm:text-base font-medium leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="text-center">
            <NavLink
              to="/onboarding"
              className="group inline-flex items-center justify-center gap-2 px-7 py-4 sm:px-10 sm:py-5 min-h-[52px] w-full sm:w-auto bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
              aria-label="Start gratis quiz om je stijladvies te ontvangen"
            >
              Start gratis — 2 minuten
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1.5" aria-hidden="true" />
            </NavLink>
          </div>
        </div>
      </section>
    </main>
  );
}
