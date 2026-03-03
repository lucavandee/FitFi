import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import {
  Check,
  Star,
  Zap,
  Crown,
  Loader as Loader2,
  CircleAlert as AlertCircle,
  X,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  Minus,
  Info,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useStripeProducts } from "@/hooks/useStripeProducts";
import { useCreateCheckout } from "@/hooks/useCreateCheckout";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const FEATURE_ROWS: Array<{
  label: string;
  note?: string;
  free: string | boolean;
  premium: string | boolean;
  founder: string | boolean;
}> = [
  { label: "Stijlprofiel analyse", free: true, premium: true, founder: true },
  { label: "Outfit-combinaties", note: "Inclusief do's & don'ts per outfit", free: "3 outfits", premium: "Onbeperkt", founder: "Onbeperkt" },
  { label: "Shoplinks", note: "Directe links naar webshops", free: true, premium: true, founder: true },
  { label: "Stijladvies aanpasbaar", note: "Hermaak je rapport na nieuwe antwoorden", free: true, premium: true, founder: true },
  { label: "Nova AI-assistent", note: "Chat 24/7 met je stijlcoach", free: false, premium: true, founder: true },
  { label: "Kleuranalyse (foto)", note: "Alleen als je een foto uploadt of ondertoon deelt", free: false, premium: true, founder: true },
  { label: "Shopping cheatsheet", note: "Uitgebreide kleuren- en combinatiegids op maat", free: false, premium: true, founder: true },
  { label: "Smart learning", note: "Systeem leert van je feedback", free: false, premium: true, founder: true },
  { label: "Founder badge & beta toegang", free: false, premium: false, founder: true },
  { label: "Prioritaire support", free: false, premium: false, founder: true },
];

function FeatureDot({ value }: { value: string | boolean }) {
  if (value === false) {
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-40"
        style={{ background: "var(--color-border)" }}
        aria-label="Niet inbegrepen"
      >
        <Minus className="w-3 h-3 text-[var(--color-muted)]" />
      </div>
    );
  }
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: "var(--ff-color-primary-100)" }}
      aria-label={typeof value === "string" ? value : "Inbegrepen"}
    >
      <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
    </div>
  );
}

