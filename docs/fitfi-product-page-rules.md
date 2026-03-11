# FitFi Product Page Rules

Product pages (`/results`, `/dashboard`, `/profile`, `/shop`) are **functional interfaces**, not marketing pages.

---

## 1. Max Widths

| Page | Max Width |
|---|---|
| `/results` | `max-w-5xl` |
| `/dashboard` | `max-w-6xl` |
| `/profile` | `max-w-4xl` |
| `/shop` | `max-w-6xl` |

Never use `max-w-7xl` as default on product pages.

---

## 2. Section Spacing

| Context | Padding |
|---|---|
| Compact section | `py-6 sm:py-8` |
| Normal section | `py-8 sm:py-12` |
| Hero area of product page | `pt-8 pb-6` or `pt-10 pb-8` |

Never use `py-16`, `py-20`, or larger on product pages unless explicitly requested.

---

## 3. Header Hierarchy

| Level | Size |
|---|---|
| Page H1 | `text-2xl sm:text-3xl lg:text-4xl` |
| Section H2 | `text-xl sm:text-2xl` |
| Card title H3 | `text-base sm:text-lg font-semibold` |
| Metadata label | `text-xs font-medium text-[var(--color-muted)]` |

Font weight: max 2–3 weights on any single product page view.
Leading: `leading-tight` for headings, `leading-relaxed` for body.

---

## 4. Metadata Rules

- Always `text-xs`
- Always `text-[var(--color-muted)]`
- Maximum 2 badges/pills per metadata row
- Use separator `·` between inline items
- Must be visually subordinate to the title and primary CTA
- Use `MetaInlineRow` primitive for all metadata rows

---

## 5. Card Rules

All cards follow the `SurfaceCard` primitive:

```
bg-[var(--color-surface)]
rounded-2xl
border border-[var(--color-border)]
shadow-[var(--shadow-soft)]
```

Hover states:
- Optional: `hover:-translate-y-0.5 transition-transform duration-200`
- Never: `scale-105` or heavier shadow jumps as default

Padding inside cards:
- Compact: `p-4`
- Normal: `p-4 sm:p-6`
- Never: `p-8` or larger as default on product page cards

---

## 6. No Marketing Hero Behaviour on Product Pages

Product pages must NOT have:

| Forbidden | Why |
|---|---|
| Full-bleed image hero | Reserved for landing/marketing |
| Oversized H1 (>3.5rem) | Too large for functional context |
| Large empty spacing above fold | Wastes screen real estate |
| Heavy intro/storytelling section above functionality | Delays user value |
| Decorative patterns or radial gradients as page background | Visual noise |
| Glassmorphism as default card style | Reduces readability |
| Marketing copywriting tone in UI labels | Confusing in functional context |

---

## 7. CTA Rules on Product Pages

- Maximum **1 primary CTA** visible at a time per viewport
- Primary: `bg-[var(--ff-color-primary-700)] text-white rounded-xl`
- Secondary: transparent outline, `border-[var(--color-border)]`
- Icon-only buttons: `w-11 h-11 rounded-full` minimum
- Never stack two primary CTAs side by side

---

## 8. Badge/Pill on Product Pages

- `text-xs rounded-full`
- Soft background tints only
- Convey status or context (not promotions)
- Never use primary-700 fill on product page badges
- Maximum 2 badges visible in the same inline context

---

## 9. Spacing System (8px Grid)

All spacing must map to multiples of 8px (Tailwind scale):

```
4px  = gap-1, p-1
8px  = gap-2, p-2
12px = gap-3, p-3
16px = gap-4, p-4
24px = gap-6, p-6
32px = gap-8, p-8
48px = gap-12, py-12
```

---

## 10. Do / Don't Checklist

### DO
- Use `SurfaceCard` primitive for all cards
- Use `SectionHeader` primitive for section titles
- Use `MetaInlineRow` primitive for metadata
- Use `PrimaryButton` / `SecondaryButton` / `IconButton` primitives
- Use `BadgePill` for all status/label pills
- Keep sections compact and functional
- Provide clear visual hierarchy: title > content > metadata

### DON'T
- Add marketing hero sections above functionality
- Use hex or rgb values in component files (tokens only)
- Stack more than 1 primary CTA per visible section
- Use `py-16` or larger on product pages
- Introduce a second navbar or header
- Use Node-only imports in client components
- Redesign routing, providers, auth, or analytics
