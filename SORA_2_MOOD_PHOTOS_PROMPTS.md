# 🎬 Sora 2 Mood Foto Prompts - FitFi Onboarding

## 🎯 Doel
**60 mood foto's (30 vrouw, 30 man) die EXACT bepalen:**
1. Formality preference (casual → formal)
2. Fit voorkeur (oversized → slim)
3. Kleur complexiteit (mono → bold)
4. Patroon tolerantie
5. Detail niveau (layers)
6. Accessoire attitude
7. Moderniteit (classic → trend)
8. Footwear style

---

## 📋 Sora 2 Technical Specs

### ALLE PROMPTS MOETEN HEBBEN:
```
Shot type: Full body portrait, vertical 9:16
Framing: Model centered, slight space around body
Lighting: Soft natural light, even exposure
Background: Minimal, neutral (concrete wall / studio / light interior)
Camera: Eye level, straight on
Focus: Sharp on outfit details, shallow depth background
Style: Clean product photography aesthetic, not editorial
Model: [age range], [body type], natural pose
Outfit clearly visible, no motion blur
```

### TECHNICAL SUFFIX (voeg toe aan elke prompt):
```
, professional fashion photography, vertical composition 9:16, full body shot, sharp focus on clothing, soft natural lighting, neutral background, product photography style, high resolution
```

---

## 👩 VROUW - 30 FOTO'S

### AS 1: FORMALITY SPECTRUM (6 foto's)

#### F1 - Ultra Casual (Formality: 20)
**Prompt:**
```
Young woman in oversized gray hoodie and black legging, white sneakers, minimal styling, hair in messy bun, relaxed home setting, cozy comfort wear, Gen-Z aesthetic, professional fashion photography, vertical 9:16, full body shot, soft natural lighting
```
**Weights:**
```json
{
  "formality": 20,
  "boldness": 15,
  "structure": 20,
  "comfort": 95,
  "minimal": 80,
  "trendy": 60,
  "classic": 30,
  "relaxed": 95
}
```
**Tags:** `oversized, athleisure, casual, comfort, loungewear`
**Color:** `#808080, #000000, #FFFFFF`

---

#### F2 - Casual Chic (Formality: 35)
**Prompt:**
```
Woman in light wash wide-leg jeans and white ribbed tank top, tan leather belt, white sneakers, minimalist gold jewelry, hair down natural, standing against concrete wall, effortless casual style, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 35,
  "boldness": 30,
  "structure": 40,
  "comfort": 85,
  "minimal": 75,
  "trendy": 80,
  "classic": 50,
  "relaxed": 80
}
```
**Tags:** `wide-leg, denim, casual, minimal, contemporary`
**Color:** `#E8E8E8, #FFFFFF, #D2B48C`

---

#### F3 - Smart Casual (Formality: 50)
**Prompt:**
```
Woman in beige knitted sweater and high-waisted chocolate brown trousers, cognac leather loafers, delicate gold necklace, hair styled in low bun, standing in minimalist interior, refined casual elegance, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 50,
  "boldness": 35,
  "structure": 60,
  "comfort": 75,
  "minimal": 70,
  "trendy": 60,
  "classic": 70,
  "relaxed": 65
}
```
**Tags:** `knit, trousers, loafers, smart-casual, refined`
**Color:** `#D4B896, #5C4033, #B87333`

---

#### F4 - Business Casual (Formality: 65)
**Prompt:**
```
Woman in oversized navy blazer over white t-shirt, high-waisted straight-leg jeans, black leather loafers, structured leather tote bag, minimal jewelry, hair sleek, standing in modern office environment, polished professional casual, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 65,
  "boldness": 40,
  "structure": 75,
  "comfort": 60,
  "minimal": 65,
  "trendy": 70,
  "classic": 75,
  "relaxed": 50
}
```
**Tags:** `blazer, business-casual, structured, polished, professional`
**Color:** `#1A1A2E, #FFFFFF, #000000`

---

#### F5 - Business Professional (Formality: 80)
**Prompt:**
```
Woman in tailored charcoal gray pantsuit, crisp white silk blouse, pointed black heels, structured handbag, classic watch, hair in professional bun, standing in corporate office, confident business attire, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 80,
  "boldness": 35,
  "structure": 90,
  "comfort": 50,
  "minimal": 70,
  "trendy": 40,
  "classic": 90,
  "relaxed": 30
}
```
**Tags:** `suit, professional, tailored, corporate, formal`
**Color:** `#36454F, #FFFFFF, #000000`

---

#### F6 - Formal Evening (Formality: 95)
**Prompt:**
```
Woman in elegant black midi cocktail dress with subtle structure, classic black heels, delicate jewelry, hair styled elegantly, standing in upscale interior, sophisticated evening wear, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 95,
  "boldness": 45,
  "structure": 85,
  "comfort": 40,
  "minimal": 75,
  "trendy": 50,
  "classic": 95,
  "relaxed": 20
}
```
**Tags:** `dress, formal, evening, elegant, sophisticated`
**Color:** `#000000, #C0C0C0, #1C1C1C`

