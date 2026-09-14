import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
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
import { useTestimonials } from "@/hooks/useTestimonials";
import OutfitFlatlay from "@/components/landing/sections/OutfitFlatlay";
import TrustStrip from "@/components/landing/sections/TrustStrip";
import StepsScene from "@/components/landing/sections/StepsScene";
import ColorWipe from "@/components/landing/sections/ColorWipe";
import { track as trackFunnel } from "@/utils/analytics";

const PAGE = "landing";

/* ─── Scrolldiepte ─── */
/*
 * Meet 25/50/75/100 procent, elk hoogstens een keer per paginabezoek.
 * De hook staat bewust in dit bestand en niet in een gedeelde module die de
 * andere pagina's importeren: pagina's worden lazy geladen, en een import over
 * paginabestanden heen trekt de hele pagina mee in de chunk van de ander.
 */
function useScrollDepth(page: string) {
  // LET OP: dit meet scrollafstand, niet gelezen content. Een vastgezette
  // scene van 200vh telt als twee schermen scrollen terwijl er een sectie
  // voorbijkomt. De drempels zijn dus alleen vergelijkbaar tussen versies
  // met dezelfde pagina-opbouw, niet met een pagina zonder pins.
  useEffect(() => {
    const drempels = [25, 50, 75, 100];
    let hoogstGemeld = 0;
    let frame = 0;

    const meet = () => {
      frame = 0;
      const scrollbaar =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollbaar <= 0) return;

      const pct = (window.scrollY / scrollbaar) * 100;
      for (const drempel of drempels) {
        // Marge van 0,5 procent: op 100 procent komt scrollY door afronding
        // en zoom zelden exact op de maximale waarde uit.
        if (drempel > hoogstGemeld && pct >= drempel - 0.5) {
          hoogstGemeld = drempel;
          trackFunnel("scroll_depth", { page, depth: drempel });
        }
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(meet);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [page]);
}

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
  const beperkteBeweging = useReducedMotion();

  // Bij reduced motion staat scroll-behavior: smooth uit, dus een ankerlink,
  // Ctrl+F of terugnavigatie springt echt. De observer vuurt dan niet voor wat
  // je overslaat en het blok blijft permanent op opacity 0. Daarom niet op
  // zichtbaarheid wachten maar meteen tonen.
  const tonen = beperkteBeweging || isInView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={beperkteBeweging ? false : { opacity: 0, y: 40 }}
      animate={tonen ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={
        beperkteBeweging
          ? { duration: 0 }
          : { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }
      }
    >
      {children}
    </motion.div>
  );
}

/* ─── Marquee CSS ─── */


export default function LandingPage() {
  const navigate = useNavigate();

  /*
   * Hier stond een useQuery die het aantal style_profiles van vandaag telde.
   * Die uitkomst werd nergens gerenderd: een Supabase-request bij elk bezoek
   * aan de drukste pagina, waarvan het antwoord werd weggegooid. Bovendien gaf
   * hij voor uitgelogde bezoekers altijd 0 terug, want RLS staat anon geen
   * telling op style_profiles toe.
   */

  const { testimonials } = useTestimonials();

  useScrollDepth(PAGE);

  const handleStartClick = (position: string) => {
    trackFunnel("cta_click", { page: PAGE, position });
    trackFunnel("quiz_start", { page: PAGE, position });
    navigate("/onboarding");
  };

  const handleExampleClick = () => {
    navigate("/results/preview");
  };

  /*
   * Alleen echte reviews uit de database.
   *
   * Hier stond tot 2026-08-07 een FALLBACK_REVIEWS met drie verzonnen
   * ervaringen: "Sophie V., 28 jaar, Amsterdam", "Marieke D., 34 jaar,
   * Utrecht" en "Tom B., 41 jaar, Rotterdam", inclusief citaten. Die werden
   * getoond zodra de database minder dan drie rijen had, en de tabel is leeg.
   * Elke bezoeker van fitfi.ai kreeg dus drie verzonnen klantreviews te zien,
   * onder een kop die letterlijk zei: "Dit zijn echte ervaringen van
   * FitFi-gebruikers."
   *
   * Los van dat het niet waar is: verzonnen consumentenreviews zijn in de EU
   * verboden (richtlijn 2005/29/EG, bijlage I punt 23b en 23c, sinds de
   * Omnibus-richtlijn). Een lege sectie is hier de enige juiste uitkomst.
   *
   * De sectie verdwijnt nu volledig zolang er minder dan drie echte reviews
   * zijn. Geen halve variant met een of twee kaarten: dan is de sectie
   * visueel scheef en verleidt hij alsnog tot aanvullen met verzinsels.
   */
  const reviews = testimonials.slice(0, 3).map((t) => ({
    name: t.author_name,
    meta: t.author_age ? `${t.author_age} jaar` : "",
    quote: t.quote,
    initial: t.author_name?.[0]?.toUpperCase() || "?",
  }));

  const toonReviews = reviews.length >= 3;

  /* Marquee items */
  /*
   * Twee claims hier weggehaald op 2026-08-07:
   *
   * "4.9/5 waardering" stond boven een reviewsectie waarvan de tabel leeg is.
   * Een gemiddelde beoordeling zonder een enkele beoordeling is geen afronding
   * maar een verzinsel, en valt onder dezelfde regels als de nepreviews die
   * hieronder zijn verwijderd.
   *
   * "50+ outfitcombinaties" was eerder al uit de rest van de site gehaald
   * (commits 7b1479f4 en a29a2595) omdat het getal nergens op steunt. Deze
   * ene stond nog.
   *
   * "2.400+ gebruikers" is er op 2026-08-07 ook afgehaald. Niet omdat het
   * aantoonbaar onwaar is, maar omdat het niet te controleren viel: RLS staat
   * anon geen telling op style_profiles toe. Naast twee claims die wel
   * aantoonbaar onwaar bleken, is een oncontroleerbaar getal geen houdbare
   * positie. Klopt het wel, zet het dan terug met de bron erbij.
   */


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
            url: "https://fitfi.ai",
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

      {/* Geen eigen skip-link: de shell in App.tsx levert er al een. */}


      {/* Geen <main> hier: de shell in App.tsx heeft er al een, en genest is
          ongeldig. overflow-x-clip in plaats van -hidden, want hidden maakt een
          scroll-container en dan plakt een sticky kind aan deze div in plaats
          van aan het scherm. Clip beschermt net zo goed tegen horizontaal
          scrollen zonder die bijwerking. */}
      <div id="main-content" className="overflow-x-clip w-full">
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
              width={1152}
              height={2048}
            />
            <img
              src="/images/hf_20260221_210750_e12efd50-544c-4e35-986d-bfff9999542b.webp"
              alt="Stijlvol stel op een Amsterdams kanaal"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectPosition: "center 20%" }}
              width={2048}
              height={1152}
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
                <div className="w-8 h-px bg-[#A85740]" aria-hidden="true" />
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
                  onClick={() => handleStartClick("hero")}
                  className="group inline-flex items-center gap-3 bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-[15px] py-[18px] px-10 rounded-full transition-all duration-200 hover:-translate-y-0.5"
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
                  className="inline-flex items-center gap-2 text-sm font-medium text-white/70 hover:text-white transition-colors duration-200 min-h-[44px]"
                  aria-label="Bekijk voorbeeld rapport"
                >
                  Bekijk voorbeeld
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/*
           * Hier zweefde een glaskaart over de foto met vier swatches en de
           * tekst "Jouw kleurpalet — Warm · Herfst · Diep". Verwijderd om twee
           * redenen die dezelfde kant op wijzen.
           *
           * Het was een claim: "jouw" palet, terwijl er op de landingspagina
           * geen profiel en dus geen uitkomst bestaat. Een bezoeker die dit
           * leest als haar eigen resultaat is misleid, en het is dezelfde soort
           * bewering als de cijfers die op 2026-08-07 uit de copy zijn gehaald.
           *
           * En het is het patroon dat Luc als "heel AI" leest: zwevende
           * glass-cards met blur en badge-tags over een foto. De hero werkt
           * sterker zonder: de foto blijft schoon en de belofte staat een keer
           * stil in beeld, wat het plan voor deze sectie ook vraagt.
           */}

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
            TRUST STRIP — stilstaand
            Verving de marquee. Drie claims die dertig seconden per lus door
            beeld schuiven betekenen niets en zouden op elke site passen.
        ════════════════════════════════════════════════════ */}
        <TrustStrip />

        {/* ════════════════════════════════════════════════════
            HOE HET WERKT — een stap tegelijk
            Verving drie kaarten naast elkaar. Die worden alle drie tegelijk
            getoond en dus geen van drieen gelezen; de scroll draagt nu de
            volgorde van het proces.
        ════════════════════════════════════════════════════ */}
        <StepsScene />

        {/* ════════════════════════════════════════════════════
            KLEURADVIES — de naad schuift over hetzelfde beeld
            Verving de statische beeld/tekst-split. Je ziet nu wat een warmer
            of koeler palet met een gezicht doet voordat het uitgelegd wordt.
        ════════════════════════════════════════════════════ */}
        <ColorWipe />

        {/* ════════════════════════════════════════════════════
            OUTFIT FLATLAY — hoofdgebaar: de outfit legt zichzelf neer
            Verving de oude "Combinaties voor elk moment"-sectie. Die beloofde
            "echte items die je direct kunt kopen", terwijl de vier stuks nog
            niet aan een geverifieerde partnerfeed met voorraad hangen. De
            flatlay toont dezelfde look als voorbeeld, met de reden per stuk.
        ════════════════════════════════════════════════════ */}
        <OutfitFlatlay />

        {/* ════════════════════════════════════════════════════
            TRUST — Privacy & vertrouwen
        ════════════════════════════════════════════════════ */}
        <section className="py-16 md:py-24 bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <Reveal>
              <div className="text-center max-w-[680px] mx-auto mb-16 md:mb-20">
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[#A85740]">
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
                  <div className="bg-[#F5F0EB] rounded-2xl p-8 md:p-10 h-full">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6">
                      <card.icon className="w-[22px] h-[22px] text-[#A85740]" />
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
            Alleen zichtbaar bij drie of meer ECHTE reviews uit de database.
        ════════════════════════════════════════════════════ */}
        {toonReviews && (
        <section className="py-16 md:py-24 bg-[#F5F0EB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <Reveal>
              <div className="text-center max-w-[680px] mx-auto mb-16 md:mb-20">
                <span className="text-xs font-semibold tracking-[2px] uppercase text-[#A85740]">
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
                  <article className="bg-white rounded-2xl p-8 md:p-10 pt-8 md:pt-10 h-full flex flex-col">
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
                        <span className="text-sm font-bold text-[#A85740]">
                          {review.initial}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">
                          {review.name}
                        </p>
                        <p className="text-xs text-[#6E6E6E]">{review.meta}</p>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* ════════════════════════════════════════════════════
            CTA — Klaar om te beginnen?
        ════════════════════════════════════════════════════ */}
        <section className="py-40 bg-[#FAFAF8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="text-center">
                <h2 className="font-serif italic text-[32px] md:text-[64px] text-[#1A1A1A] leading-[1.05]">
                  Klaar om te beginnen?
                </h2>
                <p className="text-base md:text-[17px] text-[#4A4A4A] mt-8 mb-14 md:mb-16">
                  Gratis. Ongeveer vijf minuten. Geen account nodig.
                </p>
                <button
                  onClick={() => handleStartClick("footer")}
                  className="group inline-flex items-center gap-3 bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base md:text-[17px] py-5 px-12 rounded-full transition-all duration-200 hover:-translate-y-0.5"
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
      </div>
    </>
  );
}
