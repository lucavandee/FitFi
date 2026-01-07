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

**Laatst bijgewerkt:** 7 januari 2026

FitFi verwerkt persoonsgegevens uitsluitend om je stijladvies te tonen en de dienst te verbeteren. Privacy betekent voor ons: minimale dataverzameling, transparantie en volledige controle voor jou.

## 1. Wie is verantwoordelijk?

**FitFi** (handelsnaam)
E-mail: [privacy@fitfi.ai](mailto:privacy@fitfi.ai)

We handelen conform de Algemene Verordening Gegevensbescherming (AVG/GDPR) en Nederlandse privacywetgeving.

## 2. Welke gegevens verzamelen we?

### Accountgegevens
- E-mailadres (voor login en communicatie)
- Wachtwoord (encrypted/hashed, niet leesbaar door ons)
- Account-aanmaakdatum en laatste login

### Stijlprofiel
- Antwoorden op de stijlquiz (6 vragen over voorkeuren, lichaamsbouw, doelen)
- Optioneel: foto's die je uploadt (alleen met expliciete toestemming)
- Gegenereerde outfits en opgeslagen favorieten

### Technische gegevens
- IP-adres (tijdelijk, voor beveiliging en foutopsporing)
- Browser-type, apparaat-type, schermresolutie
- Foutlogs (geanonimiseerd waar mogelijk)

### Analytische gegevens (opt-in vereist)
- Paginaweergaven, klikken, sessieduur (via Google Analytics, **alleen met toestemming**)
- A/B test varianten (zonder persoonlijke identificatie)
- **IP-adressen geanonimiseerd** (laatste octet verwijderd)
- **Data transfer naar VS** (Google LLC servers in Verenigde Staten)

### Betalingsgegevens
- Bij premium-abonnementen: transactie-ID en abonnementsstatus
- **Geen** volledige creditcardgegevens (afgehandeld door payment provider)

## 3. Waarom verwerken we deze gegevens?

| Doel | Rechtsgrond (AVG) |
|------|-------------------|
| Account aanmaken en inloggen | Overeenkomst (art. 6 lid 1 sub b AVG) |
| Stijladvies genereren | Overeenkomst + Gerechtvaardigd belang |
| Dienst verbeteren (A/B tests, analytics) | Gerechtvaardigd belang (art. 6 lid 1 sub f AVG) |
| Beveiliging en fraudepreventie | Gerechtvaardigd belang |
| Wettelijke verplichtingen (bijv. boekhouden) | Wettelijke verplichting (art. 6 lid 1 sub c AVG) |

## 4. Met wie delen we gegevens?

We verkopen **nooit** data. We delen alleen met:

- **Hosting/Database:** Supabase (EU-servers Frankfurt, AVG-compliant)
- **Analytics:** Google Analytics (VS, **alleen met jouw toestemming**, IP geanonimiseerd)
- **Payments:** Stripe (PCI-DSS certified, alleen transactie-metadata)
- **Support/Foutopsporing:** Sentry (foutlogs, geanonimiseerd)

**⚠️ Belangrijke opmerking over Google Analytics:**
Als je analytische cookies accepteert, worden geanonimiseerde gebruiksgegevens verstuurd naar Google LLC servers in de Verenigde Staten. Dit valt onder Schrems II wetgeving. Wij hebben:
- ✅ IP-anonymisatie ingeschakeld
- ✅ Data Processing Amendment met Google afgesloten
- ✅ Geen advertising features geactiveerd
- ✅ Geen user-ID tracking

**Je kunt deze cookies op elk moment uitschakelen in je [profielinstellingen](/profiel).**

