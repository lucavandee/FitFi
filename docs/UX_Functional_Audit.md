# UX & Functioneel Audit — FitFi.ai (Niveau 10)

## 1. Inleiding
**Doel**: Volledig door­gronden van alle user flows en pijn­­punten vastleggen met prioriteit, om de website naar topniveau te brengen.

## 2. User Flows Overzicht
### 2.1 Onboarding
- **Startpunt**: Landingspagina → knop 'Start quiz'
- **Stap 1**: GenderSelectPage (man/vrouw/neutral)
- **Stap 2**: Verdere voorkeuren (stijl, budget, gelegenheid)
- **Eindpunt**: doorsturen naar QuizPage of Dashboard

### 2.2 Quiz
- **Component**: `<Quiz />`
- **Keuzes**: gender, stijl, kleuren, fit-voorkeur
- **Output**: antwoorden-object → `matchQuizAnswers()` → API-call

### 2.3 Profiel
- **Pagina**: `/profile`
- **Inhoud**: opgeslagen voorkeuren, favorieten, gebruikersinfo

### 2.4 Outfitvoorstellen
- **Pagina**: `/results`
- **Component**: `EnhancedResultsPage`
- **Inputs**: match-score, afbeelding, product-titel, link

### 2.5 Checkout
- **Pagina**: `/checkout`
- **Proces**: winkelwagen → betaalmethode → orderbevestiging