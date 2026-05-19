# FitFi Design System Compliance Guide

**Version:** 2.0
**Last Updated:** 2026-01-27
**Status:** 🚨 CRITICAL - 142 violations detected

---

## 🎯 Purpose

This document defines **mandatory design rules** for FitFi. Every component, page, and feature MUST follow these rules to ensure:
- ✅ Visual consistency across all pages
- ✅ Professional, premium feel
- ✅ Predictable user experience
- ✅ Easy maintenance and updates

**Breaking these rules = rejection in PR review.**

---

## 📊 Current Compliance Score

```
Overall Score: 62/100 (Needs Improvement)

✅ Color Tokens:        75/100 (142 hardcoded colors found)
⚠️  Typography:         68/100 (Inconsistent sizes)
❌ Button Consistency:  45/100 (Mixed radii & padding)
❌ Spacing System:      52/100 (No 8px grid adherence)
⚠️  Shadow Elevation:   70/100 (Inconsistent usage)
✅ Icon Style:          85/100 (Mostly Lucide)
❌ Form Fields:         40/100 (Height & label inconsistencies)
```

---

## 🎨 1. COLOR SYSTEM (MANDATORY)

### ❌ NEVER DO THIS:
```tsx
// ❌ Hardcoded hex colors
className="bg-[#F7F3EC] text-[#1E2333]"
className="border-[#E0C9B3]"
style={{ color: '#A6886A' }}

// ❌ Generic Tailwind colors
className="bg-gray-100 text-gray-900"
className="bg-amber-500"
```

### ✅ ALWAYS DO THIS:
```tsx
// ✅ Use CSS variables
className="bg-[var(--color-bg)] text-[var(--color-text)]"
className="border-[var(--ff-color-primary-200)]"
style={{ color: 'var(--ff-color-primary-500)' }}

// ✅ Use token-based Tailwind (if configured)
className="bg-surface text-primary"
```

### 📋 Available Color Tokens:

#### Background & Surface:
```css
--color-bg            /* #F7F3EC - Page background */
--color-surface       /* #FFFFFF - Card/modal background */
--color-border        /* rgba(30, 35, 51, 0.08) - Borders */
```

#### Text:
```css
--color-text          /* #1E2333 - Primary text */
--color-text-muted    /* #4A5568 - Secondary text */
```

#### Primary (Brand Taupe):
```css
--ff-color-primary-50   /* Ultra light tint */
--ff-color-primary-100  /* Light backgrounds */
--ff-color-primary-200  /* Subtle borders */
--ff-color-primary-300  /* Muted accents */
--ff-color-primary-400  /* Soft highlights */
--ff-color-primary-500  /* Base brand color */
--ff-color-primary-600  /* Hover states */
--ff-color-primary-700  /* CTA background (AA) */
--ff-color-primary-800  /* Dark accents */
--ff-color-primary-900  /* Darkest */
```

#### Accent:
```css
--ff-color-accent-50 through -900
--ff-color-accent      /* #D8CABA */
```

#### Status:
```css
--color-success        /* #16A34A - Success states */
--ff-color-success-50 through -900
--color-warning        /* #D97706 - Warning states */
--color-danger         /* #DC2626 - Error states */
```

#### CTA (Call-to-Action):
```css
--ff-cta-500           /* Base CTA color */
--ff-cta-600           /* Hover */
--ff-cta-700           /* Active/pressed */
--ff-cta-contrast      /* #FFFFFF - Text on CTA */
```

### 🎯 Color Usage Rules:

1. **Backgrounds**: Use `--color-bg` (page) or `--color-surface` (cards)
2. **Text**: Use `--color-text` (primary) or `--color-text-muted` (secondary)
3. **Borders**: Use `--color-border` (default) or `--ff-color-primary-200` (branded)
4. **CTA Buttons**: Use `--ff-color-primary-700` (bg) + `#fff` (text)
5. **Status Messages**: Use `--color-success/warning/danger` + matching `-50` for bg
6. **Hover States**: Use next darker shade (-600 → -700)