---

### AS 2: FIT PREFERENCE (4 foto's)

#### F7 - Oversized Everything (Fit: Oversized)
**Prompt:**
```
Woman in oversized cream boyfriend blazer, oversized white t-shirt, baggy light blue jeans, chunky white sneakers, relaxed proportions, Gen-Z style, standing in urban setting, contemporary oversized fashion, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 40,
  "boldness": 50,
  "structure": 30,
  "comfort": 95,
  "minimal": 60,
  "trendy": 95,
  "classic": 30,
  "relaxed": 95
}
```
**Tags:** `oversized, boyfriend, baggy, relaxed-fit, contemporary`
**Color:** `#F5F5DC, #FFFFFF, #ADD8E6`

---

#### F8 - Regular Balanced (Fit: Regular)
**Prompt:**
```
Woman in regular fit black turtleneck, mid-rise medium wash mom jeans, white sneakers, proportionate silhouette, balanced fit, standing in minimalist setting, timeless casual style, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 45,
  "boldness": 35,
  "structure": 60,
  "comfort": 80,
  "minimal": 75,
  "trendy": 60,
  "classic": 70,
  "relaxed": 70
}
```
**Tags:** `regular-fit, mom-jeans, balanced, timeless, casual`
**Color:** `#000000, #6495ED, #FFFFFF`

---

#### F9 - Slim Tailored (Fit: Slim)
**Prompt:**
```
Woman in slim fit black turtleneck, high-waisted slim black trousers, pointed ankle boots, fitted silhouette, sleek proportions, standing in modern interior, refined minimalist style, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 70,
  "boldness": 40,
  "structure": 85,
  "comfort": 60,
  "minimal": 85,
  "trendy": 65,
  "classic": 80,
  "relaxed": 45
}
```
**Tags:** `slim-fit, fitted, tailored, sleek, refined`
**Color:** `#000000, #1C1C1C, #2F4F4F`

---

#### F10 - Wide Leg Statement (Fit: Wide)
**Prompt:**
```
Woman in fitted white ribbed tank top, high-waisted caramel wide-leg trousers, neutral sandals, dramatic proportions, modern silhouette, standing against neutral backdrop, contemporary fashion statement, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 55,
  "boldness": 65,
  "structure": 70,
  "comfort": 80,
  "minimal": 60,
  "trendy": 90,
  "classic": 50,
  "relaxed": 75
}
```
**Tags:** `wide-leg, statement, contemporary, dramatic-silhouette`
**Color:** `#FFFFFF, #C68E4F, #F5DEB3`

---

### AS 3: COLOR CONFIDENCE (5 foto's)

#### F11 - Monochrome Black (Color: Monochrome)
**Prompt:**
```
Woman in all black outfit: black turtleneck, black high-waisted trousers, black leather loafers, monochromatic styling, no accessories, minimalist aesthetic, standing in neutral setting, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 70,
  "boldness": 60,
  "structure": 80,
  "comfort": 70,
  "minimal": 95,
  "trendy": 75,
  "classic": 85,
  "relaxed": 50
}
```
**Tags:** `monochrome, all-black, minimal, sleek, sophisticated`
**Color:** `#000000, #1C1C1C, #0A0A0A`

---

#### F12 - Neutral Tones (Color: Neutral)
**Prompt:**
```
Woman in beige cashmere sweater, cream wide-leg trousers, tan leather loafers, neutral color palette, tonal dressing, standing in light studio, sophisticated neutrals, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 60,
  "boldness": 30,
  "structure": 65,
  "comfort": 85,
  "minimal": 85,
  "trendy": 70,
  "classic": 80,
  "relaxed": 75
}
```
**Tags:** `neutral, beige, tonal, sophisticated, soft`
**Color:** `#F5F5DC, #FFFDD0, #D2B48C`

---

#### F13 - Accent Color (Color: Accent)
**Prompt:**
```
Woman in white button-down shirt, navy blue high-waisted trousers, white sneakers, one bold color accent, clean composition, standing against white background, classic with pop, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 65,
  "boldness": 50,
  "structure": 75,
  "comfort": 70,
  "minimal": 70,
  "trendy": 65,
  "classic": 80,
  "relaxed": 60
}
```
**Tags:** `accent-color, navy, classic, clean, balanced`
**Color:** `#FFFFFF, #000080, #F8F8FF`

---

#### F14 - Bold Single Color (Color: Bold)
**Prompt:**
```
Woman in cobalt blue midi dress, nude heels, minimal accessories, strong single color statement, standing in minimal studio, confident color choice, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 75,
  "boldness": 85,
  "structure": 70,
  "comfort": 65,
  "minimal": 65,
  "trendy": 75,
  "classic": 60,
  "relaxed": 55
}
```
**Tags:** `bold-color, cobalt, statement, confident, single-color`
**Color:** `#0047AB, #E6C9A8, #4169E1`

