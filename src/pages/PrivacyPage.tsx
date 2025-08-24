import React from "react";
import Seo from "@/components/Seo";

export default function PrivacyPage() {
  return (
    <div className="section">
      <Seo
        title="Privacy Policy"
        description="Hoe FitFi met persoonsgegevens omgaat."
        canonical="https://www.fitfi.ai/privacy"
      />
      <div className="container">
        <h1 className="text-ink text-3xl md:text-4xl font-extrabold">
          Privacy Policy
        </h1>

        <div className="prose max-w-3xl mt-6">
          <p>
            Wij respecteren je privacy. Deze policy beschrijft welke
            persoonsgegevens we verwerken en waarom.
          </p>

          <h2>Verwerkingsdoelen</h2>
          <ul>
            <li>Account & dienstverlening (stijlquiz, rapporten, outfits).</li>
            <li>
              Analytics (geanonimiseerd waar mogelijk) om de service te
              verbeteren.
            </li>
            <li>
              Marketing (alleen met toestemming, opt-out altijd beschikbaar).
            </li>
          </ul>

          <h2>Soorten gegevens</h2>
          <ul>
            <li>Profielgegevens die je actief invult (bv. maat/voorkeuren).</li>
            <li>
              Technische data (device/OS, IP, cookie-ID's) t.b.v. beveiliging en
              analytics.
            </li>
          </ul>

          <h2>Rechtsgronden</h2>
          <ul>
            <li>Toestemming (bijv. voor marketing cookies/nieuwsbrief).</li>
            <li>Uitvoering van overeenkomst (account/rapporten).</li>
            <li>Gerechtvaardigd belang (beveiliging, misbruikpreventie).</li>
          </ul>

          <h2>Bewaartermijnen & derden</h2>
          <p>
            We bewaren niet langer dan nodig. We delen alleen data met
            verwerkers die onze dienst mogelijk maken en passende beveiliging
            bieden.
          </p>

          <h2>Jouw rechten</h2>
          <p>
            Je kunt inzage, correctie of verwijdering vragen via{" "}
            <a href="mailto:privacy@fitfi.ai">privacy@fitfi.ai</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
