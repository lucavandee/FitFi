# FitFi Mood Photo Generation Prompts

## Overview

This document contains structured AI image generation prompts for creating mood photos
that power the FitFi visual preference (swipe) system. Each photo must be accompanied
by the metadata listed below, which feeds directly into the recommendation engine.

**Target**: 45 photos per gender (male + female) = 90 new photos total
**Tool**: Midjourney, FLUX 1.1 Pro, or equivalent high-quality AI image generator
**Output**: 1:1 aspect ratio, 1024x1024 minimum, WebP format for upload

---

## Required Metadata Per Photo

After generating each photo, record these fields for database insertion:

```json
{
  "image_url": "(upload URL after storing in Supabase mood-photos bucket)",
  "gender": "male" | "female",
  "archetype_weights": { "MINIMALIST": 0.0, "CLASSIC": 0.0, "SMART_CASUAL": 0.0, "STREETWEAR": 0.0, "ATHLETIC": 0.0, "AVANT_GARDE": 0.0 },
  "dominant_colors": ["zwart", "wit"],
  "mood_tags": ["minimal", "clean"],
  "style_attributes": { "formality": 0.5, "boldness": 0.2 },
  "active": true
}
```

### Rules
- `archetype_weights` must sum to 1.0
- `dominant_colors` use Dutch color names: zwart, wit, grijs, beige, camel, navy, blauw, groen, bordeaux, bruin, terracotta, roze, creme, cognac, olijf, goud, rood, geel, kobalt
- `mood_tags` must use tags recognized by the ArchetypeDetector (see tag list below)
- `formality`: 0.0 = very casual, 1.0 = black tie formal
- `boldness`: 0.0 = safe/understated, 1.0 = maximum statement

### Recognized Mood Tags (by archetype)
- MINIMALIST: `minimal`, `clean`, `monochrome`, `modern`, `refined`, `tonal`, `effen`, `simpel`
- CLASSIC: `classic`, `tailored`, `preppy`, `elegant`, `sophisticated`, `timeless`, `vintage`, `smart`, `formal`
- SMART_CASUAL: `smart-casual`, `casual`, `layered`, `knit`, `warm`, `tonal`, `modern`, `relaxed`
- STREETWEAR: `street`, `urban`, `oversized`, `streetwear`, `hoodie`, `sneaker`
- ATHLETIC: `sport`, `athletic`, `performance`, `tech`, `athleisure`
- AVANT_GARDE: `avant`, `conceptual`, `asymmetric`, `statement`, `edge`, `dramatic`
- Occasion: `kantoor`, `casual`, `evening`, `weekend`, `date`, `summer`, `winter`, `autumn`, `spring`
- Color tags: same as dominant_colors list

---

## Global Prompt Rules

Every prompt starts with this base:

```
Fashion editorial photograph, full-body shot of a [gender] model wearing [outfit description].
Natural pose, urban European setting (Amsterdam/Rotterdam street, cafe terrace, park, modern office lobby).
Soft natural lighting, shallow depth of field, fashion magazine quality.
No text, no logos, no watermarks, clean background.
The model should look like a real person, age 25-35, diverse ethnicities.
Shot on 85mm lens, f/2.8, golden hour or overcast daylight.
```

---

## MALE PROMPTS

### Category 1: MINIMALIST (10 photos)

#### M-MIN-01: All-Black Minimal
```
Fashion editorial photograph, full-body shot of a male model wearing an all-black outfit:
slim black merino crewneck sweater, tailored black trousers with clean hem, black leather
Chelsea boots. No accessories except a simple black watch. Standing in a minimalist concrete
corridor with soft directional light. Clean lines, architectural backdrop.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.80, "CLASSIC": 0.10, "AVANT_GARDE": 0.10}`
- dominant_colors: `["zwart"]`
- mood_tags: `["minimal", "clean", "monochrome", "refined"]`
- style_attributes: `{"formality": 0.50, "boldness": 0.15}`

#### M-MIN-02: Tonal Beige/Camel
```
Fashion editorial photograph, full-body shot of a male model wearing a tonal earth outfit:
unstructured camel wool overcoat over a beige fine-knit turtleneck, sand-colored tailored
trousers, tan suede loafers. Walking on a quiet Amsterdam canal bridge in autumn light.
Warm, sophisticated, monochromatic color story.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.60, "CLASSIC": 0.30, "SMART_CASUAL": 0.10}`
- dominant_colors: `["camel", "beige"]`
- mood_tags: `["minimal", "tonal", "sophisticated", "warm", "autumn"]`
- style_attributes: `{"formality": 0.55, "boldness": 0.10}`

#### M-MIN-03: White Summer Minimal
```
Fashion editorial photograph, full-body shot of a male model wearing a crisp white linen
shirt with relaxed collar (sleeves slightly rolled), white wide-leg linen trousers, white
minimal leather sneakers. Standing against a light stone wall, bright summer daylight.
Clean, effortless, Mediterranean-meets-Dutch simplicity.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.65, "SMART_CASUAL": 0.25, "CLASSIC": 0.10}`
- dominant_colors: `["wit"]`
- mood_tags: `["minimal", "clean", "summer", "effen"]`
- style_attributes: `{"formality": 0.30, "boldness": 0.05}`

#### M-MIN-04: Charcoal Layered
```
Fashion editorial photograph, full-body shot of a male model wearing layered charcoal:
charcoal wool overshirt over a dark grey cotton t-shirt, charcoal slim chinos, dark grey
suede desert boots. Leaning against a modern glass storefront. Overcast Dutch light,
urban minimalism.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.70, "SMART_CASUAL": 0.20, "STREETWEAR": 0.10}`
- dominant_colors: `["grijs", "zwart"]`
- mood_tags: `["minimal", "layered", "modern", "tonal"]`
- style_attributes: `{"formality": 0.40, "boldness": 0.15}`

#### M-MIN-05: Navy + White Clean
```
Fashion editorial photograph, full-body shot of a male model wearing a navy unstructured
cotton blazer over a plain white crew-neck t-shirt, dark indigo slim jeans, white minimal
leather sneakers. Hands in pockets, walking through a clean modern Dutch streetscape.
Effortless, polished casual.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.45, "SMART_CASUAL": 0.35, "CLASSIC": 0.20}`
- dominant_colors: `["navy", "wit"]`
- mood_tags: `["minimal", "clean", "casual", "modern"]`
- style_attributes: `{"formality": 0.45, "boldness": 0.10}`

#### M-MIN-06: Greige Soft Tailoring (2026 Trend)
```
Fashion editorial photograph, full-body shot of a male model wearing soft tailoring in
greige tones: unstructured greige wool-blend suit with relaxed-fit trousers, no tie,
cream mock-neck under the jacket, taupe suede loafers. Standing in a light-filled modern
gallery space. Soft, deconstructed elegance inspired by 2026 relaxed tailoring trend.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.50, "CLASSIC": 0.40, "SMART_CASUAL": 0.10}`
- dominant_colors: `["beige", "grijs"]`
- mood_tags: `["minimal", "tailored", "refined", "tonal", "modern"]`
- style_attributes: `{"formality": 0.65, "boldness": 0.10}`

#### M-MIN-07: Black + Camel Contrast
```
Fashion editorial photograph, full-body shot of a male model wearing a camel cashmere
half-zip sweater over a black slim turtleneck, black tailored wool trousers, black leather
lace-up shoes. Sharp contrast of warm and dark tones. Standing in a modern minimalist
interior with concrete and wood.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.55, "CLASSIC": 0.35, "SMART_CASUAL": 0.10}`
- dominant_colors: `["camel", "zwart"]`
- mood_tags: `["minimal", "refined", "sophisticated", "modern"]`
- style_attributes: `{"formality": 0.60, "boldness": 0.15}`

