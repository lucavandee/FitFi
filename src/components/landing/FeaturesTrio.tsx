import React from "react";
import { Clock, Palette, ShieldCheck } from "lucide-react";

const items = [
  { icon: Clock, title: "Supersnel", text: "In 2 minuten een helder advies." },
  { icon: Palette, title: "Persoonlijk", text: "Outfits op maat van jouw smaak." },
  { icon: ShieldCheck, title: "Privacy-first", text: "We gaan zorgvuldig met je data om." },
];

const FeaturesTrio: React.FC = () => {
  return (
    <section aria-labelledby="features-trio">
      <h2 id="features-trio" className="section-title">Waarom FitFi</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((f) => (
          <article key={f.title} className="card card-hover">
            <div className="icon-chip" aria-hidden>
              <f.icon size={18} />
            </div>
            <h3 className="card-title">{f.title}</h3>
            <p className="card-text">{f.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturesTrio;