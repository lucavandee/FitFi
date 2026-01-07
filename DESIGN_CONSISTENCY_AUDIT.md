# FitFi Design Consistency Audit

## ✅ Visuele Consistentie Waarborgen

Dit document beschrijft alle design patterns en waarborgt uniformiteit over de hele landingspagina.

---

## 🎨 Typografie Hiërarchie

### Consistent gebruik per component-type:

| Element | Font Size | Line Height | Weight | Gebruik |
|---------|-----------|-------------|--------|---------|
| **Display** | `clamp(2.25rem, 8vw + 1rem, 6rem)` | 1.05 | 700 | Hero headlines |
| **H1** | `clamp(1.75rem, 4vw + 0.5rem, 3.5rem)` | 1.2 | 700 | Section headlines |
| **H2** | `clamp(1.5rem, 3vw + 0.5rem, 2.5rem)` | 1.3 | 700 | Subsection headlines |
| **H3** | `clamp(1.25rem, 2vw + 0.5rem, 1.75rem)` | 1.4 | 700 | Card titles |
| **Body Large** | `clamp(1.125rem, 2vw + 0.5rem, 1.5rem)` | 1.6 | 300 | Lead paragraphs |
| **Body** | `clamp(1rem, 1.5vw + 0.5rem, 1.25rem)` | 1.7 | 400 | Regular text |
| **Body Small** | `clamp(0.875rem, 1vw + 0.5rem, 1rem)` | 1.6 | 500 | Captions, labels |

**CSS Classes:** `.ff-display`, `.ff-h1`, `.ff-h2`, `.ff-h3`, `.ff-body-lg`, `.ff-body`, `.ff-body-sm`

---

## 🎯 Icon Badge Systeem

### Uniforme icoon-badges met witte symbolen op gekleurde achtergronden:

**Patroon:**
```css
.ff-icon-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.15);
}
```

**Sizes:**
- **XS**: `clamp(2rem, 3vw, 2.5rem)` - 32-40px
- **SM**: `clamp(2.5rem, 4vw, 3rem)` - 40-48px
- **MD**: `clamp(3rem, 5vw, 4rem)` - 48-64px
- **LG**: `clamp(4rem, 6vw, 5rem)` - 64-80px

**Gradient Combinaties:**

| Feature | Gradient | Gebruik |
|---------|----------|---------|
| **Kleuren analyse** | Pink → Purple | `from-pink-500 to-purple-600` |
| **Snelheid** | Yellow → Orange | `from-yellow-500 to-orange-600` |
| **Social proof** | Green → Teal | `from-green-500 to-teal-600` |
| **E-commerce** | Blue → Cyan | `from-blue-500 to-cyan-600` |

**✅ Gebruik altijd:**
- Witte iconen op gekleurde achtergrond
- Consistent border-radius: `1rem` (16px)
- Shadow: `0 10px 30px -5px rgba(0, 0, 0, 0.15)`
- Hover: `translateY(-2px)`

---

## 🔘 Button Systeem

### Drie consistente varianten:

#### 1. Primary (Solid)
```css
background: var(--ff-color-primary-700);
color: white;
hover: var(--ff-color-primary-600);
```

**Component-voorbeelden:**
- HeroV3: "Start nu" button
- FinalCTA: "Begin je stijlreis"
- FeatureBlocks: CTA buttons

#### 2. Secondary (Outline/Ghost)
```css
background: transparent;
border: 2px solid var(--color-border);
hover: border-color: var(--ff-color-primary-300);
```

**Component-voorbeelden:**
- HeroV3: "Zie voorbeeld" button

#### 3. Ghost (Transparant op donkere achtergrond)
```css
background: rgba(255, 255, 255, 0.15);
border: 2px solid rgba(255, 255, 255, 0.4);
backdrop-filter: blur(10px);
```

### Touch Targets (WCAG 2.1):

| Size | Min Height | Padding X | Font Size | Gebruik |
|------|-----------|-----------|-----------|---------|
| **SM** | 44px | 1.5rem | `clamp(0.875rem, 1.5vw + 0.5rem, 1rem)` | Tertiary actions |
| **MD** | 52px | 2rem | `clamp(1rem, 1.5vw + 0.5rem, 1.125rem)` | Standard buttons |
| **LG** | 56px | 2.5rem | `clamp(1.0625rem, 2vw + 0.5rem, 1.25rem)` | Primary CTAs |
| **XL** | 64px | 2.5rem | `clamp(1.125rem, 2vw + 0.5rem, 1.375rem)` | Hero CTAs |

**Animations:**
- Hover: `translateY(-2px) scale(1.02)`
- Active: `scale(0.98)`
- Transition: `300ms ease`

---

## 🃏 Card Systeem

### Uniform card styling:

```css
.ff-card {
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 1.5rem; /* lg */
  padding: clamp(1.5rem, 4vw, 2.5rem);
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1);
}

.ff-card:hover {
  box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
  border-color: var(--ff-color-primary-200);
}
```

**Radius Levels:**
- **SM**: `0.5rem` (8px) - Kleine elementen
- **MD**: `0.75rem` (12px) - Buttons
- **LG**: `1rem` (16px) - Standard cards
- **XL**: `1.5rem` (24px) - Feature cards
- **2XL**: `2rem` (32px) - Hero cards
- **3XL**: `2.5rem` (40px) - Premium cards

**Componenten die dit patroon gebruiken:**
- SocialProofV3: Testimonial cards
- FeatureBlocksV4: Feature cards
- RealOutfitShowcase: Outfit cards

---

## 🏷️ Badge Systeem

### Consistent badge gebruik:

**Primary Badge:**
```css
background: var(--ff-color-primary-50);
color: var(--ff-color-primary-700);
border: 2px solid var(--ff-color-primary-200);
border-radius: 9999px;
padding: 0.5rem 1rem;
```

**Gebruik in componenten:**
- HeroV3: "AI stijladvies" badge (white variant)
- FeatureBlocksV4: Section badges
- RealOutfitShowcase: "Complete looks, shopbaar"

**Variants:**
- `.ff-badge--primary`: Brand primary colors
- `.ff-badge--accent`: Accent colors
- `.ff-badge--white`: White on dark backgrounds

---

## 📏 Spacing Systeem

### Consistent verticaal ritme:

| Spacing | Value | Gebruik |
|---------|-------|---------|
| **Section Padding** | `clamp(3rem, 8vw, 6rem)` | Standard sections |
| **Section SM** | `clamp(2rem, 6vw, 4rem)` | Compact sections |
| **Section LG** | `clamp(4rem, 10vw, 8rem)` | Hero sections |
| **Gap XS** | `clamp(0.5rem, 1vw, 0.75rem)` | Tight spacing |
| **Gap SM** | `clamp(0.75rem, 2vw, 1rem)` | Close elements |
| **Gap MD** | `clamp(1rem, 3vw, 1.5rem)` | Standard gap |
| **Gap LG** | `clamp(1.5rem, 4vw, 2.5rem)` | Section elements |
| **Gap XL** | `clamp(2rem, 6vw, 4rem)` | Section headers |

**CSS Classes:** `.ff-section`, `.ff-gap-xs`, `.ff-gap-sm`, `.ff-gap-md`, `.ff-gap-lg`, `.ff-gap-xl`

---

## 🎭 Shadow Systeem

### Consistente depth hierarchy:

| Level | Shadow | Gebruik |
|-------|--------|---------|
| **SM** | `0 4px 12px rgba(0, 0, 0, 0.05)` | Subtle elevation |
| **MD** | `0 10px 30px -5px rgba(0, 0, 0, 0.1)` | Cards at rest |
| **LG** | `0 20px 40px -5px rgba(0, 0, 0, 0.15)` | Cards on hover |
| **XL** | `0 30px 60px -10px rgba(0, 0, 0, 0.2)` | Modal dialogs |
| **2XL** | `0 40px 80px -15px rgba(0, 0, 0, 0.25)` | Hero elements |

**CSS Classes:** `.ff-shadow-sm`, `.ff-shadow-md`, `.ff-shadow-lg`, `.ff-shadow-xl`, `.ff-shadow-2xl`

---

## 🌈 Gradient Systeem

### Predefined gradients voor consistentie:

**Brand Gradients:**
```css
--ff-gradient-primary: linear-gradient(135deg, var(--ff-color-primary-600), var(--ff-color-primary-400));
--ff-gradient-accent: linear-gradient(135deg, var(--ff-color-accent-600), var(--ff-color-accent-400));
```

**Feature Icon Gradients:**
```css
--ff-gradient-pink-purple: linear-gradient(135deg, #ec4899, #9333ea);
--ff-gradient-yellow-orange: linear-gradient(135deg, #fbbf24, #f97316);
--ff-gradient-blue-cyan: linear-gradient(135deg, #3b82f6, #06b6d4);
--ff-gradient-green-teal: linear-gradient(135deg, #10b981, #14b8a6);
```

**✅ Gebruik deze predefined gradients:**
- FeatureBlocksV4 iconen
- Badge achtergronden
- Hero overlays
- CTA backgrounds

**❌ NIET doen:**
- Custom gradients bedenken per component
- Random kleurencombinaties gebruiken

---

## 🎬 Animation Systeem

### Consistent transition timing:

| Speed | Duration | Gebruik |
|-------|----------|---------|
| **Fast** | 150ms | Kleine state changes |
| **Base** | 300ms | Standard transitions |
| **Slow** | 500ms | Grote transformaties |

**Easing Functions:**
```css
--ff-ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ff-ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

**Standard Hover Effects:**
- **Cards**: `translateY(-4px)`
- **Buttons**: `translateY(-2px) scale(1.02)`
- **Icons**: `translateY(-2px)`
- **Active Press**: `scale(0.98)`

---

## 📱 Component Patterns

### 1. Section Header Pattern

**Gebruik in:** HeroV3, FeatureBlocksV4, SocialProofV3, RealOutfitShowcase

```html
<div class="ff-section-header">
  <div class="ff-section-header__badge">
    <!-- Badge component -->
  </div>
  <h2 class="ff-section-header__title ff-h1">
    <!-- Section title -->
  </h2>
  <p class="ff-section-header__description ff-body-lg">
    <!-- Section description -->
  </p>
</div>
```

### 2. Feature Item Pattern

**Gebruik in:** FeatureBlocksV4 bullets

```html
<div class="ff-feature-item">
  <div class="ff-feature-item__icon">
    <!-- Checkmark icon -->
  </div>
  <div class="ff-feature-item__content">
    <!-- Feature text -->
  </div>
</div>
```

### 3. Stat Item Pattern

**Gebruik in:** SocialProofV3 stats bar

```html
<div class="ff-stat">
  <div class="ff-stat__value">98%</div>
  <div class="ff-stat__label">Zou aanbevelen</div>
