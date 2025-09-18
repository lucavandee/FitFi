import React from "react";
import { Calendar, Lightbulb, Rocket, Target } from "lucide-react";

type Props = {
  className?: string;
};

const TimelineMini: React.FC<Props> = ({ className = "" }) => {
  const timeline = [
    {
      icon: Lightbulb,
      period: "Q1 2024",
      title: "Het idee",
      text: "Frustratie over overweldigende mode-apps leidt tot het concept: rustige AI-styling.",
    },
    {
      icon: Calendar,
      period: "Q2 2024",
      title: "Eerste prototype",
      text: "MVP met basis-quiz en outfit-matching. Eerste gebruikerstests bevestigen de behoefte.",
    },
    {
      icon: Rocket,
      period: "Q3 2024",
      title: "Beta launch",
      text: "Privé beta met 500 gebruikers. Computer vision en ML-modellen worden verfijnd.",
    },
    {
      icon: Target,
      period: "Nu",
      title: "Publieke launch",
      text: "FitFi is live. Focus op groei, feedback en uitbreiding naar meer stijlcategorieën.",
    },
  ];

  return (
    <div className={`timeline-mini ${className}`}>
      <ol className="timeline-list stagger-3" aria-label="Ontwikkelingstijdlijn">
        {timeline.map((item) => (
          <li key={item.period} className="timeline-item">
            <div className="timeline-marker">
              <span className="timeline-icon" aria-hidden="true">
                <item.icon size={14} />
              </span>
            </div>
            <div className="timeline-content">
              <time className="timeline-period">{item.period}</time>
              <h3 className="timeline-title">{item.title}</h3>
              <p className="timeline-text">{item.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default TimelineMini;