#### M-MIN-08: Oatmeal Knitwear
```
Fashion editorial photograph, full-body shot of a male model wearing an oversized oatmeal
chunky knit sweater, stone-colored wide straight trousers, off-white New Balance-style
chunky sneakers. Relaxed posture, sitting on a concrete bench in a Dutch park. Soft,
cozy, textured minimalism for winter.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.50, "SMART_CASUAL": 0.40, "CLASSIC": 0.10}`
- dominant_colors: `["creme", "beige"]`
- mood_tags: `["minimal", "knit", "warm", "relaxed", "winter"]`
- style_attributes: `{"formality": 0.25, "boldness": 0.05}`

#### M-MIN-09: Olive Minimal Utility
```
Fashion editorial photograph, full-body shot of a male model wearing a muted olive cotton
field jacket (minimal design, no cargo pockets), white t-shirt underneath, dark grey slim
trousers, white minimal sneakers. Walking through Rotterdam architecture. Functional
minimalism with a subtle military nod.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.50, "STREETWEAR": 0.25, "SMART_CASUAL": 0.25}`
- dominant_colors: `["olijf", "wit", "grijs"]`
- mood_tags: `["minimal", "modern", "casual", "layered"]`
- style_attributes: `{"formality": 0.30, "boldness": 0.20}`

#### M-MIN-10: Slate Blue Mono
```
Fashion editorial photograph, full-body shot of a male model wearing a dusty slate blue
merino polo shirt, matching slate blue tailored trousers, grey suede loafers. Tonal
head-to-toe blue-grey color story. Standing in front of a modern Dutch townhouse with a
black door. Quiet confidence, color drenching trend.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.60, "CLASSIC": 0.25, "SMART_CASUAL": 0.15}`
- dominant_colors: `["blauw", "grijs"]`
- mood_tags: `["minimal", "tonal", "refined", "modern"]`
- style_attributes: `{"formality": 0.50, "boldness": 0.15}`

---

### Category 2: CLASSIC (8 photos)

#### M-CLS-01: Navy Blazer + Chinos
```
Fashion editorial photograph, full-body shot of a male model wearing a classic navy wool
blazer with gold buttons, light blue Oxford cloth button-down shirt, khaki chinos, brown
leather penny loafers. Classic preppy look. Standing on a brick-paved Amsterdam side
street with bikes in background. Timeless, polished.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.70, "SMART_CASUAL": 0.20, "MINIMALIST": 0.10}`
- dominant_colors: `["navy", "beige", "blauw"]`
- mood_tags: `["classic", "preppy", "tailored", "timeless"]`
- style_attributes: `{"formality": 0.65, "boldness": 0.10}`

#### M-CLS-02: Camel Overcoat Formal
```
Fashion editorial photograph, full-body shot of a male model wearing a structured camel
wool overcoat over a charcoal turtleneck, charcoal flannel trousers, dark brown leather
Oxford shoes, leather gloves in hand. Walking on a wet Amsterdam evening street. Refined
winter elegance.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.65, "MINIMALIST": 0.25, "SMART_CASUAL": 0.10}`
- dominant_colors: `["camel", "grijs"]`
- mood_tags: `["classic", "elegant", "sophisticated", "winter"]`
- style_attributes: `{"formality": 0.75, "boldness": 0.10}`

#### M-CLS-03: Preppy Quarter-Zip (2026 Trend)
```
Fashion editorial photograph, full-body shot of a male model wearing a cream cable-knit
quarter-zip sweater over a white collared shirt (collar popped through), dark navy chinos,
tan leather boat shoes. Leaning against a wooden cafe terrace railing. Relaxed Ivy League
preppy, strong 2026 trend.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.65, "SMART_CASUAL": 0.30, "MINIMALIST": 0.05}`
- dominant_colors: `["creme", "navy", "wit"]`
- mood_tags: `["classic", "preppy", "knit", "casual", "spring"]`
- style_attributes: `{"formality": 0.45, "boldness": 0.10}`

#### M-CLS-04: Grey Suit Smart
```
Fashion editorial photograph, full-body shot of a male model wearing a medium grey wool
suit (slim-modern fit, no padding), white dress shirt with top button open (no tie),
black leather double monk-strap shoes. In a modern office lobby with marble and brass.
Professional without being corporate.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.60, "MINIMALIST": 0.25, "SMART_CASUAL": 0.15}`
- dominant_colors: `["grijs", "wit"]`
- mood_tags: `["classic", "tailored", "formal", "kantoor", "sophisticated"]`
- style_attributes: `{"formality": 0.80, "boldness": 0.10}`

#### M-CLS-05: Denim + Knit Heritage
```
Fashion editorial photograph, full-body shot of a male model wearing dark raw denim jeans
(straight leg), a burgundy lambswool crew-neck sweater, tan leather belt, brown suede
chukka boots. Warm autumn park setting. Heritage feel with modern fit.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.55, "SMART_CASUAL": 0.35, "MINIMALIST": 0.10}`
- dominant_colors: `["bordeaux", "blauw", "bruin"]`
- mood_tags: `["classic", "vintage", "casual", "knit", "autumn"]`
- style_attributes: `{"formality": 0.40, "boldness": 0.15}`

#### M-CLS-06: Tartan Check (2026 Trend)
```
Fashion editorial photograph, full-body shot of a male model wearing a dark green and
navy tartan check wool blazer, cream turtleneck underneath, dark navy trousers, dark
brown leather Chelsea boots. Standing against a grey stone wall. Modern take on Scottish
tartan trend for 2026.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.55, "AVANT_GARDE": 0.25, "SMART_CASUAL": 0.20}`
- dominant_colors: `["groen", "navy", "creme"]`
- mood_tags: `["classic", "tailored", "sophisticated", "autumn", "statement"]`
- style_attributes: `{"formality": 0.60, "boldness": 0.35}`

#### M-CLS-07: Linen Summer Classic
```
Fashion editorial photograph, full-body shot of a male model wearing a relaxed-fit beige
linen suit (unstructured, slightly wrinkled naturally), white linen camp collar shirt open,
tan woven leather sandals or espadrilles. Mediterranean terrace vibe but in Dutch summer
setting. Effortless summer elegance.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.50, "SMART_CASUAL": 0.40, "MINIMALIST": 0.10}`
- dominant_colors: `["beige", "wit"]`
- mood_tags: `["classic", "relaxed", "summer", "elegant"]`
- style_attributes: `{"formality": 0.45, "boldness": 0.05}`

#### M-CLS-08: Racing Green Elegance
```
Fashion editorial photograph, full-body shot of a male model wearing a racing green wool
overcoat, cream cable-knit sweater, dark brown corduroy trousers, polished cognac leather
brogue boots. Standing on a leafy Amsterdam canal path. Rich, refined autumn palette.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.65, "SMART_CASUAL": 0.20, "MINIMALIST": 0.15}`
- dominant_colors: `["groen", "creme", "bruin"]`
- mood_tags: `["classic", "elegant", "vintage", "autumn", "warm"]`
- style_attributes: `{"formality": 0.55, "boldness": 0.20}`

---

### Category 3: SMART CASUAL (8 photos)

#### M-SC-01: Overshirt + Chino
```
Fashion editorial photograph, full-body shot of a male model wearing a brushed cotton
olive overshirt (unbuttoned), white t-shirt underneath, stone-colored chinos, white
leather sneakers. Hands in pockets, walking down a modern Dutch residential street.
The quintessential 2025/2026 smart casual look.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.60, "MINIMALIST": 0.25, "STREETWEAR": 0.15}`
- dominant_colors: `["olijf", "wit", "beige"]`
- mood_tags: `["smart-casual", "casual", "layered", "modern"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.15}`

#### M-SC-02: Knit Polo + Trousers
```
Fashion editorial photograph, full-body shot of a male model wearing a fitted navy knit
polo shirt (long sleeve, 2026 trend), tan tailored trousers with a single pleat, cognac
leather loafers, no socks visible. Sitting on a modernist wooden bench. Polished but
relaxed, warm weather smart casual.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.50, "CLASSIC": 0.35, "MINIMALIST": 0.15}`
- dominant_colors: `["navy", "beige", "cognac"]`
- mood_tags: `["smart-casual", "knit", "modern", "refined", "summer"]`
- style_attributes: `{"formality": 0.55, "boldness": 0.10}`

