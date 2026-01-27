# FitFi UI Integration Guide

**How to use the new Design System in your components**

Version: 2.0
Last Updated: 2026-01-27

---

## Quick Start

Design system is now **enforced** through Tailwind config + utility classes.

**3 ways to build UI:**
1. Tailwind classes (NEW - enforced tokens)
2. Utility CSS classes (`.ff-btn`, `.ff-card`)  
3. Custom CSS (only when needed)

---

## 1️⃣ TAILWIND CLASSES (Preferred)

### Colors - Now tokenized

```tsx
// ❌ OLD
className="bg-[var(--color-bg)]"

// ✅ NEW
className="bg-bg"           // Background
className="bg-surface"      // Cards
className="text-text"       // Primary text
className="text-muted"      // Secondary text
className="border-border"   // Borders

// Primary colors (full scale)
className="bg-primary-700"  // CTA
className="bg-primary-600"  // Hover
className="text-primary-600"

// Status colors
className="text-success"
className="text-danger"
```

### Spacing - 8px grid enforced

```tsx
className="gap-4"     // 16px - Cards
className="gap-6"     // 24px - Sections
className="py-16"     // 64px - Standard section
className="p-6"       // 24px - Cards
```

### Typography - Enforced scale

```tsx
className="text-xs"    // 12px (Caption)
className="text-sm"    // 14px (Body Small)
className="text-base"  // 16px (Body)
className="text-2xl"   // 24px (H3)
className="text-4xl"   // 40px (H1)
```

### Shadows - Redirected

```tsx
className="shadow-soft"  // For cards
className="shadow-ring"  // For focus
// All shadow-md/lg/xl redirect to shadow-soft
```

---

## 2️⃣ UTILITY CSS CLASSES

Pre-built patterns for common components.

### Buttons

```tsx
<button className="ff-btn ff-btn--md ff-btn--primary">
  Start gratis
</button>
```

### Cards

```tsx
<div className="ff-card">
  Content
</div>
```

### Typography

```tsx
<h1 className="ff-h1">Title</h1>
<p className="ff-body">Text</p>
```

---

## 3️⃣ COMPONENT PATTERNS

### Card Grid

```tsx
<div className="container mx-auto px-4 py-16">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="ff-card">Content</div>
  </div>
</div>
```

### Form

```tsx
<div>
  <label className="block text-sm font-semibold mb-2">
    E-mail
  </label>
  <input className="w-full min-h-button px-4 py-3 rounded-xl border-2 border-border" />
</div>
```

---

## 🚫 ANTI-PATTERNS

```tsx
// ❌ Hardcoded colors
className="bg-[#F7F3EC]"

// ❌ Non-8px spacing
className="gap-3"  // 12px

// ❌ Custom shadows
className="shadow-lg"

// ✅ CORRECT
className="bg-bg gap-4 shadow-soft"
```

---

## 📊 BEFORE/AFTER

**Before:**
```tsx
<div className="bg-[var(--color-surface)] p-5 shadow-md">
  <h3 className="text-[1.5rem] mb-3">Title</h3>
</div>
```

**After:**
```tsx
<div className="bg-surface p-6 shadow-soft">
  <h3 className="text-2xl mb-4">Title</h3>
</div>
```

---

## Resources

- Design System Compliance: `/DESIGN_SYSTEM_COMPLIANCE.md`
- Quick Reference: `/DESIGN_QUICK_REFERENCE.md`
- Tailwind Config: `/tailwind.config.ts`
