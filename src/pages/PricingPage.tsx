import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Check, Star, Zap, Crown, Sparkles, Loader2, AlertCircle, X } from "lucide-react";
import { useStripeProducts } from "@/hooks/useStripeProducts";
import { useCreateCheckout } from "@/hooks/useCreateCheckout";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: products, isLoading } = useStripeProducts();
  const createCheckout = useCreateCheckout();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [showCancelBanner, setShowCancelBanner] = useState(false);

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

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Prijzen – FitFi</title>
        <meta name="description" content="Kies het plan dat bij jou past. Start gratis of kies Premium of Founder voor meer features. Transparant en zonder verborgen kosten." />
        <link rel="canonical" href="https://fitfi.ai/prijzen" />
      </Helmet>

      {/* Cancel Banner */}
      {showCancelBanner && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200">
          <div className="ff-container py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-amber-900">Checkout geannuleerd</h3>
                  <p className="text-sm text-amber-700">Geen zorgen, je kunt altijd later upgraden wanneer je klaar bent.</p>
                </div>
              </div>
              <button
                onClick={handleCloseCancelBanner}
                className="flex-shrink-0 p-2 text-amber-600 hover:text-amber-800 transition-colors"
                aria-label="Sluit melding"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-primary-25)] py-24 md:py-32">
        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
              Kies het plan dat bij
              <span className="block text-[var(--ff-color-primary-600)]">jouw stijl</span> past
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Begin gratis. Upgrade wanneer je wilt. Geen verrassingen.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Free Plan */}
            <article className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
              <header className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Gratis</h2>
                <div className="text-5xl font-bold mb-2">€0</div>
                <p className="text-gray-600">Voor altijd</p>
              </header>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>Basis stijlquiz</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>3 outfit-aanbevelingen</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                  <span>AI-stijlprofiel</span>
                </li>
              </ul>
              <NavLink
                to="/onboarding"
                className="block text-center px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
                data-event="cta_start_free_pricing"
              >
                Start gratis
              </NavLink>
            </article>

            {/* Premium Plan */}
            <article className="relative bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border-2 border-[var(--ff-color-primary-500)] p-8 shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-bold bg-[var(--ff-color-primary-600)] text-white">
                Populair
              </div>
              <header className="text-center mb-8 pt-2">
                <h2 className="text-2xl font-bold mb-2">
                  {isLoading ? 'Premium' : premiumProduct?.name || 'Premium'}
                </h2>
                <div className="text-5xl font-bold mb-2">
                  €{isLoading ? '9,99' : premiumProduct?.price || '9.99'}
                </div>
                <p className="text-gray-600">Per maand</p>
              </header>
              <ul className="space-y-4 mb-8">
                {isLoading || !premiumProduct ? (
                  <>
                    <li className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                      <span>Onbeperkte outfit aanbevelingen</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                      <span>Toegang tot Nova AI</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                      <span>Geavanceerde stijlanalyse</span>
                    </li>
                  </>
                ) : (
                  premiumProduct.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))
                )}
              </ul>
              <button
                onClick={() => premiumProduct && handleCheckout(premiumProduct.id, 'Premium')}
                disabled={isLoading || createCheckout.isPending || checkingAuth}
                className="w-full px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-event="cta_start_premium_pricing"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Laden...
                  </>
                ) : createCheckout.isPending || checkingAuth ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Bezig...
                  </>
                ) : (
                  'Upgrade naar Premium'
                )}
              </button>
            </article>

            {/* Founder Plan */}
            <article className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
              <header className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  {isLoading ? 'Founder' : founderProduct?.name.replace('FitFi Subscription - ', '') || 'Founder'}
                </h2>
                <div className="text-5xl font-bold mb-2">
                  €{isLoading ? '149' : founderProduct?.price || '149'}
                </div>
                <p className="text-gray-600">Eenmalig – lifetime</p>
              </header>
              <ul className="space-y-4 mb-8">
                {isLoading || !founderProduct ? (
                  <>
                    <li className="flex items-start gap-3">
                      <Crown className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                      <span>Lifetime toegang</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                      <span>Founders badge</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                      <span>Prioritaire support</span>
                    </li>
                  </>
                ) : (
                  founderProduct.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[var(--ff-color-primary-600)] mt-1 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))
                )}
              </ul>
              <button
                onClick={() => founderProduct && handleCheckout(founderProduct.id, 'Founder')}
                disabled={isLoading || createCheckout.isPending || checkingAuth}
                className="w-full px-6 py-3 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-event="cta_start_founder_pricing"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Laden...
                  </>
                ) : createCheckout.isPending || checkingAuth ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Bezig...
                  </>
                ) : (
                  'Word Founder'
                )}
              </button>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-[var(--color-surface)]/30">
        <div className="ff-container">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Veelgestelde vragen</h2>
            <div className="space-y-4">
              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <summary className="font-semibold cursor-pointer">Hoe werkt de gratis versie?</summary>
                <p className="mt-4 text-gray-600">
                  Je ontvangt een gratis Style Report met 3 outfits. Upgraden kan altijd, maar hoeft niet.
                </p>
              </details>
              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <summary className="font-semibold cursor-pointer">Is er een geld-terug-garantie?</summary>
                <p className="mt-4 text-gray-600">
                  Ja, 30 dagen voor alle betaalde plannen. Geen vragen gesteld.
                </p>
              </details>
              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <summary className="font-semibold cursor-pointer">Wat is het verschil tussen Premium en Founder?</summary>
                <p className="mt-4 text-gray-600">
                  Founder is een eenmalige betaling voor lifetime Premium toegang plus extra voordelen zoals vroege toegang tot nieuwe features.
                </p>
              </details>
              <details className="bg-[var(--color-surface)] rounded-[var(--radius-xl)] border border-[var(--color-border)] p-6">
                <summary className="font-semibold cursor-pointer">Kan ik maandelijks opzeggen?</summary>
                <p className="mt-4 text-gray-600">
                  Ja, je kunt Premium maandelijks opzeggen. Geen verborgen kosten of kleine lettertjes.
                </p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Klaar om je <span className="text-[var(--ff-color-primary-600)]">perfecte stijl</span> te ontdekken?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Start nu gratis. Geen creditcard vereist.
            </p>
            <NavLink
              to="/onboarding"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2"
              data-event="cta_start_free_pricing_final"
            >
              <Sparkles className="w-5 h-5" />
              Start gratis Style Report
            </NavLink>
          </div>
        </div>
      </section>
    </main>
  );
}
