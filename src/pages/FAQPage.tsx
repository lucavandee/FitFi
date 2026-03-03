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
  { id: "algemeen", label: "Algemeen",          Icon: CircleHelp,  items: FAQ_GENERAL  },
  { id: "privacy",  label: "Privacy & gegevens", Icon: ShieldCheck, items: FAQ_PRIVACY  },
  { id: "prijzen",  label: "Prijzen",             Icon: CreditCard,  items: FAQ_PRICING  },
  { id: "product",  label: "Product & gebruik",   Icon: Package,     items: FAQ_PRODUCT  },
];

const ALL_QUESTIONS = CATEGORIES.flatMap((c) => c.items.map((item) => ({ ...item, catId: c.id })));

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
   HIGHLIGHT
───────────────────────────────────────────────────────────── */
function Highlight({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${esc})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase() ? (
          <mark key={i} className="faq-highlight">{p}</mark>
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
  item: QA; id: string; isOpen: boolean;
  onToggle: (id: string) => void; highlight: string; isLast: boolean;
}) {
  return (
    <div className={isLast ? "" : "faq-item-border"}>
      <h3 className="faq-h3">
        <button
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          aria-controls={`panel-${id}`}
          className={`faq-question-btn${isOpen ? " faq-question-btn--open" : ""}`}
        >
          <span className={`faq-question-text${isOpen ? " faq-question-text--open" : ""}`}>
            <Highlight text={item.q} term={highlight} />
          </span>
          <span className={`faq-icon-circle${isOpen ? " faq-icon-circle--open" : ""}`} aria-hidden="true">
            {isOpen ? <Minus size={12} strokeWidth={2.5} /> : <Plus size={12} strokeWidth={2.5} />}
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
            <p className="faq-answer">
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

  const isSearching   = search.trim().length > 0;
  const currentCat    = CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = search.trim().toLowerCase();
    return ALL_QUESTIONS.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [search, isSearching]);

  const displayItems = isSearching ? searchResults : currentCat.items;
  const displayKey   = isSearching ? "search"      : activeCat;

  function toggle(id: string)   { setOpenId((p) => (p === id ? null : id)); }
  function changeCat(id: string){ setActiveCat(id); setOpenId(null); setSearch(""); }
  function clearSearch()        { setSearch(""); setOpenId(null); }

  return (
    <main id="main">
      <Seo
        title="Veelgestelde vragen — FitFi"
        description="Antwoorden op de meest gestelde vragen over FitFi: hoe het werkt, privacy, prijzen en je account."
        path="/veelgestelde-vragen"
        structuredData={FAQ_SCHEMA}
      />

      {/* ══════════════════════════════════════════
          HERO  —  foto als CSS background-image
          zodat de tekst nooit overlapt met de
          navbar (hero zit in de normale flow)
      ══════════════════════════════════════════ */}
      <section
        aria-labelledby="faq-h1"
        className="faq-hero"
      >
        <div className="faq-hero-inner">
          {/* Badge */}
          <div className="faq-badge">
            <Sparkles size={12} aria-hidden="true" />
            Hulp &amp; informatie
          </div>

          {/* Heading */}
          <h1 id="faq-h1" className="faq-hero-title">
            Veelgestelde{" "}
            <em className="faq-hero-em">vragen</em>
          </h1>

          {/* Subtitle */}
          <p className="faq-hero-sub">
            Alles wat je wilt weten over FitFi. Staat je vraag er niet bij?{" "}
            <a href="mailto:contact@fitfi.ai" className="faq-hero-link">
              Stuur ons een bericht.
            </a>
          </p>

          {/* Trust pills */}
          <div className="faq-pills">
            {[
              { Icon: ShieldCheck, label: "Privacybewust"   },
              { Icon: CreditCard,  label: "Eerlijk geprijsd" },
              { Icon: Clock,       label: "Direct resultaat" },
            ].map(({ Icon, label }) => (
              <span key={label} className="faq-pill">
                <Icon size={12} aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          CONTENT GRID
      ══════════════════════════════════════════ */}
      <section className="faq-section">
        <div className="faq-grid">

          {/* ── SIDEBAR ── */}
          <aside className="faq-sidebar">

            {/* Search input */}
            <div className="faq-search-wrap">
              <Search size={14} className="faq-search-icon" aria-hidden="true" />
              <label htmlFor="faq-search" className="sr-only">Zoek in veelgestelde vragen</label>
              <input
                id="faq-search"
                type="search"
                placeholder="Zoek een vraag…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
                className="faq-search-input"
              />
              {search && (
                <button onClick={clearSearch} aria-label="Wissen" className="faq-search-clear">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Categories */}
            <p className="faq-cat-label">Categorieën</p>
            <nav aria-label="FAQ categorieën">
              <ul className="faq-cat-list">
                {CATEGORIES.map(({ id, label, Icon, items }) => {
                  const active = !isSearching && activeCat === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => changeCat(id)}
                        aria-pressed={active}
                        className={`faq-cat-btn${active ? " faq-cat-btn--active" : ""}`}
                      >
                        <span className={`faq-cat-icon${active ? " faq-cat-icon--active" : ""}`}>
                          <Icon size={13} aria-hidden="true" />
                        </span>
                        <span className="faq-cat-label-text">{label}</span>
                        <span className={`faq-cat-count${active ? " faq-cat-count--active" : ""}`}>
                          {items.length}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Contact card */}
            <div className="faq-contact-card">
              <div className="faq-contact-icon-wrap">
                <MessageCircle size={15} aria-hidden="true" />
              </div>
              <p className="faq-contact-title">Nog een vraag?</p>
              <p className="faq-contact-sub">Wij reageren binnen 24 uur.</p>
              <a href="mailto:contact@fitfi.ai" className="faq-contact-link">
                contact@fitfi.ai <ArrowRight size={12} />
              </a>
            </div>
          </aside>

          {/* ── ACCORDION ── */}
          <div className="faq-accordion-col">
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {isSearching && (
                searchResults.length === 0
                  ? "Geen resultaten gevonden"
                  : `${searchResults.length} resultaten gevonden`
              )}
            </div>

            {/* Header */}
            <div className="faq-acc-header">
              <span className="faq-acc-category">
                {isSearching
                  ? searchResults.length === 0
                    ? "Geen resultaten"
                    : `${searchResults.length} resultaat${searchResults.length !== 1 ? "en" : ""} voor "${search}"`
                  : currentCat.label}
              </span>
              {!isSearching && (
                <span className="faq-acc-count">{currentCat.items.length} vragen</span>
              )}
            </div>

            {/* Items */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSearching ? `s-${search}` : activeCat}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
              >
                {displayItems.length === 0 ? (
                  <div className="faq-empty">
                    <div className="faq-empty-icon">
                      <Search size={18} aria-hidden="true" />
                    </div>
                    <p className="faq-empty-text">
                      Geen vragen gevonden voor{" "}
                      <strong>"{search}"</strong>.
                    </p>
                    <button onClick={clearSearch} className="faq-empty-btn">
                      Toon alle vragen
                    </button>
                  </div>
                ) : (
                  <div className="faq-accordion-card">
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

      {/* ══════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════ */}
      <section className="faq-cta-section">
        <div className="faq-cta-card">
          <div className="faq-cta-glow faq-cta-glow--tr" aria-hidden="true" />
          <div className="faq-cta-glow faq-cta-glow--bl" aria-hidden="true" />
          <div className="faq-cta-content">
            <div>
              <p className="faq-cta-title">Klaar om je stijl te ontdekken?</p>
              <p className="faq-cta-sub">De quiz duurt minder dan twee minuten. Geen creditcard nodig.</p>
            </div>
            <NavLink to="/onboarding" className="faq-cta-btn">
              Start gratis <ArrowRight size={15} aria-hidden="true" />
            </NavLink>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SCOPED STYLES  —  alle layout in één blok
          zodat er geen conflicten zijn met globals
      ══════════════════════════════════════════ */}
      <style>{`
        /* ── HERO ── */
        .faq-hero {
          background-image:
            linear-gradient(100deg,
              rgba(18,11,4,0.93) 0%,
              rgba(18,11,4,0.75) 34%,
              rgba(18,11,4,0.28) 60%,
              rgba(18,11,4,0.08) 100%),
            url("/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp");
          background-size: cover;
          background-position: center 22%;
          min-height: 440px;
          display: flex;
          align-items: flex-end;
        }
        .faq-hero-inner {
          width: 100%;
          max-width: 1152px;
          margin: 0 auto;
          padding: 56px clamp(24px, 5vw, 56px);
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .faq-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          background: rgba(247,243,236,0.90);
          color: var(--ff-color-primary-700);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin-bottom: 20px;
          width: fit-content;
        }
        .faq-hero-title {
          margin: 0 0 16px;
          font-size: clamp(2.4rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.025em;
          color: #F7F3EC;
        }
        .faq-hero-em {
          font-style: normal;
          color: #d4a96a;
        }
        .faq-hero-sub {
          margin: 0 0 28px;
          font-size: clamp(14px, 1.6vw, 17px);
          font-weight: 300;
          line-height: 1.65;
          color: rgba(247,243,236,0.70);
          max-width: 500px;
        }
        .faq-hero-link {
          color: #d4a96a;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        /* Trust pills — compact, single row */
        .faq-pills {
          display: flex;
          flex-direction: row;
          gap: 8px;
          flex-wrap: nowrap;
        }
        .faq-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(247,243,236,0.10);
          border: 1px solid rgba(247,243,236,0.22);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          font-size: 12px;
          font-weight: 600;
          color: rgba(247,243,236,0.85);
          white-space: nowrap;
          flex-shrink: 0;
          line-height: 1;
        }
        .faq-pill svg {
          color: #b8976a;
          flex-shrink: 0;
        }

        /* ── CONTENT SECTION ── */
        .faq-section {
          max-width: 1152px;
          margin: 0 auto;
          padding: clamp(40px,5vw,72px) clamp(24px,5vw,56px) clamp(48px,6vw,80px);
        }
        .faq-grid {
          display: grid;
          grid-template-columns: 216px 1fr;
          gap: clamp(28px, 4vw, 56px);
          align-items: start;
        }

        /* ── SIDEBAR ── */
        .faq-sidebar {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* Search */
        .faq-search-wrap {
          position: relative;
          margin-bottom: 18px;
        }
        .faq-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-muted);
          pointer-events: none;
        }
        .faq-search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 36px 10px 36px;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-surface);
          font-size: 13.5px;
          color: var(--color-text);
          box-shadow: var(--shadow-soft);
          outline: none;
          transition: border-color 0.15s;
        }
        .faq-search-input:focus {
          border-color: var(--ff-color-primary-400);
        }
        .faq-search-clear {
          position: absolute;
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-muted);
        }

        /* Category nav */
        .faq-cat-label {
          margin: 0 0 7px 2px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.10em;
          text-transform: uppercase;
          color: var(--color-muted);
        }
        .faq-cat-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }
        .faq-cat-btn {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 7px 10px;
          border-radius: 9px;
          border: none;
          cursor: pointer;
          text-align: left;
          background: transparent;
          color: var(--color-text);
          font-weight: 600;
          font-size: 13px;
          transition: background 0.15s, color 0.15s;
        }
        .faq-cat-btn:hover:not(.faq-cat-btn--active) {
          background: var(--ff-color-primary-50);
          color: var(--ff-color-primary-700);
        }
        .faq-cat-btn--active {
          background: var(--ff-color-primary-700);
          color: #fff;
        }
        .faq-cat-icon {
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          border-radius: 7px;
          background: var(--ff-color-primary-100);
          color: var(--ff-color-primary-700);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .faq-cat-icon--active {
          background: rgba(255,255,255,0.20);
          color: #fff;
        }
        .faq-cat-label-text {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }
        .faq-cat-count {
          flex-shrink: 0;
          width: 19px;
          height: 19px;
          border-radius: 50%;
          font-size: 10px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ff-color-primary-100);
          color: var(--ff-color-primary-700);
        }
        .faq-cat-count--active {
          background: rgba(255,255,255,0.22);
          color: #fff;
        }

        /* Contact card */
        .faq-contact-card {
          margin-top: 20px;
          border-radius: 14px;
          padding: 18px;
          background: linear-gradient(135deg, var(--ff-color-primary-50) 0%, var(--ff-color-accent-50) 100%);
          border: 1px solid var(--ff-color-primary-200);
        }
        .faq-contact-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 9px;
          background: var(--ff-color-primary-100);
          color: var(--ff-color-primary-700);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
        }
        .faq-contact-title {
          margin: 0 0 3px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--color-text);
        }
        .faq-contact-sub {
          margin: 0 0 10px;
          font-size: 11.5px;
          color: var(--color-muted);
          line-height: 1.5;
        }
        .faq-contact-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--ff-color-primary-700);
          text-decoration: none;
          min-height: 44px;
        }
        .faq-contact-link:hover { text-decoration: underline; }

        /* ── ACCORDION COLUMN ── */
        .faq-accordion-col { min-width: 0; }
        .faq-acc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .faq-acc-category {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: var(--ff-color-primary-600);
        }
        .faq-acc-count {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-muted);
        }

        /* Accordion card */
        .faq-accordion-card {
          border-radius: 14px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-soft);
          overflow: hidden;
        }
        .faq-item-border {
          border-bottom: 1px solid var(--color-border);
        }
        .faq-h3 { margin: 0; }
        .faq-question-btn {
          width: 100%;
          min-height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 15px 22px;
          background: transparent;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.12s;
        }
        .faq-question-btn:hover,
        .faq-question-btn--open {
          background: var(--ff-color-primary-50);
        }
        .faq-question-text {
          font-size: 15px;
          font-weight: 500;
          line-height: 1.45;
          color: var(--color-text);
          flex: 1;
        }
        .faq-question-text--open { color: var(--ff-color-primary-700); }
        .faq-icon-circle {
          flex-shrink: 0;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--ff-color-primary-100);
          color: var(--ff-color-primary-700);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .faq-icon-circle--open {
          background: var(--ff-color-primary-700);
          color: #fff;
        }
        .faq-answer {
          margin: 0;
          padding: 2px 22px 18px;
          font-size: 14.5px;
          line-height: 1.7;
          color: var(--color-muted);
        }
        .faq-highlight {
          background: var(--ff-color-primary-100);
          color: var(--ff-color-primary-800);
          border-radius: 2px;
          padding: 0 2px;
        }

        /* Empty state */
        .faq-empty {
          border-radius: 14px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          box-shadow: var(--shadow-soft);
          padding: 48px 24px;
          text-align: center;
        }
        .faq-empty-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--ff-color-primary-50);
          color: var(--ff-color-primary-400);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 14px;
        }
        .faq-empty-text {
          margin: 0 0 14px;
          font-size: 14.5px;
          color: var(--color-muted);
        }
        .faq-empty-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 700;
          color: var(--ff-color-primary-700);
          text-decoration: underline;
          text-underline-offset: 2px;
          min-height: 44px;
          padding: 0 8px;
        }

        /* ── BOTTOM CTA ── */
        .faq-cta-section {
          max-width: 1152px;
          margin: 0 auto;
          padding: 0 clamp(24px,5vw,56px) clamp(56px,7vw,88px);
        }
        .faq-cta-card {
          position: relative;
          overflow: hidden;
          border-radius: 20px;
          padding: clamp(36px,4vw,52px) clamp(28px,4vw,52px);
          background: linear-gradient(135deg, #2a1f14 0%, #3d2b1a 50%, #2a1f14 100%);
        }
        .faq-cta-glow {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .faq-cta-glow--tr {
          top: -72px; right: -72px;
          width: 260px; height: 260px;
          background: radial-gradient(circle, rgba(184,151,106,0.22) 0%, transparent 70%);
        }
        .faq-cta-glow--bl {
          bottom: -56px; left: -56px;
          width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(212,169,106,0.13) 0%, transparent 70%);
        }
        .faq-cta-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
        }
        .faq-cta-title {
          margin: 0 0 5px;
          font-size: clamp(17px, 2.2vw, 21px);
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #F7F3EC;
        }
        .faq-cta-sub {
          margin: 0;
          font-size: 13.5px;
          font-weight: 300;
          color: rgba(247,243,236,0.58);
        }
        .faq-cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 13px 26px;
          min-height: 50px;
          border-radius: 11px;
          background: linear-gradient(135deg, #9b7a52 0%, #7a5c38 100%);
          color: #F7F3EC;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          box-shadow: 0 4px 20px rgba(100,72,40,0.44);
          white-space: nowrap;
          flex-shrink: 0;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .faq-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(100,72,40,0.54);
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 720px) {
          .faq-grid {
            grid-template-columns: 1fr;
          }
          .faq-hero {
            min-height: 380px;
            align-items: flex-end;
          }
          .faq-pills {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}