#### M-SC-03: Denim Jacket Layered
```
Fashion editorial photograph, full-body shot of a male model wearing a medium-wash
denim trucker jacket, grey marl hoodie underneath (hood visible at collar), black slim
jeans, white chunky sneakers. Casual street setting with graffiti-free brick wall.
Layered everyday look, youthful smart casual.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.40, "STREETWEAR": 0.40, "MINIMALIST": 0.20}`
- dominant_colors: `["blauw", "grijs", "zwart"]`
- mood_tags: `["casual", "layered", "modern", "street"]`
- style_attributes: `{"formality": 0.20, "boldness": 0.25}`

#### M-SC-04: Weekend Comfort
```
Fashion editorial photograph, full-body shot of a male model wearing a relaxed oatmeal
sweatshirt (premium quality, no logos), dark olive cargo-style trousers (tapered, modern
fit), off-white canvas sneakers. Walking through a Sunday market. Comfortable, considered
weekend dressing.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.55, "STREETWEAR": 0.25, "MINIMALIST": 0.20}`
- dominant_colors: `["creme", "olijf"]`
- mood_tags: `["casual", "relaxed", "warm", "weekend"]`
- style_attributes: `{"formality": 0.15, "boldness": 0.05}`

#### M-SC-05: Bomber + Roll Neck
```
Fashion editorial photograph, full-body shot of a male model wearing a dark navy
MA-1 style bomber jacket, charcoal roll-neck sweater, dark grey wool trousers, black
leather Chelsea boots. Evening city setting with warm ambient light. Elevated casual
for dinner or drinks.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.45, "MINIMALIST": 0.30, "STREETWEAR": 0.25}`
- dominant_colors: `["navy", "grijs", "zwart"]`
- mood_tags: `["smart-casual", "layered", "modern", "evening"]`
- style_attributes: `{"formality": 0.45, "boldness": 0.20}`

#### M-SC-06: Linen Shirt + Shorts
```
Fashion editorial photograph, full-body shot of a male model wearing a relaxed sky-blue
linen shirt (untucked), cream tailored shorts just above the knee, tan leather slide
sandals. Walking along a Dutch waterfront or beach boulevard. Light, breezy summer
smart casual.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.60, "CLASSIC": 0.25, "MINIMALIST": 0.15}`
- dominant_colors: `["blauw", "creme"]`
- mood_tags: `["casual", "relaxed", "summer", "warm"]`
- style_attributes: `{"formality": 0.20, "boldness": 0.05}`

#### M-SC-07: Leather Jacket Refined
```
Fashion editorial photograph, full-body shot of a male model wearing a cognac/tan leather
jacket (cafe racer style, minimal hardware), white crew-neck t-shirt, dark straight
jeans, white minimal sneakers. Standing against a red-brick Amsterdam warehouse. Smart
edge without trying too hard.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.40, "STREETWEAR": 0.30, "CLASSIC": 0.30}`
- dominant_colors: `["cognac", "wit", "blauw"]`
- mood_tags: `["casual", "modern", "layered", "street"]`
- style_attributes: `{"formality": 0.30, "boldness": 0.30}`

#### M-SC-08: Pink/Cherry Polo (2026 Trend)
```
Fashion editorial photograph, full-body shot of a male model wearing a cherry red/soft
pink premium cotton polo shirt, cream chinos, white leather sneakers. Confident, relaxed
stance in a modern Dutch park setting with green trees. Embracing the 2026 masculine
pink/cherry trend without looking costume-like.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.50, "CLASSIC": 0.30, "MINIMALIST": 0.20}`
- dominant_colors: `["roze", "creme", "wit"]`
- mood_tags: `["smart-casual", "modern", "casual", "summer"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.30}`

---

### Category 4: STREETWEAR (8 photos)

#### M-STR-01: Oversized Urban Black
```
Fashion editorial photograph, full-body shot of a male model wearing an oversized black
heavyweight hoodie, black wide-leg cargo pants, black and white chunky high-top sneakers.
Amsterdam street corner with a bicycle lane. Urban, confident, monochrome streetwear.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.75, "AVANT_GARDE": 0.15, "MINIMALIST": 0.10}`
- dominant_colors: `["zwart", "wit"]`
- mood_tags: `["streetwear", "urban", "oversized", "monochrome"]`
- style_attributes: `{"formality": 0.10, "boldness": 0.55}`

#### M-STR-02: Denim-on-Denim (Raw Denim 2026)
```
Fashion editorial photograph, full-body shot of a male model wearing a raw indigo denim
jacket (slightly oversized), lighter wash wide-leg jeans, white retro-style sneakers,
white t-shirt visible at neckline. Standing in front of an industrial Dutch warehouse.
Double denim with tonal contrast.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.55, "SMART_CASUAL": 0.25, "CLASSIC": 0.20}`
- dominant_colors: `["blauw", "wit"]`
- mood_tags: `["streetwear", "casual", "urban", "vintage"]`
- style_attributes: `{"formality": 0.15, "boldness": 0.35}`

#### M-STR-03: Tech Gorpcore
```
Fashion editorial photograph, full-body shot of a male model wearing a dark olive
technical shell jacket with sealed seams, black merino base layer visible at neck, dark
grey technical joggers with zipped pockets, trail running sneakers in earth tones. Urban
park setting. Functional gorpcore streetwear with clean styling.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.45, "ATHLETIC": 0.40, "MINIMALIST": 0.15}`
- dominant_colors: `["olijf", "zwart", "grijs"]`
- mood_tags: `["streetwear", "tech", "performance", "urban"]`
- style_attributes: `{"formality": 0.10, "boldness": 0.35}`

#### M-STR-04: Vintage Sporty
```
Fashion editorial photograph, full-body shot of a male model wearing a retro-style
cream and navy color-block track jacket (70s inspired), white t-shirt, navy straight-fit
track pants with side stripe, retro-style sneakers in white/navy. Nostalgic, clean
vintage sport aesthetic.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.40, "ATHLETIC": 0.35, "CLASSIC": 0.25}`
- dominant_colors: `["navy", "creme", "wit"]`
- mood_tags: `["streetwear", "vintage", "sport", "casual"]`
- style_attributes: `{"formality": 0.15, "boldness": 0.30}`

#### M-STR-05: Cargo + Knit Mix
```
Fashion editorial photograph, full-body shot of a male model wearing a cream chunky knit
fisherman sweater, olive cargo pants (relaxed fit, modern silhouette), tan suede hiking
boots. Crossover between comfort and utility. Dutch winter street scene.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.40, "SMART_CASUAL": 0.35, "CLASSIC": 0.25}`
- dominant_colors: `["creme", "olijf", "bruin"]`
- mood_tags: `["streetwear", "casual", "layered", "warm", "winter"]`
- style_attributes: `{"formality": 0.20, "boldness": 0.20}`

#### M-STR-06: Leather Pants Bold (2026 Trend)
```
Fashion editorial photograph, full-body shot of a male model wearing slim black leather
trousers (matte finish), oversized grey melange crew-neck sweatshirt, black chunky
sole boots. Hands in sweatshirt pocket. Urban Rotterdam setting with modern architecture.
Edgy yet wearable, 2026 leather pants trend for men.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.45, "AVANT_GARDE": 0.40, "MINIMALIST": 0.15}`
- dominant_colors: `["zwart", "grijs"]`
- mood_tags: `["streetwear", "edge", "statement", "urban", "modern"]`
- style_attributes: `{"formality": 0.25, "boldness": 0.60}`

