# Design System Quick Reference

**⚡ Snelle referentie voor consistente component styling**

---

## 🎨 Typography

```tsx
// Display - Hero headlines
className="text-[clamp(2.25rem,8vw+1rem,6rem)] leading-[1.05] font-bold tracking-tight"

// H1 - Section headlines
className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"

// H2 - Subsection headlines
className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight"

// H3 - Card titles
className="text-xl sm:text-2xl lg:text-3xl font-bold leading-snug"

// Body Large - Lead paragraphs
className="text-lg sm:text-xl lg:text-2xl font-light leading-relaxed"

// Body - Regular paragraphs
className="text-base sm:text-lg lg:text-xl leading-[1.7]"

// Body Small - Captions
className="text-sm sm:text-base leading-relaxed font-medium"
```

---

## 🎯 Icon Badges

```tsx
// Standard icon badge with gradient
<div className="inline-flex w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20
                bg-gradient-to-br from-pink-500 to-purple-600
                rounded-2xl lg:rounded-3xl items-center justify-center
                shadow-lg hover:shadow-xl transition-all duration-300">
  <Icon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white"
        strokeWidth={2} />
</div>
```

**Predefined Gradients:**
- Pink → Purple: `from-pink-500 to-purple-600`
- Yellow → Orange: `from-yellow-500 to-orange-600`
- Blue → Cyan: `from-blue-500 to-cyan-600`
- Green → Teal: `from-green-500 to-teal-600`

---

## 🔘 Buttons

```tsx
// Primary CTA (Solid)
<button className="inline-flex items-center justify-center gap-2
                   px-8 py-4 min-h-[52px]
                   bg-[var(--ff-color-primary-700)]
                   hover:bg-[var(--ff-color-primary-600)]
                   text-white rounded-xl font-bold text-lg
                   shadow-xl hover:shadow-2xl
                   transition-all duration-300
                   hover:scale-[1.02] hover:-translate-y-1
                   active:scale-[0.98]">
  Button Text
  <ArrowRight className="w-5 h-5" />
</button>

// Secondary (Outline)
<button className="inline-flex items-center justify-center gap-2
                   px-8 py-4 min-h-[52px]
                   bg-transparent border-2 border-[var(--color-border)]
                   hover:border-[var(--ff-color-primary-300)]
                   hover:bg-[var(--ff-color-primary-50)]
                   text-[var(--color-text)] rounded-xl font-bold text-lg
                   transition-all duration-300
                   hover:scale-[1.02] hover:-translate-y-1">
  Button Text
</button>

// Ghost (Transparant op donker)
<button className="inline-flex items-center justify-center gap-2
                   px-8 py-4 min-h-[52px]
                   bg-white/15 hover:bg-white/25
                   backdrop-blur-md border-2 border-white/40
                   hover:border-white/60 text-white
                   rounded-xl font-bold text-lg
                   transition-all duration-300
                   hover:scale-[1.02]">
  Button Text
</button>
```

---

## 🃏 Cards

```tsx
// Standard card
<div className="bg-[var(--color-surface)]
                border-2 border-[var(--color-border)]
                rounded-2xl sm:rounded-3xl
                p-6 sm:p-8 lg:p-10
                shadow-xl hover:shadow-2xl
                hover:border-[var(--ff-color-primary-200)]
                transition-all duration-300
                hover:-translate-y-2">
  {/* Card content */}
</div>

// Premium card (larger radius)
<div className="bg-[var(--color-surface)]
                border-2 border-[var(--color-border)]
                rounded-3xl lg:rounded-[2.5rem]
                p-8 sm:p-10 lg:p-12
                shadow-2xl
                transition-all duration-300">
  {/* Card content */}
</div>
```

---

## 🏷️ Badges

```tsx
// Primary badge
<div className="inline-flex items-center gap-2
                px-4 sm:px-5 py-2 sm:py-2.5
                bg-[var(--ff-color-primary-50)]
                border-2 border-[var(--ff-color-primary-200)]
                rounded-full
                text-[var(--ff-color-primary-700)]
                text-xs sm:text-sm font-bold
                shadow-md uppercase tracking-wider">
  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
  Badge Text
</div>

// White badge (op donkere achtergrond)
<div className="inline-flex items-center gap-2
                px-5 py-2.5
                bg-white/95 backdrop-blur-sm
                rounded-full
                text-[var(--ff-color-primary-700)]
                text-sm font-bold shadow-2xl">
  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
  Badge Text
</div>
```

---

## 📏 Spacing

```tsx
// Section wrapper
<section className="py-12 sm:py-20 lg:py-28 bg-[var(--color-bg)]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Content */}
  </div>
</section>

// Component gaps
gap-3 sm:gap-4 lg:gap-5    // Tight spacing
gap-4 sm:gap-6 lg:gap-8    // Standard spacing
gap-6 sm:gap-8 lg:gap-10   // Loose spacing
gap-8 sm:gap-10 lg:gap-12  // Section spacing
```

---

## 🌈 Color Usage

