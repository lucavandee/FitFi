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
  MessageCircle,
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
        "bg-[var(--color-surface)] rounded-xl border transition-colors duration-200",
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
          className="w-full min-h-[52px] flex items-center justify-between gap-4 px-4 py-3 text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
        >
          <span className={[
            "flex-1 text-base leading-snug",
            isOpen ? "font-semibold text-[var(--ff-color-primary-700)]" : "font-medium text-[var(--color-text)]",
          ].join(" ")}>
            <Highlight text={item.q} term={highlight} />
          </span>
          <span
            className={[
              "w-7 h-7 shrink-0 rounded-full flex items-center justify-center transition-colors duration-200",
              isOpen
                ? "bg-[var(--ff-color-primary-700)]"
                : "bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)]",
            ].join(" ")}
            style={isOpen ? { color: 'var(--color-bg)' } : undefined}
            aria-hidden="true"
          >
            {isOpen
              ? <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
              : <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
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
            <div className="px-4 pb-4 pt-0 border-t border-[var(--color-border)]">
              <p className="pt-3 m-0 text-sm leading-relaxed text-[var(--color-muted)]">
                <Highlight text={item.a} term={highlight} />
              </p>
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
        <section
          className="py-14 sm:py-20 md:py-28"
          style={{
            background: 'linear-gradient(160deg, var(--ff-color-primary-50) 0%, var(--color-bg) 55%, var(--ff-color-primary-50) 100%)',
          }}
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-full mb-6 text-xs font-semibold text-[var(--color-text)]"
              style={{ background: 'rgba(255,255,255,0.90)' }}
            >
              <CircleHelp className="w-3.5 h-3.5 text-[var(--ff-color-primary-600)]" aria-hidden="true" />
              Hulp &amp; informatie
            </div>

            <h1
              className="font-heading font-bold tracking-tight mb-4"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.1 }}
            >
              Veelgestelde{" "}
              <span
                style={{
                  background: 'linear-gradient(90deg, var(--ff-color-primary-600), var(--ff-color-primary-700))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                vragen
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-muted)] max-w-xl mx-auto leading-relaxed mb-8">
              Alles wat je wilt weten over FitFi. Staat je vraag er niet bij?{" "}
              <a
                href="mailto:contact@fitfi.ai"
                className="text-[var(--ff-color-primary-700)] font-semibold underline underline-offset-2"
              >
                Stuur ons een bericht.
              </a>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              {[
                { Icon: ShieldCheck, label: "Privacybewust" },
                { Icon: CreditCard,  label: "Eerlijk geprijsd" },
                { Icon: Sparkles,    label: "Direct resultaat" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center shrink-0" aria-hidden="true">
                    <Icon className="w-4 h-4 text-[var(--ff-color-primary-700)]" />
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text)]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ZOEK + TABS + ACCORDION ── */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">

            <div className="text-center mb-8">
              <h2
                className="font-heading font-bold tracking-tight mb-2"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
              >
                Vind je antwoord
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                Zoek direct of blader per categorie
              </p>
            </div>

            {/* Zoekbalk */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" aria-hidden="true" />
              <label htmlFor="faq-search" className="sr-only">Zoek in veelgestelde vragen</label>
              <input
                id="faq-search"
                type="search"
                placeholder="Zoek een vraag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                className="w-full pl-11 pr-12 py-4 min-h-[52px] text-base rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:border-[var(--ff-color-primary-400)] transition-all"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  aria-label="Zoekopdracht wissen"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center rounded-full text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Categorie tabs */}
            {!isSearching && (
              <div
                role="tablist"
                aria-label="FAQ categorieën"
                className="flex flex-row gap-1 mb-8"
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
                        "flex-1 flex flex-col items-center justify-center gap-1 min-h-[64px] px-2 rounded-2xl",
                        "text-xs font-semibold whitespace-nowrap transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2",
                        active
                          ? "bg-[var(--color-surface)] text-[var(--ff-color-primary-700)] shadow-[0_2px_12px_rgba(0,0,0,0.08)] border border-[var(--ff-color-primary-200)]"
                          : "bg-transparent text-[var(--color-muted)] hover:text-[var(--color-text)]",
                      ].join(" ")}
                    >
                      <span
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-200"
                        style={
                          active
                            ? { background: 'var(--ff-color-primary-700)', color: 'var(--color-bg)' }
                            : { background: 'var(--ff-color-primary-100)', color: 'var(--ff-color-primary-600)' }
                        }
                      >
                        <Icon size={14} aria-hidden="true" />
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

            {/* Sectielabel */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold tracking-widest uppercase text-[var(--ff-color-primary-600)]">
                {isSearching
                  ? searchResults.length === 0
                    ? "Geen resultaten"
                    : `${searchResults.length} resultaat${searchResults.length !== 1 ? "en" : ""} voor "${search}"`
                  : currentCat.label}
              </span>
              {!isSearching && (
                <span className="text-xs text-[var(--color-muted)]">
                  {currentCat.items.length} vragen
                </span>
              )}
            </div>

            {/* Accordion */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSearching ? `s-${search}` : activeCat}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {displayItems.length === 0 ? (
                  <div className="text-center py-12 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]">
                    <Search className="w-8 h-8 text-[var(--ff-color-primary-300)] mx-auto mb-3" aria-hidden="true" />
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

            {/* Contact blok */}
            <div
              className="mt-10 text-center px-6 py-8 rounded-2xl border border-[var(--ff-color-primary-200)]"
              style={{
                background: 'linear-gradient(160deg, var(--ff-color-primary-50) 0%, var(--color-bg) 100%)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: 'var(--ff-color-primary-600)' }}
                aria-hidden="true"
              >
                <MessageCircle className="w-5 h-5" style={{ color: 'var(--color-bg)' }} />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--ff-color-primary-700)' }}>Nog een vraag?</h3>
              <p className="text-sm text-[var(--color-muted)] mb-5">
                Wij reageren binnen 24 uur. Stuur ons een bericht via e-mail.
              </p>
              <a
                href="mailto:contact@fitfi.ai"
                className="inline-flex items-center justify-center gap-2 px-6 min-h-[52px] rounded-xl text-sm font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
                style={{
                  background: 'var(--ff-color-primary-700)',
                  color: 'var(--color-bg)',
                }}
              >
                contact@fitfi.ai
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        {/* ── BOTTOM CTA ── */}
        <section className="py-12 sm:py-16 md:py-20 border-t border-[var(--color-border)]">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">

            <div className="text-center mb-8">
              <h2
                className="font-heading font-bold tracking-tight mb-2"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)' }}
              >
                Klaar om te starten?
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                De quiz duurt minder dan 2 minuten
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5">
                <h3 className="font-semibold text-base mb-3 text-[var(--color-text)]">Zonder FitFi</h3>
                <ul className="space-y-3" role="list">
                  {[
                    "Uren zoeken zonder resultaat",
                    "Foute aankopen die blijven hangen",
                    "Kast vol kleding die je niet draagt",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-[var(--ff-color-danger-100)] flex items-center justify-center shrink-0" aria-hidden="true">
                        <X className="w-3 h-3 text-[var(--ff-color-danger-600)]" />
                      </span>
                      <span className="text-sm text-[var(--color-muted)] leading-snug">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-xl p-5"
                style={{
                  background: 'linear-gradient(135deg, var(--ff-color-primary-600) 0%, var(--ff-color-primary-700) 100%)',
                }}
              >
                <span
                  className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(247,243,236,0.20)', color: 'rgba(247,243,236,0.95)' }}
                >
                  Met FitFi
                </span>
                <h3 className="font-semibold text-base mb-3" style={{ color: 'rgba(247,243,236,0.98)' }}>Stijl die klopt</h3>
                <ul className="space-y-3" role="list">
                  {[
                    "Stijladvies in 2 minuten",
                    "Outfits die je écht draagt",
                    "Gratis starten, geen creditcard",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(247,243,236,0.25)' }}
                        aria-hidden="true"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true" style={{ color: 'rgba(247,243,236,0.95)' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm font-medium leading-snug" style={{ color: 'rgba(247,243,236,0.92)' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/onboarding"
                className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 min-h-[52px] rounded-xl text-base font-semibold shadow-md transition-all duration-200 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2 active:scale-[0.98]"
                style={{
                  background: 'var(--ff-color-primary-700)',
                  color: 'var(--color-bg)',
                }}
                aria-label="Start gratis quiz om je stijladvies te ontvangen"
              >
                Start gratis — 2 minuten
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