#### M-STR-07: Earth-Tone Layered
```
Fashion editorial photograph, full-body shot of a male model wearing a terracotta
corduroy shirt-jacket over a black t-shirt, khaki relaxed chinos, tan suede sneakers.
Layered earth tones, warm and approachable. Dutch cafe sidewalk setting in autumn.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.35, "SMART_CASUAL": 0.40, "CLASSIC": 0.25}`
- dominant_colors: `["terracotta", "zwart", "beige"]`
- mood_tags: `["streetwear", "casual", "layered", "warm", "autumn"]`
- style_attributes: `{"formality": 0.25, "boldness": 0.20}`

#### M-STR-08: Cobalt Statement (2026 Color Trend)
```
Fashion editorial photograph, full-body shot of a male model wearing a cobalt blue
puffer vest over a white long-sleeve t-shirt, black straight-leg jeans, black and white
sneakers. Pop of bold capri blue against neutrals. Urban Dutch backdrop. The key color
trend of 2026.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.50, "SMART_CASUAL": 0.25, "ATHLETIC": 0.25}`
- dominant_colors: `["kobalt", "wit", "zwart"]`
- mood_tags: `["streetwear", "modern", "casual", "statement"]`
- style_attributes: `{"formality": 0.20, "boldness": 0.45}`

---

### Category 5: ATHLETIC (6 photos)

#### M-ATH-01: Clean Performance Black
```
Fashion editorial photograph, full-body shot of a male model wearing a fitted black
tech t-shirt, black performance joggers with subtle zippered pockets, black-and-white
running shoes. Clean, modern gym-to-street transition. White minimalist gym or studio
environment.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.70, "MINIMALIST": 0.20, "STREETWEAR": 0.10}`
- dominant_colors: `["zwart", "wit"]`
- mood_tags: `["athletic", "performance", "minimal", "clean"]`
- style_attributes: `{"formality": 0.05, "boldness": 0.15}`

#### M-ATH-02: Athleisure Grey Tonal
```
Fashion editorial photograph, full-body shot of a male model wearing a light grey
premium zip-up hoodie (tech fleece material), matching grey tapered joggers, grey and
white running sneakers. Monochrome athletic elegance. Walking through a modern Dutch
park with a morning jog vibe.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.55, "MINIMALIST": 0.30, "SMART_CASUAL": 0.15}`
- dominant_colors: `["grijs", "wit"]`
- mood_tags: `["athletic", "athleisure", "minimal", "tonal"]`
- style_attributes: `{"formality": 0.10, "boldness": 0.10}`

#### M-ATH-03: Sport Luxe
```
Fashion editorial photograph, full-body shot of a male model wearing a navy performance
bomber jacket with knit collar, white premium polo shirt, dark navy tailored joggers
(dress-pant style with athletic fabric), clean white leather sneakers. Elevated athletic
wear for a business casual environment.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.40, "SMART_CASUAL": 0.35, "MINIMALIST": 0.25}`
- dominant_colors: `["navy", "wit"]`
- mood_tags: `["athletic", "smart-casual", "modern", "clean"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.15}`

#### M-ATH-04: Running Style
```
Fashion editorial photograph, full-body shot of a male model wearing a lightweight
breathable running vest in black, fitted moisture-wicking crew t-shirt in olive, black
running tights or fitted shorts over leggings, bright-sole running shoes. Dynamic pose
mid-stride in an urban environment.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.80, "STREETWEAR": 0.10, "MINIMALIST": 0.10}`
- dominant_colors: `["zwart", "olijf"]`
- mood_tags: `["athletic", "performance", "sport", "tech"]`
- style_attributes: `{"formality": 0.05, "boldness": 0.25}`

#### M-ATH-05: Retro Athletic
```
Fashion editorial photograph, full-body shot of a male model wearing a vintage-style
cream and forest green color-block windbreaker, white retro running shorts showing above
the knee, vintage-style sneakers in cream and green, white tube socks. Nostalgic 80s
athletic aesthetic, modern quality. Bright outdoor setting.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.50, "STREETWEAR": 0.30, "CLASSIC": 0.20}`
- dominant_colors: `["creme", "groen"]`
- mood_tags: `["athletic", "vintage", "sport", "casual", "summer"]`
- style_attributes: `{"formality": 0.05, "boldness": 0.30}`

#### M-ATH-06: Cycling/Commuter
```
Fashion editorial photograph, full-body shot of a male model wearing a dark charcoal
water-repellent cycling jacket with reflective details, black performance chinos
(stretchy, commuter-style), black leather minimal sneakers. Bicycle visible in frame.
Modern Dutch commuter athletic style.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.45, "MINIMALIST": 0.30, "SMART_CASUAL": 0.25}`
- dominant_colors: `["grijs", "zwart"]`
- mood_tags: `["athletic", "tech", "modern", "urban"]`
- style_attributes: `{"formality": 0.25, "boldness": 0.15}`

---

### Category 6: AVANT-GARDE (5 photos)

#### M-AG-01: All-Black Draped
```
Fashion editorial photograph, full-body shot of a male model wearing an all-black
draped wool coat with asymmetric hem, black high-neck fitted top, black wide-leg
cropped trousers, black leather platform boots. Standing in a brutalist concrete
architecture setting. Dramatic, sculptural silhouette.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.80, "MINIMALIST": 0.15, "STREETWEAR": 0.05}`
- dominant_colors: `["zwart"]`
- mood_tags: `["avant", "dramatic", "statement", "monochrome"]`
- style_attributes: `{"formality": 0.40, "boldness": 0.85}`

#### M-AG-02: Deconstructed Tailoring
```
Fashion editorial photograph, full-body shot of a male model wearing a deconstructed
charcoal blazer with raw edges and exposed seams, white asymmetric-hem shirt, black
slightly cropped wide trousers, black chunky derby shoes. Art gallery setting.
Intellectual fashion-forward look.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.65, "CLASSIC": 0.20, "MINIMALIST": 0.15}`
- dominant_colors: `["grijs", "wit", "zwart"]`
- mood_tags: `["avant", "conceptual", "asymmetric", "tailored"]`
- style_attributes: `{"formality": 0.50, "boldness": 0.70}`

#### M-AG-03: Oversized Volume
```
Fashion editorial photograph, full-body shot of a male model wearing a dramatically
oversized dark brown/chocolate wool overcoat (almost knee-length, very wide shoulders),
black turtleneck, black slim trousers, black leather boots. Contrast between volume
on top and slim bottom. Industrial setting with exposed pipes.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.60, "MINIMALIST": 0.25, "CLASSIC": 0.15}`
- dominant_colors: `["bruin", "zwart"]`
- mood_tags: `["avant", "statement", "dramatic", "modern", "winter"]`
- style_attributes: `{"formality": 0.45, "boldness": 0.65}`

#### M-AG-04: Monochrome Texture Play
```
Fashion editorial photograph, full-body shot of a male model wearing all white but
with different textures: white quilted vest over white ribbed knit sweater, white
canvas wide-leg trousers, white chunky sole leather boots. Playing with texture
within monochrome. Clean white studio-like environment.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.55, "MINIMALIST": 0.35, "SMART_CASUAL": 0.10}`
- dominant_colors: `["wit", "creme"]`
- mood_tags: `["avant", "conceptual", "minimal", "monochrome", "statement"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.50}`

#### M-AG-05: Dark Romantic
```
Fashion editorial photograph, full-body shot of a male model wearing a black sheer-panel
knit sweater (subtle, not fully transparent), black satin-finish wide trousers, pointed
black leather boots, silver chain necklace visible. Evening setting with moody warm
lighting. Dark romance meets modern menswear, gender-fluid energy.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.70, "STREETWEAR": 0.15, "CLASSIC": 0.15}`
- dominant_colors: `["zwart"]`
- mood_tags: `["avant", "dramatic", "edge", "evening", "statement"]`
- style_attributes: `{"formality": 0.45, "boldness": 0.75}`

---

## FEMALE PROMPTS

### Category 1: MINIMALIST (10 photos)

#### F-MIN-01: Black Power Minimal
```
Fashion editorial photograph, full-body shot of a female model wearing a structured
black wool blazer (no buttons visible, clean lines), black fitted high-neck top, black
tailored wide-leg trousers, black pointed-toe leather mules. Standing in a modern white
gallery space. Power minimalism, architectural silhouette.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.70, "CLASSIC": 0.20, "AVANT_GARDE": 0.10}`
- dominant_colors: `["zwart"]`
- mood_tags: `["minimal", "clean", "monochrome", "sophisticated"]`
- style_attributes: `{"formality": 0.60, "boldness": 0.20}`

#### F-MIN-02: Beige Tonal Head-to-Toe
```
Fashion editorial photograph, full-body shot of a female model wearing a tonal beige
outfit: oversized camel cashmere cardigan, oatmeal silk camisole underneath, high-waisted
taupe wide-leg trousers, nude leather flat sandals. Walking along an Amsterdam canal in
golden light. Warm, effortless, tonal minimalism.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.60, "SMART_CASUAL": 0.25, "CLASSIC": 0.15}`
- dominant_colors: `["beige", "camel", "creme"]`
- mood_tags: `["minimal", "tonal", "warm", "relaxed", "summer"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.05}`

#### F-MIN-03: White Shirt + Black Trousers
```
Fashion editorial photograph, full-body shot of a female model wearing a crisp oversized
white cotton poplin shirt (untucked on one side), black high-waisted straight-leg
trousers, black leather pointed flats. Simple gold stud earrings. Standing in a
sunlit modern doorway. The perfect wardrobe basic elevated.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.65, "CLASSIC": 0.25, "SMART_CASUAL": 0.10}`
- dominant_colors: `["wit", "zwart"]`
- mood_tags: `["minimal", "clean", "classic", "timeless"]`
- style_attributes: `{"formality": 0.50, "boldness": 0.10}`

#### F-MIN-04: Grey Knit Dress
```
Fashion editorial photograph, full-body shot of a female model wearing a mid-calf
grey merino knit dress (body-skimming, not tight), tall black leather boots, no visible
accessories. Walking on a quiet Dutch street in autumn. Effortless one-piece minimalism,
cozy yet polished.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.65, "CLASSIC": 0.20, "SMART_CASUAL": 0.15}`
- dominant_colors: `["grijs", "zwart"]`
- mood_tags: `["minimal", "knit", "clean", "autumn", "refined"]`
- style_attributes: `{"formality": 0.45, "boldness": 0.05}`

#### F-MIN-05: Cream Summer Linen
```
Fashion editorial photograph, full-body shot of a female model wearing a relaxed cream
linen co-ord set: oversized linen shirt and matching wide-leg cropped linen trousers,
tan leather slide sandals, delicate gold necklace. Bright summer daylight on a terrace.
Clean holiday minimalism.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.55, "SMART_CASUAL": 0.35, "CLASSIC": 0.10}`
- dominant_colors: `["creme", "beige"]`
- mood_tags: `["minimal", "relaxed", "summer", "clean"]`
- style_attributes: `{"formality": 0.25, "boldness": 0.05}`

#### F-MIN-06: Navy Column Silhouette
```
Fashion editorial photograph, full-body shot of a female model wearing a long navy
wool coat (below knee, straight cut), navy turtleneck, navy wide-leg trousers, black
leather loafers. Head-to-toe navy column. Standing in a modern concrete plaza.
Architectural, disciplined, powerful.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.60, "CLASSIC": 0.30, "AVANT_GARDE": 0.10}`
- dominant_colors: `["navy", "zwart"]`
- mood_tags: `["minimal", "tonal", "sophisticated", "modern", "winter"]`
- style_attributes: `{"formality": 0.60, "boldness": 0.15}`

#### F-MIN-07: Soft Tailoring Greige (2026 Trend)
```
Fashion editorial photograph, full-body shot of a female model wearing a relaxed-fit
greige wool-blend blazer with soft shoulders, matching greige wide-leg trousers, cream
silk blouse with a subtle sheen visible at neckline, nude pointed-toe heels. Modern
office or gallery. The 2026 soft tailoring trend, deconstructed power dressing.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.50, "CLASSIC": 0.35, "SMART_CASUAL": 0.15}`
- dominant_colors: `["beige", "grijs", "creme"]`
- mood_tags: `["minimal", "tailored", "modern", "refined", "kantoor"]`
- style_attributes: `{"formality": 0.65, "boldness": 0.10}`

#### F-MIN-08: Olive Utility Minimal
```
Fashion editorial photograph, full-body shot of a female model wearing a muted olive
cotton utility jumpsuit with a belt at the waist, clean minimal design, black leather
ankle boots. Walking through Rotterdam Kop van Zuid. Functional beauty, practical
minimalism with an edge.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.45, "STREETWEAR": 0.30, "SMART_CASUAL": 0.25}`
- dominant_colors: `["olijf", "zwart"]`
- mood_tags: `["minimal", "modern", "casual", "urban"]`
- style_attributes: `{"formality": 0.30, "boldness": 0.25}`

#### F-MIN-09: Black Slip Dress
```
Fashion editorial photograph, full-body shot of a female model wearing a black satin
slip dress (midi length, bias cut), oversized black wool coat draped over shoulders,
black strappy sandals with low heel. Evening city scene with ambient warm light.
Quiet glamour, less is more.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.50, "AVANT_GARDE": 0.30, "CLASSIC": 0.20}`
- dominant_colors: `["zwart"]`
- mood_tags: `["minimal", "elegant", "evening", "refined"]`
- style_attributes: `{"formality": 0.65, "boldness": 0.30}`

#### F-MIN-10: Dusty Rose Mono (2026 Color)
```
Fashion editorial photograph, full-body shot of a female model wearing head-to-toe dusty
rose: a dusty rose knit sweater, matching dusty rose wide-leg trousers, nude/blush leather
flats. Tonal color drenching in a soft pink. Light-filled modern interior. Gentle, warm,
2026 pink color trend in minimal styling.
```
**Metadata:**
- archetype_weights: `{"MINIMALIST": 0.55, "SMART_CASUAL": 0.25, "CLASSIC": 0.20}`
- dominant_colors: `["roze", "nude"]`
- mood_tags: `["minimal", "tonal", "modern", "warm"]`
- style_attributes: `{"formality": 0.40, "boldness": 0.15}`

---

### Category 2: CLASSIC (8 photos)

#### F-CLS-01: Navy Blazer + White
```
Fashion editorial photograph, full-body shot of a female model wearing a double-breasted
navy wool blazer with gold buttons, white silk blouse, dark navy tailored trousers,
tan leather pointed-toe pumps with low block heel. Amsterdam canal house setting. Timeless
Parisian-Dutch sophistication.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.70, "MINIMALIST": 0.20, "SMART_CASUAL": 0.10}`
- dominant_colors: `["navy", "wit", "beige"]`
- mood_tags: `["classic", "tailored", "elegant", "sophisticated", "kantoor"]`
- style_attributes: `{"formality": 0.70, "boldness": 0.10}`

#### F-CLS-02: Camel Coat Classic
```
Fashion editorial photograph, full-body shot of a female model wearing a classic camel
wool wrap coat (belted), cream cashmere scarf, dark blue straight jeans, tan leather
knee-high boots. Walking along a tree-lined Amsterdam street in autumn. The ultimate
Dutch winter classic.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.60, "MINIMALIST": 0.25, "SMART_CASUAL": 0.15}`
- dominant_colors: `["camel", "creme", "blauw"]`
- mood_tags: `["classic", "elegant", "warm", "timeless", "winter"]`
- style_attributes: `{"formality": 0.55, "boldness": 0.10}`