Alle andere partijen hebben verwerkersovereenkomsten (DPA's) en handelen conform AVG.

## 5. Hoe lang bewaren we gegevens?

| Data-type | Bewaartermijn |
|-----------|---------------|
| Accountgegevens | Zolang account actief + 30 dagen na verwijdering |
| Stijlprofiel | Zolang account actief |
| Technische logs | Maximaal 90 dagen |
| Analytische data | 12 maanden (geaggregeerd, niet herleidbaar) |
| Betalingsrecords | 7 jaar (wettelijke eis boekhouden) |

## 6. Jouw rechten (AVG)

Je hebt **altijd** de volgende rechten:

1. **Inzage** (art. 15): overzicht van alle data die we van jou hebben
2. **Rectificatie** (art. 16): onjuiste gegevens corrigeren
3. **Verwijdering** (art. 17): account + data volledig wissen
4. **Dataportabiliteit** (art. 20): export van je gegevens (JSON-formaat)
5. **Bezwaar** (art. 21): bezwaar maken tegen bepaalde verwerking
6. **Beperking** (art. 18): verwerking tijdelijk bevriezen

**Hoe?** Stuur een e-mail naar [privacy@fitfi.ai](mailto:privacy@fitfi.ai). We reageren binnen **30 dagen** (AVG-termijn).

Je kunt ook een **klacht indienen** bij de Autoriteit Persoonsgegevens (AP): [autoriteitpersoonsgegevens.nl](https://autoriteitpersoonsgegevens.nl)

## 7. Beveiliging

We nemen passende technische en organisatorische maatregelen:

- **Encryptie:** HTTPS (TLS 1.3), wachtwoorden gehashed (bcrypt)
- **Toegangscontrole:** Minimale rechten, 2FA voor teamleden
- **Monitoring:** Real-time detectie van verdachte activiteit
- **Back-ups:** Encrypted, geo-redundant
- **Audits:** Regelmatige security reviews

## 8. Cookies & tracking

Zie onze [Cookiepagina](/cookies) voor volledige details. Samenvatting:

- **Functioneel:** Sessie, taal, thema (essentieel, altijd aan)
- **Analytisch:** Google Analytics (opt-in vereist, IP geanonimiseerd, data naar VS)
- **Marketing:** Geen third-party tracking pixels of advertentienetwerken

**Beheer je cookie-voorkeuren:**
- Via je [Profiel → Privacy & Cookies](/profiel)
- Via browser-instellingen
- Cookie banner bij eerste bezoek

**Consent intrekken:**
Je kunt je toestemming op elk moment intrekken. Alle analytische cookies worden dan onmiddellijk verwijderd.

## 9. Kinderen

FitFi is bedoeld voor 16+. We verzamelen niet bewust gegevens van jongeren onder 16 zonder ouderlijke toestemming.

## 10. Internationale overdracht (Schrems II)

### EU Data Storage
- **Supabase:** Alle gebruikersdata wordt opgeslagen in EU (Frankfurt, Duitsland)
- **Database & Auth:** 100% EU-gehost, geen US transfer

### US Data Transfer
Alleen bij expliciete toestemming:

| Service | Data Transfer | Rechtsgrond | Waarborgen |
|---------|---------------|-------------|------------|
| **Google Analytics** | VS (USA) | Toestemming (opt-in) | IP-anonymisatie, DPA, minimale data |
| **Stripe** | VS & EU | Overeenkomst (noodzakelijk) | EU-US DPF, PCI-DSS, DPA |

**Google Analytics (Schrems II compliance):**
- ⚠️ Data wordt verstuurd naar Google LLC (VS)
- ✅ **Opt-in vereist** (niet standaard actief)
- ✅ **IP-anonymisatie** (laatste octet verwijderd)
- ✅ **Data Processing Amendment** met Google
- ✅ **Geen advertenties** of cross-site tracking
- ✅ **Intrekbare toestemming** (verwijder cookies in profiel)

**Alternatief:** Je kunt FitFi volledig gebruiken zonder analytische cookies. Alle functionaliteit blijft beschikbaar.

## 11. Wijzigingen

We kunnen deze verklaring bijwerken. Grote wijzigingen kondigen we aan via e-mail of in-app. Controleer regelmatig de datum bovenaan.

## 12. Contact & vragen

**Privacy Officer:** [privacy@fitfi.ai](mailto:privacy@fitfi.ai)
**Algemene vragen:** [/contact](/contact)
**FAQ:** [/veelgestelde-vragen](/veelgestelde-vragen)

---

**Korte versie:**
We verzamelen alleen wat nodig is, delen nooit met marketeers, geven jou volledige controle en volgen strikte EU-privacy-regels. Vragen? We staan klaar.
          `}
        />
      </main>
    </>
  );
}