import React from "react";
import { ClipboardList, Sparkles, ShoppingBag } from "lucide-react";
import Button from "@/components/ui/Button";

type Props = { onStart?: () => void; onExample?: () => void };

const HowItWorksEditorial: React.FC<Props> = ({ onStart, onExample }) => {
  const steps = [
    {
      icon: ClipboardList,
      title: "Beantwoord 6 vragen",
      text: "Vertel je stijlvoorkeuren en doelen. Klaar in minder dan 2 minuten.",
    },
    {
      icon: Sparkles,
      title: "Ontvang je AI Style Report",
      text: "Modellen vertalen je antwoorden (en optioneel je foto) naar een persoonlijk profiel.",
    },
    {
      icon: ShoppingBag,
      title: "Krijg outfits & shoplinks",
      text: "Zie concrete outfits die werken voor silhouet en kleurtemperatuur — en shop gerichter.",
    },
  ];

  return (
    <section className="ff-section alt-bg" aria-labelledby="hiw-title">
      <div className="ff-container">
        <header className="flow-sm max-w-3xl anim-fade-up">
          <h2 id="hiw-title" className="section-title">Hoe het werkt</h2>
          <p className="text-[var(--color-muted)]">
            Rustig, stap-voor-stap — zonder ruis.
          </p>
        </header>

        {/* Staggered cards */}
        <ol className="hiw-grid stagger-3 mt-6">
          {steps.map((s, i) => (
            <li key={s.title} className="hiw-card card card-hover flow-sm" aria-label={`Stap ${i + 1}`}>
              <span className="icon-chip" aria-hidden>
                <s.icon size={16} />
              </span>
              <h3 className="card-title">{s.title}</h3>
              <p className="card-text">{s.text}</p>
            </li>
          ))}
        </ol>

        {/* CTA rail met subtiele fade-up */}
        <div className="hiw-cta-rail cluster mt-6 anim-fade-up">
          <Button variant="primary" size="lg" className="cta-raise" onClick={onStart}>
            Start gratis
          </Button>
          <Button variant="ghost" size="lg" onClick={onExample}>
            Bekijk voorbeeld
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksEditorial;