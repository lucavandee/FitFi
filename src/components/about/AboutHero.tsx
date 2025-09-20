import React from "react";
import PageHeroStacked from "@/components/marketing/PageHeroStacked";

type Props = {
  onStart?: () => void;
  onExample?: () => void;
};

const AboutHero: React.FC<Props> = ({ onStart, onExample }) => {
  return (
    <PageHeroStacked
      kicker="Over FitFi"
      title="AI-gestuurde styling — ontworpen om rust te brengen in je garderobe"
      lead="We combineren computer vision met een menselijk oog voor stijl. Zo krijg jij advies zonder ruis: outfits die passen bij silhouet, materialen en kleurtemperatuur — privacy-first."
      chips={["Privacy-first", "Mens + AI", "NL ontwerp"]}
      imageId="hero-main"
      imageAlt="FitFi — visie en productvoorbeeld"
      focal="50% 40%"
      primaryLabel="Start gratis"
      secondaryLabel="Bekijk voorbeeld"
      onPrimary={onStart}
      onSecondary={onExample}
    />
  );
};

export default AboutHero;