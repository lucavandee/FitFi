# Mood Photos Content Policy - FitFi

## 🎯 DOEL
Mood photos moeten gebruikers helpen hun **kledingstijl** te identificeren. Ze zijn GEEN lifestyle fotografie.

---

## ✅ VEREISTEN (HARD RULES)

### 1. OUTFIT MUST BE PRIMARY FOCUS
- **Full outfit zichtbaar** (top + bottom + footwear)
- **Volledige kleding** (geen ondergoed shots, geen naaktheid)
- **Duidelijk zichtbaar** (niet verduisterd, geen dark shadows)
- **Focus op kleding**, niet op persoon

### 2. GENDER CORRECTNESS
- **Female photos**: ONLY female presenting individuals
- **Male photos**: ONLY male presenting individuals
- **NO MIXING**: Users moeten consistent gender zien
- **Unisex**: Alleen als outfit echt unisex is (bijv. basic hoodie + jeans)

### 3. APPROPRIATE CONTENT
- ❌ **NO accessories as main focus** (sigaretten, drankjes, etc.)
- ❌ **NO provocative poses** (seductive, overtly sexy)
- ❌ **NO partial nudity** (shirtless, underwear only, etc.)
- ❌ **NO lifestyle shots** (focus op activiteit in plaats van outfit)
- ✅ **YES outfit showcasing** (clean, clear, focused)

### 4. IMAGE QUALITY
- **High resolution** (min 800px width)
- **Good lighting** (niet te donker, niet overexposed)
- **Clear focus** (scherp, niet blurry)
- **Neutral background** (outfit is focus, niet omgeving)

### 5. STYLE CLARITY
- **Duidelijk archetype** (minimal, classic, bold, etc.)
- **Consistent binnen style** (geen mixed signals)
- **Representatief** (typisch voorbeeld van die stijl)

---

## 🚫 VERBODEN CONTENT

### Absolute No-Go's:
1. **Naaktheid** of partial nudity
2. **Ondergoed als outerwear** (beha, boxers, etc.)
3. **Accessories als main focus** (sigaret, drank, telefoon, etc.)
4. **Provocatieve poses** (seductief, seksueel getint)
5. **Face close-ups** (geen outfits zichtbaar)
6. **Activiteiten** waar outfit secundair is (sport in actie, zwemmen, etc.)
7. **Mixed gender** in een gender-specific category

### Red Flags (Check Extra):
- 🚩 Model kijkt direct in camera (kan provocatief zijn)
- 🚩 Tight crops (geen volledige outfit)
- 🚩 Dark/moody lighting (outfit niet duidelijk)
- 🚩 Busy background (afleiding van outfit)
- 🚩 Props in beeld (sigaret, drank, etc.)

---

## ✅ GOEDE VOORBEELDEN

### Minimal (Female):
```
✅ Full body shot
✅ Wit T-shirt + zwarte jeans + witte sneakers
✅ Neutrale achtergrond
✅ Model staat ontspannen
✅ Outfit is in focus
```

### Smart Casual (Male):
```
✅ Full body shot
✅ Oxford shirt + chino + loafers
✅ Goede lighting
✅ Duidelijk masculiene presentatie
✅ Geen props/accessories
```

---

## ❌ SLECHTE VOORBEELDEN

### FOUT: Accessory Focus
```
❌ Model met sigaret in hand
❌ Focus op roken, niet op outfit
→ REJECT: Accessory is main subject
```

### FOUT: Partial Nudity
```
❌ Shirtless male met alleen broek
❌ Female in bra met jasje
→ REJECT: Not fully clothed
```

### FOUT: Wrong Gender
```
❌ Female photo in male gallery
❌ Male photo in female gallery
→ REJECT: Gender mismatch
```

### FOUT: Lifestyle Shot
```
❌ Persoon op strand aan het zwemmen
❌ Workout in progress
→ REJECT: Activity is focus, not outfit
```

---

## 🔍 REVIEW CHECKLIST

Bij elke foto:

- [ ] Is volledige outfit zichtbaar? (top + bottom + shoes)
- [ ] Is persoon volledig gekleed? (geen naaktheid/ondergoed)
- [ ] Is gender correct voor doelgroep?
- [ ] Zijn er geen verboden accessories? (sigaret, drank)
- [ ] Is outfit de primary focus?
- [ ] Is image quality goed? (resolutie, lighting, scherpte)
- [ ] Is stijl duidelijk herkenbaar?
- [ ] Zou JIJ deze outfit willen dragen?

**Als 1 antwoord "NEE" is → REJECT**

---

## 🛠️ IMPLEMENTATION

### Database:
```sql
active = false  -- Deactiveer ongepaste foto's
```

### Admin Interface:
- Quick approve/reject buttons
- Rejection reason dropdown
- Bulk moderation tools
- Quality score indicator

### User Experience:
- Users zien ALLEEN active=true photos
- Gender filter wordt STRENG toegepast
- Fallback naar unisex als te weinig photos

---

## 📊 QUALITY METRICS

**Target:**
- ✅ 100% appropriate content
- ✅ 100% gender match
- ✅ 0% user complaints over ongepaste foto's
- ✅ 95%+ outfit clarity score

**Monitor:**
- User skip rate per photo
- Admin rejection rate
- User feedback/reports

---

## 🔄 MAINTENANCE

**Wekelijks:**
- Review new photos
- Check user reports
- Audit gender distribution

**Maandelijks:**
- Quality audit (random sample 10%)
- Update policy based on feedback
- Add new style categories if needed

---

**PRINCIPLE: Als je twijfelt, reject. Liever te streng dan ongepaste content.**