---

## 📝 2. TYPOGRAPHY SYSTEM (MANDATORY)

### Font Families:
```css
/* Headings */
font-family: 'Montserrat', sans-serif;

/* Body Text */
font-family: 'Lato', sans-serif;
```

### ❌ NEVER DO THIS:
```tsx
// ❌ Random sizes
className="text-[22px]"
className="text-base"  // Too vague
style={{ fontSize: '1.3rem' }}  // Not in scale

// ❌ Inconsistent line heights
className="leading-[1.4]"  // Not systematic
```

### ✅ ALWAYS DO THIS:
```tsx
// ✅ Use defined scale
// Display: 3.5rem / 56px
className="text-[3.5rem] font-bold leading-[1.1]"

// H1: 2.5rem / 40px
className="text-[2.5rem] font-bold leading-[1.2]"

// H2: 2rem / 32px
className="text-[2rem] font-semibold leading-[1.25]"

// H3: 1.5rem / 24px
className="text-[1.5rem] font-semibold leading-[1.3]"

// Body Large: 1.125rem / 18px
className="text-[1.125rem] leading-[1.6]"

// Body: 1rem / 16px
className="text-base leading-[1.6]"

// Body Small: 0.875rem / 14px
className="text-sm leading-[1.5]"

// Caption: 0.75rem / 12px
className="text-xs leading-[1.4]"
```

### 📋 Typography Scale:

| Name | Size | Line Height | Weight | Usage |
|------|------|-------------|--------|-------|
| **Display** | 3.5rem (56px) | 1.1 (110%) | Bold (700) | Hero titles |
| **H1** | 2.5rem (40px) | 1.2 (120%) | Bold (700) | Page titles |
| **H2** | 2rem (32px) | 1.25 (125%) | Semibold (600) | Section headers |
| **H3** | 1.5rem (24px) | 1.3 (130%) | Semibold (600) | Subsections |
| **H4** | 1.25rem (20px) | 1.4 (140%) | Semibold (600) | Card titles |
| **Body Large** | 1.125rem (18px) | 1.6 (160%) | Regular (400) | Lead paragraphs |
| **Body** | 1rem (16px) | 1.6 (160%) | Regular (400) | Body text |
| **Body Small** | 0.875rem (14px) | 1.5 (150%) | Regular (400) | Secondary text |
| **Caption** | 0.75rem (12px) | 1.4 (140%) | Regular (400) | Labels, captions |

### 🎯 Typography Rules:

1. **Headings**: Always use Montserrat + appropriate weight
2. **Body Text**: Always use Lato + 1.6 line height
3. **Line Height**: Use defined ratios (110%-160%)
4. **Weights**: Use 400 (regular), 600 (semibold), 700 (bold) ONLY
5. **No Random Sizes**: Stick to the scale above

---

## 🔘 3. BUTTON SYSTEM (MANDATORY)

### ❌ NEVER DO THIS:
```tsx
// ❌ Inconsistent radii
className="rounded-lg"   // 0.5rem
className="rounded-xl"   // 0.75rem
className="rounded-2xl"  // 1rem
// All mixed on same page!

// ❌ Random padding
className="px-4 py-2"
className="px-6 py-3"
className="px-8 py-4"
// No clear system

// ❌ Inconsistent heights
style={{ minHeight: '44px' }}
className="h-12"
// Mixed heights break alignment
```

### ✅ ALWAYS DO THIS:

#### Primary Button (CTA):
```tsx
<button className="
  px-8 py-3.5
  min-h-[48px]
  rounded-xl
  bg-[var(--ff-color-primary-700)]
  text-white
  font-semibold
  text-base
  hover:bg-[var(--ff-color-primary-600)]
  active:bg-[var(--ff-color-primary-800)]
  focus-visible:shadow-[var(--shadow-ring)]
  transition-all duration-200
">
  Start gratis
</button>
```

