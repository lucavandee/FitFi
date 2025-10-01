import React from "react";
import { NavLink } from "react-router-dom";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";
import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <PageHero
        id="hero"
        eyebrow="GRATIS AI STYLE REPORT"
        title="Ontdek wat jouw stijl over je zegt"
        subtitle="Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met outfits en shoplinks — privacy-first, zonder ruis."
        align="left"
        as="h1"
        size="lg"
        density="airy"             // <<< royale verticale spacing
        ctas={[
          { label: "Start gratis", to: "/registreren", variant: "primary" },
          { label: "Bekijk voorbeeld", to: "/results", variant: "secondary" },
        ]}
      >
        {/* Chips / selling points — compact en rustig */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm">100% gratis</span>
          <span className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm">Klaar in 2 min</span>
          <span className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm">Outfits + shoplinks</span>
          <span className="inline-flex items-center rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm">Privacy-first</span>
        </div>
      </PageHero>

      {/* Mini trust row — zeer discreet */}
      <section className="ff-container pb-16">
        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-[var(--color-text)]/80">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" aria-hidden />
            Privacy-first
          </span>
          <span className="inline-flex items-center gap-2">
            <Lock className="w-4 h-4" aria-hidden />
            AVG-compliant
          </span>
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" aria-hidden />
            Geverifieerde partners
          </span>
          <Button as={NavLink} to="/registreren" variant="primary" className="ml-auto">
            Start gratis
          </Button>
        </div>
      </section>
    </main>
  );
}