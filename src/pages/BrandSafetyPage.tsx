import React from 'react';
import { Helmet } from 'react-helmet-async';
import SectionHeader from "@/components/marketing/SectionHeader";
import { Shield, Eye, Heart, CheckCircle } from 'lucide-react';

export default function BrandSafetyPage() {
  return (
    <div className="section">
      <Helmet>
        <title>Brand Safety & Editorial</title>
        <meta name="description" content="Onze richtlijnen voor merkveiligheid, redactionele integriteit en advertentiebeleid." />
        <link rel="canonical" href="https://www.fitfi.ai/brand-safety" />
      </Helmet>

      <main className="min-h-screen bg-[var(--color-bg)]">
        <SectionHeader
          eyebrow="BRAND SAFETY"
          title="Onze belofte: stijl vóór sales"
          subtitle="Transparant, editorial onafhankelijk en privacy-eerlijk."
          align="left"
          as="h1"
          size="sm"
        />

        <div className="max-w-4xl mx-auto px-4 py-12">

        <div className="prose max-w-3xl mt-6">
          <h2>Onze belofte</h2>
          <ul>
            <li><strong>Content-first</strong>: wij zijn een premium <em>content publisher</em> (geen coupon/cashback site).</li>
            <li><strong>Disclosure & compliance</strong>: affiliate-disclosure op relevante pagina's, en GDPR-conforme consent.</li>
            <li><strong>Geen merkterm-bidding</strong>: wij bieden niet op adverteerders-merktermen in SEA en gebruiken geen direct linking.</li>
            <li><strong>Geen misleiding</strong>: geen clickbait, geen nep-reviews, geen ongeautoriseerde merkassets.</li>
            <li><strong>Editorial onafhankelijk</strong>: ons advies blijft objectief en menselijk uitlegbaar.</li>
          </ul>

          <h2>Advertentie- & partnershipregels</h2>
          <ul>
            <li>We gebruiken <strong>SubID's</strong> voor transparante herkomstmeting.</li>
            <li>We respecteren <strong>programvoorwaarden</strong> van elke adverteerder (o.a. merkbidding, direct linking, kanaalrestricties).</li>
            <li>We publiceren alleen content die <strong>brand-safe</strong> is voor mainstream audiences (geen adult/gok/illegal).</li>
          </ul>

          <h2>Redactionele standaarden</h2>
          <ul>
            <li>Uitleg bij outfits: <em>waarom</em> een combinatie past (kleur, silhouet, seizoen, archetype).</li>
            <li>Beeldgebruik: eigen visuals of royalty-free; geen ongeautoriseerde merklogo's.</li>
            <li>Correcties: onjuistheden herstellen we snel en transparant.</li>
          </ul>

          <p className="text-sm text-gray-500 mt-8">Vragen van merken? Mail ons via <a href="mailto:partners@fitfi.ai">partners@fitfi.ai</a>.</p>
        </div>
        </div>
      </main>
    </div>
  );
}