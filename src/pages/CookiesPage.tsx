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
# Cookiebeleid

**Laatst bijgewerkt:** 13 oktober 2025

FitFi gebruikt cookies en vergelijkbare technologieën om de dienst te laten werken en te verbeteren. Dit beleid legt uit welke cookies we gebruiken en waarom.

## 1. Wat zijn cookies?

Cookies zijn kleine tekstbestanden die je browser opslaat. Ze helpen websites om voorkeuren te onthouden en functionaliteit te bieden.

## 2. Welke cookies gebruiken we?

### Functionele cookies (essentieel)
Nodig om FitFi te laten werken. Kun je niet uitschakelen zonder dat de dienst stopt.

| Cookie | Doel | Bewaartermijn |
|--------|------|---------------|
| \`fitfi_session\` | Inlogstatus bijhouden | 7 dagen (sessie) |
| \`fitfi_prefs\` | Taal, thema (dark mode) | 1 jaar |
| \`fitfi_consent\` | Cookie-voorkeuren opslaan | 1 jaar |

**Rechtsgrond:** Overeenkomst (noodzakelijk voor dienstverlening)

### Analytische cookies (opt-out mogelijk)
Helpen ons begrijpen hoe je FitFi gebruikt, zodat we het kunnen verbeteren.

| Cookie | Doel | Bewaartermijn |
|--------|------|---------------|
| \`_fitfi_analytics\` | Geaggregeerde statistieken (paginaweergaven, klikken) | 12 maanden |
| \`_ab_variant\` | A/B tests (welke versie je ziet) | 30 dagen |

**Privacy-vriendelijk:**
- Geen IP-adressen opgeslagen
- Geanonimiseerd (niet herleidbaar naar personen)
- Geen cross-site tracking
- Eigen implementatie (geen Google Analytics of Meta Pixel)

**Rechtsgrond:** Gerechtvaardigd belang (art. 6 lid 1 sub f AVG)

### Marketing cookies
**We gebruiken GEEN marketing-cookies.** Geen:
- Facebook/Meta Pixel
- Google Ads tracking
- TikTok Pixel
- LinkedIn Insight Tag

## 3. Local Storage & Session Storage

We gebruiken ook **Local Storage** (browser-opslag):

- **fitfi_quiz_progress:** Quiz-voortgang (zodat je niet opnieuw hoeft te beginnen)
- **fitfi_onboarding_seen:** Onboarding-status
- **fitfi_theme:** Thema-voorkeur (dark/light)

**Verschil met cookies:** Local Storage wordt niet naar onze servers gestuurd, blijft altijd lokaal.

## 4. Third-party cookies

We gebruiken externe diensten die cookies kunnen plaatsen:

- **Supabase** (database/auth): Sessie-cookies (essentieel)
- **Stripe** (betalingen): Fraud-preventie cookies (PCI-DSS compliant)

Deze partijen hebben eigen cookiebeleid. We hebben verwerkersovereenkomsten (DPA's) met hen.

## 5. Voorkeuren beheren

### Browser-instellingen
Je kunt cookies blokkeren via je browser:

- **Chrome:** Instellingen → Privacy en beveiliging → Cookies
- **Firefox:** Instellingen → Privacy en beveiliging → Cookies
- **Safari:** Voorkeuren → Privacy → Cookies
- **Edge:** Instellingen → Privacy → Cookies

**Let op:** Functionele cookies blokkeren kan FitFi onbruikbaar maken.

### Opt-out analytische cookies
Klik hier om analytische cookies uit te schakelen:

👉 **[Cookie-instellingen wijzigen](#cookie-settings)** *(toekomstige feature)*

Je kunt ook een **Do Not Track** (DNT) signaal instellen in je browser. We respecteren DNT-headers.

## 6. Bewaartermijn

| Type | Bewaartermijn | Verwijdering |
|------|---------------|--------------|
| Sessie-cookies | Tot je browser sluit | Automatisch |
| Functionele cookies | Max. 1 jaar | Bij uitloggen of handmatig verwijderen |
| Analytische cookies | Max. 12 maanden | Automatisch na vervaldatum |
| Local Storage | Onbeperkt (totdat jij verwijdert) | Via browser-instellingen |

## 7. Cookies van externe content

Als je externe content ziet (bijv. embedded video's of social shares), kunnen die diensten cookies plaatsen. We minimaliseren dit door:

- **Geen** auto-load van YouTube/Vimeo embeds (click-to-play)
- **Geen** Facebook/Twitter embeds (privacy-mode waar mogelijk)

## 8. Wijzigingen

We kunnen dit beleid bijwerken. Grote wijzigingen kondigen we aan. Controleer regelmatig de datum bovenaan.

## 9. Meer informatie

- **Privacyverklaring:** [/privacy](/privacy)
- **AVG-rechten:** [privacy@fitfi.ai](mailto:privacy@fitfi.ai)
- **Klachten:** [Autoriteit Persoonsgegevens](https://autoriteitpersoonsgegevens.nl)

---

**Korte versie:**
Essentiële cookies (inloggen/voorkeuren) zijn nodig. Analytische cookies (geanonimiseerd) helpen ons verbeteren. Marketing-cookies gebruiken we niet. Je hebt volledige controle via browser-instellingen.
          `}
        />
      </main>
    </>
  );
}