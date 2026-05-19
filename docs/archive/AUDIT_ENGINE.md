# FitFi Recommendation Engine — Volledige Audit

> **Datum:** 2026-03-14
> **Scope:** Alleen documentatie — geen wijzigingen aan code
> **Bestanden onderzocht:** 40+ bestanden in `src/`, `supabase/`, `netlify/`

---

## 1. Quiz & Input

### 1.1 Vragen (13 stappen)

| # | Veld | Vraag | Type | Verplicht |
|---|------|-------|------|-----------|
| 1 | `gender` | Zoek je kleding voor heren of dames? | Radio | Ja |
| 2 | `stylePreferences` | Welke stijlen spreken jou aan? | Checkbox (meerdere) | Ja |
| 3 | `neutrals` | Welke kleuren draag jij het liefst? | Radio | Ja |
| 4 | `lightness` | Hoe licht of donker kleed je je? | Radio | Ja |
| 5 | `contrast` | Hoe combineer je kleur en contrast? | Radio | Ja |
| 6 | `fit` | Welke pasvorm prefereer je? | Radio | Ja |
| 7 | `occasions` | Voor welke gelegenheden zoek je outfits? | Multiselect | Ja |
| 8 | `goals` | Wat zijn jouw stijldoelen? | Multiselect | Ja |
| 9 | `prints` | Welke prints en patronen prefereer je? | Radio | Nee |
| 10 | `materials` | Welke materialen spreken je aan? | Checkbox | Nee |
| 11 | `budgetRange` | Wat is jouw budget per kledingstuk? | Slider €25–€500 | Ja |
| 12 | `sizes` | Wat zijn jouw maten? | Formulier | Nee |
| 13 | `photoUrl` | Upload een selfie voor kleurenanalyse | Foto-upload | Nee |

**Bron:** `src/data/quizSteps.ts`

### 1.2 Antwoordopties per vraag

**Q1 — Gender:**
- `female` (Dames), `male` (Heren), `non-binary` (Beide/Anders), `prefer-not-to-say`

**Q2 — Stijlvoorkeuren** (genderafhankelijk, via `getStyleOptionsForGender()`):
- *Dames:* Minimalistisch, Klassiek, Urban/Streetwear, Bohemien, Romantisch, Stoer (Edgy)
- *Heren:* Minimalistisch, Klassiek, Urban/Streetwear, Smart Casual, Sportief/Athletic, Stoer/Rugged
- *Non-binary:* Minimalistisch, Klassiek, Urban/Streetwear, Bohemien/Vrij, Stoer/Edgy, Androgyn

**Q3 — Neutrale kleuren:** `warm` | `koel` | `neutraal`

**Q4 — Lichtheid:** `licht` | `medium` | `donker`

**Q5 — Contrast:** `laag` | `medium` | `hoog`

**Q6 — Pasvorm:** `slim` | `regular` | `relaxed` | `oversized`

**Q7 — Gelegenheden:** `work` | `casual` | `formal` | `date` | `travel` | `sport`

**Q8 — Doelen:** `timeless` | `trendy` | `minimal` | `express` | `professional` | `comfort`

**Q9 — Prints:** `effen` | `subtiel` | `statement` | `gemengd`

**Q10 — Materialen:** `katoen` | `wol` | `denim` | `fleece` | `tech` | `linnen`

**Q11 — Budget:** Slider van €25–€500, stap €25

**Q12 — Maten:** Genderafhankelijk (tops, bottoms/broeken, schoenen met EU-maten)

**Q13 — Foto:** Optionele selfie, wordt geanalyseerd door `analyze-selfie-color` edge function

### 1.3 Datastructuur opslag

**Type:** `QuizAnswers` interface — `src/types/quiz.ts`

```typescript
interface QuizAnswers {
  gender?: string;
  stylePreferences: string[];
  baseColors: string;
  bodyType: string;
  occasions: string[];
  budgetRange: number;
  sizes?: { tops?: string; bottoms?: string; shoes?: string };
  photoUrl?: string;
  colorAnalysis?: any;
  fit?: string;
  materials?: string[];
  goals?: string[];
  prints?: string;
}
```

**Opslag locaties:**
1. **localStorage** (primair, voor snelle display):
   - `ff_quiz_answers` — volledige antwoorden
   - `ff_color_profile` — berekend kleurprofiel
   - `ff_style_archetype` — gedetecteerd archetype
   - `ff_results_ts` — timestamp resultaten
   - `ff_quiz_completed` — voltooiingsvlag
2. **Supabase** (async sync):
   - `style_profiles` tabel — volledig profiel als JSONB
   - `quiz_answers` tabel — individuele antwoorden per rij

**Bron:** `src/lib/quiz/types.ts`, `src/services/quizService.ts`

### 1.4 Na de 13 vragen: extra fases

Na de kernvragen volgen nog:
- **Swipes** — visuele voorkeursbepaling via mood-foto's (links/rechts swipen)
- **Calibratie** — adaptieve finetuning van resultaten
- **Reveal** — onthulling van archetype en kleurprofiel

---

## 2. Scoring & Classificatie

### 2.1 Kleurprofiel: `computeColorProfile()`

**Bron:** `src/lib/quiz/logic.ts:56-73`

Vier onafhankelijke dimensies worden bepaald:

| Dimensie | Functie | Logica | Regels |
|----------|---------|--------|--------|
| **Temperature** | `decideTemperature()` (:3-7) | Sieraden > neutrals > fallback | `jewelry=goud` → warm, `jewelry=zilver` → koel, anders: `neutrals` veld |
| **Value** | `decideValue()` (:8-10) | Directe mapping | `lightness` antwoord, default `medium` |
| **Contrast** | `decideContrast()` (:11-13) | Directe mapping | `contrast` antwoord, default `medium` |
| **Chroma** | `decideChroma()` (:14-18) | Prints + materialen combinatie | `statement/glans` → helder, `effen/mat` → zacht, default: `zacht` |

**Opmerking:** De `jewelry` vraag zit **niet** in de 13 quizstappen maar wordt wel gebruikt in `decideTemperature()`. Als de gebruiker geen sieradenvraag beantwoordt, valt het systeem terug op de `neutrals` vraag. Dit is een potentiële inconsistentie.

### 2.2 Seizoenstype: `decideSeason()`

**Bron:** `src/lib/quiz/logic.ts:19-46`

**Prioriteit 1 — Foto-analyse (als `confidence ≥ 0.6`):**
```
photoAnalysis.seasonal_type → directe vertaling:
  "spring" → "lente"
  "summer" → "zomer"
  "autumn" → "herfst"
  "winter" → "winter"
```

**Prioriteit 2 — Rule-based (als geen foto of lage confidence):**

| Conditie | Seizoen |
|----------|---------|
| `warm + licht` | Lente |
| `warm + medium` | Herfst |
| `warm` (overig) | Herfst |
| `koel + (donker OF hoog contrast)` | Winter |
| `koel` (overig) | Zomer |
| `donker + hoog contrast` | Winter |
| `licht` (overig) | Zomer |
| `hoog contrast` (overig) | Winter |
| **Default** | **Herfst** |

**Conclusie:** Bij `neutraal` (niet warm, niet koel) worden alleen `value` en `contrast` gebruikt. Het systeem heeft een **sterke bias naar herfst** als default.

### 2.3 Archetype: `computeArchetype()`

**Bron:** `src/lib/quiz/logic.ts:75-191`

**6 archetypes:** MINIMALIST, CLASSIC, SMART_CASUAL, STREETWEAR, ATHLETIC, AVANT_GARDE

**Scoringsmodel:** Additief puntensysteem (niet genormaliseerd). Elke quizdimensie voegt punten toe aan een of meerdere archetypes.

#### Puntenverdeling per input:

**Stijlvoorkeuren** (hoogste impact, 15–40 punten):
| Stijl-keyword | Archetype | Punten |
|---------------|-----------|--------|
| minimalis/clean/effen | MINIMALIST | +30 |
| classic/klassiek/preppy | CLASSIC | +30 |
| smart-casual | SMART_CASUAL | **+40** |
| streetwear/street/urban | STREETWEAR | +35 |
| edgy/stoer/rock | STREETWEAR +20, AVANT_GARDE +15 | |
| sport/athletic/actief | ATHLETIC | +30 |
| bohemi/boho/artistic | AVANT_GARDE | +30 |
| romantic/romantisch | CLASSIC | +20 |
| androgyn | MINIMALIST | +20 |

**Pasvorm** (8–22 punten):
| Fit | Primair | Secundair | Tertiair |
|-----|---------|-----------|----------|
| slim | MINIMALIST +18 | CLASSIC +15 | SMART_CASUAL +8 |
| regular/straight | SMART_CASUAL +15 | CLASSIC +12 | MINIMALIST +8 |
| relaxed | SMART_CASUAL +12 | STREETWEAR +10 | ATHLETIC +8 |
| oversized | STREETWEAR +22 | AVANT_GARDE +18 | |

**Doelen** (8–20 punten):
| Doel | Archetypes |
|------|-----------|
| sport | ATHLETIC +20 |
| werk/office | SMART_CASUAL +15, CLASSIC +10 |
| casual | SMART_CASUAL +10, STREETWEAR +8 |
| avond | CLASSIC +10, SMART_CASUAL +8 |

**Gelegenheden** (5–12 punten):
| Gelegenheid | Archetypes |
|-------------|-----------|
| office | SMART_CASUAL +12, CLASSIC +8 |
| smartcasual | SMART_CASUAL +10 |
| leisure | SMART_CASUAL +8, STREETWEAR +5 |

**Materialen** (5–15 punten):
| Materiaal | Archetypes |
|-----------|-----------|
| tech | ATHLETIC +15, STREETWEAR +5 |
| fleece | ATHLETIC +10, STREETWEAR +5 |
| linnen | MINIMALIST +12, SMART_CASUAL +8 |
| wol/kasjmier | CLASSIC +12, MINIMALIST +8 |
| leer | CLASSIC +10, AVANT_GARDE +8 |
| mat | MINIMALIST +8, CLASSIC +5 |
| textuur | SMART_CASUAL +8, CLASSIC +5 |
| glans | AVANT_GARDE +8 |

**Prints** (5–10 punten):
| Print | Archetypes |
|-------|-----------|
| effen/geen | MINIMALIST +10 |
| subtiel | SMART_CASUAL +8, CLASSIC +5 |
| statement | STREETWEAR +10, AVANT_GARDE +10 |

**Resultaatlogica** (`:180-190`):
- Sorteer 6 archetypes op score (aflopend)
- Als hoogste score < 10 → **SMART_CASUAL** (veilige default)
- Anders: archetype met hoogste score

**Hardcoded:** Het volledige scoringsmodel is hardcoded. Er is geen externe configuratie of database-tabel.

### 2.4 Hybride Archetype Detector (met swipe-data)

**Bron:** `src/services/styleProfile/archetypeDetector.ts`

De `ArchetypeDetector.detect()` combineert **twee signalen**:
- **Quiz-input: 55% gewicht** (expliciete intentie)
- **Swipe-data: 45% gewicht** (impliciete voorkeur)

Swipe-analyse leest `mood_tags` van gelikete mood-foto's en scoort op basis van tag-keywords per archetype. Bijvoorbeeld:
- MINIMALIST: `['minimal', 'clean', 'effen', 'simpel', 'monochrome']`
- STREETWEAR: `['street', 'urban', 'oversized', 'hoodie', 'sneaker']`

**Confidence levels:**
| Score | Confidence |
|-------|------------|
| ≥ 50 | 0.9 |
| ≥ 35 | 0.7 |
| ≥ 20 | 0.5 |
| < 20 | 0.3 |

**Output:** `{ primary, secondary (als score > 20), scores[], confidence }`

---

## 3. Kleurpalet-generatie

### 3.1 Vaste paletten per seizoenstype

**Bron:** `src/data/colorPalettes.ts`