#### F-CLS-03: Midi Skirt + Loafers (2026 Trend)
```
Fashion editorial photograph, full-body shot of a female model wearing a camel pleated
midi skirt, white fitted turtleneck, cognac leather penny loafers (2026 loafer trend),
structured tan leather handbag. Cafe terrace setting. Polished European daily uniform.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.60, "SMART_CASUAL": 0.30, "MINIMALIST": 0.10}`
- dominant_colors: `["camel", "wit", "cognac"]`
- mood_tags: `["classic", "preppy", "elegant", "casual"]`
- style_attributes: `{"formality": 0.50, "boldness": 0.10}`

#### F-CLS-04: Grey Suit Office
```
Fashion editorial photograph, full-body shot of a female model wearing a light grey
wool suit (relaxed blazer + matching wide-leg trousers), black silk cami visible
underneath blazer, black pointed-toe pumps. In a bright modern office. Contemporary
power dressing.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.55, "MINIMALIST": 0.35, "SMART_CASUAL": 0.10}`
- dominant_colors: `["grijs", "zwart"]`
- mood_tags: `["classic", "tailored", "formal", "kantoor", "sophisticated"]`
- style_attributes: `{"formality": 0.75, "boldness": 0.10}`

#### F-CLS-05: Breton Stripe Heritage
```
Fashion editorial photograph, full-body shot of a female model wearing a navy and
white Breton stripe long-sleeve top, high-waisted dark indigo straight jeans, red
leather ballet flats or loafers, small gold hoop earrings. Waterfront setting. Timeless
French-Dutch everyday style.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.55, "SMART_CASUAL": 0.35, "MINIMALIST": 0.10}`
- dominant_colors: `["navy", "wit", "rood"]`
- mood_tags: `["classic", "casual", "preppy", "timeless"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.15}`

#### F-CLS-06: Tartan Blazer (2026 Trend)
```
Fashion editorial photograph, full-body shot of a female model wearing a dark green
and brown tartan check blazer, cream silk blouse, dark brown leather pencil skirt
(midi length), dark brown leather ankle boots. Standing in front of a traditional
Dutch townhouse. Heritage tartan trend 2026 meets modern styling.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.55, "AVANT_GARDE": 0.25, "SMART_CASUAL": 0.20}`
- dominant_colors: `["groen", "bruin", "creme"]`
- mood_tags: `["classic", "tailored", "sophisticated", "statement", "autumn"]`
- style_attributes: `{"formality": 0.60, "boldness": 0.35}`

#### F-CLS-07: Summer Linen Elegant
```
Fashion editorial photograph, full-body shot of a female model wearing a white linen
wrap dress (midi length, flutter sleeves), tan leather woven sandals, straw tote bag,
delicate gold bracelet. Dutch terrace in summer sunshine. Breezy, elegant, vacation-ready
classic.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.50, "SMART_CASUAL": 0.35, "MINIMALIST": 0.15}`
- dominant_colors: `["wit", "beige"]`
- mood_tags: `["classic", "elegant", "relaxed", "summer"]`
- style_attributes: `{"formality": 0.40, "boldness": 0.05}`

#### F-CLS-08: Burgundy Evening
```
Fashion editorial photograph, full-body shot of a female model wearing a burgundy
satin midi dress with subtle draping, black cashmere cardigan over shoulders, black
pointed-toe heels, small gold clutch. Restaurant or theater entrance with warm evening
light. Understated evening elegance.
```
**Metadata:**
- archetype_weights: `{"CLASSIC": 0.55, "MINIMALIST": 0.25, "AVANT_GARDE": 0.20}`
- dominant_colors: `["bordeaux", "zwart"]`
- mood_tags: `["classic", "elegant", "evening", "sophisticated"]`
- style_attributes: `{"formality": 0.75, "boldness": 0.25}`

---

### Category 3: SMART CASUAL (8 photos)

#### F-SC-01: Jeans + Blazer
```
Fashion editorial photograph, full-body shot of a female model wearing a slightly
oversized beige linen blazer, white t-shirt, medium-wash straight-leg jeans, white
leather sneakers. Hair down, casual walk on a sunny Dutch street. The universal
smart casual outfit, approachable and polished.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.55, "MINIMALIST": 0.25, "CLASSIC": 0.20}`
- dominant_colors: `["beige", "wit", "blauw"]`
- mood_tags: `["smart-casual", "casual", "modern", "relaxed"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.10}`

#### F-SC-02: Knitwear + Midi Skirt
```
Fashion editorial photograph, full-body shot of a female model wearing an oversized
cream cable-knit sweater, olive green satin midi skirt, tan suede ankle boots. Walking
through an autumn park with fallen leaves. Cozy meets polished, textural contrast.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.50, "CLASSIC": 0.30, "MINIMALIST": 0.20}`
- dominant_colors: `["creme", "olijf", "bruin"]`
- mood_tags: `["smart-casual", "knit", "layered", "warm", "autumn"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.10}`

#### F-SC-03: Denim + Trench
```
Fashion editorial photograph, full-body shot of a female model wearing a classic beige
trench coat (belted), dark straight-leg jeans, striped navy and white t-shirt, white
leather loafers. Walking with purpose through a city center. The everyday uniform
elevated.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.45, "CLASSIC": 0.40, "MINIMALIST": 0.15}`
- dominant_colors: `["beige", "blauw", "wit"]`
- mood_tags: `["smart-casual", "classic", "casual", "layered"]`
- style_attributes: `{"formality": 0.40, "boldness": 0.10}`

#### F-SC-04: Athleisure Chic (2026 Trend)
```
Fashion editorial photograph, full-body shot of a female model wearing premium dark grey
joggers (tapered, elevated fabric), oversized cream blazer over the joggers, white fitted
t-shirt, white chunky sneakers. Coffee in hand. Urban Dutch cafe setting. The 2026
athleisure meets tailoring trend.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.40, "ATHLETIC": 0.30, "MINIMALIST": 0.30}`
- dominant_colors: `["grijs", "creme", "wit"]`
- mood_tags: `["smart-casual", "athleisure", "modern", "casual"]`
- style_attributes: `{"formality": 0.30, "boldness": 0.15}`

#### F-SC-05: Polka Dots (2026 Trend)
```
Fashion editorial photograph, full-body shot of a female model wearing a black and white
polka dot midi wrap dress, black leather belt at waist, black ankle boots, minimal gold
jewelry. Dutch city setting. The 2026 polka dot trend in a wearable, smart casual
interpretation.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.40, "CLASSIC": 0.35, "AVANT_GARDE": 0.25}`
- dominant_colors: `["zwart", "wit"]`
- mood_tags: `["smart-casual", "modern", "statement", "casual"]`
- style_attributes: `{"formality": 0.40, "boldness": 0.35}`

#### F-SC-06: Weekend Comfort
```
Fashion editorial photograph, full-body shot of a female model wearing a soft grey
cashmere hoodie (premium quality), black leggings, oversized camel scarf, white
minimalist sneakers. Walking through a Sunday morning market. Elevated comfort dressing
for the weekend.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.45, "ATHLETIC": 0.30, "MINIMALIST": 0.25}`
- dominant_colors: `["grijs", "zwart", "camel"]`
- mood_tags: `["casual", "relaxed", "warm", "weekend"]`
- style_attributes: `{"formality": 0.10, "boldness": 0.05}`

#### F-SC-07: Summer Dress Simple
```
Fashion editorial photograph, full-body shot of a female model wearing a terracotta
linen button-through midi dress with a thin belt, tan leather sandals, straw crossbody
bag. Strolling through a flower market. Simple, warm, approachable summer dressing.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.50, "CLASSIC": 0.30, "MINIMALIST": 0.20}`
- dominant_colors: `["terracotta", "beige"]`
- mood_tags: `["casual", "warm", "relaxed", "summer"]`
- style_attributes: `{"formality": 0.30, "boldness": 0.10}`

