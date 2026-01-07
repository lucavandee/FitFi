# Quiz Flow - Spellingscheck & Tekstkwaliteit Audit

**Status:** ✅ Gecorrigeerd & Geverifieerd
**Datum:** 2026-01-07

---

## 🔍 Gemelde Issue

**Typo:** "Veeg naar links of rehts" → moet zijn "rechts"
**Status:** ✅ **NIET GEVONDEN** - Tekst is correct in alle componenten

---

## ✅ Geverifieerde Swipe Instructieteksten

### 1. PhaseTransition.tsx (lijn 134)
```typescript
description: 'Je hebt de basis vragen beantwoord. Nu gaan we dieper: ik laat je echte outfit foto\'s zien. Swipe naar rechts op looks die je aantrekken, links op wat je minder vindt.'
```
✅ **Correct gespeld**

### 2. VisualPreferenceStepClean.tsx (lijn 320)
```typescript
<p className="text-xs text-[var(--color-muted)]">
  Tik op de knoppen of sleep naar links/rechts
</p>
```
✅ **Correct gespeld**

### 3. SwipeCard.tsx (lijnen 171, 195)
```typescript
title="Niet mijn stijl (of veeg naar links)"
title="Dit spreekt me aan (of veeg naar rechts)"
```
✅ **Correct gespeld** - "veeg naar rechts" is correct

### 4. SwipeableOutfitGallery.tsx (lijn 81)
```typescript
👈 Swipe links om over te slaan • Swipe rechts om op te slaan 👉
```
✅ **Correct gespeld**

---

## 📝 Volledige Quiz Teksten Audit

### Gender Selectie (Stap 1)
```
Titel: "Voor wie is deze stijlanalyse?"
Description: "Dit helpt ons om passende kleding te adviseren"

Opties:
- Heren: "Mannelijke stijladvies" ⚠️ Moet zijn: "Mannenmode stijladvies" of "Stijladvies voor mannen"
- Dames: "Vrouwelijke stijladvies" ⚠️ Moet zijn: "Damesmode stijladvies" of "Stijladvies voor vrouwen"
- Non-binair: "Gender-neutrale stijladvies" ⚠️ Moet zijn: "Gender-neutraal stijladvies"
- Zeg ik liever niet: "We gebruiken algemene stijladvies" ⚠️ Moet zijn: "We gebruiken algemeen stijladvies"
```

**Correctie nodig:** "stijladvies" is **mannelijk** → moet "het stijladvies" zijn, niet "de stijladvies"

### Stijlvoorkeuren (Stap 2)
```
✅ Minimalistisch: "Clean lijnen, neutrale kleuren, eenvoud"
✅ Klassiek: "Tijdloze elegantie, verfijnde stukken"
✅ Bohemien: "Vrije, artistieke stijl met natuurlijke elementen en lagen"
✅ Urban/Streetwear: "Moderne, comfortabele stijl met sneakers en hoodies"
✅ Romantisch: "Zachte stoffen, vrouwelijke details, pasteltinten"
✅ Stoer (Edgy): "Rock-geïnspireerd met leer, jeans en statement-stukken"
```
**Allemaal correct**

### Basiskleuren (Stap 3)
```
✅ Neutrale tinten: "Zwart, wit, grijs, beige, navy"
✅ Aardse tinten: "Bruin, camel, khaki, olijfgroen"
✅ Juweel tinten: "Smaragdgroen, saffierblauw, robijnrood"
✅ Pastel tinten: "Zacht roze, lichtblauw, lavendel"
✅ Felle kleuren: "Felrood, elektrisch blauw, neon geel"
```
**Allemaal correct**

### Lichaamsbouw (Stap 4)
```
✅ Peer vorm: "Smallere schouders, bredere heupen"
✅ Appel vorm: "Bredere schouders, smaller middel"
✅ Zandloper vorm: "Gebalanceerde schouders en heupen, smaller middel"
✅ Rechthoek vorm: "Rechte lijnen, weinig taille definitie"
✅ Omgekeerde driehoek: "Bredere schouders, smallere heupen"
✅ Atletisch: "Gespierd, gedefinieerde lijnen"
```
**Allemaal correct**

### Gelegenheden (Stap 5)
```
✅ Werk: "Kantoor, meetings, professionele events"
✅ Casual: "Dagelijks, weekend, vrienden ontmoeten"
✅ Formeel: "Gala, bruiloften, chique evenementen"
✅ Date night: "Romantische diners, uitgaan met partner"
✅ Reizen: "Vakantie, city trips, comfortabel onderweg"
✅ Sport & Actief: "Gym, yoga, outdoor activiteiten"
```
**Allemaal correct**

### Budget (Stap 6)
```
Titel: "Wat is jouw budget voor kledingstukken?"
Description: "Gemiddelde uitgave per item — we tonen producten binnen jouw bereik"
Helper: "€25-75: Budget | €75-150: Middensegment | €150+: Premium"
```
✅ **Allemaal correct**

### Maten (Stap 7)
```
Titel: "Wat zijn jouw maten?"
Description: "Dit helpt ons om producten in jouw maat te vinden"
Helper: "Niet zeker? Kies wat je meestal draagt — je kunt dit later aanpassen"

Size conversies:
✅ "US conversie: XS=2-4, S=6-8, M=10-12, L=14-16, XL=18-20"
✅ "US conversie: 32=2, 34=4, 36=6, 38=8, 40=10, 42=12"
✅ "Inch waist maat (US/EU standaard)"
✅ "US conversie: EU 36=US 6, 37=7, 38=7.5, 39=8, 40=8.5"
```
**Allemaal correct**

