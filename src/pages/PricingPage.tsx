import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Star, Zap, Crown, Sparkles, Loader2, AlertCircle, X, Users, TrendingUp, Shield, ArrowRight, Minus } from "lucide-react";
import { useStripeProducts } from "@/hooks/useStripeProducts";
import { useCreateCheckout } from "@/hooks/useCreateCheckout";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import { canonicalUrl } from "@/utils/urls";

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: products, isLoading } = useStripeProducts();
  const createCheckout = useCreateCheckout();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [showCancelBanner, setShowCancelBanner] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const founderProduct = products?.find(p => p.interval === 'one_time');
  const premiumProduct = products?.find(p => p.interval === 'month');

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');

    if (checkoutStatus === 'cancelled') {
      setShowCancelBanner(true);

      const timer = setTimeout(() => {
        navigate('/prijzen', { replace: true });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [searchParams, navigate]);

  const handleCloseCancelBanner = () => {
    setShowCancelBanner(false);
    navigate('/prijzen', { replace: true });
  };

  const handleCheckout = async (productId: string, planName: string) => {
    setCheckingAuth(true);

    const client = supabase();

    if (!client) {
      setCheckingAuth(false);
      toast.error('Verbinding niet beschikbaar. Probeer het later opnieuw.');
      return;
    }

    const { data: { session } } = await client.auth.getSession();

    if (!session) {
      setCheckingAuth(false);
      toast.error('Log eerst in om te kunnen upgraden');
      navigate('/login?redirect=/prijzen');
      return;
    }

    setCheckingAuth(false);

    try {
      const result = await createCheckout.mutateAsync({ productId });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Er ging iets mis. Probeer het opnieuw.';

      if (errorMsg.includes('not configured') || errorMsg.includes('STRIPE_SECRET_KEY')) {
        toast.error('Betalingen zijn momenteel niet beschikbaar. Neem contact op met support.');
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const premiumPriceNum = premiumProduct?.price || 9.99;
  const founderPriceNum = founderProduct?.price || 149;

  const premiumPrice = isLoading ? '9,99' : premiumPriceNum.toFixed(2).replace('.', ',');
  const founderPrice = isLoading ? '149' : Math.round(founderPriceNum).toString();

  const breakEvenMonths = premiumPriceNum > 0
    ? Math.ceil(founderPriceNum / premiumPriceNum)
    : 15;

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Prijzen – FitFi</title>
        <meta name="description" content="Kies het plan dat bij jou past. Start gratis of kies Premium voor onbeperkte AI-styling." />
        <link rel="canonical" href={canonicalUrl('/prijzen')} />
      </Helmet>

      {/* Cancel Banner */}
      {showCancelBanner && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200">
          <div className="ff-container py-3 sm:py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900 text-sm sm:text-base">Checkout geannuleerd</h3>
                  <p className="text-xs sm:text-sm text-amber-700">Geen zorgen, je kunt altijd later upgraden wanneer je klaar bent.</p>
                </div>
              </div>
              <button
                onClick={handleCloseCancelBanner}
                className="flex-shrink-0 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-amber-600 hover:text-amber-800 transition-colors rounded-lg hover:bg-amber-100 active:scale-[0.95]"
                aria-label="Sluit melding"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="ff-container relative">
          <div className="max-w-5xl mx-auto text-center px-4 sm:px-6">

            {/* Social Proof */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm border border-[var(--color-border)] rounded-full mb-4 sm:mb-6 shadow-sm">
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ff-color-primary-600)]" />
              <span className="text-xs sm:text-sm font-medium text-[var(--color-text)]">
                <span className="hidden xs:inline">Meer dan </span>2.500+ gebruikers<span className="hidden xs:inline"> ontdekten hun stijl</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[var(--color-text)] mb-4 sm:mb-6 leading-tight">
              Investeer in <span className="text-[var(--ff-color-primary-600)]">jezelf</span>,<br className="hidden sm:inline" />
              <span className="sm:hidden"> </span>niet in foute aankopen
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--color-muted)] mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Stop met twijfelen. Start met vertrouwen. Betaal alleen voor wat werkt.
            </p>

            {/* Trust Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[var(--color-text)]">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span>30 dagen geld terug</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[var(--color-text)]">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span>Maandelijks opzegbaar</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[var(--color-text)]">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                <span>Geen verborgen kosten</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 sm:py-16 md:py-20 -mt-8 sm:-mt-12">
        <div className="ff-container">
          <div className="max-w-7xl mx-auto">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">

              {/* Free Plan - Smaller */}
              <article className="lg:col-span-4 bg-[var(--color-surface)] rounded-2xl sm:rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-5 sm:p-7 shadow-[var(--shadow-soft)] h-full">
                <header className="mb-5 sm:mb-6">
                  <div className="inline-block px-2.5 sm:px-3 py-1 bg-[var(--color-bg)] rounded-full text-[10px] xs:text-xs font-bold text-[var(--color-muted)] mb-3 sm:mb-4">
                    VOOR BEGINNERS
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Gratis</h2>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl sm:text-5xl font-bold">€0</span>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--color-muted)]">Voor altijd gratis</p>
                </header>

                <ul className="space-y-3 mb-6 sm:mb-8">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--ff-color-primary-700)]" />
                    </div>
                    <span className="text-sm sm:text-base">Ontdek je stijlprofiel</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--ff-color-primary-700)]" />
                    </div>
                    <span className="text-sm sm:text-base">3 gepersonaliseerde outfits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--ff-color-primary-700)]" />
                    </div>
                    <span className="text-sm sm:text-base">Basis kleuradvies</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-50">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--color-border)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--color-muted)]" />
                    </div>
                    <span className="text-sm sm:text-base">Geen AI-styling assistent</span>
                  </li>
                  <li className="flex items-start gap-3 opacity-50">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[var(--color-border)] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--color-muted)]" />
                    </div>
                    <span className="text-sm sm:text-base">Beperkte outfits</span>
                  </li>
                </ul>

                <NavLink
                  to="/onboarding"
                  className="block text-center px-6 py-3.5 min-h-[52px] bg-[var(--color-surface)] border-2 border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] rounded-xl font-semibold text-base hover:bg-[var(--ff-color-primary-50)] hover:border-[var(--ff-color-primary-400)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 active:scale-[0.98]"
                  data-event="cta_start_free_pricing"
                >
                  Start gratis
                </NavLink>
              </article>

              {/* Premium Plan - HERO */}
              <article className="lg:col-span-8 relative bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-2xl sm:rounded-[var(--radius-2xl)] p-5 sm:p-7 md:p-9 lg:p-11 shadow-2xl text-white transform lg:scale-105 mt-2 sm:mt-3">

                {/* Popular Badge */}
                <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 rounded-full px-5 sm:px-7 py-2 sm:py-2.5 text-sm sm:text-base font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-2xl border-2 border-white/20 backdrop-blur-sm">
                  <span className="drop-shadow-sm">🔥 MEEST GEKOZEN</span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">

                  {/* Left: Pricing */}
                  <div>
                    <header className="mb-6 sm:mb-8 pt-2">
                      <div className="inline-block px-2.5 sm:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] xs:text-xs font-bold mb-3 sm:mb-4">
                        ONBEPERKT STYLEN
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                        {isLoading ? 'Premium' : premiumProduct?.name || 'Premium'}
                      </h2>
                      <div className="flex items-baseline gap-2 mb-2 sm:mb-3">
                        <span className="text-5xl sm:text-6xl font-bold">€{premiumPrice}</span>
                        <span className="text-lg sm:text-xl opacity-90">/maand</span>
                      </div>
                      <p className="text-white/80 text-xs sm:text-sm mb-5 sm:mb-6">
                        Gemiddeld €0,33 per dag — minder dan een koffie
                      </p>

                      <button
                        onClick={() => premiumProduct && handleCheckout(premiumProduct.id, 'Premium')}
                        disabled={isLoading || createCheckout.isPending || checkingAuth}
                        className="w-full px-6 sm:px-8 py-4 min-h-[52px] bg-white text-[var(--ff-color-primary-700)] rounded-xl font-bold text-base sm:text-lg hover:bg-white/90 hover:shadow-2xl transition-all focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl active:scale-[0.98]"
                        data-event="cta_start_premium_pricing"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            <span className="hidden xs:inline">Laden...</span>
                          </>
                        ) : createCheckout.isPending || checkingAuth ? (
                          <>
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            <span className="hidden xs:inline">Bezig...</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden xs:inline">Upgrade naar Premium</span>
                            <span className="xs:hidden">Premium</span>
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </>
                        )}
                      </button>

                      <p className="text-[10px] xs:text-xs text-white/70 text-center mt-2 sm:mt-3">
                        30 dagen geld-terug-garantie • Stop wanneer je wilt
                      </p>
                    </header>
                  </div>

                  {/* Right: Benefits */}
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-3 sm:mb-4 opacity-90">
                      Alles van gratis, plus:
                    </h3>
                    <ul className="space-y-3 sm:space-y-4">
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm sm:text-base mb-1">Onbeperkte outfits</div>
                          <div className="text-xs sm:text-sm text-white/80">Nieuwe looks voor elke gelegenheid, altijd vers</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm sm:text-base mb-1">Nova AI-assistent</div>
                          <div className="text-xs sm:text-sm text-white/80">Chat met je persoonlijke stijlcoach 24/7</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm sm:text-base mb-1">Geavanceerde kleuranalyse</div>
                          <div className="text-xs sm:text-sm text-white/80">Upload je foto's voor persoonlijk advies</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm sm:text-base mb-1">Smart learning</div>
                          <div className="text-xs sm:text-sm text-white/80">Systeem leert je smaak en wordt beter</div>
                        </div>
                      </li>
                      <li className="flex items-start gap-2 sm:gap-3">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm sm:text-base mb-1">Vroege toegang</div>
                          <div className="text-xs sm:text-sm text-white/80">Nieuwe features voor jou het eerst</div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </article>
            </div>

            {/* Founder Plan - Below, Full Width */}
            <article className="mt-8 sm:mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-[var(--radius-2xl)] p-6 sm:p-8 md:p-10 lg:p-12 text-white shadow-2xl border border-amber-500/20">
              <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">

                {/* Left: Pitch */}
                <div>
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500/20 backdrop-blur-sm rounded-full text-xs sm:text-sm font-bold mb-4 sm:mb-6">
                    <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    <span className="text-amber-300">EXCLUSIEF LIFETIME</span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">
                    Founder
                  </h2>

                  <p className="text-base sm:text-lg md:text-xl text-white/90 mb-5 sm:mb-6">
                    Betaal één keer. Gebruik voor altijd. Geen verborgen kosten, ooit.
                  </p>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-[var(--radius-xl)] p-5 sm:p-6 mb-5 sm:mb-6">
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-2">
                      <span className="text-4xl sm:text-5xl font-bold">€{founderPrice}</span>
                      <span className="text-white/70 line-through text-lg sm:text-xl">€999</span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 mb-3 sm:mb-4">Eenmalig • Lifetime toegang</p>

                    <div className="pt-3 sm:pt-4 border-t border-white/20">
                      <div className="text-xs sm:text-sm text-white/80 mb-2">💡 Break-even calculator:</div>
                      <div className="text-xl sm:text-2xl font-bold text-amber-400">
                        {breakEvenMonths} maanden = gratis voor altijd
                      </div>
                      <div className="text-[10px] xs:text-xs text-white/60 mt-2">
                        Na {breakEvenMonths} maanden heb je dit bedrag terugverdiend vs Premium
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => founderProduct && handleCheckout(founderProduct.id, 'Founder')}
                    disabled={isLoading || createCheckout.isPending || checkingAuth}
                    className="w-full px-6 sm:px-8 py-4 min-h-[52px] bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold text-base sm:text-lg hover:from-amber-400 hover:to-amber-500 transition-all focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl active:scale-[0.98]"
                    data-event="cta_start_founder_pricing"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="hidden xs:inline">Laden...</span>
                      </>
                    ) : createCheckout.isPending || checkingAuth ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="hidden xs:inline">Bezig...</span>
                      </>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden xs:inline">Word Founder lid</span>
                        <span className="xs:hidden">Founder</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] xs:text-xs text-white/50 text-center mt-2 sm:mt-3">
                    Beperkt beschikbaar • 30 dagen geld-terug-garantie
                  </p>
                </div>

                {/* Right: Exclusive Benefits */}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider mb-4 sm:mb-6 text-amber-300">
                    🏆 Exclusieve voordelen:
                  </h3>
                  <ul className="space-y-3 sm:space-y-4">
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base mb-1">Lifetime Premium toegang</div>
                        <div className="text-xs sm:text-sm text-white/70">Alle Premium features, voor altijd</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base mb-1">Founder badge</div>
                        <div className="text-xs sm:text-sm text-white/70">Herkenbaar als early adopter in de community</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base mb-1">Beta toegang</div>
                        <div className="text-xs sm:text-sm text-white/70">Test nieuwe features als eerste</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base mb-1">Prioritaire support</div>
                        <div className="text-xs sm:text-sm text-white/70">Je vragen worden altijd eerst beantwoord</div>
                      </div>
                    </li>
                    <li className="flex items-start gap-2 sm:gap-3">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm sm:text-base mb-1">Invloed op roadmap</div>
                        <div className="text-xs sm:text-sm text-white/70">Help bepalen welke features we bouwen</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Comparison Table Toggle */}
      <section className="py-12 bg-[var(--color-surface)]/30">
        <div className="ff-container">
          <div className="max-w-5xl mx-auto text-center">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] font-medium hover:bg-[var(--color-bg)] transition-colors"
            >
              <span>Bekijk volledige vergelijkingstabel</span>
              <ArrowRight className={`w-4 h-4 transition-transform ${showComparison ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {showComparison && (
            <div className="max-w-5xl mx-auto mt-8 bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--color-bg)]">
                    <tr>
                      <th className="text-left p-6 font-bold text-[var(--color-text)]">Feature</th>
                      <th className="text-center p-6 font-bold text-[var(--color-text)]">Gratis</th>
                      <th className="text-center p-6 font-bold text-[var(--ff-color-primary-600)] bg-[var(--ff-color-primary-50)]">Premium</th>
                      <th className="text-center p-6 font-bold text-amber-600 bg-amber-50">Founder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    <tr>
                      <td className="p-4 text-[var(--color-text)]">Stijlprofiel analyse</td>
                      <td className="p-4 text-center"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="p-4 text-center bg-[var(--ff-color-primary-50)]/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="p-4 text-center bg-amber-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[var(--color-text)]">Outfit aanbevelingen</td>
                      <td className="p-4 text-center text-[var(--color-muted)]">3 outfits</td>
                      <td className="p-4 text-center bg-[var(--ff-color-primary-50)]/30 font-semibold">Onbeperkt</td>
                      <td className="p-4 text-center bg-amber-50/30 font-semibold">Onbeperkt</td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[var(--color-text)]">Nova AI-assistent</td>
                      <td className="p-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="p-4 text-center bg-[var(--ff-color-primary-50)]/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="p-4 text-center bg-amber-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[var(--color-text)]">Foto kleuranalyse</td>
                      <td className="p-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="p-4 text-center bg-[var(--ff-color-primary-50)]/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="p-4 text-center bg-amber-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[var(--color-text)]">Smart learning</td>
                      <td className="p-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="p-4 text-center bg-[var(--ff-color-primary-50)]/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="p-4 text-center bg-amber-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[var(--color-text)]">Founder badge</td>
                      <td className="p-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="p-4 text-center bg-[var(--ff-color-primary-50)]/30"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="p-4 text-center bg-amber-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[var(--color-text)]">Prioritaire support</td>
                      <td className="p-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="p-4 text-center bg-[var(--ff-color-primary-50)]/30"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="p-4 text-center bg-amber-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="p-4 text-[var(--color-text)]">Beta toegang</td>
                      <td className="p-4 text-center"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="p-4 text-center bg-[var(--ff-color-primary-50)]/30"><X className="w-5 h-5 text-red-400 mx-auto" /></td>
                      <td className="p-4 text-center bg-amber-50/30"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="bg-[var(--color-bg)] font-semibold">
                      <td className="p-4 text-[var(--color-text)]">Prijs</td>
                      <td className="p-4 text-center">€0</td>
                      <td className="p-4 text-center bg-[var(--ff-color-primary-50)]/30">€{premiumPrice}/maand</td>
                      <td className="p-4 text-center bg-amber-50/30">€{founderPrice} eenmalig</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 sm:mb-4">
              Waarom duizenden kiezen voor FitFi
            </h2>
            <p className="text-lg sm:text-xl text-[var(--color-muted)] text-center mb-8 sm:mb-10 md:mb-12">
              Echte resultaten van echte gebruikers
            </p>

            <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
              {/* Testimonial 1 */}
              <article className="bg-[var(--color-surface)] rounded-xl sm:rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 sm:p-8 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-[var(--color-text)] text-sm sm:text-base mb-5 sm:mb-6 leading-relaxed">
                  "Binnen 10 minuten wist ik precies wat me staat. Geen eindeloos scrollen meer — elke aanbeveling klopt."
                </p>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center font-bold text-[var(--ff-color-primary-700)]">
                    S
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-[var(--color-text)]">Sophie M.</div>
                    <div className="text-xs sm:text-sm text-[var(--color-muted)]">Premium gebruiker</div>
                  </div>
                </div>
              </article>

              {/* Testimonial 2 */}
              <article className="bg-[var(--color-surface)] rounded-xl sm:rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 sm:p-8 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-[var(--color-text)] text-sm sm:text-base mb-5 sm:mb-6 leading-relaxed">
                  "De Nova AI voelt als een persoonlijke stylist. Het leert mijn smaak en geeft telkens betere suggesties."
                </p>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center font-bold text-[var(--ff-color-primary-700)]">
                    T
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-[var(--color-text)]">Thomas V.</div>
                    <div className="text-xs sm:text-sm text-[var(--color-muted)]">Founder lid</div>
                  </div>
                </div>
              </article>

              {/* Testimonial 3 */}
              <article className="bg-[var(--color-surface)] rounded-xl sm:rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 sm:p-8 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-[var(--color-text)] text-sm sm:text-base mb-5 sm:mb-6 leading-relaxed">
                  "Ik bespaarde al 2x de kosten door geen verkeerde aankopen meer te doen. Betaalt zichzelf terug."
                </p>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--ff-color-primary-100)] rounded-full flex items-center justify-center font-bold text-[var(--ff-color-primary-700)]">
                    L
                  </div>
                  <div>
                    <div className="font-semibold text-sm sm:text-base text-[var(--color-text)]">Lisa R.</div>
                    <div className="text-xs sm:text-sm text-[var(--color-muted)]">Premium gebruiker</div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-[var(--color-surface)]/30">
        <div className="ff-container">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-10 md:mb-12">Veelgestelde vragen</h2>
            <div className="space-y-3 sm:space-y-4">
              <details className="bg-[var(--color-surface)] rounded-xl sm:rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5 sm:p-6 group">
                <summary className="font-semibold text-sm sm:text-base cursor-pointer flex items-center justify-between min-h-[44px]">
                  <span>Wat krijg ik met de gratis versie?</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="mt-3 sm:mt-4 text-[var(--color-muted)] text-sm sm:text-base leading-relaxed">
                  Je krijgt een volledig stijlprofiel en 3 gepersonaliseerde outfits. Perfect om te ervaren hoe FitFi werkt en of het bij jou past.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-xl sm:rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5 sm:p-6 group">
                <summary className="font-semibold text-sm sm:text-base cursor-pointer flex items-center justify-between min-h-[44px]">
                  <span>Is Premium maandelijks opzegbaar?</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="mt-3 sm:mt-4 text-[var(--color-muted)] text-sm sm:text-base leading-relaxed">
                  Ja. Je kunt elke maand opzeggen zonder verborgen kosten of kleine lettertjes. Stop wanneer je wilt.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-xl sm:rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5 sm:p-6 group">
                <summary className="font-semibold text-sm sm:text-base cursor-pointer flex items-center justify-between min-h-[44px]">
                  <span>Wat is het verschil tussen Premium en Founder?</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="mt-3 sm:mt-4 text-[var(--color-muted)] text-sm sm:text-base leading-relaxed">
                  Premium is een maandelijks abonnement. Founder is een eenmalige betaling voor lifetime toegang plus exclusieve voordelen zoals beta toegang, prioritaire support en invloed op de roadmap. Na {breakEvenMonths} maanden is Founder goedkoper.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-xl sm:rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5 sm:p-6 group">
                <summary className="font-semibold text-sm sm:text-base cursor-pointer flex items-center justify-between min-h-[44px]">
                  <span>Is er een geld-terug-garantie?</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="mt-3 sm:mt-4 text-[var(--color-muted)] text-sm sm:text-base leading-relaxed">
                  Ja, 30 dagen geld-terug-garantie voor alle betaalde plannen. Geen vragen gesteld.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-xl sm:rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5 sm:p-6 group">
                <summary className="font-semibold text-sm sm:text-base cursor-pointer flex items-center justify-between min-h-[44px]">
                  <span>Hoe werkt de Nova AI-assistent?</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="mt-3 sm:mt-4 text-[var(--color-muted)] text-sm sm:text-base leading-relaxed">
                  Nova is je persoonlijke stijlcoach die je kunt chatten 24/7. Upload foto's, vraag om advies, of laat Nova nieuwe outfits samenstellen op basis van je planning. Het systeem leert van je feedback en wordt steeds beter.
                </p>
              </details>

              <details className="bg-[var(--color-surface)] rounded-xl sm:rounded-[var(--radius-xl)] border border-[var(--color-border)] p-5 sm:p-6 group">
                <summary className="font-semibold text-sm sm:text-base cursor-pointer flex items-center justify-between min-h-[44px]">
                  <span>Betaalt FitFi zich echt terug?</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-muted)] group-open:rotate-90 transition-transform flex-shrink-0 ml-2" />
                </summary>
                <p className="mt-3 sm:mt-4 text-[var(--color-muted)] text-sm sm:text-base leading-relaxed">
                  Gemiddeld bespaart een gebruiker €150+ per jaar door minder foute aankopen. Eén verkeerde aankoop die je vermijdt betaalt al 15 maanden Premium. Plus: je bespaart uren zoektijd en frustratie.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] rounded-xl sm:rounded-[var(--radius-2xl)] p-8 sm:p-10 md:p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Klaar om <span className="text-amber-300">vertrouwen</span> te krijgen in je stijl?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">
              Start gratis. Geen creditcard vereist. Klaar in 5 minuten.
            </p>
            <NavLink
              to="/onboarding"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 min-h-[52px] bg-white text-[var(--ff-color-primary-700)] rounded-xl sm:rounded-[var(--radius-xl)] font-bold hover:bg-white/90 hover:shadow-2xl transition-all shadow-xl text-base sm:text-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ff-color-primary-600)] active:scale-[0.98]"
              data-event="cta_start_free_pricing_final"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              Start gratis Style Report
            </NavLink>
            <p className="text-xs sm:text-sm opacity-75 mt-3 sm:mt-4">
              2.500+ mensen ontdekten al hun stijl • ⭐️ 4.8/5 gemiddelde rating
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
