import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import Seo from "@/components/seo/Seo";
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
  ChevronDown,
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
  if (value === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0" aria-label="Inbegrepen">
        <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="w-6 h-6 rounded-full bg-[var(--color-border)] flex items-center justify-center flex-shrink-0 opacity-50" aria-label="Niet inbegrepen">
        <Minus className="w-3 h-3 text-[var(--color-muted)]" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center flex-shrink-0" aria-label={value}>
      <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
    </div>
  );
}

function FeatureDotInverted({ value }: { value: string | boolean }) {
  if (value === false) {
    return (
      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 opacity-40" aria-label="Niet inbegrepen">
        <Minus className="w-3 h-3 text-white" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0" aria-label="Inbegrepen">
      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
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
    const { data: { session } } = await client.auth.getSession();
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
  const premiumPrice = isLoading ? "9,99" : premiumPriceNum.toFixed(2).replace(".", ",");
  const founderPrice = isLoading ? "149" : Math.round(founderPriceNum).toString();
  const breakEvenMonths = premiumPriceNum > 0 ? Math.ceil(founderPriceNum / premiumPriceNum) : 15;
  const isPending = createCheckout.isPending || checkingAuth;

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="Prijzen — FitFi"
        description="Free geeft je 3 outfits en shoplinks. Premium ontgrendelt onbeperkte outfits, kleuranalyse en Nova AI. Vergelijk plannen en kies wat bij jou past."
        path="/prijzen"
      />

      {showCancelBanner && (
        <div className="bg-[var(--ff-color-warning-50)] border-b border-[var(--color-border)]">
          <div className="ff-container py-3 sm:py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[var(--ff-color-warning-600)] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--color-text)] text-sm">Checkout geannuleerd</p>
                  <p className="text-xs text-[var(--color-muted)]">Geen zorgen — je kunt altijd later upgraden.</p>
                </div>
              </div>
              <button
                onClick={handleCloseCancelBanner}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--ff-color-warning-600)] hover:text-[var(--color-text)] rounded-lg hover:bg-[var(--ff-color-primary-50)] transition-colors"
                aria-label="Sluit melding"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-12 sm:py-16 md:py-20">
        <div className="ff-container relative">
          <div className="max-w-3xl mx-auto text-center px-4 sm:px-6">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-[var(--color-surface)]/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full mb-5 shadow-sm">
              <Users className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
              <span className="text-xs sm:text-sm font-medium">2.500+ gebruikers ontdekten hun stijl</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text)] mb-4 leading-tight tracking-tight">
              Jouw stijl, jouw keuze
            </h1>

            <p className="text-base sm:text-lg text-[var(--color-muted)] mb-6 max-w-2xl mx-auto leading-relaxed">
              Free blijft altijd bruikbaar. Premium ontgrendelt kleuranalyse, onbeperkte outfits en je persoonlijke AI-stylist.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-[var(--color-text)]">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[var(--ff-color-success-600)]" />
                <span>30 dagen geld-terug-garantie</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[var(--ff-color-success-600)]" />
                <span>Maandelijks opzegbaar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[var(--ff-color-success-600)]" />
                <span>Geen creditcard voor Free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING CARDS ── */}
      <section className="py-10 sm:py-14 -mt-4 sm:-mt-6">
        <div className="ff-container">
          <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6">

            {/* Stack on mobile, 3-col on lg */}
            <div className="flex flex-col lg:grid lg:grid-cols-3 gap-5 sm:gap-6">

              {/* ── Free Plan ── */}
              <article className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 sm:p-7 shadow-[var(--shadow-soft)] flex flex-col">
                <div className="inline-block px-3 py-1 bg-[var(--color-bg)] rounded-full text-xs font-bold text-[var(--color-muted)] mb-3 uppercase tracking-wide self-start">
                  Altijd gratis
                </div>
                <h2 className="text-2xl font-bold mb-2">Gratis</h2>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold">€0</span>
                </div>
                <p className="text-sm text-[var(--color-muted)] mb-6">Voor altijd — geen creditcard</p>

                <ul className="space-y-3 mb-6 flex-1" role="list">
                  {[
                    { ok: true,  label: "Stijlprofiel analyse" },
                    { ok: true,  label: "3 gepersonaliseerde outfits" },
                    { ok: true,  label: "Directe shoplinks" },
                    { ok: true,  label: "Rapport aanpasbaar" },
                    { ok: false, label: "Nova AI-stylist" },
                    { ok: false, label: "Kleuranalyse (foto)" },
                  ].map(({ ok, label }) => (
                    <li key={label} className={`flex items-center gap-3${ok ? "" : " opacity-45"}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${ok ? "bg-[var(--ff-color-primary-100)]" : "bg-[var(--color-border)]"}`}>
                        {ok
                          ? <Check className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" strokeWidth={3} />
                          : <Minus className="w-3 h-3 text-[var(--color-muted)]" />
                        }
                      </div>
                      <span className="text-sm leading-snug">{label}</span>
                    </li>
                  ))}
                </ul>

                <NavLink
                  to="/onboarding"
                  className="block text-center px-6 py-3.5 min-h-[52px] bg-[var(--color-surface)] border-2 border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] rounded-xl font-semibold hover:bg-[var(--ff-color-primary-50)] hover:border-[var(--ff-color-primary-400)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 active:scale-[0.98]"
                  data-event="cta_start_free_pricing"
                >
                  Ga door met Free
                </NavLink>
              </article>

              {/* ── Premium Plan ── */}
              <article className="relative bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-2xl p-6 sm:p-7 shadow-2xl text-white flex flex-col lg:col-span-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--ff-color-warning-600)] text-white rounded-full text-xs font-bold mb-3 self-start shadow-md">
                  <Star className="w-3.5 h-3.5 fill-white" />
                  MEEST GEKOZEN
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {isLoading ? "Premium" : premiumProduct?.name || "Premium"}
                </h2>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold">€{premiumPrice}</span>
                  <span className="text-base opacity-80">/maand</span>
                </div>
                <p className="text-white/60 text-xs mb-1">~€0,33 per dag</p>
                <p className="text-white/55 text-xs mb-5">Maandelijks opzegbaar</p>

                <button
                  onClick={() => premiumProduct && handleCheckout(premiumProduct.id)}
                  disabled={isLoading || isPending}
                  className="w-full px-6 py-4 min-h-[52px] bg-white text-[var(--ff-color-primary-700)] rounded-xl font-bold text-base hover:bg-white/90 transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] mb-2"
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
                <p className="text-xs text-white/55 text-center mb-6">30 dagen geld-terug-garantie</p>

                <div className="border-t border-white/20 pt-5 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3">Alles van Free, plus:</p>
                  <ul className="space-y-3" role="list">
                    {[
                      { Icon: Check,      title: "Onbeperkte outfits" },
                      { Icon: Zap,        title: "Nova AI-assistent" },
                      { Icon: Sparkles,   title: "Kleuranalyse (foto)" },
                      { Icon: Check,      title: "Shopping cheatsheet" },
                      { Icon: TrendingUp, title: "Smart learning" },
                    ].map(({ Icon, title }) => (
                      <li key={title} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm font-medium">{title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

              {/* ── Founder Plan ── */}
              <article className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-7 text-white shadow-2xl border border-amber-500/20 flex flex-col">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold mb-3 self-start">
                  <Crown className="w-3.5 h-3.5" />
                  LIFETIME
                </div>
                <h2 className="text-2xl font-bold mb-2">Founder</h2>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-4xl sm:text-5xl font-bold">€{founderPrice}</span>
                  <span className="text-white/50 line-through text-lg">€999</span>
                </div>
                <p className="text-white/55 text-xs mb-1">Eenmalig • Lifetime toegang</p>
                <p className="text-amber-400 text-xs font-semibold mb-5">
                  Break-even: {breakEvenMonths} maanden
                </p>

                <button
                  onClick={() => founderProduct && handleCheckout(founderProduct.id)}
                  disabled={isLoading || isPending}
                  className="w-full px-6 py-4 min-h-[52px] bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-xl font-bold text-base transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] mb-2"
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
                <p className="text-xs text-white/45 text-center mb-6">Beperkt beschikbaar • 30 dagen garantie</p>

                <div className="border-t border-white/10 pt-5 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400/80 mb-3">Exclusief:</p>
                  <ul className="space-y-3" role="list">
                    {[
                      { Icon: Check,      title: "Lifetime Premium toegang" },
                      { Icon: Crown,      title: "Founder badge" },
                      { Icon: Sparkles,   title: "Beta toegang" },
                      { Icon: Shield,     title: "Prioritaire support" },
                      { Icon: TrendingUp, title: "Invloed op roadmap" },
                    ].map(({ Icon, title }) => (
                      <li key={title} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <span className="text-sm font-medium">{title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>

            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURE MATRIX ── */}
      <section className="py-10 sm:py-14 bg-[var(--color-surface)]/40" aria-labelledby="matrix-heading">
        <div className="ff-container">
          <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6">

            <button
              onClick={() => setMatrixOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-soft)] focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
              aria-expanded={matrixOpen}
              aria-controls="feature-matrix"
              id="matrix-heading"
            >
              <div className="text-left">
                <p className="font-bold text-base sm:text-lg text-[var(--color-text)]">Vergelijk alle features</p>
                <p className="text-sm text-[var(--color-muted)]">Free · Premium · Founder naast elkaar</p>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-[var(--color-muted)] flex-shrink-0 transition-transform duration-300 ${matrixOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>

            {matrixOpen && (
              <div
                id="feature-matrix"
                className="mt-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-soft)]"
              >
                <div className="overflow-x-auto">
                  <div className="min-w-[480px]">
                    {/* Header */}
                    <div className="grid grid-cols-4 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                      <div className="col-span-1 p-3 sm:p-4 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wide">Feature</div>
                      <div className="p-3 sm:p-4 text-center text-xs font-bold text-[var(--color-text)]">Gratis</div>
                      <div className="p-3 sm:p-4 text-center text-xs font-bold text-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)]">Premium</div>
                      <div className="p-3 sm:p-4 text-center text-xs font-bold text-amber-600 bg-amber-50">Founder</div>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-[var(--color-border)]">
                      {FEATURE_ROWS.map((row, i) => (
                        <div key={row.label} className={`grid grid-cols-4 ${i % 2 === 1 ? "bg-[var(--color-bg)]/40" : ""}`}>
                          <div className="col-span-1 p-3 sm:p-4 flex items-start gap-1">
                            <span className="text-xs sm:text-sm text-[var(--color-text)] font-medium leading-snug">{row.label}</span>
                            {row.note && (
                              <span className="group relative flex-shrink-0 mt-0.5">
                                <Info className="w-3 h-3 text-[var(--color-muted)] cursor-help" />
                                <span className="pointer-events-none absolute bottom-full left-0 mb-1 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg px-3 py-2 w-52 shadow-xl z-10 leading-relaxed">
                                  {row.note}
                                </span>
                              </span>
                            )}
                          </div>
                          <div className="p-3 sm:p-4 flex items-center justify-center">
                            <FeatureDot value={row.free} />
                          </div>
                          <div className="p-3 sm:p-4 flex items-center justify-center bg-[var(--ff-color-primary-50)]/30">
                            <FeatureDot value={row.premium} />
                          </div>
                          <div className="p-3 sm:p-4 flex items-center justify-center bg-amber-50/30">
                            <FeatureDot value={row.founder} />
                          </div>
                        </div>
                      ))}
                      {/* Price row */}
                      <div className="grid grid-cols-4 border-t-2 border-[var(--color-border)] bg-[var(--color-bg)] font-semibold">
                        <div className="col-span-1 p-3 sm:p-4 text-xs sm:text-sm">Prijs</div>
                        <div className="p-3 sm:p-4 text-center text-xs sm:text-sm">€0</div>
                        <div className="p-3 sm:p-4 text-center text-xs sm:text-sm bg-[var(--ff-color-primary-50)]/40">€{premiumPrice}/mnd</div>
                        <div className="p-3 sm:p-4 text-center text-xs sm:text-sm bg-amber-50/40">€{founderPrice}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color note */}
                <div className="px-4 sm:px-5 py-4 bg-[var(--ff-color-primary-50)] border-t border-[var(--ff-color-primary-200)] flex items-start gap-3">
                  <Info className="w-4 h-4 text-[var(--ff-color-primary-700)] flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs sm:text-sm text-[var(--ff-color-primary-700)] leading-relaxed">
                    Kleuranalyse werkt uitsluitend als jij een foto uploadt of je ondertoon zelf deelt. We schatten dit nooit op eigen initiatief.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-10 sm:py-14">
        <div className="ff-container">
          <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">Wat gebruikers zeggen</h2>
            <p className="text-[var(--color-muted)] text-center mb-8 text-sm sm:text-base">Echte ervaringen van echte gebruikers</p>

            <div className="flex flex-col sm:grid sm:grid-cols-3 gap-5 sm:gap-6">
              {[
                { quote: "Binnen 10 minuten wist ik precies wat me staat. Geen eindeloos scrollen meer.", name: "Sophie M.", plan: "Premium gebruiker", initial: "S" },
                { quote: "Nova voelt als een echte stylist. Het leert mijn smaak en wordt telkens beter.", name: "Thomas V.", plan: "Founder lid", initial: "T" },
                { quote: "Ik bespaarde al 2x de kosten door geen verkeerde aankopen meer te doen.", name: "Lisa R.", plan: "Premium gebruiker", initial: "L" },
              ].map(({ quote, name, plan, initial }) => (
                <article key={name} className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
                  <div className="flex items-center gap-0.5 mb-4" aria-label="5 van 5 sterren">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-[var(--color-text)] text-base font-light leading-relaxed mb-5">
                    &ldquo;{quote}&rdquo;
                  </blockquote>
                  <footer className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center font-bold text-[var(--ff-color-primary-700)] text-sm flex-shrink-0">
                      {initial}
                    </div>
                    <div>
                      <cite className="font-semibold text-sm text-[var(--color-text)] not-italic block">{name}</cite>
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
      <section className="py-10 sm:py-14 bg-[var(--color-surface)]/30" aria-labelledby="faq-heading">
        <div className="ff-container">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold text-center mb-8">Veelgestelde vragen</h2>
            <div className="space-y-3">
              {[
                {
                  q: "Wat blijft altijd beschikbaar met Free?",
                  a: "Je stijlprofiel, je 3 outfit-combinaties en alle shoplinks blijven altijd zichtbaar — ook als je nooit betaalt. Free is niet tijdelijk; het is een volwaardig startpunt.",
                },
                {
                  q: "Wat ontgrendelt Premium precies?",
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
                <details key={q} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-5 group">
                  <summary className="font-semibold text-sm sm:text-base cursor-pointer flex items-center justify-between gap-3 min-h-[44px] list-none">
                    <span className="leading-snug">{q}</span>
                    <ChevronDown className="w-5 h-5 text-[var(--color-muted)] flex-shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-3 text-[var(--color-muted)] text-sm sm:text-base leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — extra pb-28 zodat floating chat-knop niet overlapt ── */}
      <section className="py-10 sm:py-14 pb-28 sm:pb-20">
        <div className="ff-container">
          <div className="max-w-2xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-2xl p-8 sm:p-10 text-center text-white shadow-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Klaar om jouw stijl te ontdekken?</h2>
              <p className="text-base opacity-90 mb-1">Start gratis. Je ziet eerst een preview — daarna beslis je.</p>
              <p className="text-sm mb-8 opacity-65">Geen creditcard vereist. Klaar in ~2 minuten.</p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <NavLink
                  to="/onboarding"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 min-h-[52px] bg-white text-[var(--ff-color-primary-700)] rounded-xl font-bold hover:bg-white/90 transition-all shadow-xl text-base focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)] active:scale-[0.98]"
                  data-event="cta_start_free_pricing_final"
                >
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  Start mijn stijlquiz
                </NavLink>

                <button
                  onClick={() => premiumProduct && handleCheckout(premiumProduct.id)}
                  disabled={isLoading || isPending}
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 min-h-[52px] bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded-xl font-semibold text-base transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)] disabled:opacity-50 active:scale-[0.98]"
                  data-event="cta_upgrade_premium_pricing_final"
                >
                  Upgrade naar Premium
                  <ArrowRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <p className="text-xs opacity-55 mt-5">
                2.500+ mensen ontdekten al hun stijl · 4.8/5 gemiddelde beoordeling
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