---

#### F15 - Multicolor Mix (Color: Multicolor)
**Prompt:**
```
Woman in color-blocked outfit: terracotta knit top, olive green wide-leg pants, cream sneakers, multicolor coordination, vibrant but balanced, standing in natural setting, expressive color mixing, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 50,
  "boldness": 80,
  "structure": 60,
  "comfort": 75,
  "minimal": 40,
  "trendy": 85,
  "classic": 45,
  "relaxed": 70
}
```
**Tags:** `multicolor, color-block, vibrant, expressive, bold`
**Color:** `#E2725B, #556B2F, #FFFDD0`

---

### AS 4: PATTERN TOLERANCE (4 foto's)

#### F16 - No Pattern (Pattern: None)
**Prompt:**
```
Woman in solid gray sweater, solid black trousers, no patterns or prints, clean solid colors only, minimalist approach, standing in simple setting, pattern-free styling, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 65,
  "boldness": 25,
  "structure": 75,
  "comfort": 80,
  "minimal": 95,
  "trendy": 60,
  "classic": 85,
  "relaxed": 65
}
```
**Tags:** `no-pattern, solid, minimal, clean, simple`
**Color:** `#808080, #000000, #D3D3D3`

---

#### F17 - Subtle Texture (Pattern: Texture)
**Prompt:**
```
Woman in chunky cable knit cream sweater, solid navy trousers, textured fabric but no print, tactile materials, standing in cozy interior, subtle texture focus, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 50,
  "boldness": 35,
  "structure": 55,
  "comfort": 90,
  "minimal": 70,
  "trendy": 70,
  "classic": 75,
  "relaxed": 80
}
```
**Tags:** `texture, cable-knit, cozy, subtle, tactile`
**Color:** `#FFFDD0, #000080, #F5F5DC`

---

#### F18 - Classic Pattern (Pattern: Stripes)
**Prompt:**
```
Woman in black and white striped long-sleeve top, solid black high-waisted trousers, classic pattern integration, timeless stripe styling, standing against neutral backdrop, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 60,
  "boldness": 50,
  "structure": 70,
  "comfort": 75,
  "minimal": 60,
  "trendy": 60,
  "classic": 85,
  "relaxed": 65
}
```
**Tags:** `stripes, pattern, classic, timeless, balanced`
**Color:** `#000000, #FFFFFF, #F8F8F8`

---

#### F19 - Bold Print (Pattern: Bold)
**Prompt:**
```
Woman in leopard print midi skirt, solid black turtleneck, statement print piece, confident pattern mixing, standing in modern setting, bold print styling, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 65,
  "boldness": 90,
  "structure": 65,
  "comfort": 70,
  "minimal": 35,
  "trendy": 85,
  "classic": 55,
  "relaxed": 60
}
```
**Tags:** `bold-print, leopard, statement, confident, expressive`
**Color:** `#D2B48C, #8B4513, #000000`

---

### AS 5: DETAIL LEVEL (4 foto's)

#### F20 - Single Layer (Detail: Minimal)
**Prompt:**
```
Woman in simple black slip dress, no additional layers, minimal styling, clean single-piece outfit, standing in minimal studio, effortless simplicity, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 70,
  "boldness": 40,
  "structure": 60,
  "comfort": 85,
  "minimal": 95,
  "trendy": 70,
  "classic": 80,
  "relaxed": 75
}
```
**Tags:** `single-layer, minimal, simple, effortless, clean`
**Color:** `#000000, #1C1C1C, #2F2F2F`

---

#### F21 - Two Layers (Detail: Balanced)
**Prompt:**
```
Woman in white ribbed tank top and high-waisted beige trousers, two-piece outfit, balanced layering, standing in natural light, clean coordination, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 55,
  "boldness": 35,
  "structure": 65,
  "comfort": 80,
  "minimal": 75,
  "trendy": 75,
  "classic": 70,
  "relaxed": 75
}
```
**Tags:** `two-layers, balanced, coordinated, clean, contemporary`
**Color:** `#FFFFFF, #F5DEB3, #D2B48C`

---

#### F22 - Three Layers (Detail: Layered)
**Prompt:**
```
Woman in white t-shirt, beige cardigan, blue jeans, three-layer outfit, intentional layering, standing in casual setting, styled complexity, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 45,
  "boldness": 40,
  "structure": 60,
  "comfort": 80,
  "minimal": 55,
  "trendy": 70,
  "classic": 70,
  "relaxed": 75
}
```
**Tags:** `three-layers, cardigan, layered, styled, casual`
**Color:** `#FFFFFF, #F5DEB3, #4682B4`

