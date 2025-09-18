import React from "react";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import SmartImage from "@/components/media/SmartImage";

type Props = { onCTAClick?: () => void; className?: string };

const Hero: React.FC<Props> = ({ onCTAClick, className = "" }) => {
  return (
    <section className={`pt-14 md:pt-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div className="max-w-2xl">
          <span className="accent-chip mb-5 inline-flex">
            <Sparkles size={16} aria-hidden />
            <span>Gratis AI Style Report</span>
          </span>

          <h1
            className="font-semibold tracking-tight text-[var(--color-text)]"
            style={{ fontSize: "clamp(2.125rem, 2.6vw + 1rem, 3.5rem)", lineHeight: 1.06 }}
          >
            AI Style Report — ontdek wat jouw stijl over je zegt
          </h1>

          <p
            className="mt-6 text-[var(--color-muted)]"
            style={{ fontSize: "clamp(1rem, .6vw + .8rem, 1.2rem)", lineHeight: 1.65, maxWidth: "52ch" }}
          >
            In <strong>2&nbsp;minuten</strong> een persoonlijk rapport met outfits die écht bij je passen — inclusief
            slimme shoplinks. Geen account nodig. Privacy-first.
          </p>

          {/* Benefits */}
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            {["100% gratis", "Klaar in 2 min", "Outfits + shoplinks"].map((b) => (
              <li key={b} className="flex items-center gap-2">
                <CheckCircle size={18} className="text-[var(--ff-color-primary-600)]" aria-hidden />
                <span className="text-sm text-[var(--color-text)]">{b}</span>
              </li>
            ))}
          </ul>

          {/* CTA rail */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              variant="primary"
              size="lg"
              className="px-7 py-4 text-base md:text-lg cta-raise"
              onClick={onCTAClick}
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

          {/* Trust-belt */}
          <div className="mt-6 text-sm text-[var(--color-muted)] flex flex-wrap items-center gap-y-2">
            <span>12.500+ rapporten</span>
            <span className="mx-3">·</span>
            <span>★★★★★ 4,8/5</span>
            <span className="mx-3">·</span>
            <span>Geen creditcard</span>
          </div>
        </div>

        {/* Visual — compacter en luxe frame zodat "Generic" fallback niet domineert */}
        <div className="relative flex justify-center lg:justify-end pb-8 md:pb-14">
          <div
            className="hero-art rounded-[var(--radius-lg)] premium-shadow-lg overflow-hidden"
            style={{ width: 360, height: 500 }}
            aria-hidden="true"
          >
            <SmartImage
              id="nova-hero"
              kind="generic"
              alt=""
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