#### Secondary Button (Ghost):
```tsx
<button className="
  px-6 py-3
  min-h-[48px]
  rounded-xl
  bg-transparent
  border-2 border-[var(--color-border)]
  text-[var(--color-text)]
  font-medium
  text-base
  hover:border-[var(--ff-color-primary-500)]
  hover:text-[var(--ff-color-primary-700)]
  transition-all duration-200
">
  Bekijk voorbeeld
</button>
```

### 📋 Button Specs:

| Variant | Height | Padding | Radius | Border | Font |
|---------|--------|---------|--------|--------|------|
| **Primary** | 48px | px-8 py-3.5 | rounded-xl | none | font-semibold |
| **Secondary** | 48px | px-6 py-3 | rounded-xl | 2px | font-medium |
| **Small** | 40px | px-5 py-2.5 | rounded-lg | varies | font-medium |
| **Icon Only** | 44x44px | p-3 | rounded-lg | none | - |

### 🎯 Button Rules:

1. **Minimum Height**: 48px for touch targets (44px for icon-only)
2. **Border Radius**: `rounded-xl` (1rem) for standard, `rounded-lg` (0.75rem) for small
3. **Padding**: Use defined values above (px-8/px-6/px-5)
4. **Hover States**: MUST have visible hover effect
5. **Focus States**: MUST have `focus-visible:shadow-[var(--shadow-ring)]`
6. **Transitions**: Always `transition-all duration-200`

---

## 📐 4. SPACING SYSTEM (MANDATORY)

### The 8px Grid Rule:

**ALL spacing MUST be multiples of 8px** (0.5rem in Tailwind).

### ❌ NEVER DO THIS:
```tsx
// ❌ Random spacing
className="mb-3"      // 0.75rem = 12px
className="mt-5"      // 1.25rem = 20px
className="gap-7"     // 1.75rem = 28px
className="p-[18px]"  // Not divisible by 8

// ❌ Inconsistent section spacing
<Section className="py-12" />  // 48px
<Section className="py-16" />  // 64px
<Section className="py-20" />  // 80px
// All on same page!
```

### ✅ ALWAYS DO THIS:

#### Spacing Scale (8px grid):
```tsx
// 4px = 0.25rem = space-1 (only for tight lists)
// 8px = 0.5rem = space-2 ✅
// 12px = 0.75rem = space-3 ✅
// 16px = 1rem = space-4 ✅
// 24px = 1.5rem = space-6 ✅
// 32px = 2rem = space-8 ✅
// 40px = 2.5rem = space-10 ✅
// 48px = 3rem = space-12 ✅
// 64px = 4rem = space-16 ✅
// 80px = 5rem = space-20 ✅
// 96px = 6rem = space-24 ✅

// Element spacing
className="gap-4"      // 16px - Cards within grid
className="gap-6"      // 24px - Sections
className="gap-8"      // 32px - Major groups

// Section padding
className="py-16"      // 64px - Standard section
className="py-20"      // 80px - Hero sections
className="py-24"      // 96px - Major sections

// Component padding
className="p-6"        // 24px - Cards
className="p-8"        // 32px - Modals
```

### 📋 Standard Spacing:

| Element | Spacing | Value |
|---------|---------|-------|
| Between inline elements | gap-2 | 8px |
| Between cards | gap-4 | 16px |
| Between sections | gap-8 | 32px |
| Card padding | p-6 | 24px |
| Modal padding | p-8 | 32px |
| Section vertical | py-16 | 64px |
| Hero vertical | py-20 | 80px |
| Max container width | max-w-7xl | 1280px |

### 🎯 Spacing Rules:

1. **Always use 8px multiples** (gap-2, gap-4, gap-6, gap-8, etc.)
2. **Consistent section spacing**: py-16 for standard, py-20 for hero
3. **Card padding**: Always p-6 (24px) or p-8 (32px)
4. **Gap consistency**: Use gap-4 for cards, gap-6 for sections
5. **Container**: Always max-w-7xl + mx-auto + px-4

