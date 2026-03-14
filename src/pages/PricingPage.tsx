import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import {
  Check,
  X,
  Shield,
  Users,
  CreditCard,
  ArrowRight,
  Plus,
  Loader as Loader2,
  CircleAlert as AlertCircle,
} from "lucide-react";
import { useStripeProducts } from "@/hooks/useStripeProducts";
import { useCreateCheckout } from "@/hooks/useCreateCheckout";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";
import track from "@/utils/telemetry";

/* ─── Reveal hook ─────────────────────────────────────────────────────────── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ─── Reveal wrapper ──────────────────────────────────────────────────────── */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.9s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.9s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Feature comparison rows ─────────────────────────────────────────────── */
const COMPARISON_ROWS: Array<{
  label: string;
  free: string | boolean;
  premium: string | boolean;
}> = [
  { label: "Stijlprofiel analyse", free: true, premium: true },
  { label: "Gepersonaliseerde outfits", free: "3", premium: "Onbeperkt" },
  { label: "Directe shoplinks", free: true, premium: true },
  { label: "Rapport aanpasbaar", free: true, premium: true },
  { label: "Kleuranalyse (foto)", free: false, premium: true },
  { label: "Nova AI-assistent", free: false, premium: true },
  { label: "Shopping cheatsheet", free: false, premium: true },
  { label: "Smart learning", free: false, premium: true },
];

