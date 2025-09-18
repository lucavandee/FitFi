import React from "react";
import { Sparkles, ClipboardCheck, ShoppingBag } from "lucide-react";

const steps = [
  { icon: Sparkles, title: "Beantwoord 6 vragen", text: "Vertel je stijlvoorkeuren en doelen." },
  { icon: ClipboardCheck, title: "Ontvang je rapport", text: "Persoonlijk profiel + outfits in 2 minuten." },
  { icon: ShoppingBag, title: "Shop slimmer", text: "Kies wat past bij silhouet en kleuren." },
];

const HowItWorksSnippet: React.FC = () => {
  return (
    <section aria-labelledby="hiw">
      <h2 id="hiw" className="section-title">Hoe het werkt</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((s) => (
          <article key={s.title} className="card card-hover">
            <div className="icon-chip" aria-hidden>
              <s.icon size={18} />
            </div>
            <h3 className="card-title">{s.title}</h3>
            <p className="card-text">{s.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSnippet;