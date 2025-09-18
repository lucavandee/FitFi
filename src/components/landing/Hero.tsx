import React from "react";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

type Props = { onCTAClick?: () => void; className?: string };

const Hero: React.FC<Props> = ({ onCTAClick, className = "" }) => {
  const handleCTAClick = () => onCTAClick?.();

  return (
    <section className={`pt-14 md:pt-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <span className="accent-chip mb-5 inline-flex">
            <Sparkles size={16} aria-hidden="true" />
            <span>Gratis AI Style Report</span>
          </span>

          <h1
            className="font-semibold tracking-tight text-[var(--color-text)]"
            style={{ fontSize: "clamp(2rem, 2.8vw + 1rem, 3.75rem)", lineHeight: 1.05 }}
          >
            AI Style Report — <span className="text-[var(--ff-color-primary-700)]">ontdek</span> wat jouw stijl over je zegt
          </h1>

          <p
            className="mt-6 text-[var(--color-muted)]"
            style={{ fontSize: "clamp(1rem, .6vw + .8rem, 1.25rem)", lineHeight: 1.6 }}
          >
            In <strong>2 minuten</strong> een persoonlijk rapport met outfits die écht bij je passen — inclusief
            slimme shoplinks. Geen account nodig. Privacy-first.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {["100% gratis", "Klaar in 2 min", "Outfits + shoplinks"].map((b) => (
              <div key={b} className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[var(--ff-color-primary-600)]" aria-hidden />
                <span className="text-sm text-[var(--color-text)]">{b}</span>
              </div>
            ))}
          </div>

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
              <ArrowRight size={20} className="ml-2" aria-hidden />
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

          {/* Trust-belt met verbeterde separators en duidelijke metrics */}
          <div className="mt-6 text-sm text-[var(--color-muted)] flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1">
              <span className="font-medium text-[var(--color-text)]">12.500+</span>
              <span>rapporten</span>
            </span>
            <span className="text-[var(--color-border)]">•</span>
            <span className="flex items-center gap-1">
              <span className="text-yellow-500">★★★★★</span>
              <span className="font-medium text-[var(--color-text)]">4.8/5</span>
            </span>
            <span className="text-[var(--color-border)]">•</span>
            <span className="flex items-center gap-1">
              <CheckCircle size={14} className="text-[var(--ff-color-primary-600)]" aria-hidden />
              <span>Geen creditcard</span>
            </span>
          </div>
        </div>

        {/* Visual: alleen SmartImage zonder onzekere src */}
        <div className="relative flex justify-center lg:justify-end pb-10 md:pb-16">
          <div
            className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] premium-shadow-lg overflow-hidden"
            style={{ width: 420, height: 560 }}
          >
            <SmartImage
              id="nova-hero"
              kind="generic"
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