import React from "react";
import { Shield, Heart, Zap } from "lucide-react";

type Props = {
  className?: string;
};

const ValuesTrio: React.FC<Props> = ({ className = "" }) => {
  const values = [
    {
      icon: Shield,
      title: "",
      text: "Jouw data blijft van jou. Geen tracking, geen verkoop aan derden. Transparant over wat we wel en niet doen.",
    },
    {
      icon: Heart,
      title: "Zonder ruis",
      text: "Geen overweldigende keuzes of pushy marketing. Rustige interface, heldere adviezen, jouw tempo.",
    },
    {
      icon: Zap,
      title: "Toegankelijk",
      text: "Premium kwaliteit voor iedereen. Eerlijke prijzen, geen verborgen kosten, altijd een gratis optie.",
    },
  ];

  return (
    <div className={`values-trio ${className}`}>
      <ol className="values-grid stagger-3" aria-label="Onze kernwaarden">
        {values.map((value) => (
          <li key={value.title} className="value-card card card-hover flow-sm">
            <span className="icon-chip" aria-hidden="true">
              <value.icon size={16} />
            </span>
            <h3 className="card-title">{value.title}</h3>
            <p className="card-text">{value.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default ValuesTrio;