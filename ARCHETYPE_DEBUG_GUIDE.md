# Archetype Detection Debug Guide

## Wat is gefixed

### 1. ✅ Bohemian/Romantic/Edgy mapping
De quiz biedt deze stijlen aan, maar ze werden NIET gematched naar archetypes:

**Nu gematched:**
- **Bohemian** → AVANT_GARDE (30 punten) + SMART_CASUAL (15 punten)
- **Romantic** → CLASSIC (25 punten)
- **Edgy/Stoer** → STREETWEAR (25 punten) + AVANT_GARDE (20 punten)

### 2. ✅ BaseColors field detection
De quiz slaat kleurvoorkeuren op als `baseColors`, maar de analyzer zocht naar `colorPreference`.

**Nu gedetecteerd:**
- `baseColors` wordt nu als primaire bron gebruikt
- Felle kleuren (bold) → `temperature: 'warm'`, `chroma: 'gedurfd'`, `contrast: 'hoog'`

### 3. ✅ Chroma/Contrast dynamisch
Voorheen was chroma/contrast altijd laag voor neutral colors. Nu:
- **Bold colors** (felrood, neon) → `chroma: 'gedurfd'`, `contrast: 'hoog'`
- **Zwart + Wit** → `chroma: 'gedurfd'`, `contrast: 'hoog'`
- **Neutral only** → `chroma: 'zacht'`, `contrast: 'laag'`

## Hoe te testen

### Stap 1: Open browser console (F12)
Bij het invullen van de quiz zie je nu console logs:

```
[ArchetypeDetector] Detecting archetype...
[ArchetypeDetector] Archetype scores:
  - AVANT_GARDE: 45
  - STREETWEAR: 45
  - CLASSIC: 25
  - MINIMALIST: 0
[ArchetypeDetector] ✅ Result:
  primary: "AVANT_GARDE"
  secondary: "STREETWEAR"
  confidence: 0.7
```

### Stap 2: Check localStorage
Na het voltooien van de quiz:

1. Open DevTools → Application → Local Storage
2. Zoek key `ff_quiz_answers`
3. Check of `stylePreferences` array correct is opgeslagen:
   ```json
   {
     "stylePreferences": ["bohemian", "streetwear", "edgy"],
     "baseColors": "bold",
     "fit": "oversized",
     ...
   }
   ```

### Stap 3: Check StyleProfileGenerator logs
Bij het genereren van het profiel:

```
[StyleProfileGenerator] analyzeQuizColors input:
  hasBaseColors: true
  baseColors: "bold"
  colorPref: "bold"

[StyleProfileGenerator] Color mapping:
  input: "bold"
  temperature: "warm"
  preferredColors: ["rood", "elektrischblauw", "neongeel", "oranje"]

[StyleProfileGenerator] Quiz-only profile:
  temperature: "warm"
  chroma: "gedurfd"
  contrast: "hoog"
  hasBoldColors: true
  preferredColors: [...]
```

## Test scenarios

### Scenario 1: Bohemian + Bold colors
**Input:**
- Stijl: Bohemian
- Kleuren: Felle kleuren (bold)
- Fit: Relaxed

**Verwacht resultaat:**
- Archetype: AVANT_GARDE (primary)
- Temperature: warm
- Chroma: gedurfd
- Contrast: hoog
- Seizoen: herfst

### Scenario 2: Streetwear + Edgy + Neutral
**Input:**
- Stijl: Streetwear, Stoer (Edgy)
- Kleuren: Neutrale tinten
- Fit: Oversized

**Verwacht resultaat:**
- Archetype: STREETWEAR (primary)
- Temperature: koel
- Chroma: zacht (neutrale kleuren)
- Contrast: laag
- Seizoen: winter

### Scenario 3: Romantic + Pastel
**Input:**
- Stijl: Romantisch
- Kleuren: Pastel tinten
- Fit: Balanced

**Verwacht resultaat:**
- Archetype: CLASSIC (primary)
- Temperature: koel
- Chroma: zacht
- Contrast: laag
- Seizoen: zomer

## Bekende issues

### Issue 1: Calibratie laadt 0/0 outfits
**Oorzaak:** `CalibrationService.generateCalibrationOutfits()` retourneert lege array als:
- Geen products in database voor de gegeven category/gender
- `fetchProductForSlot()` faalt

**Oplossing:** Check of products tabel gevuld is:
```sql
SELECT COUNT(*) FROM products WHERE category IN ('top', 'bottom', 'footwear');
```

Als tabel leeg is, run de seed script:
```bash
npm run seed:products
```

### Issue 2: Moodfotos laden traag
**Oorzaak:** Geen cached visual preferences

**Oplossing:** Check of `style_swipes` tabel data bevat:
```sql
SELECT COUNT(*) FROM style_swipes WHERE user_id = 'YOUR_USER_ID';
```

## Debugging tips

1. **Clear localStorage** tussen tests om cache te vermijden
2. **Check Network tab** voor failed API calls
3. **Enable verbose logging** in browser console (filter: "StyleProfile", "Archetype")
4. **Test in incognito** om extension interference te vermijden

## Support

Als je nog steeds hetzelfde profiel krijgt:
1. Clear localStorage (`localStorage.clear()` in console)
2. Refresh page (hard refresh: Ctrl+Shift+R)
3. Start quiz opnieuw
4. Check console logs voor errors
5. Share console output in support ticket