---

#### F23 - Maximalist Layers (Detail: Maximalist)
**Prompt:**
```
Woman in layered outfit: turtleneck, vest, oversized coat, jeans, scarf, bag, multiple layers and accessories, complex styling, standing in urban setting, fashion-forward layering, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 60,
  "boldness": 75,
  "structure": 70,
  "comfort": 60,
  "minimal": 25,
  "trendy": 85,
  "classic": 50,
  "relaxed": 55
}
```
**Tags:** `maximalist, layered, complex, styled, fashion-forward`
**Color:** `#000000, #8B7355, #4A4A4A`

---

### AS 6: ACCESSOIRE ATTITUDE (3 foto's)

#### F24 - Zero Accessories (Accessories: None)
**Prompt:**
```
Woman in simple gray sweater and black trousers, no jewelry, no bag, no accessories, completely clean styling, standing in minimal space, accessory-free look, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 60,
  "boldness": 20,
  "structure": 70,
  "comfort": 85,
  "minimal": 98,
  "trendy": 55,
  "classic": 85,
  "relaxed": 75
}
```
**Tags:** `no-accessories, minimal, clean, simple, pure`
**Color:** `#808080, #000000, #696969`

---

#### F25 - Minimal Accessories (Accessories: Minimal)
**Prompt:**
```
Woman in white shirt and navy trousers, simple gold watch and delicate necklace only, restrained accessorizing, standing in clean setting, subtle jewelry, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 70,
  "boldness": 35,
  "structure": 75,
  "comfort": 75,
  "minimal": 80,
  "trendy": 65,
  "classic": 85,
  "relaxed": 65
}
```
**Tags:** `minimal-accessories, subtle, delicate, refined, restrained`
**Color:** `#FFFFFF, #000080, #FFD700`

---

#### F26 - Statement Accessories (Accessories: Statement)
**Prompt:**
```
Woman in simple black dress, bold gold earrings, layered necklaces, statement sunglasses, structured bag, expressive accessorizing, standing in urban setting, accessory-focused styling, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 70,
  "boldness": 85,
  "structure": 65,
  "comfort": 65,
  "minimal": 40,
  "trendy": 85,
  "classic": 60,
  "relaxed": 55
}
```
**Tags:** `statement-accessories, bold, jewelry, expressive, styled`
**Color:** `#000000, #FFD700, #C0C0C0`

---

### AS 7: MODERNITEIT (3 foto's)

#### F27 - Timeless Classic (Modern: Classic)
**Prompt:**
```
Woman in beige trench coat, white button shirt, black straight trousers, black loafers, timeless styling, could be from any decade, standing in classic setting, eternal elegance, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 80,
  "boldness": 35,
  "structure": 90,
  "comfort": 65,
  "minimal": 75,
  "trendy": 30,
  "classic": 98,
  "relaxed": 50
}
```
**Tags:** `timeless, classic, trench, eternal, sophisticated`
**Color:** `#D2B48C, #FFFFFF, #000000`

---

#### F28 - Contemporary (Modern: Contemporary)
**Prompt:**
```
Woman in minimal beige knit set, matching top and trousers, white sneakers, modern minimal aesthetic, current but not trendy, standing in contemporary space, refined modern style, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 55,
  "boldness": 40,
  "structure": 65,
  "comfort": 85,
  "minimal": 85,
  "trendy": 70,
  "classic": 65,
  "relaxed": 75
}
```
**Tags:** `contemporary, modern, knit-set, refined, current`
**Color:** `#F5DEB3, #FFFDD0, #FFFFFF`

---

#### F29 - Trend Forward (Modern: Trend)
**Prompt:**
```
Woman in cropped puffer jacket, wide-leg cargo pants, chunky platform sneakers, bucket hat, Gen-Z trend styling, 2024-2025 aesthetic, standing in urban street, fashion-forward look, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 35,
  "boldness": 80,
  "structure": 50,
  "comfort": 80,
  "minimal": 40,
  "trendy": 98,
  "classic": 25,
  "relaxed": 80
}
```
**Tags:** `trend-forward, Gen-Z, cargo, puffer, streetwear`
**Color:** `#000000, #556B2F, #FFFFFF`

---

#### F30 - Footwear Focus (shoes visible in other shots, this is summary)
**Prompt:**
```
Woman in neutral outfit with focus on white leather sneakers, standing pose that shows footwear clearly, casual contemporary styling, sneaker culture aesthetic, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 40,
  "boldness": 35,
  "structure": 55,
  "comfort": 90,
  "minimal": 75,
  "trendy": 80,
  "classic": 60,
  "relaxed": 85
}
```
**Tags:** `sneakers, footwear, casual, contemporary, comfort`
**Color:** `#FFFFFF, #F5F5DC, #C0C0C0`

---

## 👨 MAN - 30 FOTO'S