Er zijn **4 vaste paletten** — één per seizoen. Elk palet bevat:
- **14 kleuren** (4 basis, 7 accent, 3 neutraal)
- **6 aanbevolen kleuren** (doColors)
- **4 te vermijden kleuren** (dontColors) met reden

| Seizoen | Basis | Accent | Neutraal | Te vermijden |
|---------|-------|--------|----------|--------------|
| **Winter** | Zuiver wit, Zwart, Navy, Donkerblauw | Bourgogne, Smaragdgroen, Sapphire, Petrol, Diep rood, Bosgroen, Aubergine | Zilvergrijs, Lichtgrijs, Gebroken wit | Camel, Oranje, Mosterd, Goud |
| **Zomer** | Soft white, Lichtgrijs, Grijs-blauw, Slate | Duifgrijs, Soft blauw, Medium grijs, Eucalyptus, Zachte lavendel, Silver sage, Dusty mauve | Pearl grey, Cloud, Silver | Zwart, Felrood, Oranje, Bruin |
| **Herfst** | Ivory, Camel, Chocolade, Espresso | Cognac, Warm taupe, Terracotta, Olijfgroen, Hazelnoot, Warm beige, Toffee | Sand, Greige, Taupe | Zuiver wit, Fuchsia, IJsblauw, Zwart |
| **Lente** | Crème, Beige, Sage groen, Warm groen | Warm terracotta, Licht camel, Licht sage, Soft gold, Peach, Warm sand, Mint sage | Eggshell, Warm ivory, Linen | Zwart, Navy, Donkerbruin, Paars |

### 3.2 Paletnaam

**Bron:** `src/lib/quiz/logic.ts:47-54`

```
Lente → "Light Warm Neutrals (warm)"
Zomer → "Soft Cool Tonals (koel)"
Herfst → "Earthy Warm Neutrals (warm)"
Winter → "Crisp Cool Neutrals (koel)"
```

De paletnaam combineert seizoen-beschrijving met temperature, maar de temperatuur kan ook `neutraal` zijn, wat rare combinaties geeft zoals "Earthy Warm Neutrals (neutraal)".

### 3.3 Unieke uitkomsten

**Kleuren:** 4 seizoenen × vaste paletten = **4 unieke kleurpaletten**. Er is geen dynamische kleurgeneratie.

De `paletteName` voegt een temperatuur-suffix toe, maar de daadwerkelijke kleuren veranderen niet. Een "herfst + koel" en een "herfst + warm" gebruiker krijgen **exact dezelfde kleuren**.

### 3.4 Kleurfiltering in engine

**Bron:** `src/engine/colorSeasonFiltering.ts`

De engine filtert producten op kleurcompatibiliteit:
- **Aanbevolen kleuren:** score 1.0
- **Neutrale kleuren:** score 0.8
- **Onbekend:** score 0.4
- **Te vermijden:** score 0, `isAllowed: false` (hardblok in strict mode)

Er zijn **aparte kleurlijsten** per seizoen in `colorSeasonFiltering.ts` (string-gebaseerd) naast de `colorPalettes.ts` (hex-gebaseerd). Deze twee systemen zijn **niet gesynchroniseerd** — potentiële bron van inconsistenties.

---

## 4. Outfit Matching

### 4.1 Waar komen outfitdata vandaan?

**Database:** `products` tabel in Supabase

Producten zijn geïmporteerd vanuit:
- Brams Fruit (modecollectie)
- Zalando feed
- Daisycon affiliate feed

**Kolommen:** id, name, brand, price, image_url, category, type, gender, tags[], colors[], sizes[], retailer, affiliate_url, in_stock, rating, style, sku

### 4.2 Recommendation pipeline

**Bron:** `src/engine/recommendationEngine.ts`

```
1. Fetch producten (in_stock=true, gender match of unisex)
2. Filter op budget (max prijs)
3. Check: minimaal 10 producten vereist
4. Occasion-aware archetype analyse
5. Check foto-analyse → enhanced of standaard pad
6. Genereer 2× gewenst aantal outfits (bijv. 12 voor 6 finale)
7. Pas fit, prints, doelen, materiaal constraints toe
8. Rank met rankOutfits()
9. Pas diversiteitcheck toe (ensureDiversity)
10. Retourneer top N outfits
```

