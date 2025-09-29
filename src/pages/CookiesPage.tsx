import React from "react";
import { Helmet } from 'react-helmet-async';
import SectionHeader from "@/components/marketing/SectionHeader";
import MarkdownPage from '@/components/ui/MarkdownPage';

export default function CookiesPage() {
  return (
    <>
      <Helmet>
        <title>Cookies - FitFi</title>
        <meta name="description" content="Helder cookiebeleid - functionele en analytische cookies, geen marketing-tracking." />
      </Helmet>

      <main className="min-h-screen bg-[var(--color-bg)]">
        <SectionHeader
          eyebrow="COOKIES"
          title="Cookies & voorkeuren"
          subtitle="We houden het licht en relevant — je hebt de regie."
          align="left"
          as="h1"
          size="sm"
        />

        <MarkdownPage
          content={`
## Soorten cookies

- **Functioneel:** sessie, taal, voorkeuren
- **Analytisch:** geaggregeerd gebruik om te verbeteren

## Voorkeuren beheren

Je kunt cookies beheren via je browserinstellingen. Functionele cookies zijn nodig om FitFi te laten werken.

## Bewaartermijn

Kort en proportioneel. Technische logs verlopen automatisch.
          `}
        />
      </main>
    </>
  );
}