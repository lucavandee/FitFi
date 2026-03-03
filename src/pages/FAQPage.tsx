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

type QA = { q: string; a: string; category: string };

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
  { id: "algemeen",  label: "Algemeen",          Icon: CircleHelp,   items: FAQ_GENERAL  },
  { id: "privacy",   label: "Privacy & gegevens", Icon: ShieldCheck,  items: FAQ_PRIVACY  },
  { id: "prijzen",   label: "Prijzen",             Icon: CreditCard,   items: FAQ_PRICING  },
  { id: "product",   label: "Product & gebruik",   Icon: Package,      items: FAQ_PRODUCT  },
];

const TRUST_PILLS = [
  { Icon: ShieldCheck, label: "Privacybewust" },
  { Icon: CreditCard,  label: "Eerlijk geprijsd" },
  { Icon: Clock,       label: "Direct resultaat" },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: ALL_QUESTIONS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, term }: { text: string; term: string }) {
  if (!term.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegex(term)})`, "gi"));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === term.toLowerCase() ? (
          <mark
            key={i}
            style={{
              background: "var(--ff-color-primary-100)",
              color: "var(--ff-color-primary-800)",
              borderRadius: "2px",
              padding: "0 2px",
            }}
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

type AccordionItemProps = {
  item: QA;
  id: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  highlight: string;
  isLast: boolean;
};

function AccordionItem({ item, id, isOpen, onToggle, highlight, isLast }: AccordionItemProps) {
  const panelId  = `panel-${id}`;
  const labelId  = `label-${id}`;

  return (
    <div
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--color-border)",
      }}
    >
      <h3 id={labelId} style={{ margin: 0 }}>
        <button
          onClick={() => onToggle(id)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          style={{
            width: "100%",
            minHeight: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            padding: "16px 24px",
            background: isOpen ? "var(--ff-color-primary-50)" : "transparent",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            transition: "background 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!isOpen) (e.currentTarget as HTMLButtonElement).style.background = "var(--ff-color-primary-50)";
          }}
          onMouseLeave={(e) => {
            if (!isOpen) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <span
            style={{
              fontSize: "15px",
              fontWeight: 500,
              lineHeight: 1.4,
              color: isOpen ? "var(--ff-color-primary-700)" : "var(--color-text)",
              flex: 1,
            }}
          >
            <Highlight text={item.q} term={highlight} />
          </span>
          <span
            style={{
              flexShrink: 0,
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: isOpen ? "var(--ff-color-primary-700)" : "var(--ff-color-primary-100)",
              color: isOpen ? "#fff" : "var(--ff-color-primary-700)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s ease",
            }}
            aria-hidden="true"
          >
            {isOpen ? <Minus size={13} strokeWidth={2.5} /> : <Plus size={13} strokeWidth={2.5} />}
          </span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={labelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p
              style={{
                margin: 0,
                padding: "4px 24px 20px",
                fontSize: "15px",
                lineHeight: 1.7,
                color: "var(--color-muted)",
              }}
            >
              <Highlight text={item.a} term={highlight} />
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [activeCat, setActiveCat]     = useState("algemeen");
  const [openId, setOpenId]           = useState<string | null>(null);
  const [search, setSearch]           = useState("");

  const isSearching = search.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const q = search.trim().toLowerCase();
    return ALL_QUESTIONS.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [search, isSearching]);

  const currentCat = CATEGORIES.find((c) => c.id === activeCat) ?? CATEGORIES[0];

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function changeCat(id: string) {
    setActiveCat(id);
    setOpenId(null);
    setSearch("");
  }

  function clearSearch() {
    setSearch("");
    setOpenId(null);
  }

  const displayItems  = isSearching ? searchResults : currentCat.items;
  const displayCatId  = isSearching ? "search"      : currentCat.id;

  return (
    <main id="main" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>
      <Seo
        title="Veelgestelde vragen — FitFi"
        description="Antwoorden op de meest gestelde vragen over FitFi: hoe het werkt, privacy, prijzen en je account."
        path="/veelgestelde-vragen"
        structuredData={FAQ_SCHEMA}
      />

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section
        aria-labelledby="faq-h1"
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: "clamp(420px, 52vh, 560px)",
          background: "#1c1208",
        }}
      >
        {/* Photo */}
        <img
          src="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
          alt=""
          aria-hidden="true"
          loading="eager"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 20%",
          }}
        />

        {/* Left-to-right gradient (keeps text readable) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(95deg, rgba(20,13,6,0.92) 0%, rgba(20,13,6,0.72) 38%, rgba(20,13,6,0.30) 62%, rgba(20,13,6,0.10) 100%)",
          }}
        />

        {/* Bottom fade to page bg */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "160px",
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(247,243,236,0.18) 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "clamp(80px, 10vw, 120px) clamp(24px, 5vw, 56px) clamp(64px, 8vw, 96px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 0,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 14px",
              borderRadius: "999px",
              background: "rgba(247,243,236,0.92)",
              color: "var(--ff-color-primary-700)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "24px",
            }}
          >
            <Sparkles size={13} aria-hidden="true" />
            Hulp &amp; informatie
          </div>

          {/* Heading */}
          <h1
            id="faq-h1"
            style={{
              margin: 0,
              fontSize: "clamp(2.6rem, 5.5vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              color: "#F7F3EC",
              marginBottom: "20px",
            }}
          >
            Veelgestelde{" "}
            <em
              className="not-italic"
              style={{ color: "#d4a96a" }}
            >
              vragen
            </em>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              margin: 0,
              fontSize: "clamp(15px, 1.8vw, 18px)",
              fontWeight: 300,
              lineHeight: 1.65,
              color: "rgba(247,243,236,0.72)",
              maxWidth: "520px",
              marginBottom: "36px",
            }}
          >
            Alles wat je wilt weten over FitFi. Staat je vraag er niet bij?{" "}
            <a
              href="mailto:contact@fitfi.ai"
              style={{
                color: "#d4a96a",
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Stuur ons een bericht.
            </a>
          </p>

          {/* Trust pills — single row, no wrap */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              gap: "10px",
            }}
          >
            {TRUST_PILLS.map(({ Icon, label }) => (
              <div
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  background: "rgba(247,243,236,0.09)",
                  border: "1px solid rgba(247,243,236,0.22)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <Icon
                  size={13}
                  aria-hidden="true"
                  style={{ color: "#b8976a", flexShrink: 0 }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "rgba(247,243,236,0.82)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "clamp(48px, 6vw, 80px) clamp(24px, 5vw, 56px) clamp(64px, 8vw, 80px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "220px 1fr",
            gap: "clamp(32px, 4vw, 64px)",
            alignItems: "start",
          }}
          className="faq-grid"
        >
          {/* ── SIDEBAR ── */}
          <aside>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <Search
                size={15}
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--color-muted)",
                  pointerEvents: "none",
                }}
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
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  paddingLeft: "40px",
                  paddingRight: search ? "40px" : "14px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  borderRadius: "12px",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface)",
                  fontSize: "14px",
                  color: "var(--color-text)",
                  boxShadow: "var(--shadow-soft)",
                  outline: "none",
                  transition: "border-color 0.15s ease",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--ff-color-primary-400)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
              />
              {search && (
                <button
                  onClick={clearSearch}
                  aria-label="Zoekopdracht wissen"
                  style={{
                    position: "absolute",
                    right: "6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-muted)",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category label */}
            <p
              style={{
                margin: "0 0 8px 2px",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-muted)",
              }}
            >
              Categorieën
            </p>

            {/* Category buttons */}
            <nav aria-label="FAQ categorieën">
              <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "4px" }}>
                {CATEGORIES.map(({ id, label, Icon, items }) => {
                  const active = !isSearching && activeCat === id;
                  return (
                    <li key={id}>
                      <button
                        onClick={() => changeCat(id)}
                        aria-pressed={active}
                        style={{
                          width: "100%",
                          minHeight: "44px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "8px 12px",
                          borderRadius: "10px",
                          border: "none",
                          cursor: "pointer",
                          textAlign: "left",
                          background: active ? "var(--ff-color-primary-700)" : "transparent",
                          color: active ? "#fff" : "var(--color-text)",
                          transition: "all 0.15s ease",
                          fontWeight: 600,
                          fontSize: "13.5px",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.background = "var(--ff-color-primary-50)";
                        }}
                        onMouseLeave={(e) => {
                          if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                      >
                        {/* Icon container */}
                        <span
                          style={{
                            flexShrink: 0,
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: active ? "rgba(255,255,255,0.18)" : "var(--ff-color-primary-100)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: active ? "#fff" : "var(--ff-color-primary-700)",
                          }}
                        >
                          <Icon size={13} aria-hidden="true" />
                        </span>

                        {/* Label — single line */}
                        <span
                          style={{
                            flex: 1,
                            lineHeight: 1.2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {label}
                        </span>

                        {/* Count badge */}
                        <span
                          style={{
                            flexShrink: 0,
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            fontSize: "11px",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: active ? "rgba(255,255,255,0.20)" : "var(--ff-color-primary-100)",
                            color: active ? "#fff" : "var(--ff-color-primary-700)",
                          }}
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
            <div
              style={{
                marginTop: "24px",
                borderRadius: "16px",
                padding: "20px",
                background: "linear-gradient(135deg, var(--ff-color-primary-50) 0%, var(--ff-color-accent-50) 100%)",
                border: "1px solid var(--ff-color-primary-200)",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "var(--ff-color-primary-100)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "12px",
                }}
              >
                <MessageCircle size={16} style={{ color: "var(--ff-color-primary-700)" }} aria-hidden="true" />
              </div>
              <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: 700, color: "var(--color-text)" }}>
                Nog een vraag?
              </p>
              <p style={{ margin: "0 0 12px", fontSize: "12px", color: "var(--color-muted)", lineHeight: 1.5 }}>
                Wij reageren binnen 24 uur.
              </p>
              <a
                href="mailto:contact@fitfi.ai"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--ff-color-primary-700)",
                  textDecoration: "none",
                  minHeight: "44px",
                }}
              >
                contact@fitfi.ai
                <ArrowRight size={13} />
              </a>
            </div>
          </aside>

          {/* ── ACCORDION ── */}
          <div>
            {/* Live region */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {isSearching
                ? searchResults.length === 0
                  ? "Geen resultaten gevonden"
                  : `${searchResults.length} ${searchResults.length === 1 ? "resultaat" : "resultaten"} gevonden`
                : ""}
            </div>

            {/* Header row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  color: "var(--ff-color-primary-600)",
                }}
              >
                {isSearching
                  ? searchResults.length === 0
                    ? "Geen resultaten"
                    : `${searchResults.length} resultaat${searchResults.length !== 1 ? "en" : ""} voor "${search}"`
                  : currentCat.label}
              </span>
              {!isSearching && (
                <span style={{ fontSize: "12px", color: "var(--color-muted)", fontWeight: 500 }}>
                  {currentCat.items.length} vragen
                </span>
              )}
            </div>

            {/* Accordion panel */}
            <AnimatePresence mode="wait">
              <motion.div
                key={isSearching ? `search-${search}` : activeCat}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
              >
                {displayItems.length === 0 ? (
                  <div
                    style={{
                      borderRadius: "16px",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      boxShadow: "var(--shadow-soft)",
                      padding: "56px 24px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "14px",
                        background: "var(--ff-color-primary-50)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                      }}
                    >
                      <Search size={18} style={{ color: "var(--ff-color-primary-400)" }} />
                    </div>
                    <p style={{ margin: "0 0 16px", color: "var(--color-muted)", fontSize: "15px" }}>
                      Geen vragen gevonden voor{" "}
                      <strong style={{ color: "var(--color-text)" }}>"{search}"</strong>.
                    </p>
                    <button
                      onClick={clearSearch}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--ff-color-primary-700)",
                        textDecoration: "underline",
                        textUnderlineOffset: "2px",
                        minHeight: "44px",
                        padding: "0 8px",
                      }}
                    >
                      Toon alle vragen
                    </button>
                  </div>
                ) : (
                  <div
                    style={{
                      borderRadius: "16px",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      boxShadow: "var(--shadow-soft)",
                      overflow: "hidden",
                    }}
                  >
                    {displayItems.map((item, i) => (
                      <AccordionItem
                        key={`${displayCatId}-${i}`}
                        item={item}
                        id={`${displayCatId}-${i}`}
                        isOpen={openId === `${displayCatId}-${i}`}
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

      {/* ══════════════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════════════ */}
      <section
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "0 clamp(24px, 5vw, 56px) clamp(64px, 8vw, 96px)",
        }}
      >
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "24px",
            padding: "clamp(40px, 5vw, 56px) clamp(32px, 5vw, 56px)",
            background: "linear-gradient(135deg, #2a1f14 0%, #3d2b1a 50%, #2a1f14 100%)",
          }}
        >
          {/* Decorative glows */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(184,151,106,0.20) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "-60px",
              left: "-60px",
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(212,169,106,0.12) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  fontSize: "clamp(18px, 2.5vw, 22px)",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "#F7F3EC",
                }}
              >
                Klaar om je stijl te ontdekken?
              </p>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: 300, color: "rgba(247,243,236,0.60)" }}>
                De quiz duurt minder dan twee minuten. Geen creditcard nodig.
              </p>
            </div>

            <NavLink
              to="/onboarding"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "14px 28px",
                minHeight: "52px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #9b7a52 0%, #7a5c38 100%)",
                color: "#F7F3EC",
                fontWeight: 700,
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 4px 24px rgba(100,72,40,0.45)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 32px rgba(100,72,40,0.55)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 24px rgba(100,72,40,0.45)";
              }}
            >
              Start gratis
              <ArrowRight size={16} aria-hidden="true" />
            </NavLink>
          </div>
        </div>
      </section>

      {/* Responsive: stack grid on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .faq-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