</div>
```

---

## ✅ Consistency Checklist

Gebruik dit bij het maken van nieuwe componenten:

### Typography
- [ ] Gebruikt predefined font sizes (`.ff-display`, `.ff-h1`, etc.)
- [ ] Line heights consistent per hiërarchie
- [ ] Font weights: 300 (light), 400 (regular), 500 (medium), 700 (bold)

### Icons
- [ ] Witte iconen op gekleurde achtergrond
- [ ] Border-radius: `1rem` (16px)
- [ ] Shadow: `0 10px 30px -5px rgba(0, 0, 0, 0.15)`
- [ ] Gebruikt predefined gradients

### Buttons
- [ ] Minimum 44px touch target
- [ ] Gebruikt `.ff-btn` classes of equivalent styling
- [ ] Hover: `translateY(-2px) scale(1.02)`
- [ ] Transition: `300ms ease`

### Cards
- [ ] Border-radius: 1.5rem (lg) of 2rem (xl)
- [ ] Border: 2px solid var(--color-border)
- [ ] Shadow: MD at rest, LG on hover
- [ ] Hover: `translateY(-4px)` + border color change

### Spacing
- [ ] Section padding: `clamp(3rem, 8vw, 6rem)`
- [ ] Gebruikt predefined gap classes (`.ff-gap-md`, etc.)
- [ ] Consistent internal padding

### Colors
- [ ] Gebruikt alleen tokens (geen hardcoded hex values)
- [ ] Gradients uit predefined set
- [ ] Consistent gebruik van primary/accent/secondary

---

## 🚨 Veelgemaakte Fouten

**❌ NIET doen:**

1. **Custom font sizes buiten scale:**
   ```css
   /* FOUT */
   font-size: 19px;

   /* GOED */
   font-size: var(--ff-text-body-lg);
   ```

2. **Inconsistent icoon styling:**
   ```css
   /* FOUT */
   background: linear-gradient(45deg, red, blue);
   border-radius: 50%;

   /* GOED */
   background: var(--ff-gradient-pink-purple);
   border-radius: 1rem;
   ```

3. **Random spacing values:**
   ```css
   /* FOUT */
   margin-bottom: 23px;

   /* GOED */
   margin-bottom: var(--ff-gap-md);
   ```

4. **Inconsistent hover effects:**
   ```css
   /* FOUT */
   transform: scale(1.1) rotate(5deg);

   /* GOED */
   transform: translateY(-4px);
   ```

---

## 🎯 Component Overzicht

| Component | Icons | Buttons | Cards | Typography | Status |
|-----------|-------|---------|-------|------------|--------|
| **HeroV3** | ✅ Badges white | ✅ Primary/Ghost | N/A | ✅ Display scale | ✅ Consistent |
| **SocialProofV3** | ✅ Star ratings | N/A | ✅ Testimonials | ✅ Body scale | ✅ Consistent |
| **RealOutfitShowcase** | ✅ Category icons | ✅ Primary CTAs | ✅ Outfit cards | ✅ H2/Body | ✅ Consistent |
| **FeatureBlocksV4** | ✅ Gradient badges | N/A | ✅ Feature blocks | ✅ H2/bullets | ✅ Consistent |
| **FinalCTA** | ✅ Trust icons | ✅ Primary white | ✅ CTA card | ✅ H2/Body | ✅ Consistent |

---

## 📚 Implementatie Guide

### Nieuwe sectie toevoegen? Volg deze stappen:

1. **Kies typography scale** uit design system
2. **Gebruik predefined icon gradients** voor badges
3. **Implementeer button variants** (primary/secondary/ghost)
4. **Apply spacing tokens** (`.ff-section`, `.ff-gap-*`)
5. **Use shadow system** voor depth
6. **Test responsive** op 375px / 820px / 1440px
7. **Verify consistency** met checklist

### Code Example:

```tsx
<section className="ff-section bg-[var(--color-bg)]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Section header pattern */}
    <div className="ff-section-header">
      <div className="ff-badge ff-badge--primary">
        <Icon className="w-4 h-4" />
        Badge text
      </div>
      <h2 className="ff-h1">Section Title</h2>
      <p className="ff-body-lg">Section description</p>
    </div>

    {/* Feature grid */}
    <div className="grid md:grid-cols-3 ff-gap-lg">
      {features.map((feature) => (
        <div className="ff-card ff-hover-lift">
          <div className="ff-icon-badge ff-icon-badge--md ff-gradient-pink-purple">
            <Icon className="text-white" />
          </div>
          <h3 className="ff-h3">{feature.title}</h3>
          <p className="ff-body">{feature.description}</p>
        </div>
      ))}
    </div>

  </div>
</section>
```

---

## 🎨 Design Tokens Reference

Alle tokens zijn gedefinieerd in:
- `src/styles/tokens.css` - Color palette
- `src/styles/components/design-system.css` - Component patterns

**Altijd gebruiken:**
- `var(--ff-color-primary-*)` voor brand kleuren
- `var(--color-text)` / `var(--color-muted)` voor tekst
- `var(--color-surface)` / `var(--color-bg)` voor backgrounds
- Predefined spacing/shadow/radius values

---

*Last updated: 2026-01-07*
*Version: 1.0*