#### F-SC-08: Cobalt Accent (2026 Color Trend)
```
Fashion editorial photograph, full-body shot of a female model wearing a cobalt blue
fine-knit sweater, white wide-leg trousers, tan leather sandals or loafers. One bold
color pop against clean neutrals. Bright Dutch terrace setting. The key 2026 capri
blue color trend in an accessible outfit.
```
**Metadata:**
- archetype_weights: `{"SMART_CASUAL": 0.50, "MINIMALIST": 0.30, "CLASSIC": 0.20}`
- dominant_colors: `["kobalt", "wit", "beige"]`
- mood_tags: `["smart-casual", "modern", "casual", "statement"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.30}`

---

### Category 4: STREETWEAR (8 photos)

#### F-STR-01: Oversized Hoodie + Skirt
```
Fashion editorial photograph, full-body shot of a female model wearing an oversized
black hoodie, pleated grey midi skirt, black chunky sneakers, small black crossbody
bag. Urban Amsterdam street corner. Mixing feminine and streetwear codes, gender-neutral
energy.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.55, "AVANT_GARDE": 0.25, "SMART_CASUAL": 0.20}`
- dominant_colors: `["zwart", "grijs"]`
- mood_tags: `["streetwear", "urban", "oversized", "casual"]`
- style_attributes: `{"formality": 0.15, "boldness": 0.40}`

#### F-STR-02: Cargo Pants Modern
```
Fashion editorial photograph, full-body shot of a female model wearing olive green
cargo pants (modern tapered fit), cropped white tank top, black leather belt, black
and white retro sneakers. Hair pulled back. Industrial urban setting. Functional
streetwear, 2026 utility trend.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.60, "SMART_CASUAL": 0.20, "ATHLETIC": 0.20}`
- dominant_colors: `["olijf", "wit", "zwart"]`
- mood_tags: `["streetwear", "urban", "casual", "modern"]`
- style_attributes: `{"formality": 0.10, "boldness": 0.35}`

#### F-STR-03: Leather Jacket Edge
```
Fashion editorial photograph, full-body shot of a female model wearing a black leather
biker jacket (classic fit, silver zips), white band-style t-shirt, black skinny or
straight jeans, black Chelsea boots. Leaning against a graffiti-free brick wall. Rock
meets modern street.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.50, "AVANT_GARDE": 0.30, "MINIMALIST": 0.20}`
- dominant_colors: `["zwart", "wit"]`
- mood_tags: `["streetwear", "edge", "urban", "casual"]`
- style_attributes: `{"formality": 0.15, "boldness": 0.55}`

#### F-STR-04: Puffer + Dress Contrast
```
Fashion editorial photograph, full-body shot of a female model wearing a cropped black
puffer jacket, floral midi dress in muted sage and cream tones visible underneath,
black chunky boots. Unexpected layering combination. Dutch winter street scene.
Streetwear attitude with feminine elements.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.45, "SMART_CASUAL": 0.30, "AVANT_GARDE": 0.25}`
- dominant_colors: `["zwart", "groen", "creme"]`
- mood_tags: `["streetwear", "layered", "casual", "winter"]`
- style_attributes: `{"formality": 0.15, "boldness": 0.40}`

#### F-STR-05: Denim Total Look (2026 Trend)
```
Fashion editorial photograph, full-body shot of a female model wearing head-to-toe
raw denim: oversized denim jacket (dark wash), wide-leg light-wash jeans, denim
button-up shirt visible at collar. White chunky sneakers for contrast. Dutch warehouse
district. The 2026 raw denim trend in a bold statement look.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.55, "SMART_CASUAL": 0.25, "CLASSIC": 0.20}`
- dominant_colors: `["blauw", "wit"]`
- mood_tags: `["streetwear", "casual", "urban", "statement"]`
- style_attributes: `{"formality": 0.15, "boldness": 0.40}`

#### F-STR-06: Track Suit Elevated
```
Fashion editorial photograph, full-body shot of a female model wearing a luxe navy
track suit (velour or premium jersey, matching jacket and joggers), white retro sneakers,
small gold hoop earrings, white t-shirt under the jacket. Nonchalant street pose.
Elevated sportswear aesthetic.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.45, "ATHLETIC": 0.35, "SMART_CASUAL": 0.20}`
- dominant_colors: `["navy", "wit"]`
- mood_tags: `["streetwear", "sport", "casual", "urban"]`
- style_attributes: `{"formality": 0.10, "boldness": 0.25}`

#### F-STR-07: Canary Yellow Pop (2026 Color Trend)
```
Fashion editorial photograph, full-body shot of a female model wearing a canary yellow
oversized windbreaker, black crop top underneath, black wide-leg trousers, black and
yellow sneakers. Urban skate park or modern bridge setting. Bold 2026 yellow trend in a
wearable streetwear context.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.55, "AVANT_GARDE": 0.30, "ATHLETIC": 0.15}`
- dominant_colors: `["geel", "zwart"]`
- mood_tags: `["streetwear", "statement", "urban", "modern"]`
- style_attributes: `{"formality": 0.10, "boldness": 0.65}`

#### F-STR-08: Vintage Sport Mix
```
Fashion editorial photograph, full-body shot of a female model wearing a vintage-style
cream and burgundy colorblock bomber jacket, faded light-wash straight jeans, off-white
retro sneakers, simple gold chain necklace. Dutch park or school campus vibe. Nostalgic,
warm, approachable streetwear.
```
**Metadata:**
- archetype_weights: `{"STREETWEAR": 0.45, "CLASSIC": 0.30, "SMART_CASUAL": 0.25}`
- dominant_colors: `["creme", "bordeaux", "blauw"]`
- mood_tags: `["streetwear", "vintage", "casual", "warm"]`
- style_attributes: `{"formality": 0.15, "boldness": 0.25}`

---

### Category 5: ATHLETIC (6 photos)

#### F-ATH-01: Clean Performance
```
Fashion editorial photograph, full-body shot of a female model wearing a fitted black
performance tank top, black high-waisted leggings with minimal logo, black and white
running shoes. Hair in sleek ponytail. Bright modern gym or studio setting. Clean,
powerful athletic minimalism.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.70, "MINIMALIST": 0.20, "STREETWEAR": 0.10}`
- dominant_colors: `["zwart", "wit"]`
- mood_tags: `["athletic", "performance", "minimal", "clean"]`
- style_attributes: `{"formality": 0.05, "boldness": 0.15}`

#### F-ATH-02: Athleisure Street
```
Fashion editorial photograph, full-body shot of a female model wearing a cropped grey
sweatshirt, high-waisted black bike shorts, white chunky sneakers, black baseball cap.
Walking on a modern Dutch bridge. Gym-to-brunch transition, effortless athletic style.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.50, "STREETWEAR": 0.35, "MINIMALIST": 0.15}`
- dominant_colors: `["grijs", "zwart", "wit"]`
- mood_tags: `["athletic", "athleisure", "urban", "casual"]`
- style_attributes: `{"formality": 0.05, "boldness": 0.25}`

#### F-ATH-03: Yoga/Wellness
```
Fashion editorial photograph, full-body shot of a female model wearing a sage green
sports bra top with matching high-waisted leggings, cream oversized zip-up hoodie worn
open, clean white sneakers. Natural outdoor setting with greenery. Wellness lifestyle,
soft athletic aesthetic.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.60, "MINIMALIST": 0.25, "SMART_CASUAL": 0.15}`
- dominant_colors: `["groen", "creme", "wit"]`
- mood_tags: `["athletic", "athleisure", "minimal", "relaxed"]`
- style_attributes: `{"formality": 0.05, "boldness": 0.10}`

#### F-ATH-04: Running Style
```
Fashion editorial photograph, full-body shot of a female model wearing a lightweight
black running jacket (half-zip), fitted running leggings in dark grey, neon-accent
running shoes, running watch visible on wrist. Dynamic mid-stride pose on an urban
running path. Serious performance running aesthetic.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.80, "STREETWEAR": 0.10, "MINIMALIST": 0.10}`
- dominant_colors: `["zwart", "grijs"]`
- mood_tags: `["athletic", "performance", "sport", "tech"]`
- style_attributes: `{"formality": 0.05, "boldness": 0.20}`