```tsx
// Text
text-[var(--color-text)]           // Primary text
text-[var(--color-muted)]           // Secondary text
text-[var(--ff-color-primary-700)]  // Brand primary

// Backgrounds
bg-[var(--color-bg)]                // Page background
bg-[var(--color-surface)]           // Card background
bg-[var(--ff-color-primary-50)]     // Tinted background

// Borders
border-[var(--color-border)]        // Standard border
border-[var(--ff-color-primary-200)]// Primary border
```

---

## 📱 Responsive Patterns

```tsx
// Hide on mobile
<div className="hidden sm:block">Desktop only</div>

// Show only on mobile
<div className="sm:hidden">Mobile only</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
  {/* Items */}
</div>

// Responsive flex
<div className="flex flex-col sm:flex-row gap-4">
  {/* Items */}
</div>
```

---

## 🎬 Animations

```tsx
// Hover lift (cards)
transition-all duration-300 hover:-translate-y-2

// Hover lift (buttons)
transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]

// Active press
active:scale-[0.98]

// Smooth transition
transition-all duration-300 ease-in-out

// Bounce animation (scroll indicators)
animate-bounce
```

---

## 🎯 Common Patterns

### Section Header
```tsx
<div className="text-center mb-12 sm:mb-16 lg:mb-20">
  {/* Badge */}
  <div className="inline-flex items-center gap-2 px-5 py-2.5
                  bg-[var(--ff-color-primary-50)]
                  border-2 border-[var(--ff-color-primary-200)]
                  rounded-full text-sm font-bold mb-6">
    <Icon className="w-5 h-5" />
    Badge Text
  </div>

  {/* Title */}
  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold
                 text-[var(--color-text)] mb-6">
    Section Title
  </h2>

  {/* Description */}
  <p className="text-lg sm:text-xl text-[var(--color-muted)]
                max-w-3xl mx-auto">
    Section description text
  </p>
</div>
```

### Feature Item (met checkmark)
```tsx
<div className="flex items-start gap-4">
  {/* Icon */}
  <div className="w-10 h-10 bg-[var(--ff-color-primary-100)]
                  rounded-full flex items-center justify-center
                  flex-shrink-0">
    <svg className="w-5 h-5 text-[var(--ff-color-primary-700)]"
         fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  </div>

  {/* Content */}
  <span className="text-lg font-medium text-[var(--color-text)]
                   leading-relaxed">
    Feature description
  </span>
</div>
```

### Stat Display
```tsx
<div className="text-center">
  <div className="text-4xl sm:text-5xl font-bold
                  text-[var(--ff-color-primary-700)] mb-2">
    98%
  </div>
  <div className="text-sm sm:text-base text-[var(--color-muted)]
                  font-medium uppercase tracking-wide">
    Stat Label
  </div>
</div>
```

---

## ⚠️ Doe NIET

```tsx
// ❌ Custom font sizes
<h2 className="text-[19px]">Title</h2>

// ✅ Gebruik responsive scale
<h2 className="text-2xl sm:text-3xl lg:text-4xl">Title</h2>

// ❌ Hardcoded kleuren
<div className="bg-blue-500 text-white">Content</div>

// ✅ Gebruik tokens
<div className="bg-[var(--ff-color-primary-700)] text-white">Content</div>

// ❌ Random spacing
<div className="mt-[23px] mb-[17px]">Content</div>

// ✅ Consistent spacing
<div className="my-6 sm:my-8">Content</div>

// ❌ Inconsistent radius
<div className="rounded-[13px]">Card</div>

// ✅ Standard radius
<div className="rounded-2xl">Card</div>
```

---

## 🎨 Kleur Referentie

| Token | Gebruik | Voorbeeld |
|-------|---------|-----------|
| `--ff-color-primary-700` | Primary buttons, headings | CTA buttons |
| `--ff-color-primary-600` | Hover states | Button hover |
| `--ff-color-primary-200` | Borders, tints | Card borders on hover |
| `--ff-color-primary-100` | Light backgrounds | Checkmark circles |
| `--ff-color-primary-50` | Very light tints | Badge backgrounds |
| `--color-text` | Body text | Paragraphs |
| `--color-muted` | Secondary text | Captions, labels |
| `--color-surface` | Card backgrounds | Cards, panels |
| `--color-bg` | Page background | Body |
| `--color-border` | Standard borders | Card borders |

---

## 📋 Checklist Nieuwe Component

- [ ] Gebruikt responsive font sizes (clamp of sm:text-*)
- [ ] Touch targets minimum 44px
- [ ] Spacing met responsive values (gap-4 sm:gap-6)
- [ ] Kleuren uit tokens (var(--*))
- [ ] Border-radius consistent (rounded-2xl of 3xl)
- [ ] Shadows uit predefined set
- [ ] Hover: translateY(-2px tot -4px)
- [ ] Transition: 300ms
- [ ] Iconen: wit op gekleurde achtergrond
- [ ] Grid/flex responsive met breakpoints

---

**💡 Pro Tip:** Kopieer een bestaande component (HeroV3, FeatureBlocksV4) als startpunt voor consistentie.

*Version: 1.0 | Last updated: 2026-01-07*
