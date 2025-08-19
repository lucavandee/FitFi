import React from 'react';
import Seo from '@/components/Seo';

export default function CookiesPage() {
  return (
    <div className="section">
      <Seo title="Cookie Policy" description="Informatie over cookies en jouw keuzes." canonical="https://www.fitfi.ai/cookies" />
      <div className="container">
        <h1 className="text-ink text-3xl md:text-4xl font-extrabold">Cookie Policy</h1>
        <div className="prose max-w-3xl mt-6">
          <p>We gebruiken cookies voor (1) strikt noodzakelijke functies en (2) optionele analytics/marketing (alleen met toestemming).</p>
          <h2>Jouw keuzes</h2>
          <p>Je kunt je voorkeuren beheren via de knop "Cookie-instellingen" in de footer.</p>
          <h2>Types cookies</h2>
          <ul>
            <li><strong>Noodzakelijk</strong> – login, beveiliging, load balancing.</li>
            <li><strong>Analytics</strong> – sitegebruik verbeteren (alleen met toestemming).</li>
            <li><strong>Marketing</strong> – alleen indien expliciet ingeschakeld.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}