### 4.3 Archetype Fusion Scoring

**Bron:** `src/engine/archetypeFusion.ts`

Product-archetype matching via 5 gewogen componenten:
| Component | Gewicht |
|-----------|---------|
| Kleurmatch | 25% |
| Materiaalmatch | 20% |
| Silhouetmatch | 20% |
| Formaliteitsalignment | 15% |
| Stijlmatch | 20% |

De `fusionScore()` combineert scores van primair + secundair archetype volgens hun gewichten.

### 4.4 Outfit Ranking

**Bron:** `src/engine/ranking.ts`

| Rankingfactor | Scoring |
|---------------|---------|
| Archetype match | Primary=1.0, Secondary=0.5+(mixFactor×0.5), Mismatch=0.1 |
| Seizoen match | Exact=1.0, Adjacent=0.5, Mismatch=0.1 |
| Doelen match | 0.3 + (hits/3 × 0.7) |
| Prints match | effen-voorkeur: prints=0.2, clean=1.0 |
| Swipe embedding | Gewicht stijgt: 5 swipes=10%, 10=25%, 10+=40% |

### 4.5 Match Score voor display

**Bron:** `src/services/outfits/matchScoreCalculator.ts`

| Component | Gewicht |
|-----------|---------|
| **Kleur** | **35%** |
| Archetype | 30% |
| Stijl consistentie | 20% |
| Seizoen | 10% |
| Gelegenheid | 5% |

**Eindresultaat:** Geklemd op **70–98%**. Geen outfit scoort ooit lager dan 70% of hoger dan 98%.

---

## 5. Personalisatie-diepte

### 5.1 Theoretische combinaties

| Dimensie | Opties | Invloed |
|----------|--------|---------|
| Gender | 4 | Filtert productcatalogus + stijlopties |
| Seizoen | 4 | Bepaalt kleurpalet (4 vaste paletten) |
| Archetype | 6 | Bepaalt stijlrichting |
| Secundair archetype | 6 | Mengt bij (mixFactor) |
| Pasvorm | 4 | Filtert producten |
| Gelegenheden | 6 (multi) | Beïnvloedt archetype-gewichten |
| Budget | Continu (€25-€500) | Filtert producten |
| Prints | 4 | Filtert/rankt producten |
| Materialen | 6 (multi) | Beïnvloedt ranking |
| Swipe-data | Continu | 45% invloed op archetype |

**Maximaal theoretisch:** 4 × 4 × 6 × 6 × 4 × 2⁶ × continu × 4 × 2⁶ = miljoenen combinaties

**Praktisch uniek:**
- **Kleurpalet:** Slechts **4 uitkomsten** (één per seizoen)
- **Archetype:** **6 primaire uitkomsten** (met secondary als nuance)
- **Effectieve profielgroepen:** ~4 × 6 = **24 basisprofielen** (seizoen × archetype)

### 5.2 Combinaties die tot dezelfde output leiden

1. **Kleurpalet:** `warm + medium` en `warm + donker` → beide "herfst" → zelfde palet
2. **Archetype:** Veel paden leiden naar SMART_CASUAL (het heeft de hoogste single-choice bonus van 40 punten en is de default bij lage scores)
3. **Seizoen:** `neutraal + medium + medium contrast` → herfst (default). Veel "neutrale" gebruikers eindigen bij herfst
4. **Foto-analyse override:** Als de foto-analyse confidence ≥ 0.6 is, worden **alle** quizantwoorden over kleur genegeerd
5. **Temperature:** Als er geen `jewelry`-antwoord is (de vraag zit niet in de standaard quiz), bepaalt `neutrals` de temperature. Maar `neutraal` leidt altijd door naar default "herfst"

### 5.3 Waar het systeem generiek voelt

