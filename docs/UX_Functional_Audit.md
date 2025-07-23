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

## 3. Probleemlocaties & Pain Points
| Flow        | Pijnpunt                            | Impact             | Urgentie   |
|-------------|-------------------------------------|--------------------|------------|
| Quiz        | Man kiest → vrouwenproducten        | Zeer verwarrend    | Must-have  |
| Profiel     | Profielgegevens niet persistent     | Slechte UX         | Must-have  |
| Outfits     | Foutieve afbeelding ↔ product-titel  | Onbetrouwbaar      | Must-have  |
| Checkout    | Geen foutafhandeling bij betaaldata | Verlies omzet      | Must-have  |
| UI Algemeen | Inconsistente styling, oude icons   | Lage merkbeleving  | Nice-to-have |

## 4. Herziene User Stories
1. Als man wil ik uitsluitend mannenkleding zien in de quiz-resultaten, zodat ik me serieus genomen voel.  
2. Als gebruiker wil ik feedback krijgen als ik verplichte velden niet invul, zodat ik niet vastloop.  
3. Als shopper wil ik zien dat afbeelding en titel altijd overeenkomen, zodat ik vertrouwen heb in de suggesties.  
4. Als gebruiker wil dat mijn profielvoorkeuren persistent zijn na refresh, zodat ik niet opnieuw hoef in te vullen.

## 5. Backlog & Prioritering
| #  | User Story                             | Impact                 | Complexiteit | Prioriteit              |
|----|-----------------------------------------|------------------------|--------------|-------------------------|
| 1  | Quiz gender → juiste productmap         | Hoog (conversie)       | Medium       | Sprint 1 (Must-have)    |
| 2  | Foutafhandeling verplichte velden       | Medium (UX)            | Laag         | Sprint 1 (Must-have)    |
| 3  | Sync outfit image ↔ titel               | Hoog (betrouwbaarheid) | Medium       | Sprint 2 (Must-have)    |
| 4  | Profiel persistent state                | Medium                 | Medium       | Sprint 3 (Must-have)    |
| 5  | Checkout error handling                 | Hoog (omzet)           | Medium       | Sprint 3 (Must-have)    |
| 6  | UI/Visual refresh (icons, spacing, kleurgebruik) | Brand & omzetverbetering | Medium | Sprint 3 (Nice-to-have)|

## 6. Volgende Stappen
1. Screenshots toevoegen aan sectie 3 met echte mockups uit de flows.  
2. Flow-validatie: doorloop sectie 2 en bevestig of alle stappen kloppen.  
3. Kickoff Sprint 1: plan de taken voor quiz-gender fixes & UX-flows.