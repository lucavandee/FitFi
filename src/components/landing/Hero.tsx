import React from "react";
import { Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import SmartImage from "@/components/media/SmartImage";

const Hero: React.FC = () => {
  const start = () => (window.location.href = "/dynamic-onboarding");
  const how = () => (window.location.href = "/hoe-het-werkt");

  return (
    <section className="section bg-[color:var(--color-bg)]" aria-labelledby="hero-heading">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Copy */}
            <div className="inline-flex items-center gap-2 chip mb-4">
            <div className="hero__eyebrow">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>AI-Powered Styling</span>
            </div>

            <p className="lead mt-4 max-w-2xl">
              id="hero-heading"
              className="hero__title text-[clamp(2.25rem,5.5vw,3.4rem)]"
            >
              Ontdek jouw perfecte stijl met AI
            </h1>

            <p className="hero__lead mt-4">
              Van persoonlijkheidstest tot gepersonaliseerde outfits — inclusief korte uitleg
              waarom het bij je silhouet, materialen en kleurtemperatuur past.
            </p>
            <ul className="mt-6 flex flex-col gap-3">
            <ul className="hero__benefits mt-5">
              {["Gratis persoonlijkheidstest","AI-gepersonaliseerde outfits","Nederlandse merken"].map((s)=>(
                <li key={s} className="flex items-center gap-2 text-sm">
                <li key={t} className="inline-flex items-center gap-3 text-sm">
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={start} className="btn btn-primary btn-lg" aria-label="Start AI Style Report">
                Ja, geef mij mijn gratis AI Style Report
                <ArrowRight className="w-4 h-4" />
              </button>

              <button onClick={how} className="btn btn-ghost btn-lg" aria-label="Hoe FitFi werkt">
                Hoe werkt het?
              </button>
            </div>
          </div>

          {/* Visual */}
          <div>
            <div className="hero__card">
              <div className="p-4 sm:p-6">
                <SmartImage
                  src="/images/nova.svg"
                  alt="Nova AI Assistant"
                  aspect="4/5"
                  containerClassName="rounded-[20px]"
                  imgClassName="rounded-[20px]"
                  eager
                  priority
                />
              </div>
              <div className="hero__card-footer">
                <div className="text-sm font-semibold">Nova AI Assistant</div>
                <div className="text-xs muted">Jouw persoonlijke styling-expert bij elke outfitkeuze.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
    )
    }
    </section>
  );
};

export default Hero;