### AS 1: FORMALITY SPECTRUM (6 foto's)

#### M1 - Ultra Casual (Formality: 20)
**Prompt:**
```
Young man in oversized gray hoodie, black joggers, white sneakers, relaxed home wear, minimalist styling, standing in casual interior, ultimate comfort outfit, professional fashion photography, vertical 9:16, full body shot, soft natural lighting
```
**Weights:**
```json
{
  "formality": 20,
  "boldness": 20,
  "structure": 25,
  "comfort": 95,
  "minimal": 75,
  "trendy": 70,
  "classic": 30,
  "relaxed": 95
}
```
**Tags:** `oversized, hoodie, athleisure, casual, loungewear`
**Color:** `#808080, #000000, #FFFFFF`

---

#### M2 - Casual Streetwear (Formality: 35)
**Prompt:**
```
Man in plain white t-shirt, light wash wide-leg jeans, white retro sneakers, minimal styling, Gen-Z casual aesthetic, standing against concrete wall, effortless street style, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 35,
  "boldness": 35,
  "structure": 40,
  "comfort": 90,
  "minimal": 80,
  "trendy": 90,
  "classic": 40,
  "relaxed": 85
}
```
**Tags:** `wide-leg, denim, streetwear, casual, Gen-Z`
**Color:** `#FFFFFF, #ADD8E6, #F8F8FF`

---

#### M3 - Smart Casual (Formality: 50)
**Prompt:**
```
Man in navy polo shirt, beige chino pants, brown leather loafers, casual watch, standing in minimalist setting, refined casual style, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 50,
  "boldness": 30,
  "structure": 65,
  "comfort": 80,
  "minimal": 75,
  "trendy": 55,
  "classic": 75,
  "relaxed": 70
}
```
**Tags:** `polo, chino, smart-casual, refined, classic`
**Color:** `#000080, #F5DEB3, #8B4513`

---

#### M4 - Business Casual (Formality: 65)
**Prompt:**
```
Man in navy blazer, white oxford shirt, light gray chinos, brown leather dress shoes, leather belt, minimalist watch, standing in modern office, polished professional casual, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 65,
  "boldness": 35,
  "structure": 80,
  "comfort": 65,
  "minimal": 70,
  "trendy": 60,
  "classic": 85,
  "relaxed": 55
}
```
**Tags:** `blazer, business-casual, oxford, polished, professional`
**Color:** `#000080, #FFFFFF, #D3D3D3`

---

#### M5 - Business Suit (Formality: 80)
**Prompt:**
```
Man in charcoal gray suit, white dress shirt, navy tie, black oxford shoes, classic watch, standing in corporate environment, formal business attire, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 80,
  "boldness": 30,
  "structure": 95,
  "comfort": 55,
  "minimal": 75,
  "trendy": 35,
  "classic": 95,
  "relaxed": 30
}
```
**Tags:** `suit, formal, business, corporate, tailored`
**Color:** `#36454F, #FFFFFF, #000080`

---

#### M6 - Formal Evening (Formality: 95)
**Prompt:**
```
Man in black tuxedo, white dress shirt, black bow tie, patent leather shoes, formal event attire, standing in elegant setting, sophisticated evening wear, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 95,
  "boldness": 40,
  "structure": 95,
  "comfort": 45,
  "minimal": 80,
  "trendy": 30,
  "classic": 98,
  "relaxed": 20
}
```
**Tags:** `tuxedo, formal, evening, sophisticated, elegant`
**Color:** `#000000, #FFFFFF, #1C1C1C`

---

### AS 2: FIT PREFERENCE (4 foto's)

#### M7 - Oversized Streetwear (Fit: Oversized)
**Prompt:**
```
Man in oversized black t-shirt, baggy light blue jeans, chunky white sneakers, relaxed oversized proportions, Gen-Z street style, standing in urban setting, contemporary oversized fashion, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 30,
  "boldness": 50,
  "structure": 30,
  "comfort": 95,
  "minimal": 70,
  "trendy": 95,
  "classic": 30,
  "relaxed": 95
}
```
**Tags:** `oversized, baggy, streetwear, relaxed-fit, Gen-Z`
**Color:** `#000000, #ADD8E6, #FFFFFF`

---

#### M8 - Regular Fit (Fit: Regular)
**Prompt:**
```
Man in regular fit navy crewneck sweater, medium wash regular fit jeans, white sneakers, balanced proportions, Millennial safe style, standing in clean setting, timeless regular fit, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 45,
  "boldness": 30,
  "structure": 60,
  "comfort": 80,
  "minimal": 75,
  "trendy": 55,
  "classic": 75,
  "relaxed": 75
}
```
**Tags:** `regular-fit, balanced, timeless, casual, classic`
**Color:** `#000080, #4682B4, #FFFFFF`

---

