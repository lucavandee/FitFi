// src/pages/FaqPage.tsx
import React from "react";
import Seo from "@/components/Seo";
import { ChevronDown } from "lucide-react";

const QA = ({ q, a }: { q: string; a: string }) => (
  <details>
    <summary>
      <span>{q}</span>
      <ChevronDown className="chev w-4 h-4" aria-hidden="true" />
    </summary>
    <div className="faq__content">{a}</div>
  </details>
);

const FaqPage: React.FC = () => {
  return (
    <>
      <Seo 
        title="Veelgestelde vragen - FitFi"
        description="Vind antwoorden op de meest gestelde vragen over FitFi's AI style quiz en gepersonaliseerde outfit aanbevelingen."
        canonical="https://fitfi.ai/veelgestelde-vragen"
      />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
      <section className="section" aria-labelledby="faq-title">
        <div className="container">
          <h1 id="faq-title" className="hero__title text-[clamp(2rem,5vw,2.6rem)]">Veelgestelde vragen</h1>
          <p className="lead mt-3">Kort, duidelijk en zonder ruis. Vind je geen antwoord? Stuur ons een bericht.</p>

          <div className="faq mt-8 max-w-3xl">
            <QA q="Wat krijg ik gratis?"
               a="De korte stijltest, een basisprofiel en drie outfit-richtingen. Zo proef je direct of het klikt." />
            <QA q="Wat zit er in Pro?"
               a="Alles van Starter plus een volledig stijlrapport (PDF), seizoensupdates en 10+ outfits met compacte uitleg per outfit." />
            <QA q="Hoe gaat FitFi om met data?"
               a="We verwerken zo min mogelijk en zijn transparant. Profielen worden alleen bewaard met toestemming." />
            <QA q="Is dit voor mannen of vrouwen?"
               a="Allebei. De AI past outfits aan op je silhouet, stijl en gelegenheid." />
          </div>
        </div>
      </section>
      </main>
    </>
  );
};
export default FaqPage;