import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  Star,
  Zap,
  Crown,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Users,
  TrendingUp,
  Shield,
  ArrowRight,
  Minus,
  Info,
} from "lucide-react";
import { useStripeProducts } from "@/hooks/useStripeProducts";
import { useCreateCheckout } from "@/hooks/useCreateCheckout";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { canonicalUrl } from "@/utils/urls";

const FEATURE_ROWS: Array<{
  label: string;
  note?: string;
  free: string | boolean;
  premium: string | boolean;
  founder: string | boolean;
}> = [
  {
    label: "Stijlprofiel analyse",
    free: true,
    premium: true,
    founder: true,
  },
  {
    label: "Outfit-combinaties",
    note: "Inclusief do's & don'ts per outfit",
    free: "3 outfits",
    premium: "Onbeperkt",
    founder: "Onbeperkt",
  },
  {
    label: "Shoplinks",
    note: "Directe links naar webshops",
    free: true,
    premium: true,
    founder: true,
  },
  {
    label: "Stijladvies aanpasbaar",
    note: "Hermaak je rapport na nieuwe antwoorden",
    free: true,
    premium: true,
    founder: true,
  },
  {
    label: "Nova AI-assistent",
    note: "Chat 24/7 met je stijlcoach",
    free: false,
    premium: true,
    founder: true,
  },
  {
    label: "Kleuranalyse (foto)",
    note: "Alleen beschikbaar als je een foto uploadt of ondertoon deelt — we schatten dit nooit zelf",
    free: false,
    premium: true,
    founder: true,
  },
  {
    label: "Shopping cheatsheet",
    note: "Uitgebreide kleuren- en combinatiegids op maat",
    free: false,
    premium: true,
    founder: true,
  },
  {
    label: "Smart learning",
    note: "Systeem leert van je feedback",
    free: false,
    premium: true,
    founder: true,
  },
  {
    label: "Founder badge & beta toegang",
    free: false,
    premium: false,
    founder: true,
  },
  {
    label: "Prioritaire support",
    free: false,
    premium: false,
    founder: true,
  },
];