- **Kleuradvies:** 4 vaste paletten, geen interpolatie of nuance tussen seizoenen
- **Match scores:** Geklemd op 70-98% — alles "matcht" redelijk goed, waardoor differentiatie verloren gaat
- **Geen body type invloed:** Het veld `bodyType` zit in de types maar wordt nergens in scoring gebruikt
- **Geen merk-voorkeur in primary engine:** Brand affinity wordt bijgehouden maar niet in de primary recommendation flow meegenomen
- **Default bias:** SMART_CASUAL krijgt punten vanuit bijna elke dimensie en is de fallback — een groot deel van de gebruikers eindigt hier

### 5.4 Waar het systeem persoonlijk voelt

- **Swipe-data (45% gewicht):** Voegt impliciete voorkeuren toe die niet in de quiz zitten
- **Foto-analyse:** Objectieve kleuranalyse op basis van huid/haar/ogen
- **Occasion-based overrides:** Sterke contextuele aanpassing
- **Budget-filtering:** Concrete filtering op betaalbaarheid
- **Gender-specifieke opties:** Andere stijlen en maten per gender

---

## 6. Dataflow

### 6.1 Volledig pad: quizantwoord → resultaatpagina

```
GEBRUIKER BEANTWOORDT QUIZ
    │
    ▼
[OnboardingFlowPage] → src/pages/OnboardingFlowPage.tsx
    │
    ▼
quizService.saveAnswers(userId, answers)
    │
    ├─→ localStorage: ff_quiz_answers
    ├─→ localStorage: ff_style_archetype
    ├─→ localStorage: ff_color_profile
    └─→ localStorage: ff_quiz_completed
    │
    ▼
[Navigate naar Results]
    │
    ▼
profileSyncService.syncLocalToRemote()
    │
    ├─→ UPSERT style_profiles (volledig profiel als JSONB)
    └─→ INSERT quiz_answers (individuele rijen per vraag)
    │
    ▼
[EnhancedResultsPage mount] → src/pages/EnhancedResultsPage.tsx
    │
    ├─→ Lees localStorage (instant display)
    │
    ▼
StyleProfileGenerator.generateStyleProfile(answers, userId, sessionId)
    │
    ├─→ Prioriteit 1: photo_analyses (als foto + confidence > 0.7)
    ├─→ Prioriteit 2: style_swipes + mood_photos (als swipe quiz gedaan)
    └─→ Prioriteit 3: quiz_answers (fallback)
    │
    ▼
computeColorProfile(answers) → ColorProfile
computeArchetype(answers) → Archetype
ArchetypeDetector.detect(answers) → { primary, secondary, confidence }
    │
    ▼
[useOutfits hook] → src/hooks/useOutfits.ts
    │
    ▼
SELECT * FROM products WHERE in_stock=true AND (gender=? OR gender='unisex')
    │
    ▼
Filter: budget, categorie, kleur-seizoen
    │
    ▼
generateRecommendations() → 12 outfits genereren
    │
    ▼
rankOutfits() → score en sorteer
ensureDiversity() → voorkom archetype-duplicatie
    │
    ▼
Return top 6 outfits → display in SwipeableOutfitGallery
```

### 6.2 Supabase tabellen (direct betrokken bij engine)

| Tabel | Rol |
|-------|-----|
| `style_profiles` | Hoofdopslag profiel: archetype, kleurprofiel, quizantwoorden, foto |
| `quiz_answers` | Individuele antwoorden per vraag per gebruiker |
| `products` | Productcatalogus (gefilterd op gender, budget, in_stock) |
| `mood_photos` | Mood-foto's voor visuele quiz (tags, archetype_weights, dominant_colors) |
| `style_swipes` | Individuele swipe-interacties (richting, responstijd) |
| `preview_outfits` | Gegenereerde preview-outfits uit swipe-quiz |
| `photo_analyses` | CV-analyse van gebruikersfoto's |
| `saved_outfits` | Door gebruiker opgeslagen outfits |
| `outfit_calibration_feedback` | Feedback op outfit-aanbevelingen |
| `brand_affinity` | Merkvoorkeuren per gebruiker |
| `nova_swipe_insights` | AI-gegenereerde inzichten uit swipe-patronen |
| `style_embedding_snapshots` | Historische stijl-embeddings |

