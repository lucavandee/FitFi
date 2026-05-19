# FitFi — Developer Reference (Live Productie)

> Dit document is de single source of truth voor alle UI-werk.
> Lees dit ALTIJD voor je een component aanraakt.

---

## 1. App-shell structuur

```
Navbar (sticky, h-16 = 64px, z-50)
└── <main id="main">
    └── <pagina-component>   ← GEEN eigen <main> of extra nav
```

- Pagina's die een split-screen willen: gebruik `minHeight: 'calc(100vh - 64px)'`
- Pagina's die fullscreen willen (onboarding): zijn aparte Routes buiten de main-wrapper
- **Nooit** een tweede Navbar of portal-header toevoegen

---

## 2. Kleur-tokens (gebruik ALTIJD var(), nooit hex in src/**)

```css
/* Achtergrond & oppervlakken */
--color-bg:      #F7F3EC   /* beige pagina-achtergrond */
--color-surface: #FFFFFF   /* kaarten, modals */
--color-border:  rgba(30,35,51,0.08)  /* alle randen */

/* Tekst */
--color-text:   #1E2333    /* koppen + body */
--color-muted:  #4A5568    /* labels, hints (AA 5.8:1) */

/* Brand (taupe) */
--ff-color-primary-50:  #F6EFE9   /* lichte bg-tint */
--ff-color-primary-100: #EDD9C8   /* zachtere bg */
--ff-color-primary-200: #E0C9B3   /* borders */
--ff-color-primary-300: #CEB39A
--ff-color-primary-500: #A6886A   /* basis brand */
--ff-color-primary-600: #8F7459   /* hover CTA */
--ff-color-primary-700: #7A614A   /* CTA-knop achtergrond (AA) */
--ff-color-primary-900: #3E3125

/* Status */
--ff-color-success-600: #16A34A
--ff-color-warning-600: #D97706
--ff-color-danger-500:  #EF4444
--ff-color-danger-600:  #DC2626

/* Nova AI */
--ff-color-nova: #2B6AF3
```

---

## 3. Typografie

- **Headings**: Montserrat, font-bold, tracking-tight
- **Body**: Lato, font-normal, leading-relaxed
- Gebruik `clamp()` voor responsive koppen — kijk naar Hero.tsx als referentie
- **Nooit** `text-purple-*` of `text-indigo-*` gebruiken

---

## 4. Spacing-systeem (8px grid)

```
p-1  = 4px   p-2 = 8px   p-3 = 12px  p-4 = 16px
p-5  = 20px  p-6 = 24px  p-8 = 32px  p-10 = 40px
p-12 = 48px  p-16 = 64px
```

---

## 5. Vaste utility-klassen (uit polish.css)

```css
.ff-container  /* max-w-[72rem] mx-auto px-4 */
.ff-section    /* py-14 sm:py-20 */
.ff-btn        /* basis knop-reset + hoogte 52px min */
.ff-btn-primary    /* bg primary-700, wit tekst, hover primary-600 */
.ff-btn-secondary  /* wit/surface bg, border, tekst = color-text */
.ff-card       /* bg-surface, border-border, shadow-soft, radius-lg */
.badge         /* inline pill: border + radius-full */
.badge-soft    /* lichte accent-tint achtergrond */
```

---

## 6. Knoppen — ALTIJD zo

```tsx
// Primaire CTA
<button className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)]
                   text-white font-semibold rounded-xl px-6 py-3.5 min-h-[52px]
                   transition-all active:scale-[0.98]
                   focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)]">

// Secundaire / ghost
<button className="border-2 border-[var(--color-border)]
                   hover:border-[var(--ff-color-primary-500)]
                   text-[var(--color-text)] hover:text-[var(--ff-color-primary-700)]
                   hover:bg-[var(--ff-color-primary-50)]
                   font-semibold rounded-xl px-6 py-3.5 min-h-[52px]">
```

---

## 7. Kaarten

```tsx
<div className="bg-[var(--color-surface)] rounded-2xl
                border border-[var(--color-border)]
                shadow-[var(--shadow-soft)] p-6">
```

---

## 8. Split-screen pagina's (login, register, etc.)