function CellValue({ value, note }: { value: string | boolean; note?: string }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-green-600 mx-auto" aria-label="Inbegrepen" />;
  }
  if (value === false) {
    return <Minus className="w-4 h-4 text-[var(--color-muted)] mx-auto" aria-label="Niet inbegrepen" />;
  }
  return (
    <span className="text-sm font-semibold text-[var(--color-text)]">
      {value}
      {note && (
        <span className="sr-only"> — {note}</span>
      )}
    </span>
  );
}

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: products, isLoading } = useStripeProducts();
  const createCheckout = useCreateCheckout();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [showCancelBanner, setShowCancelBanner] = useState(false);

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
      if (result.url) {
        window.location.href = result.url;
      }
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
  const founderPrice = isLoading ? "149" : Math.round(founderPriceNum).toString();
  const breakEvenMonths =
    premiumPriceNum > 0 ? Math.ceil(founderPriceNum / premiumPriceNum) : 15;
  const isPending = createCheckout.isPending || checkingAuth;

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Prijzen – FitFi</title>
        <meta
          name="description"
          content="Free geeft je 3 outfits en shoplinks. Premium ontgrendelt onbeperkte outfits, kleuranalyse en Nova AI. Vergelijk plannen en kies wat bij jou past."
        />
        <link rel="canonical" href={canonicalUrl("/prijzen")} />
      </Helmet>

      {showCancelBanner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="ff-container py-3 sm:py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Checkout geannuleerd</p>
                  <p className="text-xs text-amber-700">Geen zorgen — je kunt altijd later upgraden.</p>
                </div>
              </div>
              <button
                onClick={handleCloseCancelBanner}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-amber-600 hover:text-amber-800 rounded-lg hover:bg-amber-100 transition-colors"
                aria-label="Sluit melding"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-12 sm:py-16 md:py-20 lg:py-24">
        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6">

            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full mb-5 shadow-sm">
              <Users className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
              <span className="text-xs sm:text-sm font-medium">2.500+ gebruikers ontdekten hun stijl</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-4 leading-tight">
              Jouw stijl, jouw keuze
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-[var(--color-muted)] mb-6 max-w-2xl mx-auto leading-relaxed">
              Free blijft altijd bruikbaar: je stijlrapport en outfits blijven zichtbaar. Premium ontgrendelt kleuranalyse, onbeperkte outfits en je persoonlijke AI-stylist.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--color-text)]">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-600" />
                <span>30 dagen geld-terug-garantie</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-600" />
                <span>Maandelijks opzegbaar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-green-600" />
                <span>Je ziet eerst een preview — daarna beslis je</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="py-10 sm:py-14 md:py-18 -mt-6 sm:-mt-8">
        <div className="ff-container">
          <div className="max-w-7xl mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">

              {/* Free Plan */}
              <article className="lg:col-span-4 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-5 sm:p-7 shadow-[var(--shadow-soft)] flex flex-col">
                <header className="mb-5 sm:mb-6">
                  <div className="inline-block px-3 py-1 bg-[var(--color-bg)] rounded-full text-xs font-bold text-[var(--color-muted)] mb-3 uppercase tracking-wide">
                    Altijd gratis
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Gratis</h2>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-5xl font-bold">€0</span>
                  </div>
                  <p className="text-sm text-[var(--color-muted)]">Voor altijd beschikbaar — geen creditcard</p>
                </header>

                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[var(--ff-color-primary-700)]" />
                    </div>
                    <span className="text-sm">Stijlprofiel analyse</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[var(--ff-color-primary-700)]" />
                    </div>
                    <span className="text-sm">3 gepersonaliseerde outfit-combinaties</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[var(--ff-color-primary-700)]" />
                    </div>
                    <span className="text-sm">Directe shoplinks voor elk item</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[var(--ff-color-primary-700)]" />
                    </div>
                    <span className="text-sm">Rapport aanpasbaar na herstart</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-45">
                    <div className="w-5 h-5 bg-[var(--color-border)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Minus className="w-3 h-3 text-[var(--color-muted)]" />
                    </div>
                    <span className="text-sm">Geen AI-stylist (Nova)</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-45">
                    <div className="w-5 h-5 bg-[var(--color-border)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Minus className="w-3 h-3 text-[var(--color-muted)]" />
                    </div>
                    <span className="text-sm">Geen kleuranalyse op basis van foto</span>
                  </li>
                </ul>

                <NavLink
                  to="/onboarding"
                  className="block text-center px-6 py-3.5 min-h-[52px] bg-[var(--color-surface)] border-2 border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] rounded-xl font-semibold hover:bg-[var(--ff-color-primary-50)] hover:border-[var(--ff-color-primary-400)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 active:scale-[0.98]"
                  data-event="cta_start_free_pricing"
                >
                  Ga door met Free
                </NavLink>
              </article>

              {/* Premium Plan */}
              <article className="lg:col-span-8 relative bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-2xl p-5 sm:p-7 md:p-9 shadow-2xl text-white lg:scale-[1.02] mt-2 sm:mt-3 flex flex-col">

                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 rounded-full px-5 sm:px-7 py-2 text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-2xl border-2 border-white/20 whitespace-nowrap">
                  MEEST GEKOZEN
                </div>

                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 flex-1">

                  <div className="flex flex-col">
                    <header className="mb-5 sm:mb-7 pt-2 flex-1">
                      <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold mb-3 uppercase tracking-wide">
                        Onbeperkt stylen
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                        {isLoading ? "Premium" : premiumProduct?.name || "Premium"}
                      </h2>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-5xl sm:text-6xl font-bold">€{premiumPrice}</span>
                        <span className="text-lg opacity-90">/maand</span>
                      </div>
                      <p className="text-white/75 text-xs mb-1">
                        Gemiddeld €0,33 per dag
                      </p>
                      <p className="text-white/60 text-xs mb-5">
                        Je kunt op elk moment opzeggen — geen boetes
                      </p>

                      <button
                        onClick={() => premiumProduct && handleCheckout(premiumProduct.id)}
                        disabled={isLoading || isPending}
                        className="w-full px-6 py-4 min-h-[52px] bg-white text-[var(--ff-color-primary-700)] rounded-xl font-bold text-base hover:bg-white/90 hover:shadow-2xl transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl active:scale-[0.98]"
                        data-event="cta_start_premium_pricing"
                      >
                        {isLoading ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /><span>Laden...</span></>
                        ) : isPending ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /><span>Bezig...</span></>
                        ) : (
                          <><span>Upgrade naar Premium</span><ArrowRight className="w-5 h-5" /></>
                        )}
                      </button>

                      <p className="text-xs text-white/60 text-center mt-2">
                        30 dagen geld-terug-garantie
                      </p>
                    </header>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider mb-4 opacity-80">
                      Alles van Free, plus:
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-0.5">Onbeperkte outfits</div>
                          <div className="text-xs text-white/75">Nieuwe looks voor werk, weekend, uitgaan</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-0.5">Nova AI-assistent</div>
                          <div className="text-xs text-white/75">Chat 24/7 met je persoonlijke stijlcoach</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-0.5">Kleuranalyse (foto)</div>
                          <div className="text-xs text-white/75">Upload een foto voor advies op ondertoon — alleen als je dat kiest</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-0.5">Shopping cheatsheet</div>
                          <div className="text-xs text-white/75">Uitgebreide kleuren- &amp; combinatiegids op maat</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-0.5">Smart learning</div>
                          <div className="text-xs text-white/75">Systeem leert van je feedback en wordt beter</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>

            {/* Founder Plan */}
            <article className="mt-8 sm:mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 md:p-10 text-white shadow-2xl border border-amber-500/20">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">

                <div>
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-amber-500/20 rounded-full text-xs sm:text-sm font-bold mb-4">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300">EXCLUSIEF LIFETIME</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold mb-3">Founder</h2>

                  <p className="text-base sm:text-lg text-white/90 mb-5">
                    Betaal één keer. Gebruik voor altijd. Geen verborgen kosten, ooit.
                  </p>

                  <div className="bg-white/10 rounded-xl p-5 mb-5">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-4xl sm:text-5xl font-bold">€{founderPrice}</span>
                      <span className="text-white/60 line-through text-lg">€999</span>
                    </div>
                    <p className="text-xs text-white/60 mb-4">Eenmalig • Lifetime toegang</p>

                    <div className="pt-4 border-t border-white/20">
                      <div className="text-xs text-white/70 mb-1">Break-even:</div>
                      <div className="text-xl font-bold text-amber-400">
                        {breakEvenMonths} maanden = gratis voor altijd
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        Na {breakEvenMonths} maanden heb je dit bedrag terugverdiend vs Premium
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => founderProduct && handleCheckout(founderProduct.id)}
                    disabled={isLoading || isPending}
                    className="w-full px-6 py-4 min-h-[52px] bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-base hover:from-amber-400 hover:to-amber-500 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl active:scale-[0.98]"
                    data-event="cta_start_founder_pricing"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /><span>Laden...</span></>
                    ) : isPending ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /><span>Bezig...</span></>
                    ) : (
                      <><Crown className="w-5 h-5" /><span>Word Founder lid</span></>
                    )}
                  </button>
                  <p className="text-xs text-white/50 text-center mt-2">
                    Beperkt beschikbaar • 30 dagen geld-terug-garantie
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-amber-300">
                    Exclusieve voordelen:
                  </h3>
                  <ul className="space-y-4">
                    {[
                      { icon: Check, text: "Lifetime Premium toegang", sub: "Alle Premium features, voor altijd" },
                      { icon: Crown, text: "Founder badge", sub: "Herkenbaar als early adopter in de community" },
                      { icon: Sparkles, text: "Beta toegang", sub: "Test nieuwe features als eerste" },
                      { icon: Shield, text: "Prioritaire support", sub: "Je vragen worden altijd eerst beantwoord" },
                      { icon: TrendingUp, text: "Invloed op roadmap", sub: "Help bepalen welke features we bouwen" },
                    ].map(({ icon: Icon, text, sub }) => (
                      <li key={text} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Icon className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm mb-0.5">{text}</div>
                          <div className="text-xs text-white/65">{sub}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── FEATURE MATRIX (always visible) ── */}
      <section className="py-12 sm:py-16 bg-[var(--color-surface)]/40" aria-labelledby="matrix-heading">
        <div className="ff-container">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <h2 id="matrix-heading" className="text-2xl sm:text-3xl font-bold text-center mb-2">
              Vergelijk Free vs Premium
            </h2>
            <p className="text-[var(--color-muted)] text-center mb-8 sm:mb-10 text-sm sm:text-base">
              Transparant overzicht van wat elk plan inhoudt.
            </p>

            <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-soft)]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                      <th className="text-left p-4 sm:p-5 font-bold text-[var(--color-text)] text-sm sm:text-base w-1/2">
                        Feature
                      </th>
                      <th className="text-center p-4 sm:p-5 font-bold text-[var(--color-text)] text-sm sm:text-base">
                        Gratis
                      </th>
                      <th className="text-center p-4 sm:p-5 font-bold text-[var(--ff-color-primary-600)] text-sm sm:text-base bg-[var(--ff-color-primary-50)]">
                        Premium
                      </th>
                      <th className="text-center p-4 sm:p-5 font-bold text-amber-600 text-sm sm:text-base bg-amber-50">
                        Founder
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {FEATURE_ROWS.map((row, i) => (
                      <tr
                        key={row.label}
                        className={i % 2 === 1 ? "bg-[var(--color-bg)]/40" : ""}
                      >
                        <td className="p-4 sm:p-5">
                          <div className="flex items-start gap-2">
                            <span className="text-sm text-[var(--color-text)] font-medium">{row.label}</span>
                            {row.note && (
                              <span className="group relative flex-shrink-0 mt-0.5">
                                <Info className="w-3.5 h-3.5 text-[var(--color-muted)] cursor-help" />
                                <span className="pointer-events-none absolute bottom-full left-0 mb-1 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg px-3 py-2 w-56 shadow-xl z-10 leading-relaxed">
                                  {row.note}
                                </span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 sm:p-5 text-center">
                          <CellValue value={row.free} />
                        </td>
                        <td className="p-4 sm:p-5 text-center bg-[var(--ff-color-primary-50)]/30">
                          <CellValue value={row.premium} />
                        </td>
                        <td className="p-4 sm:p-5 text-center bg-amber-50/30">
                          <CellValue value={row.founder} />
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-[var(--color-bg)] font-semibold border-t-2 border-[var(--color-border)]">
                      <td className="p-4 sm:p-5 text-sm">Prijs</td>
                      <td className="p-4 sm:p-5 text-center text-sm">€0 / altijd</td>
                      <td className="p-4 sm:p-5 text-center text-sm bg-[var(--ff-color-primary-50)]/40">
                        €{premiumPrice}/maand
                      </td>
                      <td className="p-4 sm:p-5 text-center text-sm bg-amber-50/40">
                        €{founderPrice} eenmalig
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="px-4 sm:px-5 py-4 bg-[var(--color-bg)] border-t border-[var(--color-border)] flex items-start gap-2">
                <Info className="w-4 h-4 text-[var(--color-muted)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                  Kleuranalyse op basis van ondertoon vereist een foto of dat jij deze informatie zelf deelt — we schatten of claimen dit nooit op eigen initiatief. Kleurenadvies zonder foto geeft algemene combinatietips.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
              Wat gebruikers zeggen
            </h2>
            <p className="text-[var(--color-muted)] text-center mb-8 sm:mb-10 text-sm sm:text-base">
              Echte ervaringen van echte gebruikers
            </p>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  quote: "Binnen 10 minuten wist ik precies wat me staat. Geen eindeloos scrollen meer.",
                  name: "Sophie M.",
                  plan: "Premium gebruiker",
                  initial: "S",
                },
                {
                  quote: "Nova voelt als een echte stylist. Het leert mijn smaak en wordt telkens beter.",
                  name: "Thomas V.",
                  plan: "Founder lid",
                  initial: "T",
                },
                {
                  quote: "Ik bespaarde al 2x de kosten door geen verkeerde aankopen meer te doen.",
                  name: "Lisa R.",
                  plan: "Premium gebruiker",
                  initial: "L",
                },
              ].map(({ quote, name, plan, initial }) => (
                <article
                  key={name}
                  className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-8 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex items-center gap-0.5 mb-4" aria-label="5 van 5 sterren">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />
                    ))}
                  </div>
                  <p className="text-[var(--color-text)] text-sm sm:text-base mb-5 leading-relaxed">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center font-bold text-[var(--ff-color-primary-700)] text-sm">
                      {initial}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{name}</div>
                      <div className="text-xs text-[var(--color-muted)]">{plan}</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-12 sm:py-16 md:py-20 bg-[var(--color-surface)]/30" aria-labelledby="faq-heading">
        <div className="ff-container">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10">
              Veelgestelde vragen
            </h2>
            <div className="space-y-3 sm:space-y-4">
              {[
                {
                  q: "Wat blijft altijd beschikbaar met Free?",
                  a: "Je stijlprofiel, je 3 outfit-combinaties en alle shoplinks blijven altijd zichtbaar — ook als je nooit betaalt. Je kunt je antwoorden aanpassen en het rapport opnieuw laten maken. Free is niet tijdelijk; het is een volwaardig startpunt.",
                },
                {
                  q: "Wat ontgrendelt Premium precies?",
                  a: "Premium geeft je onbeperkte outfit-aanbevelingen, toegang tot de Nova AI-stylist (chat 24/7), een uitgebreide shopping cheatsheet en kleuranalyse op basis van een foto die jij uploadt. Zonder foto geven we geen ondertoon-advies — alleen algemene combinatietips.",
                },
                {
                  q: "Hoe werkt kleurenadvies precies?",
                  a: "Standaard geven we stijladvies op basis van je voorkeuren. Kleurenanalyse op basis van ondertoon is een Premium-feature en werkt alleen als jij een foto uploadt of je ondertoon zelf deelt. We schatten of claimen dit nooit op eigen initiatief.",
                },
                {
                  q: "Is Premium maandelijks opzegbaar?",
                  a: "Ja. Je kunt elke maand opzeggen zonder verborgen kosten of kleine lettertjes. Stop wanneer je wilt — je Free-rapport blijft zichtbaar.",
                },
                {
                  q: "Wat is het verschil tussen Premium en Founder?",
                  a: `Premium is een maandelijks abonnement. Founder is een eenmalige betaling voor lifetime toegang plus exclusieve voordelen: beta toegang, prioritaire support en invloed op de roadmap. Na ${breakEvenMonths} maanden is Founder goedkoper.`,
                },
                {
                  q: "Is er een geld-terug-garantie?",
                  a: "Ja, 30 dagen geld-terug-garantie voor alle betaalde plannen. Geen vragen gesteld.",
                },
                {
                  q: "Betaalt FitFi zich echt terug?",
                  a: "Gemiddeld bespaart een gebruiker €150+ per jaar door minder foute aankopen. Eén verkeerde aankoop die je vermijdt betaalt al 15 maanden Premium. Plus: je bespaart uren zoektijd.",
                },
              ].map(({ q, a }) => (
                <details
                  key={q}
                  className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 sm:p-6 group"
                >
                  <summary className="font-semibold text-sm sm:text-base cursor-pointer flex items-center justify-between min-h-[44px] list-none">
                    <span>{q}</span>
                    <ArrowRight
                      className="w-4 h-4 text-[var(--color-muted)] group-open:rotate-90 transition-transform flex-shrink-0 ml-3"
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

      {/* ── FINAL CTA ── */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-2xl p-8 sm:p-10 md:p-12 text-center text-white shadow-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
              Klaar om jouw stijl te ontdekken?
            </h2>
            <p className="text-base sm:text-lg mb-2 opacity-90">
              Start gratis. Je ziet eerst een preview — daarna beslis je.
            </p>
            <p className="text-sm mb-8 opacity-70">
              Geen creditcard vereist. Klaar in ~2 minuten.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <NavLink
                to="/onboarding"
                className="inline-flex items-center gap-2 px-7 py-4 min-h-[52px] bg-white text-[var(--ff-color-primary-700)] rounded-xl font-bold hover:bg-white/90 hover:shadow-2xl transition-all shadow-xl text-base focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)] active:scale-[0.98] w-full sm:w-auto justify-center"
                data-event="cta_start_free_pricing_final"
              >
                <Sparkles className="w-5 h-5" aria-hidden="true" />
                Start mijn stijlquiz
              </NavLink>

              <button
                onClick={() => premiumProduct && handleCheckout(premiumProduct.id)}
                disabled={isLoading || isPending}
                className="inline-flex items-center gap-2 px-7 py-4 min-h-[52px] bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl font-semibold text-base transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)] disabled:opacity-50 active:scale-[0.98] w-full sm:w-auto justify-center"
                data-event="cta_upgrade_premium_pricing_final"
              >
                Upgrade naar Premium
                <ArrowRight className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <p className="text-xs opacity-60 mt-5">
              2.500+ mensen ontdekten al hun stijl • 4.8/5 gemiddelde beoordeling
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
