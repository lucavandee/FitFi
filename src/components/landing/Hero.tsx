import React from "react";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

interface HeroProps {
  onCTAClick?: () => void;
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ onCTAClick, className = "" }) => {
  const handleCTAClick = () => {
    if (typeof onCTAClick === "function") onCTAClick();
  };

  return (
    <section className={`bg-[color:var(--color-bg)] py-14 md:py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <div className="text-center lg:text-left">
          <div className="accent-chip mb-6">
            <Sparkles size={16} aria-hidden="true" />
            <span>Gratis AI Style Report</span>
          </div>

          <h1 className="text-3xl md:text-5xl tracking-tight font-semibold text-[color:var(--color-text)]">
            Ontdek wat jouw <span className="text-gradient">stijl</span> over je zegt
          </h1>

          <p className="mt-6 text-lg md:text-xl leading-relaxed text-[color:var(--color-muted)]">
            Krijg in 2 minuten een gepersonaliseerd AI-rapport dat toont wat je kledingkeuzes
            over je persoonlijkheid vertellen — inclusief concrete outfits en shopbare aanbevelingen.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {[
              "100% Gratis",
              "Klaar in 2 minuten",
              "Outfits + Shoplinks",
            ].map((item) => (
              <div key={item} className="flex items-center justify-center sm:justify-start gap-2">
                <CheckCircle size={18} className="text-[color:var(--ff-color-primary-600)]" aria-hidden="true" />
                <span className="text-sm text-[color:var(--color-text)]">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              onClick={handleCTAClick}
              variant="primary"
              size="lg"
              className="px-7 py-4 text-base md:text-lg cta-raise"
              aria-label="Start je gratis AI Style Report"
            >
              Start je gratis AI Style Report
              <ArrowRight size={20} className="ml-2" aria-hidden="true" />
            </Button>

            <span className="text-sm text-[color:var(--color-muted)]">
              Geen creditcard vereist • Privacy gegarandeerd • 10.000+ rapporten
            </span>
          </div>
        </div>

        {/* Visual */}
        <div className="relative flex justify-center lg:justify-end">
          <div className="rounded-3xl premium-shadow-lg bg-[color:var(--color-surface)] h-[500px] w-[350px] overflow-hidden">
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