#### M9 - Slim Tailored (Fit: Slim)
**Prompt:**
```
Man in slim fit black turtleneck, slim black trousers, chelsea boots, fitted silhouette, sleek proportions, standing in modern interior, refined minimal style, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 70,
  "boldness": 40,
  "structure": 85,
  "comfort": 60,
  "minimal": 90,
  "trendy": 65,
  "classic": 80,
  "relaxed": 45
}
```
**Tags:** `slim-fit, fitted, tailored, sleek, minimal`
**Color:** `#000000, #1C1C1C, #2F4F4F`

---

#### M10 - Cropped Contemporary (Fit: Cropped)
**Prompt:**
```
Man in fitted black polo shirt, cropped beige trousers showing ankles, white retro sneakers, modern proportions, contemporary styling, standing against minimal backdrop, trend-forward fit, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 55,
  "boldness": 60,
  "structure": 70,
  "comfort": 75,
  "minimal": 70,
  "trendy": 85,
  "classic": 50,
  "relaxed": 65
}
```
**Tags:** `cropped, contemporary, ankles, modern, trend-forward`
**Color:** `#000000, #F5DEB3, #FFFFFF`

---

### AS 3: COLOR CONFIDENCE (5 foto's)

#### M11 - Monochrome Black (Color: Monochrome)
**Prompt:**
```
Man in all black outfit: black turtleneck, black trousers, black chelsea boots, monochromatic styling, no color variation, standing in neutral setting, minimalist monochrome, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 70,
  "boldness": 60,
  "structure": 80,
  "comfort": 70,
  "minimal": 95,
  "trendy": 75,
  "classic": 85,
  "relaxed": 50
}
```
**Tags:** `monochrome, all-black, minimal, sleek, sophisticated`
**Color:** `#000000, #1C1C1C, #0A0A0A`

---

#### M12 - Earth Tone System (Color: Neutral)
**Prompt:**
```
Man in beige sweater, olive green chinos, tan suede shoes, earth tone color palette, monochrome neutrals, standing in natural light, sophisticated neutral system, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 55,
  "boldness": 30,
  "structure": 65,
  "comfort": 85,
  "minimal": 85,
  "trendy": 75,
  "classic": 75,
  "relaxed": 80
}
```
**Tags:** `earth-tones, neutral, beige, olive, sophisticated`
**Color:** `#F5DEB3, #556B2F, #D2B48C`

---

#### M13 - Navy Accent (Color: Accent)
**Prompt:**
```
Man in white oxford shirt, navy chino pants, white sneakers, single color accent, clean composition, standing against white background, classic with accent, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 60,
  "boldness": 45,
  "structure": 75,
  "comfort": 75,
  "minimal": 75,
  "trendy": 60,
  "classic": 85,
  "relaxed": 65
}
```
**Tags:** `accent-color, navy, classic, clean, oxford`
**Color:** `#FFFFFF, #000080, #F8F8FF`

---

#### M14 - Bold Overshirt (Color: Bold)
**Prompt:**
```
Man in rust orange overshirt, black t-shirt, black jeans, bold single color statement piece, confident color choice, standing in urban setting, expressive color styling, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 50,
  "boldness": 80,
  "structure": 60,
  "comfort": 75,
  "minimal": 60,
  "trendy": 80,
  "classic": 50,
  "relaxed": 70
}
```
**Tags:** `bold-color, overshirt, statement, confident, expressive`
**Color:** `#CC5500, #000000, #1C1C1C`

---

#### M15 - Color Block (Color: Multicolor)
**Prompt:**
```
Man in navy blue sweater, olive green cargo pants, white sneakers, multicolor coordination, balanced color mixing, standing in natural setting, expressive but refined, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 45,
  "boldness": 70,
  "structure": 60,
  "comfort": 80,
  "minimal": 50,
  "trendy": 80,
  "classic": 50,
  "relaxed": 75
}
```
**Tags:** `multicolor, color-block, cargo, balanced, expressive`
**Color:** `#000080, #556B2F, #FFFFFF`

---

### AS 4: PATTERN TOLERANCE (4 foto's)

#### M16 - No Pattern (Pattern: None)
**Prompt:**
```
Man in solid gray crewneck sweater, solid black chinos, no patterns anywhere, clean solid colors only, minimalist approach, standing in simple setting, pattern-free styling, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 60,
  "boldness": 25,
  "structure": 70,
  "comfort": 85,
  "minimal": 95,
  "trendy": 55,
  "classic": 85,
  "relaxed": 70
}
```
**Tags:** `no-pattern, solid, minimal, clean, simple`
**Color:** `#808080, #000000, #696969`

---

#### M17 - Cable Knit Texture (Pattern: Texture)
**Prompt:**
```
Man in cream cable knit sweater, solid navy chinos, textured fabric but no print, tactile material focus, standing in warm interior, subtle texture styling, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 55,
  "boldness": 30,
  "structure": 60,
  "comfort": 90,
  "minimal": 70,
  "trendy": 65,
  "classic": 80,
  "relaxed": 85
}
```
**Tags:** `texture, cable-knit, cozy, subtle, tactile`
**Color:** `#FFFDD0, #000080, #F5F5DC`

