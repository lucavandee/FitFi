# Google Analytics 4 Setup Guide - FitFi

## Overzicht

FitFi gebruikt Google Analytics 4 (GA4) voor privacy-vriendelijke analytics met volledige GDPR compliance via een cookie consent banner.

## Features

✅ **Privacy-first**: Analytics laadt alleen na expliciete consent
✅ **GDPR compliant**: Cookie banner met opt-in
✅ **Page view tracking**: Automatisch bij route wijzigingen
✅ **Custom events**: 14+ voorgedefinieerde events
✅ **Real-time updates**: Consent wijzigingen worden direct doorgevoerd

---

## Setup Stappen

### 1. Google Analytics Account Aanmaken

1. Ga naar [Google Analytics](https://analytics.google.com/)
2. Klik op **"Start measuring"** of **"Admin"** (linksonder)
3. Maak een nieuwe **Property** aan:
   - Property name: `FitFi Production` (of `FitFi Staging` voor test)
   - Reporting time zone: `Netherlands`
   - Currency: `Euro (EUR)`

### 2. Data Stream Toevoegen

1. In je nieuwe Property, ga naar **Admin → Data Streams**
2. Klik op **"Add stream" → Web**
3. Vul in:
   - **Website URL**: `https://fitfi.ai` (of je domein)
   - **Stream name**: `FitFi Web`
   - **Enhanced measurement**: Schakel AAN (voor scroll, outbound clicks, etc.)

4. Kopieer je **Measurement ID** (format: `G-XXXXXXXXXX`)

### 3. Measurement ID Configureren

#### Lokaal (development):

1. Voeg toe aan je `.env` bestand:
```bash
VITE_GTAG_ID=G-XXXXXXXXXX
```

2. Herstart dev server:
```bash
npm run dev
```

#### Productie (Netlify):

1. Ga naar je Netlify dashboard
2. Navigate naar: **Site settings → Environment variables**
3. Klik op **"Add a variable"**
4. Voeg toe:
   - **Key**: `VITE_GTAG_ID`
   - **Value**: `G-XXXXXXXXXX` (jouw Measurement ID)
   - **Scopes**: Selecteer `All scopes` of specifiek `Production`

5. **Deploy** je site opnieuw (Netlify pakt nieuwe env vars pas op na redeploy)

---

## Testen

### 1. Development Test

1. Start dev server: `npm run dev`
2. Open browser op `http://localhost:5173`
3. Open **Developer Tools → Console**
4. Accepteer cookies in de cookie banner
5. Je zou moeten zien:
   ```
   [AnalyticsLoader] Loading GA4: G-XXXXXXXXXX
   [GA4] page_view { page_path: "/" }
   ```

### 2. Real-time Check in GA4

1. Ga naar Google Analytics dashboard
2. Klik op **Reports → Realtime**
3. Open je website in een incognito window
4. Accepteer cookies
5. Navigeer tussen paginas
6. Je zou binnen 30 seconden gebruikers moeten zien in "Real-time"

### 3. Event Test

1. Klik op een CTA button op de homepage
2. Check in GA4 **Realtime → Events**
3. Je zou events moeten zien zoals:
   - `page_view`
   - `cta_click_hero_primary`
   - `start_style_report`

---

## Tracked Events

FitFi tracked automatisch de volgende events:

### Navigatie
- ✅ `page_view` - Elke route wijziging
- ✅ `start_style_report` - Quiz gestart (met source)
- ✅ `complete_style_report` - Quiz voltooid (met duration)

### CTA Interactions
- ✅ `cta_click_hero_primary` - Hero primary button (+ variant)
- ✅ `cta_click_hero_secondary` - Hero secondary button (+ variant)
- ✅ `cta_click_midpage` - Mid-page CTA clicks

### Content Engagement
- ✅ `example_view` - Outfit voorbeeld bekeken (+ outfit_type)
- ✅ `example_view_all` - "Bekijk alle voorbeelden" geklikt
- ✅ `howitworks_step_view` - How it works step viewed (+ step number)
- ✅ `faq_expand` - FAQ vraag uitgeklapt (+ question)

### Account
- ✅ `account_created` - Account aangemaakt (+ method: email/social)

### Privacy
- ✅ `privacy_expand` - Privacy policy uitgeklapt

---

## Custom Event Tracking

Voeg custom events toe in je componenten:

```typescript
import { events } from "@/utils/ga4";

// In je component
const handleCTAClick = () => {
  events.cta_click_hero_primary("variant_a");
  // ... rest van je logic
};

// Of direct
import { trackEvent } from "@/utils/ga4";

trackEvent("custom_event_name", {
  custom_param: "value",
  another_param: 123
});
```

### Beschikbare Event Functies

```typescript
import { events } from "@/utils/ga4";

events.cta_click_hero_primary(variant?: string)
events.cta_click_hero_secondary(variant?: string)
events.example_view(outfitType: string)
events.example_view_all()
events.howitworks_step_view(step: number)
events.privacy_expand()
events.start_style_report(source: string)
events.complete_style_report(duration: number)
events.account_created(method: string)
events.cta_click_midpage()
events.faq_expand(question: string)
```

---

## Cookie Consent Flow

FitFi gebruikt een **opt-in** consent systeem:

### 1. Cookie Banner
- Verschijnt automatisch bij eerste bezoek
- 3 opties: **Alle accepteren** / **Alleen essentieel** / **Aanpassen**

### 2. Consent Opslag
- Opgeslagen in `localStorage` als `ff_cookie_prefs`
- Format: `{ essential: true, analytics: true, marketing: false }`

### 3. Analytics Loading
- GA4 script laadt **alleen** als `analytics: true`
- Bij consent wijziging wordt script direct geladen/verwijderd
- Page views worden alleen getrackt met consent

### 4. Consent Wijzigen
- Footer link: "Cookie-instellingen"
- Opent cookie banner opnieuw
- Wijzigingen worden direct doorgevoerd

---

## Privacy & GDPR

### Compliant Features

✅ **Opt-in consent**: Analytics laadt niet zonder expliciete toestemming
✅ **Cookie banner**: Duidelijke uitleg en keuzes
✅ **Easy opt-out**: Consent kan altijd worden ingetrokken
✅ **Data minimization**: Alleen essentiële tracking
✅ **Transparent**: Privacy policy met volledige uitleg

### IP Anonymization

GA4 anonymiseert automatisch IP-adressen. Geen extra configuratie nodig.

### Data Retention

Stel in via Google Analytics:

1. **Admin → Data Settings → Data Retention**
2. Kies: **14 months** (aanbevolen voor GDPR)
3. Schakel **"Reset on new activity"** UIT voor strikte compliance

---

## Troubleshooting

### "Geen data in Google Analytics"

**Check:**
1. ✅ Is `VITE_GTAG_ID` correct ingesteld? (G-XXXXXXXXXX format)
2. ✅ Heb je cookies geaccepteerd in de banner?
3. ✅ Is de site gedeployed na het toevoegen van env var?
4. ✅ Check browser console voor errors
5. ✅ Check Realtime report (niet Overview - die heeft 24-48u delay)

**Test:**
```javascript
// Open browser console op je site
console.log(import.meta.env.VITE_GTAG_ID); // Should show G-XXXXXXXXXX
console.log(window.gtag); // Should be a function
console.log(window.dataLayer); // Should be an array
```

### "Events komen niet door"

**Check:**
1. ✅ Is analytics consent gegeven? Check `localStorage.getItem('ff_cookie_prefs')`
2. ✅ Is `window.gtag` gedefinieerd? Check in console
3. ✅ Zie je `[GA4]` logs in console? (alleen in development)
4. ✅ Check GA4 **Realtime → Events** (niet Overview)

### "Script laadt niet"

**Check:**
1. ✅ Ad blockers disabled? (uBlock, Privacy Badger, etc.)
2. ✅ Browser privacy settings? (Brave, Firefox strict mode)
3. ✅ CSP headers? Check Netlify `_headers` file
4. ✅ Network tab: Is `googletagmanager.com` blocked?

---

## Advanced: DebugView

Voor gedetailleerde event debugging:

1. Installeer [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) (Chrome extension)
2. Enable de extension
3. Ga naar GA4: **Admin → DebugView**
4. Open je site
5. Zie real-time event details met alle parameters

---

## Best Practices

### 1. Event Naming
- Gebruik **snake_case**: `cta_click_hero_primary` ✅
- Niet: `CTAClick-Hero-Primary` ❌
- Consistente prefixes: `cta_*`, `account_*`, `quiz_*`

### 2. Event Parameters
- Max **25 custom parameters** per event
- Parameter namen ook **snake_case**
- Gebruik meaningful names: `source`, `duration`, `variant`

### 3. Testing
- Test altijd in **incognito** window (geen cached consent)
- Check **Realtime** report (niet Overview)
- Use **DebugView** voor development

### 4. Production Checklist
- [ ] VITE_GTAG_ID in Netlify env vars
- [ ] Site gedeployed na env var toevoegen
- [ ] Cookie banner werkt
- [ ] Test event in Realtime report
- [ ] Privacy policy up-to-date
- [ ] Data retention ingesteld (14 months)

---

## Support

**Google Analytics 4 Docs:**
https://support.google.com/analytics/answer/9304153

**GDPR Compliance Guide:**
https://support.google.com/analytics/answer/9019185

**FitFi Implementatie:**
- `/src/components/analytics/AnalyticsLoader.tsx` - GA4 loader met consent
- `/src/utils/ga4.ts` - Event tracking helpers
- `/src/utils/consent.ts` - Cookie consent management
- `/src/components/legal/CookieBanner.tsx` - Cookie consent UI

---

## Changelog

**v1.0** (2025-01-09)
- Initial GA4 setup met privacy-first consent
- 14+ custom events
- GDPR compliant cookie banner
- Real-time page view tracking
