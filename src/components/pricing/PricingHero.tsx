import React from "react";
import PageHeroStacked from "@/components/marketing/PageHeroStacked";

type Props = {
  onStart?: () => void;
  onExample?: () => void;
};

const PricingHero: React.FC<Props> = ({ onStart, onExample }) => {
  return (
    <PageHeroStacked
      kicker="Prijzen"
      title="Kies rustig. Start gratis — upgrade wanneer jij wil"
      lead="Je begint met een gratis AI Style Report. Daarna kun je eventueel uitbreiden met premium features. Geen creditcard nodig."
      chips={["Gratis starten", "Opzeggen kan altijd", "Geen creditcard"]}
      imageId="hero-main"
      imageAlt="Pricing hero visual"
      focal="50% 45%"
      primaryLabel="Start gratis"
      secondaryLabel="Bekijk voorbeeld"
      onPrimary={onStart}
      onSecondary={onExample}
    />
  );
};

export default PricingHero;