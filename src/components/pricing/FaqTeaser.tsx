import React from "react";
import { ArrowRight, HelpCircle } from "lucide-react";
import Button from "@/components/ui/Button";

const quickFaqs = [
  {
    q: "Kan ik altijd opzeggen?",
    a: "Ja, je kunt elk moment opzeggen. Geen verborgen kosten of lange contracten.",
  },
  {
    q: "Hoe werkt de gratis versie?",
    a: "Je krijgt een volledig AI Style Report met 3 outfits. Geen creditcard nodig.",
  },
  {
    q: "Wat gebeurt er met mijn data?",
    a: "We bewaren alleen wat nodig is voor je rapport. Privacy-first, GDPR-compliant.",
  },
];

const FaqTeaser: React.FC = () => {
  return (
    <div className="faq-teaser">
      <header className="faq-header">
        <div className="faq-icon">
          <HelpCircle size={24} aria-hidden />
        </div>
        <h2 className="faq-title">Veelgestelde vragen</h2>
        <p className="faq-subtitle">
          Snel antwoord op de belangrijkste vragen over plannen en privacy.
        </p>
      </header>

      <div className="faq-grid">
        {quickFaqs.map((faq, i) => (
          <article key={i} className="faq-item">
            <h3 className="faq-question">{faq.q}</h3>
            <p className="faq-answer">{faq.a}</p>
          </article>
        ))}
      </div>

      <div className="faq-cta">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => (window.location.href = "/faq")}
          aria-label="Bekijk alle veelgestelde vragen"
        >
          Alle FAQ's bekijken
          <ArrowRight size={18} className="ml-2" aria-hidden />
        </Button>
      </div>
    </div>
  );
};

export default FaqTeaser;