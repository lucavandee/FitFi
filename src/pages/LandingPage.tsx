import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ClipboardCheck,
  Palette,
  ShoppingBag,
  Clock,
  Shield,
  Lock,
  Info,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { useTestimonials } from "@/hooks/useTestimonials";

/* ─── Scroll-reveal wrapper ─── */
function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Marquee CSS ─── */
const marqueeCSS = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`;

export default function LandingPage() {
  const navigate = useNavigate();

  /* Preserve existing data-fetching */
  const { data: todayCount } = useQuery({
    queryKey: ["profiles-today"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("style_profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today.toISOString());
      if (error) throw error;
      return count || 0;
    },
    staleTime: 60000,
    refetchInterval: 60000,
  });

  const { testimonials } = useTestimonials();

  const handleStartClick = () => {
    navigate("/onboarding");
  };

  const handleExampleClick = () => {
    navigate("/results/preview");
  };

  /* Testimonial data — DB first, fallback to hardcoded */
  const FALLBACK_REVIEWS = [
    {
      name: "Sophie V.",
      meta: "28 jaar · Amsterdam",
      quote:
        "Eindelijk weet ik wat ik 's ochtends aantrek. Het rapport klopte verrassend goed met hoe ik me wil kleden.",
      initial: "S",
    },
    {
      name: "Marieke D.",
      meta: "34 jaar · Utrecht",
      quote:
        "De kleuradviezen zijn een openbaring. Ik shop nu veel gerichter en maak minder spijt-aankopen.",
      initial: "M",
    },
    {
      name: "Tom B.",
      meta: "41 jaar · Rotterdam",
      quote:
        "Sceptisch begonnen, maar de outfits passen echt bij mijn leven. Een paar minuten werk, direct resultaat.",
      initial: "T",
    },
  ];

  const reviews =
    testimonials.length >= 3
      ? testimonials.slice(0, 3).map((t) => ({
          name: t.author_name,
          meta:
            t.author_age
              ? `${t.author_age} jaar`
              : "",
          quote: t.quote,
          initial: t.author_name?.[0]?.toUpperCase() || "?",
        }))
      : FALLBACK_REVIEWS;

  /* Marquee items */
  const marqueeItems = [
    { bold: "2.400+", rest: "gebruikers" },
    { bold: "~5 min", rest: "invultijd" },
    { bold: "Gratis", rest: "geen creditcard" },
    { bold: "4.9/5", rest: "waardering" },
    { bold: "50+", rest: "outfitcombinaties" },
    { bold: "Persoonlijk", rest: "kleurpalet" },
  ];

  return (
    <>
      <Helmet>
        <title>FitFi — Persoonlijk stijladvies in een paar minuten</title>
        <meta
          name="description"
          content="Een stijlrapport dat je écht helpt kiezen wat je aantrekt. Outfits voor werk, weekend en uitgaan + directe shoplinks. Gratis start, in een paar minuten klaar."
        />
        <meta
          property="og:title"
          content="FitFi — Persoonlijk stijladvies in een paar minuten"
        />
        <meta
          property="og:description"
          content="Stijlrapport met outfits voor werk, weekend en uitgaan. We vertalen jouw voorkeuren naar combinaties die écht passen."
        />
        <meta
          property="og:image"
          content="/images/c614360c-fec6-44de-89c5-497a49a852a7.webp"
        />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "FitFi",
            description:
              "Persoonlijk stijladvies in een paar minuten. Ontdek outfits die bij je passen en shop ze direct.",
            url: "https://fitfi.nl",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
            },
          })}
        </script>
      </Helmet>

      {/* Skip to main content — A11Y */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[#C2654A] focus:text-white focus:rounded-xl focus:shadow-2xl focus:font-semibold"
      >
        Spring naar hoofdinhoud
      </a>

      <style>{marqueeCSS}</style>

      <main id="main-content" className="overflow-x-hidden w-full">
        {/* ════════════════════════════════════════════════════
            HERO — Full-screen image, text bottom-left
        ════════════════════════════════════════════════════ */}
        <section
          className="relative min-h-screen flex items-end overflow-hidden"
          aria-labelledby="hero-heading"
        >
          {/* Background image */}
          <picture>
            <source
              media="(max-width: 1023px)"
              srcSet="/hero/hf_20260221_211319_a32928c5-35c0-46c6-be6e-cfa9d8747078.webp"
            />
            <img
              src="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
              alt="Stijlvol stel op een Amsterdams kanaal"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
              loading="eager"
              fetchPriority="high"
            />
          </picture>

          {/* Gradient overlays */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(20,18,15,0.72) 0%, rgba(20,18,15,0.35) 45%, transparent 70%), linear-gradient(to top, rgba(20,18,15,0.6) 0%, transparent 40%)",
            }}
            aria-hidden="true"
          />

          {/* Content */}
          <div className="relative z-10 w-full max-w-[1320px] mx-auto px-6 md:px-10 pb-16 md:pb-24 pt-20 min-h-screen flex items-end">
            <div className="max-w-[560px]">
              {/* Eyebrow */}
              <div className="flex items-center gap-[10px] mb-6">
                <div className="w-8 h-px bg-[#C2654A]" aria-hidden="true" />
                <span className="text-xs font-semibold tracking-[2.5px] uppercase text-[#F4E8E3]">
                  Persoonlijk stijladvies
                </span>
              </div>

              {/* Headline — serif/sans contrast */}
              <h1
                id="hero-heading"
                className="text-4xl md:text-[68px] md:leading-[1.02] md:tracking-[-1px] leading-[1.08] mb-6"
              >
                <span className="font-serif italic text-white">
                  Ontdek welke{" "}
                </span>
                <span className="font-jakarta font-bold not-italic tracking-[-2px] text-white">
                  stijl
                </span>
                <br className="hidden md:block" />
                <span className="font-serif italic text-white">
                  {" "}
                  bij jou past
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-base md:text-[17px] leading-[1.7] text-white/75 max-w-[420px] mb-8 md:mb-11">
                Beantwoord een paar vragen en ontvang een persoonlijk rapport met
                je kleurpalet, outfits en directe shoplinks.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <button
                  onClick={handleStartClick}
                  className="group inline-flex items-center gap-3 bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-[15px] py-[18px] px-10 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    boxShadow: "0 12px 40px rgba(194,101,74,0.3)",
                  }}
                  aria-label="Begin gratis met je stijladvies"
                >
                  Begin gratis
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>

                <button
                  onClick={handleExampleClick}
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200"
                  aria-label="Bekijk voorbeeld rapport"
                >
                  Bekijk voorbeeld
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Floating color palette card — desktop only */}
          <div
            className="hidden lg:flex absolute bottom-[120px] right-20 z-20 flex-col gap-4"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "20px",
              padding: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C2654A]" />
              <div className="w-10 h-10 rounded-full bg-[#D4913D]" />
              <div className="w-10 h-10 rounded-full bg-[#8B6E4E]" />
              <div className="w-10 h-10 rounded-full bg-[#3D5A4E]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1A1A1A]">
                Jouw kleurpalet
              </p>
              <p className="text-xs text-[#8A8A8A]">Warm · Herfst · Diep</p>
            </div>
          </div>

          {/* Scroll indicator — desktop only */}
          <div
            className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-3"
            aria-hidden="true"
          >
            <span className="text-[10px] font-semibold tracking-[2px] uppercase text-white/40">
              Scroll
            </span>
            <motion.div
              className="w-px h-8 bg-white/40 origin-top"
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            MARQUEE — Scrolling trust bar
        ════════════════════════════════════════════════════ */}
        <div className="py-7 border-b border-[#E5E5E5] overflow-hidden bg-[#FAFAF8]">
          <div
            className="flex whitespace-nowrap"
            style={{ animation: "marquee 30s linear infinite" }}
          >
            {/* Duplicate items for seamless loop */}
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <div
                key={i}
                className="inline-flex items-center gap-3 mx-8 flex-shrink-0"
              >
                <div className="w-1 h-1 rounded-full bg-[#C2654A] flex-shrink-0" />
                <span className="text-sm">
                  <strong className="font-bold text-[#1A1A1A]">
                    {item.bold}
                  </strong>{" "}
                  <span className="font-medium text-[#8A8A8A]">
                    {item.rest}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            HOE HET WERKT — 3 step cards
        ════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <Reveal>
              <div className="text-center max-w-[680px] mx-auto mb-16 md:mb-20">
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[#C2654A]">
                  Hoe het werkt
                </span>
                <h2 className="font-serif italic text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] mt-4">
                  In drie stappen
                </h2>
                <p className="text-base md:text-[17px] text-[#4A4A4A] leading-[1.8] max-w-[520px] mx-auto mt-4">
                  Van eerste vraag tot volledig stijlrapport. Snel, persoonlijk
                  en zonder gedoe.
                </p>
              </div>
            </Reveal>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  num: "01",
                  icon: ClipboardCheck,
                  title: "Beantwoord de quiz",
                  text: "Een korte quiz over je voorkeuren, levensstijl en kleuren. Klaar in een paar minuten.",
                  tag: "~5 minuten",
                  tagIcon: Clock,
                },
                {
                  num: "02",
                  icon: Palette,
                  title: "Ontvang je rapport",
                  text: "Je persoonlijke kleurpalet, stijlprofiel en seizoenstype — visueel en overzichtelijk.",
                  tag: "Direct beschikbaar",
                  tagIcon: ArrowRight,
                },
                {
                  num: "03",
                  icon: ShoppingBag,
                  title: "Shop je outfits",
                  text: "Outfits samengesteld op basis van jouw profiel, met directe links naar webshops.",
                  tag: "Directe shoplinks",
                  tagIcon: ArrowUpRight,
                },
              ].map((step, i) => (
                <Reveal key={step.num} delay={i * 0.12}>
                  <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 md:p-12 relative overflow-hidden group transition-all duration-200 hover:border-[#C2654A] hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] h-full flex flex-col">
                    {/* Big number */}
                    <span
                      className="font-serif italic text-[72px] text-[#F5F0EB] absolute -top-3 right-5 select-none pointer-events-none"
                      aria-hidden="true"
                    >
                      {step.num}
                    </span>

                    {/* Icon */}
                    <div className="w-12 h-12 rounded-2xl bg-[#F5F0EB] flex items-center justify-center mb-7">
                      <step.icon className="w-[22px] h-[22px] text-[#C2654A]" />
                    </div>

                    {/* Content */}
                    <h3 className="text-[22px] font-bold text-[#1A1A1A] mb-3">
                      {step.title}
                    </h3>
                    <p className="text-[15px] text-[#4A4A4A] leading-[1.7] flex-1">
                      {step.text}
                    </p>

                    {/* Tag */}
                    <div className="flex items-center gap-2 mt-6 text-xs font-semibold text-[#C2654A]">
                      <step.tagIcon className="w-3.5 h-3.5" />
                      {step.tag}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FEATURE SPLIT 1 — Kleuradvies (image left, content right)
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#F5F0EB]">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[640px]">
            {/* Image */}
            <Reveal className="relative overflow-hidden">
              <img
                src="/images/3afbe258-11f3-4a98-b82e-a2939fd1de19.webp"
                alt="Persoonlijk kleuradvies en kleurpalet"
                className="w-full h-full min-h-[400px] lg:min-h-[640px] object-cover"
                loading="lazy"
              />
            </Reveal>

            {/* Content */}
            <Reveal
              className="flex flex-col justify-center p-8 md:p-12 lg:p-20 bg-[#F5F0EB]"
              delay={0.12}
            >
              <span className="text-xs font-semibold tracking-[2px] uppercase text-[#C2654A] mb-4">
                Kleuradvies
              </span>
              <h2 className="font-serif italic text-[32px] md:text-[48px] text-[#1A1A1A] leading-[1.05] mb-6">
                Tinten die bij jou horen
              </h2>
              <p className="text-base md:text-[17px] text-[#4A4A4A] leading-[1.7] mb-8 max-w-[480px]">
                Geen trends volgen. De quiz analyseert je contrast, ondertoon en
                seizoenstype om kleuren te vinden die jouw gezicht laten stralen.
              </p>
              <ul className="space-y-4">
                {[
                  "Persoonlijk kleurpalet op basis van je kenmerken",
                  "Seizoensgebonden aanbevelingen",
                  "Kleuren om te vermijden met uitleg waarom",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.6]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#C2654A] mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            FEATURE SPLIT 2 — Outfits (content left, image right)
        ════════════════════════════════════════════════════ */}
        <section className="bg-[#FAFAF8]">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[640px]">
            {/* Content */}
            <Reveal
              className="flex flex-col justify-center p-8 md:p-12 lg:p-20 bg-[#FAFAF8] order-2 lg:order-1"
              delay={0.12}
            >
              <span className="text-xs font-semibold tracking-[2px] uppercase text-[#C2654A] mb-4">
                Outfits
              </span>
              <h2 className="font-serif italic text-[32px] md:text-[48px] text-[#1A1A1A] leading-[1.05] mb-6">
                Combinaties voor elk moment
              </h2>
              <p className="text-base md:text-[17px] text-[#4A4A4A] leading-[1.7] mb-8 max-w-[480px]">
                Van een werkdag tot een avondje uit. Echte items die je direct
                kunt kopen, samengesteld op basis van jouw stijlprofiel.
              </p>
              <ul className="space-y-4">
                {[
                  "Outfits per gelegenheid",
                  "Directe shoplinks naar webshops",
                  "Afgestemd op je budget",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-[15px] text-[#4A4A4A] leading-[1.6]"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#C2654A] mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>

            {/* Image */}
            <Reveal className="relative overflow-hidden order-1 lg:order-2">
              <img
                src="/images/caa9958f-d96f-4d6c-8dff-b192665376c8.webp"
                alt="Persoonlijke outfit combinaties"
                className="w-full h-full min-h-[400px] lg:min-h-[640px] object-cover"
                loading="lazy"
              />
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            TRUST — Privacy & vertrouwen
        ════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <Reveal>
              <div className="text-center max-w-[680px] mx-auto mb-16 md:mb-20">
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[#C2654A]">
                  Privacy & vertrouwen
                </span>
                <h2 className="font-serif italic text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] mt-4">
                  Jouw gegevens, jouw controle
                </h2>
                <p className="text-base md:text-[17px] text-[#4A4A4A] leading-[1.8] max-w-[520px] mx-auto mt-4">
                  We zijn transparant over wat we wel en niet doen met je
                  informatie.
                </p>
              </div>
            </Reveal>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Privacy first",
                  text: "Je antwoorden blijven privé. We delen nooit je data met derden en je kunt je account op elk moment verwijderen.",
                },
                {
                  icon: Lock,
                  title: "Jouw data, jouw keuze",
                  text: "We bewaren alleen wat nodig is voor je stijladvies. Verwijder je profiel en al je gegevens worden binnen 30 dagen gewist.",
                },
                {
                  icon: Info,
                  title: "Mode, geen fitness",
                  text: "FitFi is een stijl- en kledingadvies-tool. We maken geen uitspraken over gezondheid, lichaamsbouw of fitness.",
                },
              ].map((card, i) => (
                <Reveal key={card.title} delay={i * 0.12}>
                  <div className="bg-[#F5F0EB] rounded-3xl p-8 md:p-10 h-full">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6">
                      <card.icon className="w-[22px] h-[22px] text-[#C2654A]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1A1A] mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[#4A4A4A] leading-[1.7]">
                      {card.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            TESTIMONIALS — Ervaringen
        ════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-[#F5F0EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <Reveal>
              <div className="text-center max-w-[680px] mx-auto mb-16 md:mb-20">
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[#C2654A]">
                  Ervaringen
                </span>
                <h2 className="font-serif italic text-[32px] md:text-[56px] text-[#1A1A1A] leading-[1.05] mt-4">
                  Wat anderen zeggen
                </h2>
                <p className="text-base md:text-[17px] text-[#4A4A4A] leading-[1.8] max-w-[520px] mx-auto mt-4">
                  Van sceptisch tot overtuigd. Dit zijn echte ervaringen van
                  FitFi-gebruikers.
                </p>
              </div>
            </Reveal>

            {/* Cards — same height */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <Reveal key={i} delay={i * 0.12}>
                  <article className="bg-white rounded-3xl p-8 md:p-10 pt-8 md:pt-10 h-full flex flex-col">
                    {/* Quote mark */}
                    <span
                      className="font-serif text-[72px] text-[#F4E8E3] leading-[0.6] mb-4 select-none"
                      aria-hidden="true"
                    >
                      &ldquo;
                    </span>

                    {/* Quote */}
                    <blockquote className="text-base text-[#4A4A4A] leading-[1.7] italic mb-7 flex-1">
                      {review.quote}
                    </blockquote>

                    {/* Author */}
                    <div className="flex items-center gap-3.5 pt-5 border-t border-[#E5E5E5]">
                      <div className="w-11 h-11 rounded-full bg-[#F4E8E3] flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#C2654A]">
                          {review.initial}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">
                          {review.name}
                        </p>
                        <p className="text-xs text-[#8A8A8A]">{review.meta}</p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════
            CTA — Klaar om te beginnen?
        ════════════════════════════════════════════════════ */}
        <section className="py-[120px] md:py-[200px] bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center">
                <h2 className="font-serif italic text-[32px] md:text-[64px] text-[#1A1A1A] leading-[1.05]">
                  Klaar om te beginnen?
                </h2>
                <p className="text-base md:text-[17px] text-[#4A4A4A] mt-8 mb-14 md:mb-16">
                  Gratis. Twee minuten. Geen account nodig.
                </p>
                <button
                  onClick={handleStartClick}
                  className="group inline-flex items-center gap-3 bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base md:text-[17px] py-5 px-12 rounded-full transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    boxShadow: "0 12px 40px rgba(194,101,74,0.3)",
                  }}
                >
                  Begin gratis
                  <ArrowRight
                    className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </>
  );
}
