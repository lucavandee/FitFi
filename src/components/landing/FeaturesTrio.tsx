import React from "react";
import { Clock, Palette, ShieldCheck } from "lucide-react";

const items = [
  { icon: Clock, title: "Supersnel", text: "In 2 minuten een helder advies." },
  { icon: Palette, title: "Persoonlijk", text: "Outfits op maat van jouw smaak." },
  { icon: ShieldCheck, title: "Privacy-first", text: "We gaan zorgvuldig met je data om." },
];

const FeaturesTrio: React.FC = () => (
  <section aria-labelledby="features-trio">
    <h2 id="features-trio" className="text-2xl md:text-3xl font-semibold text-[var(--color-text)] mb-8">
      Waarom FitFi
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((f) => (
        <article
          key={f.title}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-soft)]"
        >
          <f.icon className="text-[var(--ff-color-primary-600)]" size={24} aria-hidden />
          <h3 className="mt-3 text-lg font-medium text-[var(--color-text)]">{f.title}</h3>
          <p className="mt-2 text-[var(--color-muted)]">{f.text}</p>
        </article>
      ))}
    </div>
  </section>
);

export default FeaturesTrio;