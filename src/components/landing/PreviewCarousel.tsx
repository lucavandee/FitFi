import React from "react";
import { Sparkles, ArrowRight, Eye } from "lucide-react";
import SwipeCarousel from "@/components/ui/SwipeCarousel";
import { track } from "@/utils/analytics";

const PREVIEWS = [
  { 
    title: "Smart casual — Italiaans", 
    why: "Warme taupe + clean lijnen = relaxed chic.",
    category: "Casual",
    season: "Herfst/Winter"
  },
  { 
    title: "Diner — ton-sur-ton", 
    why: "Ton-sur-ton verlengt je silhouet; merino oogt verfijnd.",
    category: "Elegant", 
    season: "Alle seizoenen"
  },
  { 
    title: "Smart denim", 
    why: "Indigo contrasteert subtiel; suède voegt luxe textuur toe.",
    category: "Casual-chic",
    season: "Lente/Zomer"
  },
  {
    title: "Business casual",
    why: "Gestructureerde blazer + zachte knit = professioneel maar toegankelijk.",
    category: "Zakelijk",
    season: "Alle seizoenen"
  },
  {
    title: "Weekend comfort",
    why: "Natuurlijke materialen + neutrale tinten = moeiteloos stijlvol.",
    category: "Comfort",
    season: "Alle seizoenen"
  }
];

const PreviewCarousel: React.FC<{ className?: string }> = ({ className = "" }) => {
  const handlePreviewClick = (preview: typeof PREVIEWS[0], index: number) => {
    track('preview_card_click', {
      preview_title: preview.title,
      preview_category: preview.category,
      preview_index: index,
      section: 'landing_preview_carousel'
    });
  };

  const handleCTAClick = () => {
    track('cta_click', {
      cta_text: 'Start je stijlanalyse',
      section: 'preview_carousel',
      position: 'bottom'
    });
  };

  return (
    <section className={`section bg-gradient-to-b from-[color:var(--color-bg)] to-[color:var(--color-surface)] ${className}`} aria-labelledby="preview-title">
      <div className="container">
        <header className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 chip mb-4">
            <Eye className="w-4 h-4" />
            <span>Voorproefje</span>
          </div>
          <h2 id="preview-title" className="hero__title">Zo zien jouw outfits eruit</h2>
          <p className="lead mt-3">Elke look komt met een korte uitleg waarom het bij jou past.</p>
        </header>

        <div className="mt-8">
          <SwipeCarousel ariaLabel="Outfit previews" className="pb-4">
            {PREVIEWS.map((preview, index) => (
              <article 
                key={preview.title} 
                className="subcard interactive-elevate cursor-pointer group"
                onClick={() => handlePreviewClick(preview, index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handlePreviewClick(preview, index);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Bekijk outfit: ${preview.title}`}
              >
                <div className="subcard__inner">
                  <div className="flex items-start justify-between mb-3">
                    <div className="inline-flex items-center gap-2 text-xs text-[color:var(--color-muted)]">
                      <span className="chip text-xs py-1 px-2">{preview.category}</span>
                      <span>•</span>
                      <span>{preview.season}</span>
                    </div>
                    <Sparkles className="w-4 h-4 text-[color:var(--color-primary)] opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200" />
                  </div>
                  
                  <h3 className="subcard__title group-hover:text-[color:var(--color-primary)] transition-colors duration-200">
                    {preview.title}
                  </h3>
                  
                  <p className="subcard__kicker mt-2">
                    <strong className="text-[color:var(--color-text)]">Waarom dit werkt:</strong> {preview.why}
                  </p>
                  
                  <div className="mt-4 pt-3 border-t border-[color:var(--color-border)] flex items-center justify-between">
                    <span className="text-xs text-[color:var(--color-muted)]">Klik voor meer details</span>
                    <ArrowRight className="w-4 h-4 text-[color:var(--color-primary)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </article>
            ))}
          </SwipeCarousel>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-[color:var(--color-surface)] to-[color:var(--color-bg)] border border-[color:var(--color-border)]">
            <p className="text-sm text-[color:var(--color-muted)] max-w-md">
              Krijg jouw persoonlijke stijlanalyse met outfits die perfect bij je passen
            </p>
            <button 
              onClick={handleCTAClick}
              className="btn btn-primary btn-lg group"
              aria-label="Start je persoonlijke stijlanalyse"
            >
              <span>Start je stijlanalyse</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PreviewCarousel;