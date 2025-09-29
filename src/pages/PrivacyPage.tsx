import React from "react";
import { Helmet } from 'react-helmet-async';
import SectionHeader from "@/components/marketing/SectionHeader";
import MarkdownPage from '@/components/ui/MarkdownPage';

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy - FitFi</title>
        <meta name="description" content="Privacyverklaring van FitFi. Transparant over hoe we omgaan met je gegevens." />
      </Helmet>

      <main className="min-h-screen bg-[var(--color-bg)]">
        <SectionHeader
          eyebrow="PRIVACY"
          title="Privacy in gewoon Nederlands"
          subtitle="Wat we wel en niet doen met je data. Kort en eerlijk."
          align="left"
          as="h1"
          size="sm"
        />

        <MarkdownPage
          content={`
# Privacyverklaring

We verzamelen zo min mogelijk gegevens, uitsluitend om FitFi te laten werken en verbeteren. We verkopen nooit data.

## Welke gegevens verwerken we?

- Accountgegevens (e-mail, wachtwoord-hash)
- Stijlprofiel antwoorden (6 vragen)
- Technische logs (beperkt, voor foutanalyse)

## Waarom verwerken we die gegevens?

Om outfits te genereren, je voorkeuren te bewaren en de app te beveiligen/verbeteren.

## Hoe lang bewaren we je gegevens?

Zo kort mogelijk. Je kunt verwijderen en export aanvragen via support.

## Jouw rechten

- Inzage, rectificatie en dataportabiliteit
- Verwijderen van je account en gegevens
- Bezwaar maken tegen verwerking

## Contact

Vragen? Mail [privacy@fitfi.ai](mailto:privacy@fitfi.ai).
          `}
        />
      </main>
    </>
  );
}