### 6.3 Edge functions betrokken bij engine

| Functie | Locatie | Rol |
|---------|---------|-----|
| `analyze-selfie-color` | `supabase/functions/` | CV-analyse van selfie → undertone, seizoenstype, confidence |
| `analyze-mood-photo` | `supabase/functions/` | Analyse van mood-foto → tags, kleuren, stijl |
| `ai-mood-tags` | `supabase/functions/` | AI-tagging van mood-foto's |
| `import-daisycon-feed` | `supabase/functions/` | Product-import uit affiliate feed |
| `validate-product-links` | `supabase/functions/` | Validatie van affiliate links |

### 6.4 Relevante RPC calls

| RPC | Doel |
|-----|------|
| `record_swipe` | Registreer individuele swipe |
| `compute_visual_preference_embedding` | Bereken visueel voorkeurs-embedding uit swipes |
| `compute_final_embedding` | Genereer definitief stijl-embedding |
| `apply_calibration_to_profile` | Pas calibratie-aanpassingen toe op profiel |
| `get_adaptive_recommendations` | Context-bewuste outfit-aanbevelingen |
| `find_similar_users` | Collaborative filtering voor aanbevelingen |

---

## 7. Zwaktes & Beperkingen

### 7.1 Kritiek — Architectuur

| Issue | Detail | Locatie |
|-------|--------|---------|
| **Match score clamping 70-98%** | Elke outfit scoort minstens 70%, wat differentiatie ondermijnt. Een slecht matchende outfit en een goed matchende outfit kunnen slechts 28% verschil tonen. | `matchScoreCalculator.ts` |
| **Default bias naar SMART_CASUAL** | SMART_CASUAL krijgt punten vanuit bijna elke dimensie (office, casual, regular fit, subtiele prints) en is de fallback bij score < 10. Dit vermindert diversiteit. | `logic.ts:188` |
| **Default bias naar herfst** | Bij `neutraal` temperatuur en gemiddelde antwoorden valt het systeem door naar herfst als default. | `logic.ts:45` |
| **Slechts 4 vaste kleurpaletten** | Geen interpolatie tussen seizoenen. Een "warme zomer" en "koele zomer" krijgen exact dezelfde kleuren. | `colorPalettes.ts` |

### 7.2 Kritiek — Inconsistenties

| Issue | Detail | Locatie |
|-------|--------|---------|
| **Jewelry-vraag mist in quiz** | `decideTemperature()` checkt `jewelry`, maar er is geen sieradenvraag in de 13 stappen. Temperature valt altijd terug op `neutrals`. | `logic.ts:3-7` vs `quizSteps.ts` |
| **Twee kleur-systemen niet gesynchroniseerd** | `colorPalettes.ts` (hex-gebaseerd, 4 seizoenen) en `colorSeasonFiltering.ts` (string-gebaseerd, andere kleurlijsten) opereren onafhankelijk. | `colorPalettes.ts` vs `colorSeasonFiltering.ts` |
| **Occasion-waarden mismatch** | Quiz biedt `work`/`casual`/`formal`/`date`/`travel`/`sport` aan, maar scoring checkt op `office`/`smartcasual`/`leisure` — strings die nooit uit de quiz komen. | `logic.ts:152-157` vs `quizSteps.ts` |
| **AnswerMap velden vs Quiz velden** | `AnswerMap` bevat `bodytype`, `comfort`, `brands`, `jewelry` die niet in de quiz zitten. Quiz heeft `neutrals`, `lightness` die niet alle paths door de engine volgen. | `types.ts` vs `quizSteps.ts` |
| **Legacy archetypes in score object** | `scores` initialiseert ook `"Clean Minimal"`, `"Smart Casual"`, `"Sporty Sharp"`, `"Classic Soft"` maar deze worden nooit gebruikt in selectie (alleen de 6 modernKeys). Dood gewicht. | `logic.ts:91-95` |

