import React from "react";

type Props = {
  onCTAClick?: () => void;
  onExampleClick?: () => void;
};

const Hero: React.FC<Props> = ({ onCTAClick, onExampleClick }) => {
  return (
    <section className="ff-section bg-[var(--color-bg)]">
      <div className="ff-container grid items-center gap-10 lg:grid-cols-12">
        {/* Copy */}
        <div className="lg:col-span-7">
          <p className="kicker">Gratis AI Style Report</p>

          <h1 className="section-title">Ontdek wat jouw stijl over je zegt</h1>

          <p className="section-intro">
            Beantwoord 6 korte vragen en ontvang direct een persoonlijk
            stijlprofiel met outfits en shoplinks — privacy-first, zonder ruis.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onCTAClick}
              aria-label="Start gratis"
            >
              Start gratis
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={onExampleClick}
              aria-label="Bekijk voorbeeld"
            >
              Bekijk voorbeeld
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip">100% gratis</span>
            <span className="chip">Klaar in 2 min</span>
            <span className="chip">Outfits + shoplinks</span>
            <span className="chip">Privacy-first</span>
          </div>
        </div>

        {/* Visual — tokens-first gradient card + plinth (zoals live) */}
        <div className="lg:col-span-5">
          <div className="relative w-full ml-auto max-w-[680px]">
            <div
              aria-hidden="true"
              className="hero-gradient block w-full h-auto aspect-[4/3] rounded-[var(--radius-2xl)] shadow-[var(--shadow-soft)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-3 left-1/2 h-3 w-[82%] -translate-x-1/2 rounded-[var(--radius-lg)] bg-[var(--color-surface)] border border-[var(--color-border)] shadow-[var(--shadow-soft)]"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;