---

## 🌟 5. SHADOW & ELEVATION (MANDATORY)

### Available Shadows:
```css
--shadow-soft: 0 4px 24px rgba(30, 35, 51, 0.06);
--shadow-ring: 0 0 0 3px rgba(166, 136, 106, 0.20);
```

### ❌ NEVER DO THIS:
```tsx
// ❌ Custom shadows
className="shadow-md"
className="shadow-lg"
style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}

// ❌ Inconsistent elevation
<Card className="shadow-sm" />
<Card className="shadow-lg" />
<Card className="shadow-xl" />
// Mixed on same page!
```

### ✅ ALWAYS DO THIS:
```tsx
// ✅ Use shadow-soft for cards
<Card className="shadow-[var(--shadow-soft)]" />

// ✅ Use shadow-ring for focus
<input className="focus-visible:shadow-[var(--shadow-ring)]" />

// ✅ No shadow for flat surfaces
<div className="bg-[var(--color-bg)]" />
```

### 📋 Elevation System:

| Level | Shadow | Usage |
|-------|--------|-------|
| **0 (Flat)** | none | Page background, flat sections |
| **1 (Raised)** | shadow-soft | Cards, modals, dropdowns |
| **Focus** | shadow-ring | Focus states |

### 🎯 Shadow Rules:

1. **Cards**: Always use `shadow-[var(--shadow-soft)]`
2. **Focus**: Always use `shadow-[var(--shadow-ring)]`
3. **No random shadows**: Use tokens only
4. **Hover elevation**: Don't change shadow on hover (only color/scale)

---

## 🎭 6. ICON SYSTEM (MANDATORY)

### Icon Library:
**Use Lucide React ONLY** (already installed).

### ❌ NEVER DO THIS:
```tsx
// ❌ Mixed icon libraries
import { FaStar } from 'react-icons/fa';
import { MdCheck } from 'react-icons/md';

// ❌ Inconsistent sizes
<Icon className="w-4 h-4" />
<Icon className="w-5 h-5" />
<Icon className="w-6 h-6" />
// All mixed!

// ❌ Filled + outlined mix
import { Star } from 'lucide-react';        // outlined
import { StarFilled } from '@tabler/icons'; // filled
```

### ✅ ALWAYS DO THIS:
```tsx
// ✅ Lucide React only
import { Star, Heart, Check, X } from 'lucide-react';

// ✅ Consistent sizes
// Small: w-4 h-4 (16px) - Inline text
// Medium: w-5 h-5 (20px) - Buttons, cards
// Large: w-6 h-6 (24px) - Section headers
// XL: w-8 h-8 (32px) - Hero icons

// ✅ Standard usage
<Star className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
```

### 📋 Icon Sizes:

| Size | Class | Usage |
|------|-------|-------|
| **Small** | w-4 h-4 | Inline with text |
| **Medium** | w-5 h-5 | Buttons, list items |
| **Large** | w-6 h-6 | Section headers |
| **XL** | w-8 h-8 | Hero sections |

### 🎯 Icon Rules:

1. **Library**: Lucide React ONLY
2. **Style**: Outlined (default Lucide style)
3. **Sizes**: Use defined scale (w-4, w-5, w-6, w-8)
4. **Colors**: Use color tokens
5. **Stroke Width**: Default (2px) - don't override

---

## 📋 7. FORM FIELD SYSTEM (MANDATORY)

### ❌ NEVER DO THIS:
```tsx
// ❌ Inconsistent heights
<input className="h-10" />  // 40px
<input className="h-12" />  // 48px
<input className="h-14" />  // 56px

// ❌ Inconsistent padding
<input className="px-3 py-2" />
<input className="px-4 py-3" />

// ❌ Mixed border styles
<input className="border" />
<input className="border-2" />
```

### ✅ ALWAYS DO THIS:

#### Standard Input:
```tsx
<input className="
  w-full
  min-h-[48px]
  px-4 py-3
  rounded-xl
  border-2 border-[var(--color-border)]
  text-base
  transition-all
  focus-visible:border-[var(--ff-color-primary-500)]
  focus-visible:shadow-[var(--shadow-ring)]
  outline-none
" />
```

#### Label:
```tsx
<label className="
  block
  text-sm
  font-semibold
  text-[var(--color-text)]
  mb-2
">
  E-mailadres
</label>
```

### 📋 Form Field Specs:

| Element | Height | Padding | Radius | Border | Font Size |
|---------|--------|---------|--------|--------|-----------|
| **Input** | 48px | px-4 py-3 | rounded-xl | 2px | text-base |
| **Textarea** | auto | px-4 py-3 | rounded-xl | 2px | text-base |
| **Select** | 48px | px-4 py-3 | rounded-xl | 2px | text-base |
| **Checkbox** | 20px | - | rounded-md | 2px | - |
| **Radio** | 20px | - | rounded-full | 2px | - |
| **Label** | auto | - | - | - | text-sm |

### 🎯 Form Field Rules:

1. **Height**: 48px minimum for touch targets
2. **Padding**: px-4 py-3 (consistent)
3. **Border**: 2px solid
4. **Radius**: rounded-xl (1rem)
5. **Label**: Above field, mb-2, text-sm, font-semibold
6. **Focus**: border + shadow-ring
7. **Error**: Red border + inline error message below

---

## 🎯 ENFORCEMENT CHECKLIST

Before merging any PR, verify:

### Colors:
- [ ] No hardcoded hex colors (#...) in className or style
- [ ] All colors use `var(--...)` syntax
- [ ] Status colors use appropriate tokens (success/warning/danger)

### Typography:
- [ ] Font sizes match defined scale
- [ ] Line heights follow system (1.1 - 1.6)
- [ ] Headings use Montserrat, body uses Lato
- [ ] Font weights are 400/600/700 only

### Buttons:
- [ ] Minimum height 48px (44px for icon-only)
- [ ] Border radius is rounded-xl or rounded-lg
- [ ] Padding matches defined system
- [ ] Hover and focus states present
- [ ] Transitions are 200ms

### Spacing:
- [ ] All spacing is 8px multiples
- [ ] Section padding is py-16 or py-20
- [ ] Card padding is p-6 or p-8
- [ ] Gap is gap-4, gap-6, or gap-8

### Shadows:
- [ ] Cards use shadow-soft
- [ ] Focus uses shadow-ring
- [ ] No custom shadow values

### Icons:
- [ ] Lucide React only
- [ ] Sizes are w-4, w-5, w-6, or w-8
- [ ] Colors use tokens

### Forms:
- [ ] Input height is 48px
- [ ] Padding is px-4 py-3
- [ ] Border is 2px
- [ ] Radius is rounded-xl
- [ ] Labels are above, mb-2

---

## 🚨 VIOLATIONS

### Current Violations (by severity):

**🔴 CRITICAL (Fix immediately):**
- 142 hardcoded hex colors in components
- Inconsistent button radii (rounded-lg vs rounded-xl vs rounded-2xl)
- Random spacing values (not 8px multiples)
- Form fields with varying heights (40-56px)

**🟡 WARNING (Fix soon):**
- Some typography sizes not in scale
- Mixed shadow usage
- Inconsistent hover states

**🟢 MINOR (Fix when touching code):**
- Some icons not using Lucide
- Label positioning inconsistencies

---

## 📚 RESOURCES

- Design Tokens: `/src/styles/tokens.css`
- Polish CSS: `/src/styles/polish.css`
- Button Component: `/src/components/ui/Button.tsx`
- Error Messages: `/src/utils/formErrors.ts`

---

**Remember: Consistency = Professional = Trust = Conversions.**

Every small inconsistency chips away at user confidence.