#### F-ATH-05: Sport Luxe Blazer Mix
```
Fashion editorial photograph, full-body shot of a female model wearing a camel oversized
blazer over a white sports bra or tank, matching camel wide-leg joggers in premium fabric,
white leather sneakers. Blurring the line between athletic and smart casual. Modern
cafe or co-working space.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.35, "SMART_CASUAL": 0.35, "MINIMALIST": 0.30}`
- dominant_colors: `["camel", "wit"]`
- mood_tags: `["athletic", "smart-casual", "modern", "athleisure"]`
- style_attributes: `{"formality": 0.30, "boldness": 0.15}`

#### F-ATH-06: Cycling Commuter
```
Fashion editorial photograph, full-body shot of a female model wearing a dark navy
waterproof cycling jacket with clean lines, black stretch straight-leg pants, white
leather sneakers, small backpack. Bicycle in frame. Practical Dutch cycling commuter
style that looks good off the bike too.
```
**Metadata:**
- archetype_weights: `{"ATHLETIC": 0.45, "MINIMALIST": 0.30, "SMART_CASUAL": 0.25}`
- dominant_colors: `["navy", "zwart", "wit"]`
- mood_tags: `["athletic", "tech", "modern", "urban"]`
- style_attributes: `{"formality": 0.25, "boldness": 0.10}`

---

### Category 6: AVANT-GARDE (5 photos)

#### F-AG-01: Sculptural Black
```
Fashion editorial photograph, full-body shot of a female model wearing a dramatic black
sculptural coat with exaggerated shoulders and asymmetric closure, black wide-leg
trousers, black platform boots. Standing in a brutalist concrete setting. Architecture
as fashion, powerful silhouette.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.80, "MINIMALIST": 0.15, "STREETWEAR": 0.05}`
- dominant_colors: `["zwart"]`
- mood_tags: `["avant", "dramatic", "statement", "asymmetric"]`
- style_attributes: `{"formality": 0.45, "boldness": 0.85}`

#### F-AG-02: Deconstructed Shirt Dress
```
Fashion editorial photograph, full-body shot of a female model wearing an oversized
white cotton shirt-dress with deconstructed details (open back, asymmetric hemline,
one sleeve rolled up differently than the other), black leather boots, minimal silver
jewelry. Art gallery setting. Intellectual fashion.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.65, "MINIMALIST": 0.25, "CLASSIC": 0.10}`
- dominant_colors: `["wit", "zwart"]`
- mood_tags: `["avant", "conceptual", "asymmetric", "modern"]`
- style_attributes: `{"formality": 0.40, "boldness": 0.60}`

#### F-AG-03: Volume Play
```
Fashion editorial photograph, full-body shot of a female model wearing a dramatically
oversized balloon-sleeve black blouse tucked into a high-waisted pencil skirt in dark
chocolate brown, pointed-toe black heels. Strong contrast between voluminous top and
sleek bottom. Modern museum setting. The 2026 sculptural volume trend.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.60, "CLASSIC": 0.25, "MINIMALIST": 0.15}`
- dominant_colors: `["zwart", "bruin"]`
- mood_tags: `["avant", "statement", "dramatic", "modern"]`
- style_attributes: `{"formality": 0.55, "boldness": 0.65}`

#### F-AG-04: Lace Evening (2026 Trend)
```
Fashion editorial photograph, full-body shot of a female model wearing a black lace
midi skirt (2026 lace trend), black fitted turtleneck, black pointed-toe ankle boots,
dramatic gold statement earrings. Evening setting with moody candlelight or warm street
lamps. Dark romance, modern gothic elegance.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.55, "CLASSIC": 0.30, "MINIMALIST": 0.15}`
- dominant_colors: `["zwart", "goud"]`
- mood_tags: `["avant", "dramatic", "edge", "evening", "elegant"]`
- style_attributes: `{"formality": 0.60, "boldness": 0.65}`

#### F-AG-05: All-White Texture
```
Fashion editorial photograph, full-body shot of a female model wearing all white with
contrasting textures: white oversized chunky knit cardigan, white satin slip skirt
underneath, white leather ankle boots. Layered textures create visual depth within
monochrome. Bright white studio or gallery. Minimal meets avant-garde.
```
**Metadata:**
- archetype_weights: `{"AVANT_GARDE": 0.50, "MINIMALIST": 0.40, "CLASSIC": 0.10}`
- dominant_colors: `["wit", "creme"]`
- mood_tags: `["avant", "conceptual", "minimal", "monochrome", "statement"]`
- style_attributes: `{"formality": 0.35, "boldness": 0.50}`

---

## Coverage Matrix

### Per Gender: 45 photos total
| Archetype     | Count | % of total | Notes |
|---------------|-------|------------|-------|
| MINIMALIST    | 10    | 22%        | Most popular style preference |
| CLASSIC       | 8     | 18%        | Strong for NL market |
| SMART_CASUAL  | 8     | 18%        | The "normal person" category |
| STREETWEAR    | 8     | 18%        | Youth + urban segment |
| ATHLETIC      | 6     | 13%        | Growing segment |
| AVANT_GARDE   | 5     | 11%        | Niche but important for diversity |

### Season Coverage per gender
| Season  | Count | Via prompts |
|---------|-------|-------------|
| Summer  | ~10   | Linen, shorts, sandals, bright light |
| Autumn  | ~10   | Knits, layers, earth tones, leaves |
| Winter  | ~10   | Coats, boots, wool, darker palette |
| Spring  | ~8    | Light layers, fresh colors |
| Neutral | ~7    | Works year-round |

### Formality Distribution per gender
| Level          | Range     | Count |
|----------------|-----------|-------|
| Very casual    | 0.0-0.15  | ~10   |
| Casual         | 0.15-0.35 | ~12   |
| Smart casual   | 0.35-0.55 | ~10   |
| Formal         | 0.55-0.75 | ~10   |
| Dressy formal  | 0.75-1.0  | ~3    |

### 2026 Trend Integration
- Soft/deconstructed tailoring (greige tones)
- Capri blue / cobalt as statement color
- Quarter-zip and polo knits (preppy resurgence)
- Leather trousers for men
- Raw denim
- Tartan / check prints
- Lace textures (women)
- Sculptural volumes (women)
- Polka dots
- Canary yellow accent
- Pink/cherry for menswear
- Loafers over ballet flats

### Cross-Archetype Photos (intentional blends)
~30% of all photos deliberately span two archetypes to enable nuanced profiling:
- M-MIN-05: Minimalist + Smart Casual blend
- M-CLS-06: Classic + Avant-Garde via tartan
- M-SC-03: Smart Casual + Streetwear overlap
- F-SC-04: Smart Casual + Athletic athleisure
- F-STR-04: Streetwear + Smart Casual + Avant-Garde
- F-ATH-05: Athletic + Smart Casual + Minimalist blend
- ...and many more

---

## Upload Instructions

After generating photos:

1. Upload to Supabase Storage bucket `mood-photos` in folder `male/` or `female/`
2. Insert into `mood_photos` table with all metadata
3. Set `active = true` and assign `display_order` (sequential within gender)
4. Verify archetype_weights sum to 1.0

### SQL Insert Template
```sql
INSERT INTO mood_photos (image_url, gender, archetype_weights, dominant_colors, mood_tags, style_attributes, active, display_order)
VALUES (
  'https://[project-ref].supabase.co/storage/v1/object/public/mood-photos/male/[filename].webp',
  'male',
  '{"MINIMALIST": 0.80, "CLASSIC": 0.10, "AVANT_GARDE": 0.10}',
  ARRAY['zwart'],
  ARRAY['minimal', 'clean', 'monochrome', 'refined'],
  '{"formality": 0.50, "boldness": 0.15}',
  true,
  1
);
```