```tsx
// Buitenste wrapper — vult viewport min de Navbar
<div className="flex flex-col lg:flex-row"
     style={{ minHeight: 'calc(100vh - 64px)' }}>

  {/* Linker hero-paneel — alleen desktop */}
  <div className="hidden lg:block relative lg:w-[52%] xl:w-[55%] flex-shrink-0"
       style={{ minHeight: 'calc(100vh - 64px)' }}>

    {/* Foto via CSS background (betrouwbaarder dan <img> voor full-panel) */}
    <div className="absolute inset-0"
         style={{
           backgroundImage: 'url(/hero/hero-style-report-lg.webp)',
           backgroundSize: 'cover',
           backgroundPosition: 'center top',
         }} />

    {/* Gradient overlay */}
    <div className="absolute inset-0"
         style={{
           background: 'linear-gradient(160deg,
             rgba(20,20,28,0.22) 0%,
             rgba(20,20,28,0.05) 30%,
             rgba(20,20,28,0.60) 68%,
             rgba(20,20,28,0.88) 100%)',
         }} />

    {/* Inhoud — flex col justify-between voor top/bottom positionering */}
    <div className="relative z-10 flex flex-col justify-between h-full p-8 xl:p-12">
      <div>{/* eyebrow label */}</div>
      <div>{/* headline + quote + pills */}</div>
    </div>
  </div>

  {/* Rechter formulier-paneel */}
  <div className="flex-1 flex flex-col items-center justify-center
                  bg-[var(--color-bg)] px-4 sm:px-8 xl:px-16 py-10 lg:py-12">
    <div className="w-full max-w-[420px]">
      {/* formulier-inhoud */}
    </div>
  </div>

</div>
```

---

## 9. Glass-morphism (voor overlays op foto's)

```tsx
// Kaart op foto-achtergrond
style={{
  background: 'rgba(247,243,236,0.09)',
  border: '1px solid rgba(247,243,236,0.15)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
}}

// Badge/chip op foto
style={{
  background: 'rgba(166,136,106,0.25)',
  border: '1px solid rgba(247,243,236,0.20)',
  color: 'rgba(247,243,236,0.85)',
  backdropFilter: 'blur(8px)',
}}
```

---

## 10. Responsiviteit — volgorde van breakpoints

```
mobiel first (geen prefix) → sm:640px → md:768px → lg:1024px → xl:1280px
```

- `lg:hidden` = verberg op desktop
- `hidden lg:block` = alleen desktop
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Split-screen: altijd `flex-col lg:flex-row`

---

## 11. Foto-paden (bestaande assets)

```
/hero/hero-style-report-lg.webp   ← desktop hero (split-screen)
/hero/hero-style-report-md.webp   ← tablet
/hero/hero-style-report-sm.webp   ← mobiel
/hero/hero-style-report-xs.webp   ← klein mobiel
```

---

## 12. Verboden patronen

- Nooit `#` hex-waarden in `src/**` — altijd `var(--token)`
- Nooit `purple-*`, `indigo-*`, `violet-*` Tailwind-klassen
- Nooit een tweede `<Navbar>` of portaled header
- Nooit `min-h-screen` op een pagina-component (Navbar pakt al 64px)
- Nooit `node:path` of Node-only imports in client-code
- Nooit `DROP` of `DELETE` in migraties zonder expliciete vraag

---

## 13. Workflow voor elke UI-taak

1. **Lees** het bestaande bestand volledig voor je iets wijzigt
2. **Controleer** welke tokens/klassen al gebruikt worden in dat bestand
3. **Kijk** naar een vergelijkbare pagina die al goed werkt als referentie
4. **Wijs** de minste code toe — geen cleanup, geen extra features
5. **Bouw** altijd: `npm run build` moet schoon zijn voor je klaar bent

---

## 14. De referentie-pagina's (werken al goed)

| Pagina | Bestand | Wat het demonstreert |
|--------|---------|----------------------|
| Homepagina | `src/pages/LandingPage.tsx` | Hero, sections, CTA-hiërachie |
| Inloggen | `src/pages/LoginPage.tsx` | Split-screen, formulier, trust |
| Registreren | `src/pages/RegisterPage.tsx` | Split-screen, meerstaps |
| Dashboard | `src/pages/DashboardPage.tsx` | Authenticated layout, widgets |
| Pricing | `src/pages/PricingPage.tsx` | Kaart-grid, feature-vergelijking |
