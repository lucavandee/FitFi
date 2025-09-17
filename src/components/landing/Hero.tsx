import React from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

type Props = { onCTAClick?: () => void; className?: string };

const Hero: React.FC<Props> = ({ onCTAClick, className = "" }) => {
  const handleCTAClick = () => onCTAClick?.();

  return (
    <section className={`bg-[color:var(--color-bg)] pt-14 md:pt-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <h1 className="font-semibold tracking-tight text-[color:var(--color-text)]"
              style={{ fontSize: "clamp(2rem, 2.8vw + 1rem, 3.75rem)", lineHeight: 1.05 }}>
            AI Style Report — <span className="text-[color:var(--ff-color-primary-700)]">ontdek</span> wat jouw stijl over je zegt
          </h1>

          <p className="mt-6 text-[color:var(--color-muted)]"
             style={{ fontSize: "clamp(1rem, .6vw + .8rem, 1.25rem)", lineHeight: 1.6 }}>
            In <strong>2 minuten</strong> een persoonlijk rapport met outfits die écht bij je passen.
            Geen account nodig. Privacy-first.
          </p>

          {/* CTA rail */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              onClick={handleCTAClick}
              variant="primary"
              size="lg"
              className="px-7 py-4 text-base md:text-lg cta-raise"
              aria-label="Start je gratis AI Style Report"
            >
              Start gratis
              <ArrowRight size={20} className="ml-2" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="px-7 py-4 text-base md:text-lg"
              onClick={() => (window.location.href = "/results")}
              aria-label="Bekijk voorbeeldrapport"
            >
              Bekijk voorbeeld
            </Button>
          </div>

          {/* Trust-belt (subtiel) */}
          <div className="mt-6 text-sm text-[color:var(--color-muted)] flex flex-wrap gap-x-6 gap-y-2">
            <span>10.000+ rapporten</span>
            <span>★★★★★ 4,8/5</span>
            <span>Geen creditcard nodig</span>
          </div>
        </div>

        {/* Visual (bestaande SmartImage/asset) */}
        <div className="relative flex justify-center lg:justify-end pb-14 md:pb-20">
          <div className="rounded-[var(--radius-lg)] bg-[color:var(--color-surface)] premium-shadow-lg overflow-hidden"
               style={{ width: 420, height: 560 }}>
            <SmartImage
              id="nova-hero"        
              kind="generic"
              src="/images/hero/main.jpg" 
              alt="Voorbeeld van AI-stijlrapport met outfits in FitFi"
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;