/* ─── FAQ data ────────────────────────────────────────────────────────────── */
const FAQ_ITEMS = [
  {
    q: "Wat blijft altijd beschikbaar met Free?",
    a: "Je stijlprofiel, 3 gepersonaliseerde outfits, directe shoplinks en de mogelijkheid om je rapport aan te passen. Free is geen proefperiode — het blijft altijd beschikbaar.",
  },
  {
    q: "Wat krijg ik met Premium precies?",
    a: "Onbeperkte outfits voor alle gelegenheden, kleuranalyse op basis van je foto, de Nova AI-assistent voor persoonlijke stijlvragen, een shopping cheatsheet en smart learning dat je aanbevelingen steeds beter maakt.",
  },
  {
    q: "Kan ik maandelijks opzeggen?",
    a: "Ja, je kunt je Premium abonnement op elk moment opzeggen. Je houdt toegang tot het einde van je betaalperiode. Daarna ga je terug naar Free.",
  },
  {
    q: "Hoe werkt de geld-terug-garantie?",
    a: "Als je binnen 30 dagen na je eerste betaling niet tevreden bent, krijg je je geld volledig terug. Geen vragen, geen gedoe.",
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: products, isLoading } = useStripeProducts();
  const createCheckout = useCreateCheckout();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [showCancelBanner, setShowCancelBanner] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const founderProduct = products?.find((p) => p.interval === "one_time");
  const premiumProduct = products?.find((p) => p.interval === "month");

  useEffect(() => {
    track("pricing_page_viewed", {});
  }, []);

  useEffect(() => {
    const checkoutStatus = searchParams.get("checkout");
    if (checkoutStatus === "cancelled") {
      track("checkout_cancelled", { returnedTo: "pricing" });
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
    const planType = productId === founderProduct?.id ? "founder" : "premium";
    track("checkout_initiated", { productId, plan: planType });

    setCheckingAuth(true);
    const client = supabase();
    if (!client) {
      setCheckingAuth(false);
      track("checkout_error", { reason: "no_client", plan: planType });
      toast.error("Verbinding niet beschikbaar. Probeer het later opnieuw.");
      return;
    }
    const {
      data: { session },
    } = await client.auth.getSession();
    if (!session) {
      setCheckingAuth(false);
      track("checkout_blocked", { reason: "unauthenticated", plan: planType });
      toast.error("Log eerst in om te kunnen upgraden");
      navigate("/login?redirect=/prijzen");
      return;
    }
    setCheckingAuth(false);
    try {
      const result = await createCheckout.mutateAsync({ productId });
      if (result.url) {
        track("checkout_redirect", { plan: planType });
        window.location.href = result.url;
      }
    } catch (error: any) {
      const msg = error.message || "Er ging iets mis. Probeer het opnieuw.";
      track("checkout_error", { reason: msg, plan: planType });
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
  const isPending = createCheckout.isPending || checkingAuth;

  return (
    <>
      <Seo
        title="Prijzen — FitFi"
        description="Free geeft je 3 outfits en shoplinks. Met Premium krijg je onbeperkte outfits, kleuranalyse en een persoonlijke stylist. Vergelijk plannen en kies wat bij jou past."
        path="/prijzen"
        ogImage="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp"
      />

      <div className="bg-[#FAFAF8] text-[#1A1A1A]">

        {/* ── Checkout-geannuleerd banner ── */}
        {showCancelBanner && (
          <div className="border-b border-[#E5E5E5] bg-[#FFF8F0]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between max-w-4xl mx-auto gap-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#D4913D]" />
                  <div>
                    <p className="font-semibold text-[#1A1A1A] text-sm">
                      Checkout geannuleerd
                    </p>
                    <p className="text-xs text-[#8A8A8A]">
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
                      className="px-6 py-3 min-h-[48px] bg-[#C2654A] text-white text-base font-semibold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap hover:bg-[#A8513A]"
                    >
                      Probeer opnieuw
                    </button>
                  )}
                  <button
                    onClick={handleCloseCancelBanner}
                    className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl transition-colors hover:bg-[#F4E8E3] text-[#D4913D]"
                    aria-label="Sluit melding"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════
            1. PAGE HERO
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F0EB] pt-44 pb-14 md:pt-52 md:pb-20 text-center" aria-labelledby="pricing-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Eyebrow */}
            <Reveal>
              <div className="flex items-center justify-center gap-3 mb-8">
                <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A]">
                  Prijzen
                </span>
                <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
              </div>
            </Reveal>

            {/* Headline */}
            <Reveal delay={0.12}>
              <h1
                id="pricing-heading"
                className="text-[32px] md:text-[64px] text-[#1A1A1A] leading-[1.05] max-w-[760px] mx-auto mb-6"
              >
                <span className="font-serif italic">Jouw stijl, jouw </span>
                <span className="font-sans font-bold" style={{ letterSpacing: "-2px" }}>keuze</span>
              </h1>
            </Reveal>

            {/* Subtitle */}
            <Reveal delay={0.24}>
              <p className="text-lg text-[#4A4A4A] max-w-[480px] mx-auto mb-8">
                Free blijft altijd bruikbaar. Premium geeft je het volledige plaatje met kleuranalyse, meer outfits en persoonlijk advies.
              </p>
            </Reveal>

            {/* Trust pills */}
            <Reveal delay={0.36}>
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {[
                  { icon: Shield, label: "30 dagen geld-terug-garantie" },
                  { icon: Users, label: "Maandelijks opzegbaar" },
                  { icon: CreditCard, label: "Geen creditcard voor Free" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-[13px] font-medium text-[#4A4A4A]">
                    <Icon className="w-4 h-4 text-[#C2654A]" aria-hidden="true" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            2. PRICING CARDS
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF8] py-20 pb-28" aria-labelledby="plans-heading">
          <h2 id="plans-heading" className="sr-only">Prijsplannen</h2>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[880px] mx-auto">

              {/* ── Free Card ── */}
              <Reveal>
                <article className="bg-white border border-[#E5E5E5] rounded-[28px] p-12 hover:shadow-[0_16px_48px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full">
                  {/* Badge */}
                  <div className="bg-[#F5F0EB] text-[#4A4A4A] text-[11px] font-bold uppercase tracking-[0.5px] px-3.5 py-1.5 rounded-full mb-6 self-start">
                    Altijd gratis
                  </div>

                  {/* Name */}
                  <h3 className="font-serif italic text-[32px] text-[#1A1A1A] mb-2">Free</h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-[56px] font-extrabold text-[#1A1A1A] tracking-[-2px] leading-none">€0</span>
                  </div>

                  {/* Note */}
                  <p className="text-[13px] text-[#8A8A8A] mb-8">Voor altijd, geen creditcard nodig</p>

                  {/* Divider */}
                  <div className="w-full h-px bg-[#E5E5E5] mb-8" />

                  {/* Label */}
                  <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-4">Wat je krijgt</p>

                  {/* Features */}
                  <div className="flex flex-col gap-3.5 mb-10 flex-1">
                    {[
                      { included: true, label: "Stijlprofiel analyse" },
                      { included: true, label: "3 gepersonaliseerde outfits" },
                      { included: true, label: "Directe shoplinks" },
                      { included: true, label: "Rapport aanpasbaar" },
                      { included: false, label: "Kleuranalyse (foto)" },
                      { included: false, label: "Nova AI-assistent" },
                      { included: false, label: "Shopping cheatsheet" },
                      { included: false, label: "Smart learning" },
                    ].map(({ included, label }) => (
                      <div key={label} className="flex items-start gap-3 text-sm">
                        {included ? (
                          <div className="w-5 h-5 rounded-full bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-[#C2654A]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#F5F0EB] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <X className="w-2.5 h-2.5 text-[#E5E5E5]" />
                          </div>
                        )}
                        <span className={included ? "text-[#1A1A1A]" : "text-[#E5E5E5]"}>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <NavLink
                    to="/onboarding"
                    className="w-full text-center py-4 rounded-full border border-[#E5E5E5] text-[15px] font-semibold text-[#1A1A1A] hover:border-[#C2654A] hover:text-[#C2654A] transition-all duration-300 block"
                    data-event="cta_start_free_pricing"
                  >
                    Start gratis
                  </NavLink>
                </article>
              </Reveal>

              {/* ── Premium Card ── */}
              <Reveal delay={0.12}>
                <article className="relative bg-white border-2 border-[#C2654A] rounded-[28px] p-12 shadow-[0_16px_48px_rgba(194,101,74,0.08)] flex flex-col h-full">
                  {/* Badge */}
                  <div className="bg-[#F4E8E3] text-[#C2654A] text-[11px] font-bold uppercase tracking-[0.5px] px-3.5 py-1.5 rounded-full mb-6 self-start">
                    Meest gekozen
                  </div>

                  {/* Name */}
                  <h3 className="font-serif italic text-[32px] text-[#1A1A1A] mb-2">Premium</h3>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-[56px] font-extrabold text-[#1A1A1A] tracking-[-2px] leading-none">
                      €{premiumPrice}
                    </span>
                    <span className="text-base text-[#8A8A8A] font-medium ml-1">/maand</span>
                  </div>

                  {/* Note */}
                  <p className="text-[13px] text-[#8A8A8A] mb-8">~€0,33 per dag · Maandelijks opzegbaar</p>

                  {/* Divider */}
                  <div className="w-full h-px bg-[#E5E5E5] mb-8" />

                  {/* Label */}
                  <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#8A8A8A] mb-4">Alles van Free, plus</p>

                  {/* Features */}
                  <div className="flex flex-col gap-3.5 mb-10 flex-1">
                    {[
                      "Onbeperkte outfits",
                      "Kleuranalyse (foto)",
                      "Nova AI-assistent",
                      "Shopping cheatsheet",
                      "Smart learning",
                    ].map((label) => (
                      <div key={label} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-[#F4E8E3] flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-[#C2654A]" />
                        </div>
                        <span className="text-[#1A1A1A]">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => premiumProduct && handleCheckout(premiumProduct.id)}
                    disabled={isLoading || isPending}
                    className="w-full text-center py-4 rounded-full bg-[#C2654A] hover:bg-[#A8513A] text-white text-[15px] font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(194,101,74,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                      <span>Upgrade naar Premium →</span>
                    )}
                  </button>

                  {/* Guarantee */}
                  <div className="text-center text-[13px] text-[#8A8A8A] mt-2 flex items-center justify-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#8A8A8A]" aria-hidden="true" />
                    <span>30 dagen geld-terug-garantie</span>
                  </div>
                </article>
              </Reveal>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            3. FOUNDER MENTION
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="max-w-[880px] mx-auto mb-28 bg-[#F5F0EB] rounded-3xl p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Left */}
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A] mb-1.5">Founder Lifetime</h3>
                  <p className="text-sm text-[#4A4A4A] leading-[1.6] max-w-[420px]">
                    Eenmalige betaling, levenslang Premium. Voor early adopters die FitFi mee willen bouwen. Inclusief beta-toegang, prioritaire support en invloed op de roadmap.
                  </p>
                  <button
                    onClick={() => founderProduct && handleCheckout(founderProduct.id)}
                    disabled={isLoading || isPending}
                    className="text-[13px] font-semibold text-[#C2654A] hover:text-[#A8513A] mt-3 inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                    data-event="cta_start_founder_pricing"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                        <span>Bezig...</span>
                      </>
                    ) : (
                      <span>Meer info →</span>
                    )}
                  </button>
                </div>

                {/* Right */}
                <div className="text-center md:text-right flex-shrink-0">
                  <div className="flex items-baseline gap-2 justify-center md:justify-end">
                    <span className="text-4xl font-extrabold text-[#1A1A1A] tracking-[-1px]">€{founderPrice}</span>
                    <span className="text-base text-[#8A8A8A] line-through ml-2">€999</span>
                  </div>
                  <p className="text-xs text-[#8A8A8A] mt-1">Eenmalig · Beperkt beschikbaar</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            4. FEATURE COMPARISON TABLE
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F0EB] py-28" aria-labelledby="compare-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <Reveal>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
                  <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A]">
                    Vergelijk
                  </span>
                  <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <h2
                  id="compare-heading"
                  className="text-[32px] md:text-[48px] text-[#1A1A1A] leading-[1.05] mb-4"
                >
                  <span className="font-serif italic">Wat zit waar in?</span>
                </h2>
              </Reveal>
              <Reveal delay={0.24}>
                <p className="text-base text-[#4A4A4A] max-w-lg mx-auto">
                  Een helder overzicht van wat je krijgt per plan.
                </p>
              </Reveal>
            </div>

            {/* Table */}
            <Reveal delay={0.36}>
              <div className="max-w-[880px] mx-auto bg-white rounded-3xl overflow-hidden border border-[#E5E5E5]">
                {/* Header row */}
                <div className="bg-[#FAFAF8] border-b border-[#E5E5E5] grid grid-cols-[1fr_80px_80px] md:grid-cols-[1fr_160px_160px] px-5 md:px-10 py-5">
                  <div />
                  <div className="text-xs font-bold uppercase tracking-[1px] text-[#8A8A8A] text-center">Free</div>
                  <div className="text-xs font-bold uppercase tracking-[1px] text-[#C2654A] text-center">Premium</div>
                </div>

                {/* Content rows */}
                {COMPARISON_ROWS.map((row, i) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-[1fr_80px_80px] md:grid-cols-[1fr_160px_160px] px-5 md:px-10 py-4 ${
                      i < COMPARISON_ROWS.length - 1 ? "border-b border-[#E5E5E5]/50" : ""
                    }`}
                  >
                    <div className="text-[13px] md:text-sm font-medium text-[#1A1A1A]">{row.label}</div>
                    <div className="flex items-center justify-center">
                      {typeof row.free === "boolean" ? (
                        row.free ? (
                          <div className="w-5 h-5 rounded-full bg-[#F4E8E3] flex items-center justify-center">
                            <Check className="w-3 h-3 text-[#C2654A]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#F5F0EB] flex items-center justify-center">
                            <X className="w-2.5 h-2.5 text-[#E5E5E5]" />
                          </div>
                        )
                      ) : (
                        <span className="text-[13px] font-semibold text-[#1A1A1A] text-center">{row.free}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-center">
                      {typeof row.premium === "boolean" ? (
                        row.premium ? (
                          <div className="w-5 h-5 rounded-full bg-[#F4E8E3] flex items-center justify-center">
                            <Check className="w-3 h-3 text-[#C2654A]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#F5F0EB] flex items-center justify-center">
                            <X className="w-2.5 h-2.5 text-[#E5E5E5]" />
                          </div>
                        )
                      ) : (
                        <span className="text-[13px] font-bold text-[#C2654A] text-center">{row.premium}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            5. FAQ SECTION
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF8] py-28" aria-labelledby="faq-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <Reveal>
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
                  <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#C2654A]">
                    Veelgestelde vragen
                  </span>
                  <span className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <h2
                  id="faq-heading"
                  className="text-[32px] md:text-[48px] text-[#1A1A1A] leading-[1.05] mb-4"
                >
                  <span className="font-serif italic">Over prijzen en plannen</span>
                </h2>
              </Reveal>
              <Reveal delay={0.24}>
                <p className="text-base text-[#4A4A4A] max-w-lg mx-auto">
                  De meest gestelde vragen over onze plannen.
                </p>
              </Reveal>
            </div>

            {/* FAQ list */}
            <Reveal delay={0.36}>
              <div className="max-w-[720px] mx-auto">
                {FAQ_ITEMS.map((item, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div
                      key={item.q}
                      className={`border-b border-[#E5E5E5] ${i === 0 ? "border-t border-[#E5E5E5]" : ""}`}
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="flex justify-between items-center py-6 gap-4 w-full text-left cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span className="text-base font-semibold text-[#1A1A1A]">{item.q}</span>
                        <div className={`w-8 h-8 rounded-full ${isOpen ? "bg-[#F4E8E3]" : "bg-[#F5F0EB]"} flex items-center justify-center flex-shrink-0 transition-colors`}>
                          <Plus
                            className={`w-4 h-4 text-[#C2654A] transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                          />
                        </div>
                      </button>
                      {isOpen && (
                        <p className="text-[15px] text-[#4A4A4A] leading-[1.7] pb-6 max-w-[600px]">
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            6. CTA SECTION
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F0EB] py-[120px] md:py-[200px] text-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] max-w-[760px] mx-auto mb-8">
                <span className="font-serif italic">Begin gratis, upgrade wanneer je wilt</span>
              </h2>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="text-[17px] text-[#4A4A4A] mb-14 md:mb-16 max-w-lg mx-auto">
                Probeer FitFi zonder verplichtingen. Je betaalt pas als je meer wilt.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <NavLink
                to="/onboarding"
                className="inline-flex items-center gap-2 bg-[#C2654A] hover:bg-[#A8513A] text-white text-[15px] font-semibold py-5 px-12 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(194,101,74,0.2)]"
                data-event="cta_start_free_pricing"
              >
                Begin gratis
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </NavLink>
              <p className="text-[13px] text-[#8A8A8A] mt-6">
                Geen creditcard nodig · Altijd gratis te gebruiken
              </p>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            7. FOOTER SEPARATOR
        ════════════════════════════════════════════════════ */}
        {/* Footer is rendered by the app shell. Add border-top separator since CTA is also sand-colored */}
        <div className="h-px bg-[#E5E5E5]" />

      </div>
    </>
  );
}
