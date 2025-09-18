import React from "react";
import { Sparkles, ClipboardCheck, ShoppingBag } from "lucide-react";

const steps = [
  { icon: Sparkles, title: "Beantwoord 6 vragen", text: "Vertel je stijlvoorkeuren en doelen." },
  { icon: ClipboardCheck, title: "Ontvang je rapport", text: "Persoonlijk profiel + outfits in 2 minuten." },
  { icon: ShoppingBag, title: "Shop slimmer", text: "Kies wat past bij silhouet en kleuren." },
];

const HowItWorksSnippet: React.FC = () => {
  return (
    <section aria-labelledby="hiw-snippet">
      <h2 id="hiw-snippet" className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-8">
        Hoe het werkt
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <article
            key={s.title}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)] hover-lift"
          >
            <s.icon className="text-[var(--ff-color-primary-600)]" size={24} aria-hidden />
            <h3 className="mt-3 text-lg font-medium text-[var(--color-text)]">{s.title}</h3>
            <p className="mt-2 text-[var(--color-muted)]">{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSnippet;