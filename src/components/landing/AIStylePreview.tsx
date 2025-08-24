import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, Heart } from "lucide-react";

type Outfit = {
  id: string;
  title: string;
  subtitle: string;
  why: string;
  palette: string[];
  ctaHref?: string;
  imageUrl?: string;
};

const PREVIEW: Outfit[] = [
  {
    id: "it-smart-casual",
    title: "Smart Casual — Italiaans",
    subtitle: "Linnen, loafers, clean layers",
    why: "Effortless klasse met scherpe fits en luchtige stoffen.",
    palette: ["#0D1B2A", "#F3F4F6", "#E8E2D0", "#89CFF0"],
    ctaHref: "/quiz",
  },
  {
    id: "city-minimal",
    title: "City Minimal",
    subtitle: "Monochrome, structured, modern",
    why: "Strakke lijnen die silhouet verlengen en rust geven.",
    palette: ["#0D1B2A", "#111827", "#9CA3AF", "#FFFFFF"],
    ctaHref: "/quiz",
  },
  {
    id: "soft-athleisure",
    title: "Soft Athleisure",
    subtitle: "Cozy tech fabrics",
    why: "Comfort met premium uitstraling voor dagelijks gebruik.",
    palette: ["#0D1B2A", "#FFFFFF", "#D1D5DB", "#89CFF0"],
    ctaHref: "/quiz",
  },
  {
    id: "boho-chic",
    title: "Boho Chic",
    subtitle: "Flowing fabrics, earth tones",
    why: "Vrije geest met natuurlijke elegantie en textuur.",
    palette: ["#8B4513", "#DEB887", "#F5DEB3", "#CD853F"],
    ctaHref: "/quiz",
  },
  {
    id: "classic-timeless",
    title: "Classic Timeless",
    subtitle: "Tailored, refined, versatile",
    why: "Tijdloze elegantie die altijd en overal werkt.",
    palette: ["#0D1B2A", "#FFFFFF", "#B8860B", "#2F4F4F"],
    ctaHref: "/quiz",
  },
];

export default function AIStylePreview() {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (direction: "left" | "right") => {
    if (!scroller.current) return;
    const scrollAmount = 320;
    scroller.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative bg-gradient-to-b from-white to-slate-50/50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#89CFF0]/10 px-4 py-2 text-sm font-medium text-[#0D1B2A] mb-4">
            <Sparkles className="h-4 w-4" />
            AI-Powered Style Discovery
          </div>
          <h2 className="text-3xl font-bold text-[#0D1B2A] mb-3">
            Ontdek stijlen die bij <span className="text-[#89CFF0]">jou</span> passen
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Swipe door verschillende stijlen en ontdek wat jouw persoonlijkheid het beste uitdrukt. 
            Na de test krijg je gepersonaliseerde varianten met uitleg.
          </p>
        </div>
        
        <div className="flex items-center justify-between gap-6 mb-6">
          <div>
            <p className="text-sm text-slate-500">
              {PREVIEW.length} stijlen beschikbaar • Swipe voor meer
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scrollBy("left")}
              className="group rounded-xl p-3 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 transition-all duration-200"
              aria-label="Scroll links"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
            </button>
            <button
              onClick={() => scrollBy("right")}
              className="group rounded-xl p-3 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 transition-all duration-200"
              aria-label="Scroll rechts"
            >
              <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-900 transition-colors" />
            </button>
          </div>
        </div>

        {/* Scroller */}
        <div
          ref={scroller}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-p-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ scrollbarWidth: "none" }}
        >
          {PREVIEW.map((o) => (
            <article
              key={o.id}
              className="group snap-start shrink-0 w-[300px] sm:w-[360px] rounded-3xl p-6 shadow-[0_20px_50px_rgba(13,27,42,0.12)] ring-1 ring-slate-100 bg-gradient-to-br from-white to-slate-50/80 hover:shadow-[0_25px_60px_rgba(13,27,42,0.18)] hover:ring-slate-200 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Visual block */}
              <div className="relative h-52 w-full overflow-hidden rounded-2xl ring-1 ring-slate-100 bg-gradient-to-br from-[#E6F3FC] via-white to-slate-50 group-hover:ring-slate-200 transition-all duration-300">
                {/* AI Badge */}
                <div className="absolute right-3 top-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-medium text-[#0D1B2A] shadow-sm">
                  AI Match
                </div>
                
                {/* Palette chips */}
                <div className="absolute left-3 top-3 flex gap-2">
                  {o.palette.map((hex) => (
                    <span 
                      key={hex} 
                      className="h-6 w-6 rounded-full ring-2 ring-white shadow-sm group-hover:scale-110 transition-transform duration-200" 
                      style={{ background: hex }} 
                    />
                  ))}
                </div>
                
                {/* Decorative elements */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="h-16 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-xl border border-white/50 flex items-center justify-center">
                    <div className="text-xs text-slate-600 font-medium">Style Preview</div>
                  </div>
                </div>
                
                {/* Future image */}
                {o.imageUrl ? (
                  <img
                    src={o.imageUrl}
                    alt={o.title}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              {/* Copy */}
              <div className="mt-5">
                <h3 className="text-xl font-bold text-[#0D1B2A] group-hover:text-[#89CFF0] transition-colors duration-200">
                  {o.title}
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-1">{o.subtitle}</p>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">{o.why}</p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <a
                  href={o.ctaHref || "/quiz"}
                  data-cta="preview_card_cta"
                  data-style={o.id}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 bg-[#0D1B2A] text-white text-sm font-semibold hover:bg-[#89CFF0] hover:text-[#0D1B2A] transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Ontdek jouw stijl
                  <Sparkles className="h-4 w-4" />
                </a>
                <button
                  className="rounded-xl p-3 ring-1 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 transition-all duration-200 group/heart"
                  aria-label="Bewaar stijl"
                >
                  <Heart className="h-4 w-4 text-slate-400 group-hover/heart:text-red-500 transition-colors" />
                </button>
              </div>
            </article>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-10">
          <p className="text-sm text-slate-600 mb-4">
            Zie je een stijl die je aanspreekt? Ontdek wat perfect bij jou past.
          </p>
          <a
            href="/quiz"
            data-cta="preview_bottom_cta"
            className="inline-flex items-center gap-2 rounded-2xl px-8 py-4 bg-[#89CFF0] text-[#0D1B2A] font-bold hover:bg-[#7fc2e3] transition-all duration-200 shadow-[0_10px_30px_rgba(137,207,240,0.35)] hover:shadow-[0_15px_40px_rgba(137,207,240,0.45)] hover:-translate-y-0.5"
          >
            <Sparkles className="h-5 w-5" />
            Start jouw stijltest
          </a>
        </div>
      </div>
    </section>
  );
}