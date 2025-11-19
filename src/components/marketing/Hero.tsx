import React from "react";
import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-10%] w-[560px] h-[560px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(60% 60% at 50% 40%, rgba(103,232,249,.30), transparent)" }}
      />
      <Container className="pt-16 pb-10 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="ff-tag">AI-styling • Uitleg bij elke look</span>
          <h1 className="mt-4">Jouw persoonlijke stylist — aangedreven door AI</h1>
          <p className="mt-4 text-[var(--fitfi-muted)] text-[16px] leading-7">
            Wij vertalen je smaak naar outfits die kloppen. Slim, betaalbaar en direct shopbaar —
            inclusief korte uitleg waarom het werkt.
          </p>
          <div className="mt-6 flex items-center gap-10">
            <Button size="lg">Doe de stijlscan</Button>
            <a href="#previews" className="ff-ghost">Bekijk voorbeelden</a>
          </div>
          <div className="mt-6 flex items-center gap-3 text-[13px] text-[var(--fitfi-muted)]">
            <span className="ff-chip">Capsule-denkend</span>
            <span className="ff-chip">Budgetvriendelijk</span>
            <span className="ff-chip">Uitleg per outfit</span>
          </div>
        </div>

        <div className="ff-card p-3">
          <div className="aspect-[4/3] w-full rounded-[14px] overflow-hidden border border-white/10 ff-grad" />
          <div className="px-3 pb-3 pt-2 text-sm text-[var(--fitfi-muted)]">
            Live preview van een outfit
          </div>
        </div>
      </Container>
    </section>
  );
}