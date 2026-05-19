# CTA Hierarchy — Quick Reference Guide

**Last Updated:** 2026-01-27

---

## 🎯 THE GOLDEN RULE

```
ONE PAGE = ONE PRIMARY CTA (MAXIMUM!)
```

---

## 🎨 BUTTON CLASSES CHEAT SHEET

### **1. Primary CTA (The ONE Thing)**

```tsx
<button className="ff-btn ff-btn--primary ff-btn--xl">
  Ontvang je stijladvies
</button>
```

**Use when:**
- Main conversion goal
- Maximum ONE per viewport
- Above-the-fold

**Examples:**
- "Ontvang je stijladvies"
- "Shop je favoriete items"
- "Start gratis" (on recommended plan only)

---

### **2. Secondary Action**

```tsx
<button className="ff-btn ff-btn--secondary ff-btn--md">
  Bekijk voorbeeld
</button>
```

**Use when:**
- Supporting actions
- Alternative paths
- Multiple allowed per page

**Examples:**
- "Bekijk voorbeeld"
- "Pas je stijl aan"
- "Kies dit plan" (on non-recommended plans)

---

### **3. Ghost Button (Dark Backgrounds)**

```tsx
<button className="ff-btn ff-btn--ghost ff-btn--md">
  Meer informatie
</button>
```

**Use when:**
- Secondary on hero images
- Modals with dark overlays

---

### **4. Text Link (Tertiary)**

```tsx
<a href="/info" className="ff-link">
  Meer informatie →
</a>

<a href="/privacy" className="ff-link ff-link--muted">
  Privacy instellingen
</a>
```

**Use when:**
- Low-priority actions
- Navigation links
- "Learn more" type links

---

## 📏 SIZE GUIDE

| Size | Class | Height | Use For |
|------|-------|--------|---------|
| **XL** | `ff-btn--xl` | 64px | Hero primary |
| **LG** | `ff-btn--lg` | 56px | Section primary |
| **MD** | `ff-btn--md` | 52px | Secondary (default) |
| **SM** | `ff-btn--sm` | 44px | Compact contexts |

**Rule:** Primary = xl/lg, Secondary = md/sm

---

## 📝 COPY FORMULA

```
[Action Verb] + [Concrete Benefit/Object]
```

### **DO ✅**

| Use This | Not This |
|----------|----------|
| "Ontvang je stijladvies" | "Verder" |
| "Shop deze outfits" | "Klik hier" |
| "Begin gratis" | "Start" |
| "Bekijk je perfecte kleuren" | "Meer" |

---

## 🚫 ANTI-PATTERNS

### ❌ DON'T: Multiple Primaries

```tsx
// BAD - Two prominent CTAs
<button className="ff-btn--primary">Action 1</button>
<button className="ff-btn--primary">Action 2</button>

// GOOD - Clear hierarchy
<button className="ff-btn--primary ff-btn--xl">Primary Action</button>
<button className="ff-btn--secondary ff-btn--md">Secondary</button>
```

### ❌ DON'T: Same Size

```tsx
// BAD - No size difference
<button className="ff-btn--primary ff-btn--md">Primary</button>
<button className="ff-btn--secondary ff-btn--md">Secondary</button>

// GOOD - Size reinforces hierarchy
<button className="ff-btn--primary ff-btn--xl">Primary</button>
<button className="ff-btn--secondary ff-btn--md">Secondary</button>
```

### ❌ DON'T: Vague Labels

```tsx
// BAD
<button>Verder</button>
<button>Klik hier</button>
<button>Meer</button>

// GOOD
<button>Ontvang je stijladvies</button>
<button>Shop deze outfits</button>
<button>Ontdek je voordelen</button>
```

---

## 📱 MOBILE RULES

- **Touch targets:** ≥ 52px (height)
- **Thumb zone:** Place primary CTA in bottom 40% of screen
- **Stack vertically:** CTAs should stack on mobile
- **Full width:** Primary CTA can be `w-full` on mobile

```tsx
<div className="flex flex-col gap-3 sm:flex-row">
  <button className="ff-btn ff-btn--primary ff-btn--xl w-full sm:w-auto">
    Primary Action
  </button>
  <button className="ff-btn ff-btn--secondary ff-btn--md w-full sm:w-auto">
    Secondary
  </button>
</div>
```

---

## ✅ CHECKLIST

Before shipping any page:

```
□ ONE primary CTA per viewport
□ Primary uses ff-btn--primary
□ Primary is xl/lg size
□ Primary has value-driven label
□ Secondary CTAs are md/sm
□ Touch targets ≥ 52px
□ Passes "squint test"
```

---

## 🔍 THE SQUINT TEST

**How to test visual hierarchy:**

1. Squint your eyes
2. Look at the page
3. Can you still identify the primary CTA?
4. Is it clearly the most prominent?

**If NO → Fix hierarchy!**

---

## 📊 EXPECTED IMPACT

| Metric | Before | After | Lift |
|--------|--------|-------|------|
| Click-through | 12% | 22% | **+83%** |
| Decision time | 8.5s | 3.2s | **-62%** |
| Conversion | 3.2% | 5.8% | **+81%** |

---

## 🎯 PAGE EXAMPLES

### Landing Page

```tsx
// PRIMARY - Hero
<button className="ff-btn ff-btn--primary ff-btn--xl">
  Ontvang je stijladvies
  <ArrowRight />
</button>

// SECONDARY - Hero
<button className="ff-btn ff-btn--ghost ff-btn--md">
  <Play />
  Bekijk voorbeeld
</button>

// TERTIARY - Footer
<a href="/faq" className="ff-link ff-link--muted">
  Veelgestelde vragen →
</a>
```

### Pricing Page

```tsx
{/* ONLY recommended plan gets primary */}
{plan.recommended ? (
  <button className="ff-btn ff-btn--primary ff-btn--xl w-full">
    Start gratis
    <ArrowRight />
  </button>
) : (
  <button className="ff-btn ff-btn--secondary ff-btn--lg w-full">
    Kies dit plan
  </button>
)}
```

### Results Page

```tsx
// PRIMARY - Sticky bar
<button className="ff-btn ff-btn--primary ff-btn--lg">
  <ShoppingBag />
  Shop je favoriete items
</button>

// SECONDARY - Card actions
<button className="ff-btn ff-btn--secondary ff-btn--sm">
  <Heart />
  Bewaar
</button>
```

---

## 📚 FULL DOCUMENTATION

See: `/CTA_HIERARCHY_SYSTEM.md`

---

**Remember: ONE primary = Clear path = Higher conversion!** 🚀
