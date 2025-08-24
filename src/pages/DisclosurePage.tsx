import React from "react";
import Seo from "@/components/Seo";

export default function DisclosurePage() {
  return (
    <div className="section">
      <Seo
        title="Affiliate Disclosure"
        description="Uitleg over onze affiliate-relaties en hoe we commissies verdienen."
        canonical="https://www.fitfi.ai/disclosure"
      />
      <div className="container">
        <h1 className="text-ink text-3xl md:text-4xl font-extrabold">
          Affiliate Disclosure
        </h1>

        <div className="prose max-w-3xl mt-6">
          <p>
            FitFi werkt met affiliate-partners. Wanneer je via onze links shopt,
            kan FitFi een commissie ontvangen. Dit kost jou niets extra. Onze
            redactionele aanbevelingen blijven objectief en uitlegbaar.
          </p>

          <h2>Waarom affiliate?</h2>
          <p>
            Zo kunnen we premium content en tooling blijven ontwikkelen zonder
            paywalls. We vermelden nooit betaald advies als "onafhankelijk".
          </p>

          <h2>Transparantie</h2>
          <ul>
            <li>
              Disclosure bij relevante pagina's en onder shopbare secties.
            </li>
            <li>
              Programvoorwaarden van partners worden gerespecteerd (geen
              merkterm-bidding, geen direct linking).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