### 7.3 Hardcoded dat dynamisch zou moeten zijn

| Wat | Huidige staat | Beter |
|-----|---------------|-------|
| Scoringspunten per archetype | Vaste waarden in code (30, 40, 35 etc.) | Configuratie-tabel of admin-panel |
| Kleurpaletten | 4 vaste objecten in `colorPalettes.ts` | Database-gestuurd met mogelijkheid tot seizoensupdates |
| Archetype-configuratie | Hardcoded in `config/archetypes.ts` | Database of CMS voor flexibiliteit |
| Match score clamp (70-98) | `Math.max(70, Math.min(98, score))` | Dynamische drempels per context |
| Quiz/55% vs Swipe/45% weging | Hardcoded in archetypeDetector | A/B-testbaar via configuratie |
| Foto-analyse confidence drempel (0.6) | Vaste waarde | Configureerbaar per model-versie |

### 7.4 Waar nuance mist

| Gebied | Gap |
|--------|-----|
| **Seizoensovergangen** | Geen "warm herfst" vs "diep herfst" varianten — alle herfst-gebruikers krijgen hetzelfde palet |
| **Stijlblending** | Secundair archetype wordt meegewogen in fusionScore maar niet visueel gecommuniceerd in het palet |
| **Leeftijd/levensfase** | Niet gevraagd, niet meegenomen — een 22-jarige en 55-jarige met dezelfde antwoorden krijgen identieke output |
| **Gelegenheid per outfit** | Gebruiker kiest meerdere gelegenheden maar outfits worden niet per-gelegenheid gegroepeerd |
| **Materiaalvoorkeur in filtering** | Materialen beïnvloeden archetype-score maar worden niet direct gefilterd op productniveau |
| **Branding** | `brand_affinity` wordt bijgehouden maar niet actief meegewogen in de recommendation engine |
| **Sizes** | Maten worden opgeslagen maar niet gefilterd — outfits kunnen producten bevatten die niet in de maat van de gebruiker beschikbaar zijn |
| **Chroma-dimensie** | De `chroma` dimensie beïnvloedt het seizoen niet (parameter `_chroma` in `decideSeason`) en wordt minimaal gebruikt in verdere logica |

### 7.5 Risico's

| Risico | Impact |
|--------|--------|
| **Product-schaarste per segment** | Bij < 10 producten na filtering faalt de engine. Kleine catalogi voor specifieke gender/budget combinaties zijn kwetsbaar. |
| **localStorage als primary source** | Resultaatpagina leest primair uit localStorage. Als dit gewist wordt, is het profiel weg totdat Supabase sync plaatsvindt. |
| **Swipe embedding degradatie** | Swipe-data heeft 45% invloed maar er is geen decay — oude swipes wegen even zwaar als recente. |
| **Geen feedback loop naar scoring** | `outfit_calibration_feedback` wordt opgeslagen maar het is onduidelijk of en hoe dit de scoringsmatrix terugkoppelt. |

---

## Samenvatting

FitFi's recommendation engine is een **regelgebaseerd systeem** met een additief puntensysteem voor archetype-detectie en vaste seizoenspaletten voor kleuradvies. De engine combineert expliciete quiz-input (55%) met impliciete swipe-data (45%) voor archetype-bepaling.

**Sterktes:**
- Goed gelaagde architectuur met duidelijke scheiding van concerns
- Foto-analyse als objectieve kleurvalidatie
- Swipe-data voegt impliciete voorkeuren toe
- Meervoudige ranking met diversiteitscheck

**Grootste verbeterpunten:**
1. Match score clamping (70-98%) verbergt kwaliteitsverschillen
2. Slechts 4 vaste kleurpaletten voor alle gebruikers
3. SMART_CASUAL en herfst domineren als defaults
4. Occasion-waarden in scoring matchen niet met quiz-opties
5. Jewelry-vraag mist maar wordt wel gebruikt in temperature-logica
6. Twee ongesynchroniseerde kleur-systemen
7. Maten worden niet gefilterd in outfit-generatie