function FeatureDotInverted({ value }: { value: string | boolean }) {
  if (value === false) {
    return (
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 opacity-40"
        style={{ background: "rgba(247,243,236,0.10)" }}
        aria-label="Niet inbegrepen"
      >
        <Minus className="w-3 h-3" style={{ color: "rgba(247,243,236,0.80)" }} />
      </div>
    );
  }
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(247,243,236,0.20)" }}
      aria-label="Inbegrepen"
    >
      <Check className="w-3.5 h-3.5" style={{ color: "rgba(247,243,236,0.95)" }} strokeWidth={3} />
    </div>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: products, isLoading } = useStripeProducts();
  const createCheckout = useCreateCheckout();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [showCancelBanner, setShowCancelBanner] = useState(false);
  const [matrixOpen, setMatrixOpen] = useState(false);

  const founderProduct = products?.find((p) => p.interval === "one_time");
  const premiumProduct = products?.find((p) => p.interval === "month");

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "cancelled") {
      setShowCancelBanner(true);
      const timer = setTimeout(() => {
        navigate("/prijzen", { replace: true });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [searchParams, navigate]);

  const handleCloseCancelBanner = () => {
    setShowCancelBanner(false);
    navigate("/prijzen", { replace: true });
  };

  const handleCheckout = async (productId: string) => {
    setCheckingAuth(true);
    const client = supabase();
    if (!client) {
      setCheckingAuth(false);
      toast.error("Verbinding niet beschikbaar. Probeer het later opnieuw.");
      return;
    }
    const {
      data: { session },
    } = await client.auth.getSession();
    if (!session) {
      setCheckingAuth(false);
      toast.error("Log eerst in om te kunnen upgraden");
      navigate("/login?redirect=/prijzen");
      return;
    }
    setCheckingAuth(false);
    try {
      const result = await createCheckout.mutateAsync({ productId });
      if (result.url) window.location.href = result.url;
    } catch (error: any) {
      const msg = error.message || "Er ging iets mis. Probeer het opnieuw.";
      if (msg.includes("not configured") || msg.includes("STRIPE_SECRET_KEY")) {
        toast.error("Betalingen zijn momenteel niet beschikbaar.");
      } else {
        toast.error(msg);
      }
    }
  };

  const premiumPriceNum = premiumProduct?.price || 9.99;
  const founderPriceNum = founderProduct?.price || 149;
  const premiumPrice = isLoading
    ? "9,99"
    : premiumPriceNum.toFixed(2).replace(".", ",");
  const founderPrice = isLoading
    ? "149"
    : Math.round(founderPriceNum).toString();
  const breakEvenMonths =
    premiumPriceNum > 0 ? Math.ceil(founderPriceNum / premiumPriceNum) : 15;
  const isPending = createCheckout.isPending || checkingAuth;

  return (
    <>
      <Seo
        title="Prijzen — FitFi"
        description="Free geeft je 3 outfits en shoplinks. Met Premium krijg je onbeperkte outfits, kleuranalyse en een persoonlijke stylist. Vergelijk plannen en kies wat bij jou past."
        path="/prijzen"

        ogImage="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp"
      />

      {/* FIX #1: geen <main> hier — app-shell beheert dit */}
      <div className="bg-[var(--color-bg)] text-[var(--color-text)]">

        {/* ── Checkout-geannuleerd banner ── */}
        {showCancelBanner && (
          <div
            className="border-b border-[var(--color-border)]"
            style={{ background: "var(--ff-color-warning-50)" }}
          >
            <div className="ff-container py-3 sm:py-4">
              <div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "var(--ff-color-warning-600)" }}
                  />
                  <div>
                    <p className="font-semibold text-[var(--color-text)] text-sm">
                      Checkout geannuleerd
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      Geen zorgen — je kunt altijd later upgraden.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {premiumProduct && (
                    <button
                      onClick={() => {
                        handleCloseCancelBanner();
                        handleCheckout(premiumProduct.id);
                      }}
                      disabled={isPending}
                      className="px-4 py-2 min-h-[44px] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                      style={{ background: "var(--ff-color-primary-600)" }}
                    >
                      Probeer opnieuw
                    </button>
                  )}
                  <button
                    onClick={handleCloseCancelBanner}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--ff-color-primary-50)]"
                    style={{ color: "var(--ff-color-warning-600)" }}
                    aria-label="Sluit melding"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── HERO ── */}
        {/*
          FIX #3: Geen `via-white` of `accent-50` tokens (bestaan niet).
          Vervangen door goedgekeurde tokens: primary-50 → color-bg.
        */}
        <section
          className="relative overflow-hidden py-14 sm:py-20"
          style={{
            background:
              "linear-gradient(160deg, var(--ff-color-primary-50) 0%, var(--color-bg) 55%, var(--ff-color-primary-50) 100%)",
          }}
          aria-labelledby="pricing-heading"
        >
          <div className="ff-container relative">
            <div className="max-w-3xl mx-auto text-center">
              {/* Social-proof badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 border border-[var(--color-border)] shadow-[var(--shadow-soft)]"
                style={{ background: "var(--color-surface)" }}
              >
                <Users
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "var(--ff-color-primary-600)" }}
                  aria-hidden="true"
                />
                <span className="text-xs sm:text-sm font-medium">
                  2.500+ gebruikers ontdekten hun stijl
                </span>
              </div>

              {/*
                FIX #4: font-heading class + clamp() voor responsieve heading.
                Geen arbitraire Tailwind-breakpoint font-sizes.
              */}
              <h1
                id="pricing-heading"
                className="font-heading font-bold tracking-tight mb-4 text-[var(--color-text)]"
                style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.1 }}
              >
                Jouw stijl, jouw keuze
              </h1>

              <p className="text-base sm:text-lg text-[var(--color-muted)] mb-8 max-w-2xl mx-auto leading-relaxed">
                Free blijft altijd bruikbaar. Met Premium krijg je kleuranalyse,
                onbeperkte outfits en een persoonlijke stylist die vragen beantwoordt.
              </p>

              {/* Trust-checkmarks */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-[var(--color-text)]">
                {[
                  "30 dagen geld-terug-garantie",
                  "Maandelijks opzegbaar",
                  "Geen creditcard voor Free",
                ].map((label) => (
                  <div key={label} className="flex items-center gap-2">
                    <Check
                      className="w-4 h-4 flex-shrink-0"
                      style={{ color: "var(--ff-color-success-600)" }}
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING CARDS ── */}
        <section className="py-10 sm:py-14" aria-labelledby="plans-heading">
          <h2 id="plans-heading" className="sr-only">Prijsplannen</h2>
          <div className="ff-container">
            <div className="max-w-2xl lg:max-w-5xl mx-auto">

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

                {/* ── Free Plan ── */}
                <article
                  className="rounded-2xl border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)] flex flex-col"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide self-start mb-4"
                    style={{
                      background: "var(--color-bg)",
                      color: "var(--color-muted)",
                    }}
                  >
                    Altijd gratis
                  </div>
                  <h3
                    className="font-heading font-bold mb-2 text-[var(--color-text)]"
                    style={{ fontSize: "clamp(1.3rem, 3vw, 1.6rem)" }}
                  >
                    Gratis
                  </h3>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="font-bold text-[var(--color-text)]"
                      style={{ fontSize: "clamp(2.5rem, 5vw, 3rem)" }}
                    >
                      €0
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-muted)] mb-6">
                    Voor altijd — geen creditcard
                  </p>

                  <ul className="space-y-3 flex-1 mb-6" role="list">
                    {[
                      { ok: true, label: "Stijlprofiel analyse" },
                      { ok: true, label: "3 gepersonaliseerde outfits" },
                      { ok: true, label: "Directe shoplinks" },
                      { ok: true, label: "Rapport aanpasbaar" },
                      { ok: false, label: "Nova AI-stylist" },
                      { ok: false, label: "Kleuranalyse (foto)" },
                    ].map(({ ok, label }) => (
                      <li
                        key={label}
                        className={`flex items-center gap-3 ${ok ? "" : "opacity-40"}`}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: ok
                              ? "var(--ff-color-primary-100)"
                              : "var(--color-border)",
                          }}
                        >
                          {ok ? (
                            <Check
                              className="w-3 h-3 text-[var(--ff-color-primary-700)]"
                              strokeWidth={3}
                            />
                          ) : (
                            <Minus className="w-3 h-3 text-[var(--color-muted)]" />
                          )}
                        </div>
                        <span className="text-sm text-[var(--color-text)] leading-snug">
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* FIX #7/#9: py-4 (16px, on-grid) + min-h-[52px] secondary light-bg stijl */}
                  <NavLink
                    to="/onboarding"
                    className="block text-center px-6 py-4 min-h-[52px] rounded-xl font-semibold text-sm border-2 border-[var(--ff-color-primary-600)] text-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-50)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 active:scale-[0.98] flex items-center justify-center"
                    data-event="cta_start_free_pricing"
                  >
                    Start gratis
                  </NavLink>
                </article>

                {/* ── Premium Plan ── */}
                <article
                  className="relative rounded-2xl p-6 shadow-2xl flex flex-col"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--ff-color-primary-600) 0%, var(--ff-color-primary-700) 100%)",
                  }}
                >
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 self-start shadow-md"
                    style={{
                      background: "var(--ff-color-warning-600)",
                      color: "rgba(247,243,236,0.96)",
                    }}
                  >
                    <Star className="w-3 h-3 fill-current flex-shrink-0" aria-hidden="true" />
                    MEEST GEKOZEN
                  </div>

                  <h3
                    className="font-heading font-bold mb-2"
                    style={{
                      fontSize: "clamp(1.3rem, 3vw, 1.6rem)",
                      color: "rgba(247,243,236,0.96)",
                    }}
                  >
                    {isLoading ? "Premium" : premiumProduct?.name || "Premium"}
                  </h3>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="font-bold"
                      style={{
                        fontSize: "clamp(2.5rem, 5vw, 3rem)",
                        color: "rgba(247,243,236,0.96)",
                      }}
                    >
                      €{premiumPrice}
                    </span>
                    <span
                      className="text-base"
                      style={{ color: "rgba(247,243,236,0.60)" }}
                    >
                      /maand
                    </span>
                  </div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: "rgba(247,243,236,0.55)" }}
                  >
                    ~€0,33 per dag
                  </p>
                  <p
                    className="text-xs mb-6"
                    style={{ color: "rgba(247,243,236,0.45)" }}
                  >
                    Maandelijks opzegbaar
                  </p>

                  <ul className="space-y-3 flex-1 mb-6" role="list">
                    <li
                      className="text-xs font-bold uppercase tracking-wider pb-1"
                      style={{ color: "rgba(247,243,236,0.55)" }}
                    >
                      Alles van Free, plus:
                    </li>
                    {[
                      "Onbeperkte outfits",
                      "Nova AI-assistent",
                      "Kleuranalyse (foto)",
                      "Shopping cheatsheet",
                      "Smart learning",
                    ].map((title) => (
                      <li key={title} className="flex items-center gap-3">
                        <FeatureDotInverted value={true} />
                        <span
                          className="text-sm font-medium"
                          style={{ color: "rgba(247,243,236,0.92)" }}
                        >
                          {title}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* FIX #7/#9: py-4 + min-h-[56px] voor primaire knop op donkere achtergrond */}
                  <button
                    onClick={() =>
                      premiumProduct && handleCheckout(premiumProduct.id)
                    }
                    disabled={isLoading || isPending}
                    className="w-full px-6 py-4 min-h-[56px] rounded-xl font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] mb-2"
                    style={{
                      background: "rgba(247,243,236,0.96)",
                      color: "var(--ff-color-primary-700)",
                      focusRingColor: "rgba(247,243,236,0.80)",
                    }}
                    data-event="cta_start_premium_pricing"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Laden...</span>
                      </>
                    ) : isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Bezig...</span>
                      </>
                    ) : (
                      <>
                        <span>Upgrade naar Premium</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                  <p
                    className="text-xs text-center"
                    style={{ color: "rgba(247,243,236,0.45)" }}
                  >
                    30 dagen geld-terug-garantie
                  </p>
                </article>

                {/* ── Founder Plan ── */}
                <article
                  className="rounded-2xl p-6 shadow-2xl border flex flex-col"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--ff-color-primary-900) 0%, var(--ff-color-primary-800) 100%)",
                    borderColor: "rgba(217,119,6,0.20)",
                  }}
                >
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 self-start"
                    style={{
                      background: "rgba(217,119,6,0.18)",
                      color: "var(--ff-color-warning-300)",
                    }}
                  >
                    <Crown className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
                    LIFETIME
                  </div>

                  <h3
                    className="font-heading font-bold mb-2"
                    style={{
                      fontSize: "clamp(1.3rem, 3vw, 1.6rem)",
                      color: "rgba(247,243,236,0.96)",
                    }}
                  >
                    Founder
                  </h3>

                  <div className="flex items-baseline gap-3 mb-1">
                    <span
                      className="font-bold"
                      style={{
                        fontSize: "clamp(2.5rem, 5vw, 3rem)",
                        color: "rgba(247,243,236,0.96)",
                      }}
                    >
                      €{founderPrice}
                    </span>
                    <span
                      className="line-through text-base"
                      style={{ color: "rgba(247,243,236,0.32)" }}
                    >
                      €999
                    </span>
                  </div>
                  <p
                    className="text-xs mb-1"
                    style={{ color: "rgba(247,243,236,0.45)" }}
                  >
                    Eenmalig · Lifetime toegang
                  </p>
                  <p
                    className="text-xs font-semibold mb-6"
                    style={{ color: "var(--ff-color-warning-400)" }}
                  >
                    Break-even: {breakEvenMonths} maanden
                  </p>

                  <ul className="space-y-3 flex-1 mb-6" role="list">
                    <li
                      className="text-xs font-bold uppercase tracking-wider pb-1"
                      style={{ color: "rgba(217,119,6,0.70)" }}
                    >
                      Exclusief:
                    </li>
                    {[
                      "Lifetime Premium toegang",
                      "Founder badge",
                      "Beta toegang",
                      "Prioritaire support",
                      "Invloed op roadmap",
                    ].map((title) => (
                      <li key={title} className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "rgba(217,119,6,0.20)" }}
                        >
                          <Check
                            className="w-3 h-3"
                            style={{ color: "var(--ff-color-warning-400)" }}
                            strokeWidth={3}
                          />
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: "rgba(247,243,236,0.90)" }}
                        >
                          {title}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* FIX #7/#9: py-4 + min-h-[56px] */}
                  <button
                    onClick={() =>
                      founderProduct && handleCheckout(founderProduct.id)
                    }
                    disabled={isLoading || isPending}
                    className="w-full px-6 py-4 min-h-[56px] rounded-xl font-bold text-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] mb-2"
                    style={{
                      background: "var(--ff-color-warning-500)",
                      color: "var(--ff-color-primary-900)",
                    }}
                    data-event="cta_start_founder_pricing"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Laden...</span>
                      </>
                    ) : isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        <span>Bezig...</span>
                      </>
                    ) : (
                      <>
                        <span>Word Founder lid</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                  <p
                    className="text-xs text-center"
                    style={{ color: "rgba(247,243,236,0.38)" }}
                  >
                    Beperkt beschikbaar · 30 dagen garantie
                  </p>
                </article>

              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURE MATRIX ── */}
        <section
          className="py-10 sm:py-14"
          style={{ background: "rgba(255,255,255,0.40)" }}
          aria-labelledby="matrix-heading"
        >
          <div className="ff-container">
            <div className="max-w-2xl lg:max-w-5xl mx-auto">

              <button
                onClick={() => setMatrixOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-soft)] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
                style={{ background: "var(--color-surface)" }}
                aria-expanded={matrixOpen}
                aria-controls="feature-matrix"
                id="matrix-heading"
              >
                <div className="text-left">
                  <p className="font-bold text-base sm:text-lg text-[var(--color-text)]">
                    Vergelijk alle features
                  </p>
                  <p className="text-sm text-[var(--color-muted)]">
                    Free · Premium · Founder naast elkaar
                  </p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--color-muted)] flex-shrink-0 transition-transform duration-300 ${matrixOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>

              {matrixOpen && (
                <div
                  id="feature-matrix"
                  className="mt-3 rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-soft)]"
                  style={{ background: "var(--color-surface)" }}
                >
                  <div className="overflow-x-auto">
                    <div className="min-w-[480px]">
                      {/* Header */}
                      <div
                        className="grid grid-cols-4 border-b border-[var(--color-border)]"
                        style={{ background: "var(--color-bg)" }}
                      >
                        <div className="col-span-1 p-3 sm:p-4 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">
                          Feature
                        </div>
                        <div className="p-3 sm:p-4 text-center text-xs font-bold text-[var(--color-text)]">
                          Gratis
                        </div>
                        <div
                          className="p-3 sm:p-4 text-center text-xs font-bold"
                          style={{
                            color: "var(--ff-color-primary-600)",
                            background: "var(--ff-color-primary-50)",
                          }}
                        >
                          Premium
                        </div>
                        <div
                          className="p-3 sm:p-4 text-center text-xs font-bold"
                          style={{
                            color: "var(--ff-color-warning-700)",
                            background: "var(--ff-color-warning-50)",
                          }}
                        >
                          Founder
                        </div>
                      </div>

                      {/* Rows */}
                      <div className="divide-y divide-[var(--color-border)]">
                        {FEATURE_ROWS.map((row, i) => (
                          <div
                            key={row.label}
                            className="grid grid-cols-4"
                            style={
                              i % 2 === 1
                                ? { background: "rgba(0,0,0,0.02)" }
                                : undefined
                            }
                          >
                            <div className="col-span-1 p-3 sm:p-4 flex items-start gap-2">
                              <span className="text-xs sm:text-sm text-[var(--color-text)] font-medium leading-snug">
                                {row.label}
                              </span>
                              {/*
                                FIX #11: tooltip bereikbaar via focus (tabIndex=0 + focus:block)
                                zodat toetsenbord en touch-gebruikers het ook kunnen activeren.
                              */}
                              {row.note && (
                                <span className="group relative flex-shrink-0 mt-0.5">
                                  <button
                                    type="button"
                                    className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-400)] rounded"
                                    aria-label={`Toelichting: ${row.note}`}
                                  >
                                    <Info
                                      className="w-3 h-3 text-[var(--color-muted)]"
                                      aria-hidden="true"
                                    />
                                  </button>
                                  <span
                                    className="pointer-events-none absolute bottom-full left-0 mb-1 hidden group-hover:block group-focus-within:block text-xs rounded-lg px-3 py-2 w-52 shadow-xl z-10 leading-relaxed"
                                    style={{
                                      background: "var(--ff-color-primary-900)",
                                      color: "rgba(247,243,236,0.92)",
                                    }}
                                    role="tooltip"
                                  >
                                    {row.note}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="p-3 sm:p-4 flex items-center justify-center">
                              <FeatureDot value={row.free} />
                            </div>
                            <div
                              className="p-3 sm:p-4 flex items-center justify-center"
                              style={{ background: "rgba(122,97,74,0.04)" }}
                            >
                              <FeatureDot value={row.premium} />
                            </div>
                            <div
                              className="p-3 sm:p-4 flex items-center justify-center"
                              style={{ background: "rgba(217,119,6,0.04)" }}
                            >
                              <FeatureDot value={row.founder} />
                            </div>
                          </div>
                        ))}

                        {/* Price row */}
                        <div
                          className="grid grid-cols-4 border-t-2 border-[var(--color-border)] font-semibold"
                          style={{ background: "var(--color-bg)" }}
                        >
                          <div className="col-span-1 p-3 sm:p-4 text-xs sm:text-sm">
                            Prijs
                          </div>
                          <div className="p-3 sm:p-4 text-center text-xs sm:text-sm">
                            €0
                          </div>
                          <div
                            className="p-3 sm:p-4 text-center text-xs sm:text-sm"
                            style={{ background: "rgba(122,97,74,0.05)" }}
                          >
                            €{premiumPrice}/mnd
                          </div>
                          <div
                            className="p-3 sm:p-4 text-center text-xs sm:text-sm"
                            style={{ background: "rgba(217,119,6,0.05)" }}
                          >
                            €{founderPrice}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Kleuranalyse disclaimer */}
                  <div
                    className="px-4 sm:px-5 py-4 border-t flex items-start gap-3"
                    style={{
                      background: "var(--ff-color-primary-50)",
                      borderColor: "var(--ff-color-primary-200)",
                    }}
                  >
                    <Info
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--ff-color-primary-700)" }}
                      aria-hidden="true"
                    />
                    <p
                      className="text-xs sm:text-sm leading-relaxed"
                      style={{ color: "var(--ff-color-primary-700)" }}
                    >
                      Kleuranalyse werkt uitsluitend als jij een foto uploadt of je
                      ondertoon zelf deelt. We schatten dit nooit op eigen initiatief.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-10 sm:py-14" aria-labelledby="testimonials-heading">
          <div className="ff-container">
            <div className="max-w-2xl lg:max-w-5xl mx-auto">
              {/*
                FIX #5/#12: font-heading + clamp() + id voor aria-labelledby.
              */}
              <h2
                id="testimonials-heading"
                className="font-heading font-bold tracking-tight text-center mb-2 text-[var(--color-text)]"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
              >
                Wat gebruikers zeggen
              </h2>
              <p className="text-[var(--color-muted)] text-center mb-8 text-sm sm:text-base">
                Echte ervaringen van echte gebruikers
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                {[
                  {
                    quote:
                      "Binnen 10 minuten wist ik precies wat me staat. Geen eindeloos scrollen meer.",
                    name: "Sophie M.",
                    plan: "Premium gebruiker",
                    initial: "S",
                  },
                  {
                    quote:
                      "Nova voelt als een echte stylist. Het leert mijn smaak en wordt telkens beter.",
                    name: "Thomas V.",
                    plan: "Founder lid",
                    initial: "T",
                  },
                  {
                    quote:
                      "Ik bespaarde al 2x de kosten door geen verkeerde aankopen meer te doen.",
                    name: "Lisa R.",
                    plan: "Premium gebruiker",
                    initial: "L",
                  },
                ].map(({ quote, name, plan, initial }) => (
                  <article
                    key={name}
                    className="rounded-2xl border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]"
                    style={{ background: "var(--color-surface)" }}
                  >
                    {/* FIX #8: gap-1 (4px, on-grid) ipv gap-0.5 (2px) */}
                    <div
                      className="flex items-center gap-1 mb-4"
                      aria-label="5 van 5 sterren"
                    >
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 flex-shrink-0"
                          style={{
                            color: "var(--ff-color-warning-600)",
                            fill: "var(--ff-color-warning-600)",
                          }}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <blockquote className="text-[var(--color-text)] text-base font-light leading-relaxed mb-5">
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                    <footer className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{
                          background: "var(--ff-color-primary-100)",
                          color: "var(--ff-color-primary-700)",
                        }}
                      >
                        {initial}
                      </div>
                      <div>
                        <cite className="font-semibold text-sm text-[var(--color-text)] not-italic block">
                          {name}
                        </cite>
                        <div className="text-xs text-[var(--color-muted)]">{plan}</div>
                      </div>
                    </footer>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          className="py-10 sm:py-14"
          style={{ background: "rgba(255,255,255,0.30)" }}
          aria-labelledby="faq-heading"
        >
          <div className="ff-container">
            <div className="max-w-2xl mx-auto">
              {/* FIX #5: font-heading + clamp() */}
              <h2
                id="faq-heading"
                className="font-heading font-bold tracking-tight text-center mb-8 text-[var(--color-text)]"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
              >
                Veelgestelde vragen
              </h2>
              <div className="space-y-3">
                {[
                  {
                    q: "Wat blijft altijd beschikbaar met Free?",
                    a: "Je stijlprofiel, je 3 outfit-combinaties en alle shoplinks blijven altijd zichtbaar — ook als je nooit betaalt. Free is niet tijdelijk; het is een volwaardig startpunt.",
                  },
                  {
                    q: "Wat krijg ik met Premium precies?",
                    a: "Premium geeft je onbeperkte outfit-aanbevelingen, toegang tot de Nova AI-stylist (chat 24/7), een uitgebreide shopping cheatsheet en kleuranalyse op basis van een foto die jij uploadt.",
                  },
                  {
                    q: "Hoe werkt kleurenadvies precies?",
                    a: "Kleurenanalyse op basis van ondertoon is een Premium-feature en werkt alleen als jij een foto uploadt of je ondertoon zelf deelt. We schatten of claimen dit nooit op eigen initiatief.",
                  },
                  {
                    q: "Is Premium maandelijks opzegbaar?",
                    a: "Ja. Je kunt elke maand opzeggen zonder verborgen kosten. Stop wanneer je wilt — je Free-rapport blijft zichtbaar.",
                  },
                  {
                    q: "Wat is het verschil tussen Premium en Founder?",
                    a: `Premium is een maandelijks abonnement. Founder is een eenmalige betaling voor lifetime toegang plus exclusieve voordelen. Na ${breakEvenMonths} maanden is Founder goedkoper.`,
                  },
                  {
                    q: "Is er een geld-terug-garantie?",
                    a: "Ja, 30 dagen geld-terug-garantie voor alle betaalde plannen. Geen vragen gesteld.",
                  },
                ].map(({ q, a }) => (
                  <details
                    key={q}
                    className="rounded-xl border border-[var(--color-border)] p-5 group"
                    style={{ background: "var(--color-surface)" }}
                  >
                    <summary className="font-semibold text-sm sm:text-base cursor-pointer flex items-center justify-between gap-3 min-h-[44px] list-none text-[var(--color-text)]">
                      <span className="leading-snug">{q}</span>
                      <ChevronDown
                        className="w-5 h-5 text-[var(--color-muted)] flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                        aria-hidden="true"
                      />
                    </summary>
                    <p className="mt-3 text-[var(--color-muted)] text-sm sm:text-base leading-relaxed">
                      {a}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