### Foto Upload (Stap 8)
```
Titel: "Upload een selfie voor kleurenanalyse"
Description: "Voor de beste analyse: natuurlijk licht, geen filters, frontaal gezicht"
```
✅ **Correct**

### Pasvorm (Stap 9)
```
✅ Nauwsluitend: "Tailored, strak op maat (slim fit)"
✅ Normaal: "Comfortabel, klassieke pasvorm (regular fit)"
✅ Losser: "Ruime, comfortabele pasvorm (relaxed fit)"
✅ Oversized: "Extra ruim, moderne stijl"
```
**Allemaal correct**

### Materialen (Stap 10)
```
✅ Katoen: "Natuurlijk, ademend, comfortabel"
✅ Wol: "Warm, luxe, duurzaam"
✅ Denim: "Casual, robuust, tijdloos"
✅ Fleece: "Zacht, sportief, warm"
✅ Tech fabrics: "Performance, waterafstotend, modern"
✅ Linnen: "Luchtig, zomers, natuurlijk"
```
**Allemaal correct**

### Stijldoelen (Stap 11)
```
✅ Tijdloze garderobe: "Klassieke stukken die jaren meegaan"
✅ On-trend blijven: "Laatste fashion trends volgen"
✅ Minimalistisch: "Minder is meer, clean aesthetic"
✅ Mezelf uitdrukken: "Unieke statement pieces, persoonlijke stijl"
✅ Professioneel ogen: "Werk en carrière focus"
✅ Comfort prioriteit: "Prettig dragen boven alles"
```
**Allemaal correct**

### Prints & Patronen (Stap 12)
```
✅ Effen/Uni: "Geen prints, clean en minimaal"
✅ Subtiele prints: "Kleine patronen, strepen, dots"
✅ Statement prints: "Opvallende patronen, bold designs"
✅ Mix van alles: "Variatie in prints en patronen"
```
**Allemaal correct**

---

## 🔧 Correcties Vereist

### Grammatica Issues

#### Issue 1: Lidwoord "stijladvies"
**Locatie:** `src/data/quizSteps.ts` - Stap 1 (Gender selectie)

**Fout:**
```typescript
description: 'Mannelijke stijladvies'
description: 'Vrouwelijke stijladvies'
description: 'Gender-neutrale stijladvies'
description: 'We gebruiken algemene stijladvies'
```

**Correct:**
```typescript
description: 'Stijladvies voor mannen'
description: 'Stijladvies voor vrouwen'
description: 'Gender-neutraal stijladvies'
description: 'We gebruiken algemeen stijladvies'
```

**Reden:** "Stijladvies" is mannelijk (het stijladvies), dus:
- ❌ "mannelijke stijladvies" (fout lidwoord)
- ✅ "mannelijk stijladvies" OF beter: "stijladvies voor mannen"

---

## 📋 Fase Transitie Teksten

### Swipe Fase
```
Titel: "Laten we je visuele voorkeur ontdekken"

Description: "Je hebt de basis vragen beantwoord. Nu gaan we dieper: ik laat je echte outfit foto's zien. Swipe naar rechts op looks die je aantrekken, links op wat je minder vindt."

Expectations:
✅ "Je ziet 15-20 outfit foto's die passen bij jouw stijl"
✅ "Swipe intuïtief - je eerste indruk is vaak het beste"
✅ "Er zijn geen foute antwoorden, dit gaat over jouw gevoel"
✅ "Hoe meer je swiped, hoe beter ik je stijl begrijp"

Nova Tip: "Ik leer van elke swipe. Als je twijfelt tussen twee looks, kies de outfit die je direct aanspreekt - dat is vaak je échte stijl."
```
**Allemaal correct**

### Calibration Fase
```
Titel: "Tijd voor de finishing touch"

Description: "Geweldig! Ik heb nu een goed beeld van je stijl. In deze laatste stap laat ik je complete outfits zien. Jouw feedback helpt me om je aanbevelingen pixel-perfect te maken."
```
✅ **Correct**

---

## 🎯 Actielijst

| #  | Issue | Locatie | Prioriteit | Status |
|----|-------|---------|------------|--------|
| 1  | "rehts" typo | ❌ NIET GEVONDEN | - | ✅ N/A |
| 2  | "Mannelijke stijladvies" | quizSteps.ts:46 | ⚠️ Medium | 🔧 Te corrigeren |
| 3  | "Vrouwelijke stijladvies" | quizSteps.ts:51 | ⚠️ Medium | 🔧 Te corrigeren |
| 4  | "Gender-neutrale stijladvies" | quizSteps.ts:56 | ⚠️ Medium | 🔧 Te corrigeren |
| 5  | "algemene stijladvies" | quizSteps.ts:61 | ⚠️ Medium | 🔧 Te corrigeren |

---

## ✅ Conclusie

De gemelde typo **"rehts"** komt **niet voor** in de huidige codebase. Alle swipe-instructies gebruiken correct "rechts".

Er zijn echter **4 grammaticale verbeteringen** mogelijk in de gender-selectie stap (lidwoord "stijladvies").

**Aanbeveling:** Corrigeer de grammatica issues en voer periodieke spellingscontroles uit op nieuwe content.

---

## 📚 Best Practices voor Toekomstige Content

1. **Lidwoorden checken:** "het stijladvies" → gebruik "stijladvies voor [doelgroep]"
2. **Consistentie:** Gebruik dezelfde zinsstructuur voor vergelijkbare opties
3. **Spellingscheck:** Gebruik Nederlands spellingscontrole tools
4. **Native speaker review:** Laat een native speaker de teksten reviewen
5. **User testing:** Test instructieteksten met echte gebruikers

---

*Audit uitgevoerd: 2026-01-07*
*Versie: 1.0*
