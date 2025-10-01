import React from "react";
import { NavLink } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import Button from "@/components/ui/Button";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="FitFi — Ontdek wat jouw stijl over je zegt"
        description="Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met outfits en shoplinks — privacy-first, zonder ruis."
        path="/"
      />

      <section className="relative">
        <div className={["ff-container","pt-16 sm:pt-20 md:pt-24 lg:pt-28","pb-12 sm:pb-14 md:pb-16"].join(" ")}>
          <div className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm tracking-wide">
            GRATIS AI STYLE REPORT
          </div>

          <h1 className="mt-5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.08] max-w-[22ch]">
            Ontdek wat jouw stijl over je zegt
          </h1>
          <div className="mt-4 h-[3px] w-24 rounded-full bg-[var(--color-border)]" aria-hidden />

          <p className="mt-5 text-base sm:text-lg md:text-xl text-[var(--color-text)]/80 max-w-[56ch]">
            Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met
            outfits en shoplinks — privacy-first, zonder ruis.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row flex-wrap gap-3">
            <Button as={NavLink} to="/stijlquiz" variant="primary" size="lg">
              Start gratis
            </Button>
            <Button as={NavLink} to="/results" variant="secondary" size="lg">
              Bekijk voorbeeld
            </Button>
          </div>

          <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm">100% gratis</span>
            <span className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm">Klaar in 2 min</span>
            <span className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm">Outfits + shoplinks</span>
            <span className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm">Privacy-first</span>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[var(--color-text)]/80">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="w-4 h-4" aria-hidden />Privacy-first</span>
            <span className="inline-flex items-center gap-2"><Lock className="w-4 h-4" aria-hidden />AVG-compliant</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="w-4 h-4" aria-hidden />Geverifieerde partners</span>
          </div>
        </div>
      </section>
    </main>
  );
}