---

#### M18 - Gingham Shirt (Pattern: Classic)
**Prompt:**
```
Man in blue and white gingham check shirt, solid navy chinos, classic pattern integration, timeless check styling, standing against neutral backdrop, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 60,
  "boldness": 45,
  "structure": 70,
  "comfort": 75,
  "minimal": 55,
  "trendy": 55,
  "classic": 90,
  "relaxed": 70
}
```
**Tags:** `gingham, pattern, classic, checks, timeless`
**Color:** `#4169E1, #FFFFFF, #000080`

---

#### M19 - Loud Print Shirt (Pattern: Bold)
**Prompt:**
```
Man in tropical print short sleeve shirt, solid black shorts, bold print statement piece, confident pattern styling, standing in urban setting, expressive print styling, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 40,
  "boldness": 90,
  "structure": 50,
  "comfort": 80,
  "minimal": 30,
  "trendy": 75,
  "classic": 40,
  "relaxed": 80
}
```
**Tags:** `bold-print, tropical, statement, confident, expressive`
**Color:** `#FF6347, #228B22, #000000`

---

### AS 5: DETAIL LEVEL (4 foto's)

#### M20 - Single Layer (Detail: Minimal)
**Prompt:**
```
Man in simple black t-shirt and black jeans, no additional layers, minimal styling, clean single-piece top, standing in minimal studio, effortless simplicity, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 40,
  "boldness": 30,
  "structure": 50,
  "comfort": 90,
  "minimal": 95,
  "trendy": 70,
  "classic": 70,
  "relaxed": 85
}
```
**Tags:** `single-layer, minimal, simple, t-shirt, clean`
**Color:** `#000000, #1C1C1C, #2F2F2F`

---

#### M21 - Two Layers (Detail: Balanced)
**Prompt:**
```
Man in white t-shirt and beige chinos, two-piece outfit, balanced simplicity, standing in natural light, clean coordination, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 45,
  "boldness": 30,
  "structure": 60,
  "comfort": 85,
  "minimal": 80,
  "trendy": 65,
  "classic": 75,
  "relaxed": 80
}
```
**Tags:** `two-layers, balanced, coordinated, clean, casual`
**Color:** `#FFFFFF, #F5DEB3, #D2B48C`

---

#### M22 - Three Layers (Detail: Layered)
**Prompt:**
```
Man in white t-shirt, gray overshirt, blue jeans, three-layer outfit, intentional layering, standing in casual urban setting, styled complexity, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 50,
  "boldness": 45,
  "structure": 65,
  "comfort": 80,
  "minimal": 55,
  "trendy": 80,
  "classic": 60,
  "relaxed": 75
}
```
**Tags:** `three-layers, overshirt, layered, styled, contemporary`
**Color:** `#FFFFFF, #808080, #4682B4`

---

#### M23 - Maximalist Layers (Detail: Maximalist)
**Prompt:**
```
Man in layered outfit: turtleneck, puffer vest, long coat, jeans, beanie, backpack, multiple layers and accessories, complex styling, standing in cold urban setting, fashion-forward layering, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 55,
  "boldness": 70,
  "structure": 70,
  "comfort": 65,
  "minimal": 30,
  "trendy": 85,
  "classic": 45,
  "relaxed": 60
}
```
**Tags:** `maximalist, layered, complex, puffer-vest, styled`
**Color:** `#000000, #36454F, #4A4A4A`

---

### AS 6: ACCESSOIRE ATTITUDE (3 foto's)

#### M24 - Zero Accessories (Accessories: None)
**Prompt:**
```
Man in simple gray t-shirt and black jeans, no jewelry, no watch, no bag, no accessories, completely clean styling, standing in minimal space, accessory-free look, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 40,
  "boldness": 20,
  "structure": 55,
  "comfort": 90,
  "minimal": 98,
  "trendy": 60,
  "classic": 80,
  "relaxed": 85
}
```
**Tags:** `no-accessories, minimal, clean, simple, pure`
**Color:** `#808080, #000000, #696969`

---

#### M25 - Minimal Watch (Accessories: Minimal)
**Prompt:**
```
Man in white shirt and navy chinos, simple silver watch only, restrained accessorizing, standing in clean setting, subtle watch focus, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 65,
  "boldness": 30,
  "structure": 75,
  "comfort": 75,
  "minimal": 85,
  "trendy": 60,
  "classic": 85,
  "relaxed": 70
}
```
**Tags:** `minimal-accessories, watch, subtle, refined, restrained`
**Color:** `#FFFFFF, #000080, #C0C0C0`

---

