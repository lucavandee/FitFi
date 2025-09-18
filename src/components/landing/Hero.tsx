import React from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

type Props = { onCTAClick?: () => void; className?: string };

const perks = ["100% gratis", "Klaar in 2 min", "Outfits + shoplinks"];

const Hero: React.FC<Props> = ({ onCTAClick, className = "" }) => {
  return (
    <section className={`hero-wrap ${className}`}>
      <div className="ff-container grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Copy */}
        <div className="max-w-2xl">
          <span className="accent-chip mb-6 inline-flex">
            <Sparkles size={16} aria-hidden />
            <span>Gratis AI Style Report</span>
          </span>

          <h1 className="hero-title">
            <span className="text-gradient-primary">AI Style Report</span> — ontdek wat jouw stijl over je zegt
          </h1>

          <p className="hero-lead">
            In <strong>2&nbsp;minuten</strong> een persoonlijk rapport met outfits die écht bij je passen — inclusief
            slimme shoplinks. Geen account nodig. Privacy-first.
          </p>

          {/* Perks */}
          <ul className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <span className="perk-dot">
                  <Check size={14} aria-hidden />
                </span>
                <span className="text-sm text-[var(--color-text)]">{p}</span>
              </li>
            ))}
          </ul>

          {/* CTA rail */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              variant="primary"
              size="lg"
              className="px-7 py-4 text-base md:text-lg cta-raise rounded-full"
              onClick={onCTAClick}
              aria-label="Start je gratis AI Style Report"
            >
              Start gratis
              <ArrowRight size={20} className="ml-2" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="px-7 py-4 text-base md:text-lg rounded-full"
              onClick={() => (window.location.href = "/results")}
              aria-label="Bekijk voorbeeldrapport"
            >
              Bekijk voorbeeld
            </Button>
          </div>

          {/* Trust-belt */}
          <div className="mt-6 trust-belt">
            <span>12.500+ rapporten</span>
            <span className="sep">·</span>
            <span>★★★★★ 4,8/5</span>
            <span className="sep">·</span>
            <span>Geen creditcard</span>
          </div>
        </div>

        {/* Visual */}
        <div className="hero-visual">
          <div className="hero-card" aria-hidden="true">
            <SmartImage id="nova-hero" kind="generic" alt="" className="h-full w-full object-cover" priority />
            {/* decoratief glanslaagje */}
            <div className="hero-glare" aria-hidden="true" />
            <div className="hero-base" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;