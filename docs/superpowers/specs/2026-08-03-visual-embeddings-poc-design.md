# Visual embeddings PoC: design

Datum: 2026-08-03 · Branch: `claude/engine-visual-embeddings` · Status: goedgekeurd op conceptniveau door Luc (no-touch contract expliciet opgeheven voor dit werk), designkeuzes vastgelegd door Claude conform trust-en-pace werkwijze.

## Doel

Bewijzen dat visuele beeld-embeddings van productfoto's de outfit-aanbevelingen van engine v2 meetbaar coherenter maken, zonder de bestaande golden feasibility baseline te breken. Plus twee bijvangsten: visuele near-duplicate detectie in de catalogus en een "meer zoals dit"-demonstratie.

## Context (verkend)

- Engine v2 (`src/engine/v2/`) scoort producten per dimensie (archetype, kleur, occasion, LLM-tags) en bouwt outfits via `composeOutfits` → `diversifyOutfits`. `compositionScore` bepaalt ranking en match-percentage.
- De bestaande "StyleEmbedding" is een archetype-gewichten-dictionary, geen visuele embedding. Dit werk is dus nieuw, geen duplicaat.
- Golden baseline: `haalbaarheid.test.ts`, floors per profiel × gelegenheid op de getagde catalogus-snapshot van 2026-06-11 (1000 producten, geen image-URLs in de fixture).
- pgvector-extensie staat al aan in Supabase (nova_memories). `products` heeft `image_url` en public read voor anon.
- De repo bevat geen catalogus met afbeeldingen; die moeten eenmalig uit de live `products`-tabel komen.

## Aanpak (gekozen uit drie opties)

Gekozen: **lokale FashionCLIP-embeddings + flag-gated coherentie-score in engine v2.**
Afgewezen: (a) hosted embedding-API's (vendor-rent, geen fashion-tuning, data de deur uit), (b) direct pgvector-integratie in de app (te veel oppervlak voor een PoC; volgt pas na bewezen waarde).

### Componenten

1. **`scripts/visual-embeddings/fetch-catalog.mjs`** (Node): haalt `id, name, brand, category, gender, image_url` uit de live products-tabel via REST (leest `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` of `SUPABASE_URL`/`SUPABASE_ANON_KEY` uit env of `.env`, waarden worden nooit gelogd). Schrijft `scripts/visual-embeddings/out/catalog-images.json`.
2. **`scripts/visual-embeddings/embed_products.py`** (Python, eigen venv): downloadt de afbeeldingen (met cache), berekent FashionCLIP-embeddings (`patrickjohncyh/fashion-clip`, CLIP ViT-B/32, 512-dim, L2-genormaliseerd), schrijft `out/product-embeddings.json` (`{id: number[512]}`). FashionCLIP is gekozen boven generieke CLIP omdat het op fashion-productdata is gefinetuned.
3. **`src/engine/v2/scoring/visualCoherence.ts`**: pure functies: `cosineSim`, `outfitVisualCoherence(candidate, embeddings)` (gemiddelde paarsgewijze cosine over producten mét embedding; `null` bij <2), `applyVisualCoherence(candidates, embeddings, weight)` (blend: `composition * (1-w) + visual01 * w`, en zet `candidate.visualCoherence` voor evaluatie).
4. **Engine-hook**: `EngineOptions.visualEmbeddings?: Record<string, number[]>` en `EngineOptions.visualWeight?: number` (default 0.15). In `runEngineV2` wordt `applyVisualCoherence` alléén aangeroepen als embeddings meegegeven zijn. Zonder flag is de output byte-voor-byte identiek aan vandaag.
5. **Eval**: `scripts/visual-embeddings/eval.ts` (tsx): draait de 6 golden profielen × 7 gelegenheden twee keer (flag uit/aan) op de fixture-catalogus + echte embeddings en rapporteert: (a) gemiddelde intra-outfit visuele coherentie voor/na, (b) golden floors gehaald ja/nee in beide standen, (c) top-20 near-duplicate paren (cosine > 0.97), (d) dekkingsgraad (percentage fixture-producten met embedding). Unit-tests met synthetische vectoren bewaken de wiskunde en de flag-uit-identiteit onafhankelijk van echte data.
6. **Demo**: `scripts/visual-embeddings/demo.mjs` genereert een statische HTML-grid ("meer zoals dit": 8 voorbeeldproducten met hun top-5 visuele buren, plus de duplicaat-paren) voor visuele beoordeling.

### Datastroom

`products (Supabase) → catalog-images.json → embed_products.py → product-embeddings.json → (eval.ts | demo.mjs | runEngineV2 met flag)`

### Succescriteria

- Golden floors blijven staan met flag aan (harde eis).
- Gemiddelde intra-outfit visuele coherentie stijgt aantoonbaar bij weight 0.15 (richtwaarde: +5% of meer; zo niet, dan is dat een eerlijk negatief resultaat en stopt het hier).
- Demo-grid toont subjectief zinnige buren (beoordeling Luc).

### Buiten scope (bewust)

Productie-integratie (pgvector-tabel, frontend, embedding-refresh bij feedimport), foto-naar-outfit upload-flow, virtual try-on. Volgt alleen na een positieve PoC-uitkomst.

## Bevindingen tijdens uitvoering (2026-08-04)

Drie dingen bleken anders dan de spec aannam:

1. **De live catalogus is veel groter dan gedacht: 85.000+ producten.** Een volledige uitlees loopt in een Postgres statement-timeout, zowel met offset- als met keyset-paginatie. Voor de PoC is daarom gericht opgehaald: (a) exact de 1000 ids uit de golden fixture (`--ids-from`), (b) een gespreide steekproef van 1675 producten via category- en gender-filters. Beide queries lopen wel binnen de timeout.
2. **De golden fixture is sterk scheef.** Van de 1000 producten zijn er 996 van Puma en 749 uit categorie footwear. Alle 1000 hebben een geldige `image_url`. Dit betekent dat de fixture prima werkt om te bewaken dat de golden floors niet breken, maar zwak is om visuele coherentie op te meten: de onderlinge visuele variatie is klein. Conclusies over coherentie-winst moeten met die beperking worden gelezen.
3. **De live catalogus is wél divers** (Adidas Originals, Acne Studios, Alberta Ferretti, Marc Jacobs, H&M, 7 For All Mankind). De diverse steekproef dient daarom als beoordelingsset voor "meer zoals dit" en duplicaat-detectie.

Verder is een niet-gerelateerd probleem zichtbaar geworden: **de golden baseline op `main` is niet deterministisch.** De engine seedt de compositie op kloktijd (`Date.now()` per 5 minuten), waardoor de haalbaarheidsmatrix afhankelijk van het moment van draaien wel of niet faalt (gemeten op `main`: 3 falende cellen). Daarom is `EngineOptions.seed` toegevoegd: optioneel, backwards-compatible, en gebruikt door de eval en de nieuwe tests. Het aanpassen van de floors zelf hoort in een aparte PR.

### Risico's

- Fixture (2026-06-11) vs. live catalogus kunnen uiteenlopen; dekkingsgraad onder ~70% maakt de engine-eval zwak. Eval rapporteert dekking expliciet.
- Torch-installatie op Python 3.14 kan schuren; fallback is een 3.12/3.13 venv.
- Pexels-placeholderfoto's (demo-feed) zeggen niets; de echte catalogusfoto's zijn vereist voor elke conclusie.
