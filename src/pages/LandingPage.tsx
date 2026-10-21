import React, { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useTestimonials } from "@/hooks/useTestimonials";
import HeroProduct from "@/components/landing/v2/HeroProduct";
import RapportAlsBlad from "@/components/landing/v2/RapportAlsBlad";
import KleurMoment from "@/components/landing/v2/KleurMoment";
import Afsluiter from "@/components/landing/v2/Afsluiter";
import ZoWerktHet from "@/components/landing/sections/ZoWerktHet";
import { track as trackFunnel } from "@/utils/analytics";
import { tel } from "@/utils/teller";
import { LANDING_BESCHRIJVING, LANDING_TITEL, OG_BEELD } from "@/content/landingHead";

const PAGE = "landing";

/**
 * Homepage, designsysteem v2 (CLAUDE.md deel 18; plan van 21 oktober 2026,
 * ~/claude-artifacts/fitfi-beeld/2026-10-21-website/plan.md).
 *
 * Volgorde: het product (hero met een voorbeeldrapport), wat je krijgt (het
 * rapport als tijdschrift), wat kleur doet (kleurmoment), hoe het werkt (met
 * de echte quiz en wat er met je gegevens gebeurt), ervaringen zodra er drie
 * echte zijn, en de afsluiter.
 *
 * Wat eruit ging: de hero met het stel (verhuist naar Over ons), Gedragen,
 * de kleurpiek, de live voorbeeldoutfit en het slot met het schemerbeeld. De
 * bestanden blijven staan voor Over ons en de opruim-PR. Het quizscherm
 * "Deze of deze?" uit het prototype staat hier bewust niet: die vraagvorm
 * bestaat in de echte quiz nog niet.
 */

function useScrollDepth(page: string) {
  useEffect(() => {
    const drempels = [25, 50, 75, 100];
    let hoogstGemeld = 0;
    let frame = 0;

    const meet = () => {
      frame = 0;
      const scrollbaar = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollbaar <= 0) return;
      const pct = (window.scrollY / scrollbaar) * 100;
      for (const drempel of drempels) {
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

/** Verschijnt bij het inscrollen; bij reduced motion meteen (CLAUDE.md deel 8: hooguit 500 ms). */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const beperkteBeweging = useReducedMotion();
  const tonen = beperkteBeweging || isInView;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={beperkteBeweging ? false : { opacity: 0, y: 24 }}
      animate={tonen ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={beperkteBeweging ? { duration: 0 } : { duration: 0.45, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  // Anonieme dagtelling, zonder cookie (src/utils/teller.ts).
  useEffect(() => tel("home"), []);
  useScrollDepth(PAGE);

  const { testimonials } = useTestimonials();
  const reviews = testimonials.slice(0, 3).map((t) => ({
    name: t.author_name,
    meta: t.author_age ? `${t.author_age} jaar` : "",
    quote: t.quote,
    initial: t.author_name?.[0]?.toUpperCase() || "?",
  }));
  // Alleen bij drie of meer echte reviews uit de database.
  const toonReviews = reviews.length >= 3;

  return (
    <>
      {/* Titel, beschrijving en deelbeeld staan in content/landingHead.ts,
          samen met index.html en de Seo-regel in App.tsx. */}
      <Helmet>
        <title>{LANDING_TITEL}</title>
        <meta name="description" content={LANDING_BESCHRIJVING} />
        <meta property="og:title" content={LANDING_TITEL} />
        <meta property="og:description" content={LANDING_BESCHRIJVING} />
        <meta property="og:image" content={OG_BEELD} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "FitFi",
            description: LANDING_BESCHRIJVING,
            url: "https://fitfi.ai",
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          })}
        </script>
      </Helmet>

      <div className="bg-[#FAFAF8]">
        <HeroProduct />
        <RapportAlsBlad />
        <KleurMoment />
        <ZoWerktHet grond="wit" />

        {toonReviews && (
          <section className="py-16 md:py-24 bg-[#F5F0EB]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Reveal>
                <p className="text-sm font-medium text-[#A85740]">Ervaringen</p>
                <h2 className="mt-3 text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A]">Wat anderen zeggen</h2>
              </Reveal>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {reviews.map((review, i) => (
                  <Reveal key={i} delay={i * 0.1} className="h-full">
                    <article className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 h-full flex flex-col">
                      <blockquote className="text-base text-[#4A4A4A] leading-relaxed flex-1">{review.quote}</blockquote>
                      <div className="flex items-center gap-3.5 pt-5 mt-6 border-t border-[#E5E5E5]">
                        <div className="w-11 h-11 rounded-full bg-[#F4E8E3] flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-[#A85740]">{review.initial}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#1A1A1A]">{review.name}</p>
                          {review.meta && <p className="text-sm text-[#6E6E6E]">{review.meta}</p>}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        )}

        <Afsluiter />
      </div>
    </>
  );
}
