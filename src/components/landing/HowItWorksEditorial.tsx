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
      text: "Wij vertalen je antwoorden (en optioneel je foto) naar een persoonlijk profiel.",
    },
    {
      icon: ShoppingBag,
      title: "Krijg outfits & shoplinks",
      text: "Concrete outfits die werken voor silhouet en kleurtemperatuur — en shop gericht.",
    },
  ];

  return (
    <section className="ff-section alt-bg" aria-labelledby="hiw-title" aria-describedby="hiw-intro">
      <div className="ff-container">
        <header className="section-header anim-fade-up">
          <p className="kicker">Hoe het werkt</p>
          <h2 id="hiw-title" className="section-title">Van quiz naar outfits</h2>
          <p id="hiw-intro" className="section-intro">
            Vul de quiz in en krijg een stijlprofiel met outfits.
          </p>
        </header>

        <ol className="hiw-grid stagger-3" role="list">
          {steps.map((s) => (
            <li key={s.title} className="hiw-card card card-hover flow-sm" aria-label={s.title}>
              <div className="hiw-card__header">
                <span className="hiw-counter" aria-hidden="true" />
                <span className="icon-chip" aria-hidden>
                  <s.icon size={16} />
                </span>
              </div>
              <h3 className="card-title">{s.title}</h3>
              <p className="card-text">{s.text}</p>
            </li>
          ))}
        </ol>

        <div className="hiw-cta-rail cluster anim-fade-up" role="group" aria-label="Acties">
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