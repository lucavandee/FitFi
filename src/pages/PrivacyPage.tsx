import React from 'react';
import Seo from '@/components/Seo';

const PrivacyPage: React.FC = () => {
  return (
    <>
      <Seo 
        title="Privacy - FitFi"
        description="Lees ons privacybeleid en ontdek hoe FitFi jouw persoonlijke gegevens beschermt en gebruikt."
        canonical="https://fitfi.ai/privacy"
      />
      <main id="main" className="bg-[var(--color-bg)] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-8">
            Privacybeleid
          </h1>

          <div className="prose prose-lg max-w-none text-[var(--color-text)]">
            <p>Wij respecteren je privacy. Deze policy beschrijft welke persoonsgegevens we verwerken en waarom.</p>

            <h2>Verwerkingsdoelen</h2>
            <ul>
              <li>Account & dienstverlening (stijlquiz, rapporten, outfits).</li>
              <li>Analytics (geanonimiseerd waar mogelijk) om de service te verbeteren.</li>
              <li>Marketing (alleen met toestemming, opt-out altijd beschikbaar).</li>
            </ul>

            <h2>Soorten gegevens</h2>
            <ul>
              <li>Profielgegevens die je actief invult (bv. maat/voorkeuren).</li>
              <li>Technische data (device/OS, IP, cookie-ID's) t.b.v. beveiliging en analytics.</li>
            </ul>

            <h2>Rechtsgronden</h2>
            <ul>
              <li>Toestemming (bijv. voor marketing cookies/nieuwsbrief).</li>
              <li>Uitvoering van overeenkomst (account/rapporten).</li>
              <li>Gerechtvaardigd belang (beveiliging, misbruikpreventie).</li>
            </ul>

            <h2>Bewaartermijnen & derden</h2>
            <p>We bewaren niet langer dan nodig. We delen alleen data met verwerkers die onze dienst mogelijk maken en passende beveiliging bieden.</p>

            <h2>Jouw rechten</h2>
            <p>Je kunt inzage, correctie of verwijdering vragen via <a href="mailto:privacy@fitfi.ai">privacy@fitfi.ai</a>.</p>
          </div>
        </div>
      </main>
    </>
  );
};

export default PrivacyPage;