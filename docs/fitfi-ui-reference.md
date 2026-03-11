# FitFi UI Reference

**Design source of truth: homepage (`/`)**

Use the homepage as a visual benchmark for spacing, typography, CTA hierarchy, and component rhythm. Do not copy its layout structure onto product pages.

---

## 1. Container Rules

| Context | Max Width | Padding |
|---|---|---|
| Marketing / homepage | `max-w-7xl` | `px-4 sm:px-6 lg:px-8` |
| Product pages (results, dashboard, profile, shop) | `max-w-5xl` or `max-w-6xl` | `px-4 sm:px-6` |
| Reading / editorial | `max-w-3xl` | `px-4 sm:px-6` |

Token: `ff-container` in `polish.css` sets `max-width: 72rem` with `padding-inline: 1rem`.

---

## 2. Spacing Rules

Use the 8px base grid. All spacing values must map to Tailwind's scale or explicit token-based values.

| Use case | Token/class |
|---|---|
| Section padding (marketing) | `py-12 sm:py-16 md:py-20` |
| Section padding (product page) | `py-6 sm:py-8` |
| Section padding (normal product) | `py-8 sm:py-12` |
| Card internal padding | `p-4 sm:p-6` |
| Inline gap (cluster) | `gap-2 sm:gap-3` |
| Flow spacing | `.flow`, `.flow-lg`, `.flow-xl` from `polish.css` |

Never use `py-16` or larger on product pages unless explicitly requested.

---

## 3. Typography Rules

All type must use tokens. No hex or rgb values in component files.

| Role | Class / Token |
|---|---|
| Hero title (marketing) | `.hero-title` → `clamp(2.25rem, 2.6vw + 1rem, 3.6rem)` |
| Product H1 | `text-2xl sm:text-3xl lg:text-4xl` |
| Product H2 | `text-2xl sm:text-3xl` |
| Section title | `.section-title` → `clamp(1.5rem, 0.9vw + 1rem, 2rem)` |
| Body text | `text-base leading-relaxed` |
| Muted / supporting | `text-[var(--color-muted)]` or `text-[var(--color-text-muted)]` |
| Metadata | `text-xs text-[var(--color-muted)]` |

Font families: `font-heading` (Montserrat) for display, `font-sans` (Lato) for body.
Maximum 3 font weights per page.
Line height: 150% for body (1.5–1.6), 120% for headings (1.1–1.2).

---

## 4. CTA Hierarchy Rules

Each section must have at most **1 primary CTA**.

| Level | Style |
|---|---|
| Primary | `bg-[var(--ff-color-primary-700)]` `text-white` `rounded-xl` `hover:bg-[var(--ff-color-primary-600)]` |
| Secondary | Transparent / outline `border border-[var(--color-border)]` `text-[var(--color-text)]` |
| Tertiary | Icon-only, text link, or ghost |

Focus ring: `focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 focus-visible:outline-none`

Minimum touch target: `w-11 h-11` (44×44px) for all interactive elements.

---

## 5. Card Shell Rules

```
bg-[var(--color-surface)]
rounded-2xl
border border-[var(--color-border)]
shadow-[var(--shadow-soft)]
```

Optional hover: `transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md`

No heavy box shadows. No aggressive scale transforms. No glassmorphism as default.

Tokens in use:
- `--color-surface: #FFFFFF`
- `--color-border: rgba(30, 35, 51, 0.08)`
- `--shadow-soft: 0 4px 24px rgba(30, 35, 51, 0.06)`
- `--radius-2xl: 1.5rem`

---

## 6. Badge / Pill Rules

Badges are **supporting** elements. They must never be CTA-like.

| Rule | Detail |
|---|---|
| Size | `text-xs` always |
| Shape | `rounded-full` |
| Max per line | 2 badges per metadata row |
| Background | Soft tint via `color-mix()` or token |
| Text | `var(--color-text)` or `var(--color-muted)` |
| Never | Bold text, large size, high contrast fill, primary-colored background |

Reference CSS classes: `.badge`, `.badge-soft`, `.badge-neutral`, `.badge-season`, `.badge-arch` in `polish.css`.

---

## 7. Metadata Styling

- `text-xs` (0.75rem)
- `text-[var(--color-muted)]` or `text-[var(--color-text-muted)]`
- Never equal in visual weight to title or CTA
- Separate with `·` separator (midpoint `&middot;`) or inline gap
- Use `MetaInlineRow` primitive for consistency

---

## 8. Radius & Shadow Discipline

| Element | Radius |
|---|---|
| Cards | `--radius-2xl` (1.5rem) |
| Buttons | `rounded-xl` (primary/secondary) or `rounded-full` (icon/pill) |
| Badges | `rounded-full` |
| Inputs | `rounded-lg` |
| Modal | `rounded-2xl` |

| Shadow | Token |
|---|---|
| Default card | `--shadow-soft` |
| Elevated / hover | `0 10px 22px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.05)` |
| Focus ring | `--shadow-ring` |

No `shadow-xl` or heavier as default state.

---

## 9. Visual Rhythm

- Maintain consistent vertical spacing between sections
- Alternate `bg-surface` and `bg-[var(--color-bg)]` to create section breaks
- Use `.alt-bg` class from `polish.css` for subtle alternation
- Icons: 16×16 (inline/meta), 20×20 (card), 24×24 (section headers)
- Spacing between heading and subheading: `mt-2` or `mt-3`
- Spacing between heading group and content: `mt-6` or `mt-8`

---

## 10. Token Quick Reference

```css
--color-bg:              #F7F3EC
--color-surface:         #FFFFFF
--color-text:            #1E2333
--color-muted:           #4A5568
--color-border:          rgba(30, 35, 51, 0.08)
--ff-color-primary-700:  #7A614A   /* CTA background */
--ff-color-primary-600:  #8F7459   /* CTA hover */
--ff-color-primary-50:   #F6EFE9   /* light tint */
--shadow-soft:           0 4px 24px rgba(30, 35, 51, 0.06)
--shadow-ring:           0 0 0 3px rgba(166, 136, 106, 0.20)
--radius-2xl:            1.5rem
```