#### M26 - Layered Jewelry (Accessories: Statement)
**Prompt:**
```
Man in black t-shirt, layered silver chain necklaces, rings, bracelet, watch, expressive jewelry styling, standing in urban setting, accessory-focused look, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 45,
  "boldness": 85,
  "structure": 50,
  "comfort": 75,
  "minimal": 40,
  "trendy": 90,
  "classic": 45,
  "relaxed": 70
}
```
**Tags:** `statement-accessories, jewelry, chains, expressive, styled`
**Color:** `#000000, #C0C0C0, #A8A8A8`

---

### AS 7: MODERNITEIT (3 foto's)

#### M27 - Timeless Classic (Modern: Classic)
**Prompt:**
```
Man in navy blazer, white oxford shirt, gray wool trousers, brown leather oxfords, timeless styling, could be from any decade, standing in classic setting, eternal style, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 80,
  "boldness": 30,
  "structure": 90,
  "comfort": 65,
  "minimal": 75,
  "trendy": 25,
  "classic": 98,
  "relaxed": 50
}
```
**Tags:** `timeless, classic, blazer, oxford, eternal`
**Color:** `#000080, #FFFFFF, #808080`

---

#### M28 - Contemporary Minimal (Modern: Contemporary)
**Prompt:**
```
Man in minimal gray crewneck, black tapered trousers, white minimalist sneakers, modern clean aesthetic, current but not trendy, standing in contemporary space, refined modern style, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 55,
  "boldness": 35,
  "structure": 70,
  "comfort": 85,
  "minimal": 90,
  "trendy": 70,
  "classic": 65,
  "relaxed": 75
}
```
**Tags:** `contemporary, modern, minimal, refined, current`
**Color:** `#808080, #000000, #FFFFFF`

---

#### M29 - Trend Forward (Modern: Trend)
**Prompt:**
```
Man in cropped black puffer vest, wide-leg cargo pants, chunky retro sneakers, bucket hat, Gen-Z trend styling, 2024-2025 streetwear, standing in urban street, fashion-forward look, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 30,
  "boldness": 80,
  "structure": 45,
  "comfort": 85,
  "minimal": 40,
  "trendy": 98,
  "classic": 25,
  "relaxed": 85
}
```
**Tags:** `trend-forward, Gen-Z, cargo, puffer-vest, streetwear`
**Color:** `#000000, #556B2F, #FFFFFF`

---

#### M30 - Footwear Focus
**Prompt:**
```
Man in neutral minimal outfit with focus on white and gray retro running sneakers, standing pose that shows footwear clearly, sneaker culture aesthetic, professional fashion photography, vertical 9:16, full body shot
```
**Weights:**
```json
{
  "formality": 35,
  "boldness": 40,
  "structure": 50,
  "comfort": 90,
  "minimal": 75,
  "trendy": 85,
  "classic": 55,
  "relaxed": 85
}
```
**Tags:** `sneakers, retro-runners, footwear, casual, sneaker-culture`
**Color:** `#FFFFFF, #C0C0C0, #F5F5DC`

---

## 🎯 GEBRUIK INSTRUCTIES

### 1. GENEREER FOTO'S IN SORA 2:
- Kopieer prompt letterlijk
- Zorg voor 9:16 vertical format
- Export in hoogste kwaliteit
- Check dat outfit duidelijk zichtbaar is

### 2. UPLOAD NAAR FITFI ADMIN:
- Ga naar `/admin/mood-photos`
- Upload foto
- Voeg weights toe uit deze doc
- Voeg tags toe uit deze doc
- Set gender (female/male)
- Set display_order (F1-F30, M1-M30)
- Set active = true

### 3. TEST IN ONBOARDING:
- Start quiz flow
- Swipe door 15-20 foto's
- Check of mix balanced is (niet alleen formeel, niet alleen casual)
- Meet completion rate

### 4. ALGORITHM AANPASSING:
Na data collection van 50+ users:
- Analyse welke foto's meest predictive zijn
- Remove foto's met 90/10 like/dislike ratio
- Add meer foto's in zwakke zones
- Tune weights based on outfit match scores

---

## 📊 SUCCESS METRICS

### NA IMPLEMENTATIE MOET JE ZIEN:
✅ Quiz completion rate: >85%
✅ Average swipes per session: 18-22
✅ Outfit "dit past bij mij" score: >4.5/5
✅ Return rate: <15%
✅ Time per swipe: 2-4 sec (niet te snel, niet te langzaam)

### PER FOTO METRICS:
- Like/Dislike ratio: 40/60 tot 60/40 (balanced)
- Skip rate: <5%
- Correlation met final outfit satisfaction: >0.6

---

## 🚀 READY TO GO!

**60 foto's = EXACT stijl bepalen**
**Elke foto meet specifieke as**
**Weights zijn klaar voor matching algorithm**

UPLOAD, TEST, ITERATE! 🎯
