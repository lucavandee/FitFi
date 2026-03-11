# FitFi Bolt Task Template

Use this format for every UI task. Fill in each section before and after execution.

---

## Template

```
MODE: [INSPECT | COMPLIANCE | PATCH]

---

1. DOEL
[Wat moet er worden opgeleverd? Welk visueel of functioneel probleem wordt opgelost?]

---

2. COVERAGE
Bestanden die worden aangepast:
- src/...

Bestanden die NIET worden aangepast:
- [alles buiten scope]

---

3. COMPLIANCE
Huidige staat:
- [Wat is correct / compliant?]
- [Wat wijkt af van de regels?]

Veilig te patchen:
- [Wat kan zonder risico worden aangepast?]

---

4. PATCH PLAN
Stap 1: [Bestand X — beschrijf wijziging]
Stap 2: [Bestand Y — beschrijf wijziging]

---

5. UITGEVOERDE WIJZIGINGEN
- [pad/bestand.tsx]: [wat is er gewijzigd]
- [pad/bestand.tsx]: [wat is er gewijzigd]

---

6. ACCEPTANCE CHECK
- [ ] Visueel doel bereikt
- [ ] Tokens-compliant (geen hex/rgb in src/**)
- [ ] 1 Navbar in DOM
- [ ] Geen Node-only imports
- [ ] Build groen
- [ ] Geen logische regressie
- [ ] Geen second navbar geintroduceerd
- [ ] Touch targets >= 44px (w-11 h-11 minimum)
- [ ] Focus-visible states aanwezig op alle interactieve elementen

---

7. RISICO'S
- [Beschrijf eventuele edge cases of risico's]

---

8. BUILD RESULTAAT
[Paste build output here — OK / errors]
```

---

## Stop Conditions

Stop en rapporteer in plaats van te bouwen als:

- Scope is onduidelijk
- Niet duidelijk is welk component verantwoordelijk is
- De wijziging meerdere flows tegelijk raakt
- Er risico is op functionele regressie
- De taak eigenlijk een redesign buiten scope vraagt

---

## Hard Rules (controleer altijd)

| Regel | Controle |
|---|---|
| Tokens-only | Geen hex/rgb/hsl in `src/**` |
| 1 Navbar | Controleer DOM op dubbele nav |
| Geen Node-only imports | `node:path`, `fs`, etc. alleen in vite.config |
| Geen business logic aanpassen | Tenzij expliciet gevraagd |
| Geen routing aanpassen | Tenzij expliciet gevraagd |
| Geen providers aanpassen | Tenzij expliciet gevraagd |
| Geen analytics aanpassen | Tenzij expliciet gevraagd |
| Mobile-first | Responsive breakpoints altijd aanwezig |
| WCAG AA | Contrast ratio > 4.5:1 voor body tekst |

---

## Mode Definitions

### MODE 1 — INSPECT
- Lees relevante bestanden
- Bepaal componentgrenzen
- Identificeer handlers/logica die onaangeraakt blijven
- Geen wijzigingen

### MODE 2 — COMPLIANCE
- Vergelijk met de regels in `fitfi-product-page-rules.md` en `fitfi-ui-reference.md`
- Benoem wat compliant is
- Benoem wat afwijkt
- Benoem wat veilig visueel aangepast kan worden
- Geen wijzigingen

### MODE 3 — PATCH
- Implementeer alleen de afgesproken scope
- Geen logica wijzigen tenzij expliciet gevraagd
- Benoem vooraf welke bestanden worden aangepast
- Benoem welke componenten puur visueel zijn
- Benoem welke logica onaangeraakt blijft

---

## UI Primitives Available

Import from `src/components/ui/primitives/`:

| Primitive | Use case |
|---|---|
| `PrimaryButton` | Filled CTA, primary action |
| `SecondaryButton` | Outline / ghost CTA, secondary action |
| `IconButton` | Icon-only round button, tertiary action |
| `SurfaceCard` | Standard product page card shell |
| `ProductSectionHeader` | Section title with optional subtitle and actions slot |
| `MetaInlineRow` | Compact metadata row with pills and separators |
| `BadgePill` | Small supporting status/label pill |
