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

**Laatst bijgewerkt:** 7 januari 2026

FitFi gebruikt cookies en vergelijkbare technologieën om de dienst te laten werken en te verbeteren. Dit beleid legt uit welke cookies we gebruiken, waarom en hoe je ze kunt beheren.

## 1. Wat zijn cookies?

Cookies zijn kleine tekstbestanden die je browser opslaat. Ze helpen websites om voorkeuren te onthouden en functionaliteit te bieden.

## 2. Complete Cookie Inventory

### Functionele cookies (essentieel)
Nodig om FitFi te laten werken. Deze cookies kun je niet uitschakelen zonder dat de dienst stopt.

| Cookie Naam | Provider | Doel | Type | Bewaartermijn |
|-------------|----------|------|------|---------------|
| \`sb-<project>-auth-token\` | Supabase | Authenticatie sessie | HTTP-only | 7 dagen |
| \`ff_cookie_prefs\` | FitFi | Cookie-voorkeuren opslaan | LocalStorage | Permanent |
| \`fitfi_theme\` | FitFi | Dark/light mode voorkeur | LocalStorage | Permanent |

**Rechtsgrond:** Overeenkomst (noodzakelijk voor dienstverlening, art. 6 lid 1 sub b AVG)

### Analytische cookies (opt-in vereist)
Deze cookies helpen ons begrijpen hoe je FitFi gebruikt, zodat we de dienst kunnen verbeteren. **Ze worden ALLEEN geplaatst na jouw expliciete toestemming.**

| Cookie Naam | Provider | Doel | Type | Bewaartermijn | Data Transfer |
|-------------|----------|------|------|---------------|---------------|
| \`_ga\` | Google Analytics | Gebruikers onderscheiden | HTTP | 2 jaar | **VS (USA)** |
| \`_ga_<container-id>\` | Google Analytics | Sessie-status bijhouden | HTTP | 2 jaar | **VS (USA)** |
| \`_gid\` | Google Analytics | Gebruikers onderscheiden | HTTP | 24 uur | **VS (USA)** |
| \`_gat\` | Google Analytics | Request rate limiting | HTTP | 1 minuut | **VS (USA)** |

**⚠️ Belangrijke Privacy-informatie:**

- **US Data Transfer:** Google Analytics stuurt je gegevens naar servers in de Verenigde Staten. Dit valt onder Schrems II wetgeving.
- **IP Anonymization:** Wij hebben IP-anonymisatie ingeschakeld. Je volledige IP-adres wordt NIET opgeslagen.
- **Opt-in Required:** Deze cookies worden ALLEEN geplaatst als je "Analytische cookies" accepteert in onze cookie banner.
- **Geen Profiling:** Wij gebruiken Google Analytics NIET voor advertenties of gebruikersprofiling.

**Rechtsgrond:** Toestemming (art. 6 lid 1 sub a AVG)

### Marketing cookies
**We gebruiken GEEN marketing-cookies.** Geen:
- Facebook/Meta Pixel
- Google Ads tracking
- TikTok Pixel
- LinkedIn Insight Tag
- DoubleClick advertentienetwerk

## 3. Local Storage & Session Storage

We gebruiken ook **Local Storage** (browser-opslag):

| Item | Doel | Type | Data Transfer |
|------|------|------|---------------|
| \`fitfi_quiz_progress\` | Quiz-voortgang opslaan | LocalStorage | Nee (lokaal) |
| \`fitfi_onboarding_seen\` | Onboarding-status | LocalStorage | Nee (lokaal) |
| \`sb-<project>-auth-token\` | Auth token cache | LocalStorage | Nee (lokaal) |

**Verschil met cookies:** Local Storage wordt NIET automatisch naar onze servers gestuurd, blijft altijd lokaal in je browser.

## 4. Third-party cookies

We gebruiken externe diensten die cookies kunnen plaatsen:

| Service | Type | Doel | Privacy Policy | Data Transfer |
|---------|------|------|----------------|---------------|
| **Supabase** | Essentieel | Database & authenticatie | [Link](https://supabase.com/privacy) | EU (Frankfurt) |
| **Stripe** | Essentieel | Betalingsverwerking | [Link](https://stripe.com/privacy) | EU & US |
| **Google Analytics** | Analytisch | Gebruiksstatistieken | [Link](https://policies.google.com/privacy) | **VS (USA)** |

Alle partijen hebben verwerkersovereenkomsten (DPA's) en handelen conform AVG.

## 5. Voorkeuren beheren

### 🎯 Cookie-instellingen wijzigen

Je kunt je cookie-voorkeuren op elk moment wijzigen:

1. **Via je profiel:** Ga naar [Profiel → Account → Cookie-instellingen](/profiel)
2. **Via browser:** Verwijder cookies handmatig (zie hieronder)
3. **Do Not Track:** We respecteren DNT-headers in je browser

### Browser-instellingen
Je kunt cookies blokkeren via je browser:

- **Chrome:** Instellingen → Privacy en beveiliging → Cookies en andere sitegegevens
- **Firefox:** Instellingen → Privacy en beveiliging → Cookies en sitegegevens
- **Safari:** Voorkeuren → Privacy → Cookies en websitegegevens
- **Edge:** Instellingen → Privacy, zoeken en services → Cookies

**Let op:** Functionele cookies blokkeren kan FitFi onbruikbaar maken.

### Google Analytics Opt-out
Naast onze eigen cookie-instellingen, kun je ook:

- **Browser Add-on:** [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout)
- **Do Not Track:** Schakel DNT in je browser in

## 6. Bewaartermijn & Verwijdering

| Type | Bewaartermijn | Automatisch verwijderd | Handmatig verwijderen |
|------|---------------|------------------------|----------------------|
| Sessie-cookies | Tot je browser sluit | ✅ Ja | Via browser |
| Functionele cookies | Max. 1 jaar | ✅ Ja, na vervaldatum | Via browser of uitloggen |
| Google Analytics | 2 jaar (\_ga), 24u (\_gid) | ✅ Ja, na vervaldatum | Via consent intrekken |
| Local Storage | Permanent | ❌ Nee | Via browser-instellingen |

**Consent intrekken = cookies verwijderen:**
Wanneer je analytische cookies uitschakelt via je profiel, worden alle Google Analytics cookies onmiddellijk verwijderd.

## 7. GDPR & Schrems II Compliance

### Jouw rechten
Onder de AVG heb je de volgende rechten:

- **Inzage** (art. 15): overzicht van alle cookies
- **Rectificatie** (art. 16): onjuiste gegevens corrigeren
- **Verwijdering** (art. 17): alle cookies verwijderen
- **Bezwaar** (art. 21): bezwaar maken tegen analytische cookies
- **Dataportabiliteit** (art. 20): export van je gegevens

**Contact:** [privacy@fitfi.ai](mailto:privacy@fitfi.ai)

### US Data Transfer (Schrems II)
Google Analytics verstuurt gegevens naar de Verenigde Staten. Wij hebben de volgende maatregelen genomen:

✅ **IP-anonymisatie** (laatste octet verwijderd)
✅ **Opt-in consent** (niet standaard actief)
✅ **Data Processing Amendment** met Google
✅ **Minimale data** (geen PII, geen user-ID)

**Alternatief:** Overweeg onze dienst zonder analytische cookies te gebruiken. Alle kernfunctionaliteit blijft werken.

## 8. Cookies van externe content

Als je externe content ziet (bijv. embedded video's), kunnen die diensten cookies plaatsen. We minimaliseren dit door:

- **Geen** auto-load van YouTube/Vimeo embeds (click-to-play)
- **Geen** Facebook/Twitter embeds (privacy-mode waar mogelijk)
- **Geen** third-party advertentienetwerken

## 9. Wijzigingen

We kunnen dit beleid bijwerken. Grote wijzigingen kondigen we aan via:
- E-mail (als je een account hebt)
- In-app notificatie
- Vernieuwde cookie-banner

Controleer regelmatig de datum bovenaan.

## 10. Meer informatie & Contact

- **Privacyverklaring:** [/privacy](/privacy)
- **AVG-rechten:** [privacy@fitfi.ai](mailto:privacy@fitfi.ai)
- **Klachten:** [Autoriteit Persoonsgegevens](https://autoriteitpersoonsgegevens.nl)
- **Google Privacy:** [https://policies.google.com/privacy](https://policies.google.com/privacy)
- **EU Data Protection:** [https://ec.europa.eu/info/law/law-topic/data-protection](https://ec.europa.eu/info/law/law-topic/data-protection)

---

## ✅ Korte samenvatting

**Wat we gebruiken:**
- ✅ Essentiële cookies (login, voorkeuren) → altijd aan
- ✅ Google Analytics (opt-in) → ALLEEN met jouw toestemming
- ❌ Marketing cookies → NOOIT

**Privacy waarborgen:**
- IP-anonymisatie actief
- Opt-in voor alle tracking
- Consent intrekken = cookies verwijderen
- Geen verkoop van data

**Jouw controle:**
- Wijzig voorkeuren in je [profiel](/profiel)
- Bekijk alle cookies in browser-instellingen
- Verwijder account = verwijder alle data
          `}
        />
      </main>
    </>
  );
}