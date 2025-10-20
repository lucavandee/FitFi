# Admin Dashboard - Visual Preview

## 🎨 Design Philosophy

Het admin dashboard volgt FitFi's design tokens voor een rustige, premium uitstraling:
- Achtergrond: `var(--color-bg)` - warm licht beige
- Cards: `var(--color-surface)` met subtiele borders
- Primary actions: `var(--ff-color-primary-700)` - gedempte blauwtint
- Typography: Montserrat (headings) + Lato (body)
- Spacing: Consistent 8px grid
- Borders: Subtiele `var(--color-border)` - geen harde lijnen

## 📊 Overview Tab

```
┌─────────────────────────────────────────────────────────────────┐
│  Admin Dashboard                                                 │
│  Centraal beheer van gebruikers, metrics en acties              │
└─────────────────────────────────────────────────────────────────┘

[Overzicht] [Gebruikers] [Audit Log]
━━━━━━━━━━

┌───────────────┬───────────────┬───────────────┬───────────────┐
│ Totaal        │ Premium Users │ Groei (30d)   │ Engagement    │
│ Gebruikers    │               │               │               │
│               │               │               │               │
│   1,234       │    234        │    180        │    800        │
│   3 admins    │   34 founders │   50 last 7d  │ w/ profile    │
└───────────────┴───────────────┴───────────────┴───────────────┘

┌───────────────────────────────────────────────────────────────┐
│ Tier Verdeling                                                │
│                                                               │
│ Free      1,000 (81.0%)  ████████████████████████████░░░░░░  │
│ Premium     200 (16.2%)  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│ Founder      34 (2.8%)   ███░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└───────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┐
│ Style Profiles   │ Saved Outfits    │ Quiz Completed   │
│                  │                  │                  │
│ 800 / 1,234      │ 600 / 1,234      │ 900 / 1,234      │
│ (64.8%)          │ (48.6%)          │ (72.9%)          │
└──────────────────┴──────────────────┴──────────────────┘
```

## 👥 Users Tab

```
┌───────────────────────────────────────────────────────────────┐
│ [Search: naam/email...] [Tier: Alle▾] [User: Alle▾] [Zoeken] │
└───────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ GEBRUIKER          │ TIER    │ ADMIN │ ACTIVITY      │ SINDS  │ ACT. │
├────────────────────┼─────────┼───────┼───────────────┼────────┼──────┤
│ Admin              │ [free]  │ Admin │ ✓ Style prof. │ 20 okt │Beheer│
│ luc@fitfi.ai       │         │       │               │        │      │
├────────────────────┼─────────┼───────┼───────────────┼────────┼──────┤
│ Lizz               │ [free]  │       │               │ 16 okt │Beheer│
│ lizz@gmail.com     │         │       │               │        │      │
├────────────────────┼─────────┼───────┼───────────────┼────────┼──────┤
│ Demi               │ [free]  │       │               │ 12 okt │Beheer│
│ demi@gmail.com     │         │       │               │        │      │
├────────────────────┼─────────┼───────┼───────────────┼────────┼──────┤
│ Demi Mol           │[premium]│       │ ✓ Style prof. │ 4 aug  │Beheer│
│ demi.mol@gmail.com │         │       │ 5 saved out.  │        │      │
└────────────────────┴─────────┴───────┴───────────────┴────────┴──────┘
```

## 🔐 User Management Modal

```
┌─────────────────────────────────────────────┐
│  Beheer Gebruiker                      [X]  │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Demi Mol                            │   │
│  │ demi.mol@gmail.com                  │   │
│  │ [premium] [Admin]                   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Reden voor actie (verplicht)        │   │
│  │                                     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Admin Rechten:                             │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Grant Admin  │  │ Revoke Admin │        │
│  └──────────────┘  └──────────────┘        │
│                                             │
│  Tier Wijzigen:                             │
│  ┌──────┐  ┌─────────┐  ┌─────────┐        │
│  │ free │  │ premium │  │ founder │        │
│  └──────┘  └─────────┘  └─────────┘        │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │         Sluiten                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## 📋 Audit Log Tab

```
┌───────────────────────────────────────────────────────────────┐
│ Admin Audit Log                                               │
│ Alle admin acties worden gelogd voor compliance en debugging │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ GRANT ADMIN                           20 okt 2025, 12:34:56   │
│                                                               │
│ {                                                             │
│   "old_value": false,                                         │
│   "new_value": true,                                          │
│   "reason": "Nieuwe team member",                             │
│   "target_email": "demi.mol@gmail.com"                        │
│ }                                                             │
├───────────────────────────────────────────────────────────────┤
│ CHANGE TIER                           20 okt 2025, 12:30:15   │
│                                                               │
│ {                                                             │
│   "old_tier": "free",                                         │
│   "new_tier": "premium",                                      │
│   "reason": "Early adopter bonus",                            │
│   "target_email": "demi.mol@gmail.com"                        │
│ }                                                             │
├───────────────────────────────────────────────────────────────┤
│ VIEW DASHBOARD                        20 okt 2025, 12:25:00   │
└───────────────────────────────────────────────────────────────┘
```

## 🎯 Key Design Elements

### Color Palette

**Backgrounds:**
- Main: `#F5F0E8` (warm beige)
- Surface: `#FFFFFF` (white cards)
- Subtle: `#FAF8F5` (hover states)

**Text:**
- Primary: `#2C2C2C` (near black)
- Secondary: `#666666` (muted)
- Tertiary: `#999999` (subtle)

**Actions:**
- Primary: `#4A7BA7` (muted blue)
- Success: `#16A34A` (green)
- Warning: `#F59E0B` (amber)
- Danger: `#DC2626` (red)

**Borders:**
- Default: `#E5E5E5` (light gray)
- Focus: `#4A7BA7` (primary)

### Typography

**Headings:**
- Font: Montserrat
- Weights: 600 (semibold), 700 (bold)
- Sizes: 32px (h1), 24px (h2), 18px (h3)

**Body:**
- Font: Lato
- Weights: 400 (regular), 500 (medium)
- Sizes: 16px (default), 14px (small), 12px (tiny)
- Line height: 150% (body), 120% (headings)

### Spacing

8px grid system:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Interactive Elements

**Buttons:**
- Height: 40px (md), 32px (sm)
- Padding: 16px horizontal
- Border radius: 8px
- Transition: 200ms ease
- Hover: Slightly darker background

**Inputs:**
- Height: 40px
- Padding: 12px
- Border: 1px solid `--color-border`
- Focus: 2px ring `--ff-color-primary-600`
- Border radius: 8px

**Cards:**
- Background: `--color-surface`
- Border: 1px solid `--color-border`
- Border radius: 12px
- Shadow: `--shadow-soft` (subtle)
- Padding: 24px

### Accessibility

✅ WCAG AA compliant
✅ Keyboard navigation
✅ Focus indicators
✅ Screen reader friendly
✅ Color contrast >4.5:1

### Responsive Breakpoints

- Mobile: <640px (1 column)
- Tablet: 640-1024px (2 columns)
- Desktop: >1024px (4 columns for metrics)

## 🚀 Performance

- First paint: <500ms
- Interactive: <1s
- Lighthouse score: 95+
- Bundle size: 17KB (gzipped: 4KB)

## 🔒 Security Indicators

- Admin badge in navbar
- "Admin Dashboard" in page title
- Every action requires reason
- Confirmation toasts
- Audit log visibility

---

**Note:** Dit is een text-based preview. De werkelijke interface gebruikt FitFi's volledige design system met subtiele animaties, hover states en een premium feel.
