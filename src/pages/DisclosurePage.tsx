import React from 'react';
import { Helmet } from 'react-helmet-async';
import SectionHeader from "@/components/marketing/SectionHeader";
import MarkdownPage from '@/components/ui/MarkdownPage';

export default function DisclosurePage() {
  return (
    <>
      <Helmet>
        <title>Affiliate Disclosure - FitFi</title>
        <meta name="description" content="Uitleg over onze affiliate-relaties en hoe we commissies verdienen." />
        <link rel="canonical" href="https://www.fitfi.ai/disclosure" />
      </Helmet>

      <main className="min-h-screen bg-[var(--color-bg)]">
        <SectionHeader
          eyebrow="TRANSPARANTIE"
          title="Affiliate disclosure"
          subtitle="Hoe wij geld verdienen — en wat dat betekent voor jouw advies."
          align="left"
          as="h1"
          size="sm"
        />

        <MarkdownPage
          content={`
FitFi werkt met affiliate-partners. Wanneer je via onze links shopt, kan FitFi een commissie ontvangen.
Dit kost jou niets extra. Onze redactionele aanbevelingen blijven objectief en uitlegbaar.

## Waarom affiliate?

Zo kunnen we premium content en tooling blijven ontwikkelen zonder paywalls. We vermelden nooit betaald advies als "onafhankelijk".

## Transparantie

- Disclosure bij relevante pagina's en onder shopbare secties.
- Programvoorwaarden van partners worden gerespecteerd (geen merkterm-bidding, geen direct linking).
          `}
        />
      </main>
    </>
  );
}