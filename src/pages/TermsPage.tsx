import React from 'react';
import { Helmet } from 'react-helmet-async';
import SectionHeader from "@/components/marketing/SectionHeader";
import MarkdownPage from '@/components/ui/MarkdownPage';

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Algemene voorwaarden - FitFi</title>
        <meta name="description" content="Lees onze algemene voorwaarden. Duidelijke afspraken over het gebruik van FitFi's AI-stylist dienst." />
      </Helmet>

      <main className="min-h-screen bg-[var(--color-bg)]">
        <SectionHeader
          eyebrow="JURIDISCH"
          title="Algemene voorwaarden"
          subtitle="Duidelijke afspraken zodat jij nooit voor verrassingen staat."
          align="left"
          as="h1"
          size="sm"
        />

        <MarkdownPage
          content={`
# Algemene voorwaarden

*Laatst bijgewerkt: 15 januari 2025*

## 1. Dienstverlening

FitFi biedt een AI-gestuurde stylist service die gepersonaliseerde mode-adviezen en outfit suggesties levert. Onze service omvat:

- Persoonlijke stijlanalyse
- Outfit aanbevelingen
- Kledingadvies op basis van je voorkeuren
- Toegang tot onze AI-stylist

## 2. Gebruik van de dienst

### 2.1 Account
- Je account is strikt persoonlijk en mag niet worden gedeeld
- Je bent verantwoordelijk voor de veiligheid van je inloggegevens
- Bij misbruik kunnen we je account opschorten of beëindigen

### 2.2 Toegestaan gebruik
- De dienst is bedoeld voor persoonlijk, niet-commercieel gebruik
- Het is verboden om onze service te gebruiken voor illegale doeleinden
- Automatische data-extractie (scraping) is niet toegestaan

## 3. Abonnement en betaling

### 3.1 Abonnementsvormen
We bieden verschillende abonnementen aan met maandelijkse of jaarlijkse facturering.

### 3.2 Betaling
- Betaling gebeurt vooraf via de door ons ondersteunde betaalmethoden
- Bij niet-betaling wordt je toegang opgeschort
- Prijswijzigingen worden 30 dagen van tevoren aangekondigd

### 3.3 Opzegging
- Je kunt je abonnement op elk moment opzeggen
- Opzegging gaat in aan het einde van de lopende periode
- Reeds betaalde bedragen worden niet terugbetaald

## 4. Privacy en gegevens

We verwerken je gegevens conform ons privacybeleid. Door gebruik te maken van onze dienst stem je in met deze verwerking.

## 5. Aansprakelijkheid

### 5.1 Onze inspanningen
We streven ernaar om onze dienst zo goed mogelijk te leveren, maar kunnen geen 100% beschikbaarheid garanderen.

### 5.2 Beperking aansprakelijkheid
Onze aansprakelijkheid is beperkt tot het bedrag dat je in de 12 maanden voorafgaand aan de schade hebt betaald, met een maximum van €500.

### 5.3 Uitgesloten schade
We zijn niet aansprakelijk voor indirecte schade, gevolgschade of gederfde winst.

## 6. Wijzigingen

We kunnen deze voorwaarden wijzigen. Belangrijke wijzigingen kondigen we 30 dagen van tevoren aan via email.

## 7. Toepasselijk recht

Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Nederland.

## Contact

Vragen over deze voorwaarden? Neem contact met ons op via [email protected]
          `}
        />
      </main>
    </>
  );
}