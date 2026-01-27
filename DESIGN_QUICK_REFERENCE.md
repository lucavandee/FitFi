# FitFi Design System - Quick Reference

**Print this out. Keep it next to your keyboard. Use it EVERY time you write UI code.**

---

## 🎨 COLORS (Use tokens ONLY)

### ❌ NEVER:
```tsx
className="bg-[#F7F3EC]"     // ❌ Hardcoded hex
className="bg-gray-100"       // ❌ Generic Tailwind
```

### ✅ ALWAYS:
```tsx
className="bg-[var(--color-bg)]"           // Page background
className="bg-[var(--color-surface)]"      // Cards
className="text-[var(--color-text)]"       // Primary text
className="text-[var(--color-text-muted)]" // Secondary text
className="border-[var(--color-border)]"   // Borders

// Primary (Brand taupe):
className="bg-[var(--ff-color-primary-700)]"  // CTA bg
className="text-[var(--ff-color-primary-600)]" // Brand text
className="hover:bg-[var(--ff-color-primary-600)]" // Hover

// Status:
className="text-[var(--color-success)]"    // Success
className="text-[var(--color-warning)]"    // Warning
className="text-[var(--color-danger)]"     // Error
```

---

## 📝 TYPOGRAPHY (Stick to scale)

### Font Sizes:
```tsx
className="text-[3.5rem]"    // Display (56px) - Hero titles
className="text-[2.5rem]"    // H1 (40px) - Page titles
className="text-[2rem]"      // H2 (32px) - Sections
className="text-[1.5rem]"    // H3 (24px) - Subsections
className="text-[1.125rem]"  // Body Large (18px) - Lead
className="text-base"        // Body (16px) - Default
className="text-sm"          // Body Small (14px) - Secondary
className="text-xs"          // Caption (12px) - Labels
```

### Line Heights:
```tsx
className="leading-[1.1]"    // Display, H1
className="leading-[1.2]"    // H2, H3
className="leading-[1.6]"    // Body (default)
```

### Weights:
```tsx
className="font-bold"        // 700 - Headings
className="font-semibold"    // 600 - Subheadings, buttons
className="font-medium"      // 500 - Emphasis
className="font-normal"      // 400 - Body (default)
```

---

## 🔘 BUTTONS (Consistent sizes)

### Primary Button:
```tsx
<button className="
  px-8 py-3.5
  min-h-[48px]
  rounded-xl
  bg-[var(--ff-color-primary-700)]
  text-white
  font-semibold
  hover:bg-[var(--ff-color-primary-600)]
  transition-all duration-200
">
```

### Secondary Button (Ghost):
```tsx
<button className="
  px-6 py-3
  min-h-[48px]
  rounded-xl
  bg-transparent
  border-2 border-[var(--color-border)]
  hover:border-[var(--ff-color-primary-500)]
  transition-all duration-200
">
```

### Icon Button:
```tsx
<button className="
  p-3
  w-11 h-11
  rounded-lg
  hover:bg-[var(--ff-color-primary-50)]
  transition-all
">
  <Icon className="w-5 h-5" />
</button>
```

---

## 📐 SPACING (8px grid ONLY)

### ❌ NEVER:
```tsx
className="gap-3"    // 12px - Not 8px multiple
className="mb-5"     // 20px - Not 8px multiple
className="py-7"     // 28px - Not 8px multiple
```

### ✅ ALWAYS use multiples of 8px:
```tsx
// 8px = space-2
// 16px = space-4
// 24px = space-6
// 32px = space-8
// 40px = space-10
// 48px = space-12
// 64px = space-16
// 80px = space-20

className="gap-4"     // 16px - Cards
className="gap-6"     // 24px - Sections
className="gap-8"     // 32px - Major groups
className="py-16"     // 64px - Standard section
className="py-20"     // 80px - Hero section
className="p-6"       // 24px - Card padding
className="p-8"       // 32px - Modal padding
```

---

## 🌟 SHADOWS (2 options only)

### ❌ NEVER:
```tsx
className="shadow-sm"
className="shadow-md"
className="shadow-lg"
className="shadow-xl"
```

### ✅ ALWAYS:
```tsx
// For cards, modals, dropdowns:
className="shadow-[var(--shadow-soft)]"

// For focus states:
className="focus-visible:shadow-[var(--shadow-ring)]"

// For flat surfaces:
// (no shadow class at all)
```

---

## 📋 FORM FIELDS (Consistent height)

### Standard Input:
```tsx
<input className="
  w-full
  min-h-[48px]
  px-4 py-3
  rounded-xl
  border-2 border-[var(--color-border)]
  focus-visible:border-[var(--ff-color-primary-500)]
  focus-visible:shadow-[var(--shadow-ring)]
  outline-none
" />
```

### Label:
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

---

## 🎭 ICONS (Lucide only)

### Import:
```tsx
import { Star, Heart, Check } from 'lucide-react';
```

### Sizes:
```tsx
<Icon className="w-4 h-4" />  // Inline with text
<Icon className="w-5 h-5" />  // Buttons, cards (DEFAULT)
<Icon className="w-6 h-6" />  // Section headers
<Icon className="w-8 h-8" />  // Hero sections
```

---

## 🏗️ LAYOUT (Container)

### Standard Page Container:
```tsx
<main className="min-h-screen bg-[var(--color-bg)]">
  <div className="max-w-7xl mx-auto px-4 py-16">
    {/* Content */}
  </div>
</main>
```

### Card:
```tsx
<div className="
  bg-[var(--color-surface)]
  border border-[var(--color-border)]
  rounded-xl
  p-6
  shadow-[var(--shadow-soft)]
">
  {/* Content */}
</div>
```

---

## ⚡ TRANSITIONS (Smooth everything)

### Standard Transition:
```tsx
className="transition-all duration-200"
```

### Hover States:
```tsx
className="
  transition-all duration-200
  hover:scale-105
  hover:shadow-lg
"
```

---

## 🚫 COMMON MISTAKES

| ❌ Don't | ✅ Do |
|---------|-------|
| `bg-[#F7F3EC]` | `bg-[var(--color-bg)]` |
| `gap-3` | `gap-4` (16px) |
| `shadow-md` | `shadow-[var(--shadow-soft)]` |
| `text-[22px]` | `text-[1.5rem]` (24px) |
| `min-h-[44px]` | `min-h-[48px]` |
| `rounded-lg` (button) | `rounded-xl` (button) |
| `py-5` | `py-6` (24px) |
| `px-7` | `px-8` (32px) |

---

## 📊 BEFORE YOU COMMIT

Run the compliance checker:
```bash
node scripts/check-design-compliance.mjs
```

Target score: **70%+** (good) / **90%+** (excellent)

---

## 🎯 THE GOLDEN RULES

1. **Colors**: Use `var(--...)` ALWAYS
2. **Spacing**: Multiples of 8px ONLY
3. **Buttons**: 48px height, `rounded-xl`
4. **Shadows**: `shadow-soft` or `shadow-ring` ONLY
5. **Typography**: Stick to the scale (12/14/16/18/24/32/40/56px)
6. **Icons**: Lucide React, w-5 h-5 default
7. **Forms**: 48px height, px-4 py-3, rounded-xl
8. **Transitions**: 200ms, always smooth

---

**Remember: Every inconsistency = -1% user trust.**

Print this. Use it. Ship consistent UI.
