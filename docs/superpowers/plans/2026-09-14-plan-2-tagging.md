# Tagging uitvoeringsplan

> **Voor agentische uitvoerders:** VEREISTE SUB-SKILL: gebruik superpowers:subagent-driven-development of superpowers:executing-plans om dit plan taak voor taak uit te voeren. Stappen gebruiken checkbox-syntax (`- [ ]`).

**Doel:** elk canoniek product in `product_attributes` krijgt de tags uit spec 5.1 (via de Anthropic Batch API met Haiku 4.5), een FashionCLIP-embedding, en de keten krijgt een feed-poort, een dekkingsmatrix en een wekelijkse feed-import met doorlopende linkcontrole.

**Architectuur:** de tabel `products` blijft de ruwe feed; alles wat afgeleid is staat in `product_attributes` (plan 1 maakte die tabel met dedupe en de ruwe velden, dit plan voegt de tag-kolommen toe). Twee lokale scripts vullen de tags (`scripts/keten/tag-products.ts`, Batch API) en de embeddings (`scripts/keten/embed-products.py`, FashionCLIP op de Mac); SQL-functies met `security definer` doen het schrijven zodat de scripts alleen RPC's aanroepen. `pg_cron` roept wekelijks de bestaande edge function `import-daisycon-feed` aan, daarna een vulfunctie die alleen nieuwe producten een rij geeft en bestaande tags met rust laat, en elke tien minuten `validate-product-links`.

**Stack:** Vite + React 18 + TypeScript, Tailwind 3.4, Supabase (Postgres, RLS, edge functions in Deno), vitest, vite-node voor scripts, Netlify.

**Spec:** docs/superpowers/specs/2026-09-14-keten-herbouw-design.md

## Globale randvoorwaarden

- Elke taak eindigt groen op `npx tsc --noEmit`, `npx vitest run`, `npx vite build` en `npm run design:check:ci` (spec 8). De scripts in `scripts/` vallen buiten `tsconfig.json` (`include: ["src"]`), dus hun tests zijn de poort voor die code. Voor `design:check:ci` geldt dezelfde afspraak als in plan 1: het getal achter `Total Violations` stijgt door jouw taak niet (dit plan bevat geen UI, dus het blijft gelijk).
- Geen sleutels in de repo. `ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` en `SUPABASE_URL` komen uit de omgeving of uit een lokale `.env` (staat in `.gitignore`). Scripts loggen nooit een sleutelwaarde, alleen de naam van een ontbrekende variabele.
- De `products`-tabel krijgt geen nieuwe kolommen (spec 4). Alles wat afgeleid is gaat naar `product_attributes`. Twee uitzonderingen, bewust en alleen hier: een index op `products (retailer)` (taak 2, geen data) en `in_stock = false` voor producten die uit een feed verdwenen zijn (taak 12; spec 9 legt "cron voor feed en voorraad" bij dit plan, en `in_stock` is feed-data die de import zelf ook schrijft).
- Migraties worden toegepast met `supabase db query --linked -f <bestand>` (Supabase CLI 2.90.0 op `/opt/homebrew/bin/supabase`, gekoppeld via `supabase/.temp/linked-project.json`). Nooit `supabase db push`: er staat geen psql op deze machine, en de migratiehistorie van dit project is niet in de remote geregistreerd, dus `db push` zou alle oude migraties opnieuw willen draaien (plan 1, regel 25). Controle-queries gaan met `supabase db query --linked "<sql>" -o table`. De Management API heeft een tijdslimiet per query; zware aanroepen doe je per retailer, en als dat niet genoeg is via een eenmalige pg_cron-job (zie taak 6, stap "Uitwijk bij een tijdslimiet").
- Tagging is idempotent: een rij met dezelfde `tagger_version` wordt overgeslagen (spec 5.1). De tweede ronde met foto draait alleen op `confidence < 0.6`.
- `vul_product_attributes()` uit plan 1 draai je na taak 5 nooit meer: die functie overschrijft bij elke run `canonical_id`, `gender` en `price_band` uit de ruwe velden (en `is_fashion` en `category` voor rijen zonder `classifier_version`), en draait daarmee de LLM-tags op `gender` en `is_fashion` en de embedding-dedupe op `canonical_id` terug zonder dat `tagger_version` verandert. Sinds migratie `20260914120400` (plan 1 taak 3, tijdens uitvoering toegevoegd op ruling van de controller) ververst diezelfde functie ook `price`, `in_stock` en `retailer` op elke run, omdat `get_kandidaten` anders via een dure join naar `products` liep en vastliep op de 8 seconden statement-timeout van de browser-route (zie de aannametabel hieronder). Dat ververswerk verdwijnt niet: `keten_vul_nieuwe_producten()` (taak 12) neemt het over, voor elke rij van de retailer, canoniek of niet, zonder `canonical_id` aan te raken (onderbouwing bij "Wat de spec openlaat" hieronder). Nieuwe producten krijgen hun rij via diezelfde `keten_vul_nieuwe_producten()`, die alleen invoegt wat nog geen rij heeft.
- `category` heeft in deze codebase een eigenaar: de productclassifier uit plan 1 (`zet_classificatie`, `classifier_version`). Plan 1's harnas telt afwijkingen tussen de client-classifier en `product_attributes.category` en gaat rood zodra die groter dan nul is (stopregel 2). De tagger geeft `category` terug (spec 5.1, strikt schema) maar `keten_schrijf_tags` schrijft hem niet weg; hij dient om `shoe_type` te valideren en om `is_fashion` te verlagen. Alleen geclassificeerde rijen (`classifier_version is not null`) worden getagd. Wie na een feed-import nieuwe producten wil taggen, draait eerst `npm run keten:classificeer -- --retailer "<naam>"` (plan 1 taak 2) en dan `npm run keten:tag -- --ja`.
- De retailer-naam is de letterlijke waarde van `products.retailer` (dat is de programmanaam uit de Daisycon-feed, zie `import-daisycon-feed/index.ts` regel 427). Hij staat op een plek: `scripts/keten/retailers.ts` (taak 1). Elke RPC met een `p_retailer`-parameter controleert de naam en geeft een fout bij een onbekende waarde, zodat een typefout nooit stilzwijgend nul rijen oplevert.
- Het tagschema is exact spec 5.1: waarden in het Nederlands waar de spec dat zegt (`warm`, `koel`, `neutraal`, `licht`, `medium`, `donker`, `effen`, `subtiel`, `statement`, kleuren en materialen genormaliseerd), gelegenheden in het Engels (`work`, `casual`, `formal`, `date`, `travel`, `sport`, `party`).
- Migraties heten `supabase/migrations/YYYYMMDDHHMMSS_naam.sql` en beginnen met een commentaarblok (probleem, wat de migratie doet, terugdraaien). RPC's die alleen de service role of pg_cron aanroept zijn `security definer set search_path = public, extensions` met `revoke ... from public, anon, authenticated`. De publieke `get_kandidaten` blijft `security invoker` zoals in plan 1 (repo-conventie sinds 20260317120000).
- Tests op migraties zijn tweeledig: `migraties.test.ts` bewaakt het contract van de bestandsinhoud (kolomnamen, functienamen, policies) en draait offline; `migraties.live.test.ts` bewijst gedrag tegen de gekoppelde database en wordt overgeslagen zonder omgevingsvariabelen. De tekst-test alleen is geen bewijs dat SQL werkt; de live test en de controle-queries per taak zijn dat wel.
- Edge functions gebruiken `buildCorsHeaders(req)` uit `supabase/functions/_shared/cors.ts`; nooit een wildcard-origin.
- Engine v2 wordt niet aangepast (spec 7). `src/engine/v2/scoring/llmTags.ts` leest nog `occ:`- en `formality:`-tags uit `products.tags`; de kolommen uit dit plan vervangen die bron in plan 3, niet hier.
- UI-werk komt in dit plan niet voor. Mocht een taak toch een component nodig hebben: design system v1.0 uit CLAUDE.md (kleuren als `text-[#1A1A1A]`, `rounded-xl` voor knoppen, `rounded-2xl` voor cards, alleen `hover:shadow-md`), Nederlandse copy met je/jij, vaste CTA-teksten, geen nieuwe kleuren.
- Commits in het Nederlands, een commit per taak, op de branch `feat/keten-herbouw` (dezelfde als plan 1), geen em-dashes in code, commentaar of commitboodschappen.

## Aannames over plan 1

Dit plan bouwt op `docs/superpowers/plans/2026-09-14-plan-1-fundament.md`. Controleer bij de start dat plan 1 dit heeft opgeleverd.

| Wat | Verwacht | Controle |
|---|---|---|
| Tabel `product_attributes` | kolommen `product_id uuid pk`, `canonical_id uuid not null`, `is_fashion boolean`, `category text`, `gender text`, `price_band text`, `classifier_version text`, `embedding extensions.vector(512)`, `tagged_at timestamptz`; RLS aan, lezen voor iedereen, schrijven alleen service role | `grep -l "product_attributes" supabase/migrations/*.sql` geeft `20260914120000_product_attributes_fundament.sql` (staat al in de werkmap, nog niet gecommit op 2026-09-16) |
| Functie `normaliseer_productnaam(text)` | `immutable strict`, haalt maat- en kleursuffix van een productnaam | `grep -n "function normaliseer_productnaam" supabase/migrations/*.sql` |
| Vulfunctie `vul_product_attributes(p_retailer text, p_merk_van text, p_merk_tot text)` | vult en overschrijft de ruwe velden (`on conflict do update`); ververst sinds migratie `20260914120400` ook `price`, `in_stock` en `retailer` op elke run; wordt in dit plan niet meer aangeroepen, `keten_vul_nieuwe_producten()` (taak 12) neemt het verversen van die drie kolommen over | `grep -n "function vul_product_attributes" supabase/migrations/*.sql` |
| Kolommen `price`, `in_stock`, `retailer` op `product_attributes` | tijdens plan 1 taak 3 toegevoegd op ruling van de controller: `get_kandidaten` liep via een join naar `products` vast op de 8 seconden statement-timeout van de browser-route (56,5s pure uitvoertijd voor ~39.000 losse heap-fetches, gemeten met EXPLAIN ANALYZE); `vul_product_attributes()` ververste de drie kolommen sindsdien bij elke run en `get_kandidaten` filtert sindsdien op deze kolommen in plaats van op een join naar `products` | `grep -n "add column if not exists price" supabase/migrations/20260914120400_keten_kandidaten_kolommen.sql`; `grep -l "pa.in_stock" supabase/migrations/20260914120500_get_kandidaten_op_attributes.sql` |
| Classifier `zet_classificatie(jsonb, text)` en script `npm run keten:classificeer -- --retailer "<naam>"` | zet `category`, `is_fashion` en `classifier_version` per rij; H&M is na plan 1 volledig geclassificeerd | `grep -n "function zet_classificatie" supabase/migrations/*.sql`; `grep -n "keten:classificeer" package.json` |
| RPC `get_kandidaten` | signatuur uit spec 5.3 met acht parameters, `security invoker`, zonder tags in de score, `attrs` bevat `classifier_version` | `grep -n "function get_kandidaten" supabase/migrations/*.sql` |
| Harnas `scripts/keten/persona-run.ts` (plan 1 taak 11) | vite-node-script dat exit code 0 geeft als de vier persona's slagen; haalt kandidaten op met `client.rpc("get_kandidaten", params)` waarbij `params` van het type `KandidatenParams` is (acht vaste velden); telt categorie-afwijkingen met `telCategorieAfwijkingen` en is rood als dat getal groter dan nul is | `grep -n 'rpc("get_kandidaten"' scripts/keten/persona-run.ts` geeft precies een regel |
| Supabase CLI gekoppeld | `supabase/.temp/linked-project.json` bestaat | `supabase migration list --linked` toont per bestand de kolommen Local en Remote. Gemeten 2026-09-16: 171 bestanden in beide kolommen, 41 alleen lokaal (waaronder `20260418120000`, `20260804203000` en de plan 1-bestanden), 17 alleen remote. Die 41 zou `db push` opnieuw willen draaien; dat is de reden dat dit plan het nooit gebruikt |

Ontbreekt iets, dan voer je eerst de betreffende taak van plan 1 uit. Dit plan vult niets van plan 1 stilzwijgend in.

## Wat de spec openlaat en hier is besloten

- Dedupe op embedding (spec 5.1, "cosine >= 0.999") wordt beperkt tot dezelfde retailer, omdat de feed-poort en de affiliate-links per retailer werken: een product van retailer A mag nooit verdwijnen achter een canoniek product van retailer B. Geen beperking op gender of category: die komen uit de tagger en een tagfout zou een terechte match blokkeren. Wel een placeholder-beveiliging: een `image_url` die tien of meer producten delen is een "geen afbeelding"-plaatje, en die embeddings doen niet mee (taak 8).
- Linkcontrole: `validate-product-links` doet maximaal 200 producten per aanroep (constante in die functie). Een keer per dag zou de catalogus van circa 287.000 producten pas in vier jaar rondkomen. De job draait daarom elke tien minuten: 144 x 200 = 28.800 controles per dag, de hele catalogus in ongeveer tien dagen. Dat is een rollende steekproef, geen garantie dat een link vandaag gecontroleerd is (taak 12).
- De vulstap na de wekelijkse import draait niet blind twee uur na de import, maar controleert eerst per actieve campagne of de laatste import `status = 'success'` heeft en jonger dan twaalf uur is. Zo niet, dan wacht hij en probeert het een uur later opnieuw (job loopt elk uur tussen 05:00 en 11:00 UTC op zondag). Elke run schrijft een regel in `keten_cron_log` (taak 12).
- Producten die uit een feed verdwenen zijn (wel `campaign_id`, niet bijgewerkt in de laatste geslaagde import) krijgen `in_stock = false` (taak 12).
- `category` blijft van de classifier uit plan 1. Spec 5.1 laat de tagger `category` teruggeven, maar plan 1 heeft de categorie al in de database gecorrigeerd en meet in het harnas of de client-classifier het daarmee eens is (stopregel 2). Zou de tagger `category` overschrijven, dan gaat elke feed-poort rood op afwijkingen die niets met de feed te maken hebben. `keten_schrijf_tags` schrijft daarom alle tags behalve `category`, en `is_fashion` kan alleen van waar naar onwaar (taak 2).
- `get_kandidaten` geeft alleen getagde rijen terug (`tagger_version is not null`). Spec 5.3 noemt dat filter niet, maar de score bestaat voor 0.8 uit tags; een ongetagde rij kan niet gescoord worden en zou een lege plek in een outfit vullen met een product waar niets over bekend is. Gevolg: een retailer die nog niet getagd is, komt niet in kandidaten voor, wat spoort met "een feed telt pas mee na de poort" (spec 3 en 5.7). Nieuwe producten uit de wekelijkse import zijn onzichtbaar tot de eerstvolgende classificeer- en tag-run (taak 7 en 12).
- Na elke feed-import moeten `price`, `in_stock` en `retailer` op `product_attributes` weer gelijk zijn aan `products`: die drie kolommen zijn tijdens plan 1 taak 3 gedenormaliseerd (migratie `20260914120400`, controller-ruling) en werden tot dan toe door `vul_product_attributes()` ververst. Dit plan verbiedt die functie vanaf taak 5 (Globale randvoorwaarden), dus `keten_vul_nieuwe_producten()` (taak 12) neemt het ververswerk over: `price`, `in_stock`, `retailer` en `price_band` worden voor elke rij van de retailer bijgewerkt, canoniek of niet, ongeacht `classifier_version` of `tagger_version`. Bewust gekozen: alleen deze vier kolommen verversen, niet de volledige `vul_product_attributes()` opnieuw draaien. Die functie herberekent `canonical_id` voor de hele retailer bij elke run (`first_value() over (partition by retailer, image_url ...)`); een nieuw, goedkoper product in een bestaande fotogroep zou dan zonder aankondiging de canonieke rij van een al getagde groep verplaatsen naar een ongetagde rij, en `get_kandidaten` zou die hele groep tijdelijk verliezen totdat de nieuwe rij ook geclassificeerd en getagd is. Met alleen verversen blijft `canonical_id` ongemoeid: een nieuw, goedkoper product in een bestaande fotogroep wordt, net als `keten_vul_nieuwe_producten()` al deed voor nieuwe rijen, een niet-canonieke rij totdat een bewuste her-dedupe (`keten_dedupe_embedding`, taak 8) of een nieuwe classificeer/tag-ronde de rangorde binnen die groep herbepaalt. Gevolg: de kandidatenpool verschuift nooit stilletjes door een feed-import, maar een nieuw goedkoper product wordt ook niet vanzelf zichtbaar als canoniek totdat iemand de dedupe bewust opnieuw draait.

## Bestandsstructuur

Aanmaken:

| Bestand | Verantwoordelijkheid |
|---|---|
| `scripts/keten/.gitignore` | `.batches.json` en `out/` buiten git houden |
| `scripts/keten/env.ts` | omgevingsvariabelen lezen (`.env` of proces), nooit loggen |
| `scripts/keten/args.ts` | `--vlag waarde` parsen |
| `scripts/keten/retailers.ts` | de ene plek met de letterlijke retailer-naam uit `products.retailer` |
| `scripts/keten/tagging.ts` | tagschema (JSON Schema voor structured output), prompts, verzoek bouwen, uitvoer valideren, kosten schatten, batchresultaten verwerken; geen netwerk |
| `scripts/keten/batchesStore.ts` | `.batches.json` lezen, schrijven, open batches vinden |
| `scripts/keten/tag-products.ts` | CLI: kandidaten ophalen, batch versturen, pollen, schrijven; modus `--met-foto` |
| `scripts/keten/embed-products.py` | FashionCLIP-embeddings voor canonieke producten naar `product_attributes.embedding` |
| `scripts/keten/poort.ts` | pure functies voor de feed-poort: lege cellen in de matrix, groen-besluit |
| `scripts/keten/feed-poort.ts` | CLI: persona-run voor een retailer, dekkingsmatrix, schrijft `feed_gates` |
| `scripts/keten/__tests__/env.test.ts` | tests voor `env.ts` |
| `scripts/keten/__tests__/args.test.ts` | tests voor `args.ts` |
| `scripts/keten/__tests__/tagging.test.ts` | tests voor `tagging.ts` |
| `scripts/keten/__tests__/batchesStore.test.ts` | tests voor `batchesStore.ts` |
| `scripts/keten/__tests__/poort.test.ts` | tests voor `poort.ts` |
| `scripts/keten/__tests__/migraties.test.ts` | bewaakt het contract in de migratiebestanden (kolommen, indexen, functies, policies, cron-jobs); offline |
| `scripts/keten/__tests__/migraties.live.test.ts` | gedragstest van de RPC's en RLS tegen de gekoppelde database; overgeslagen zonder omgevingsvariabelen |
| `scripts/keten/__tests__/test_embed_products.py` | unittest voor de pure helpers in `embed-products.py` |
| `supabase/migrations/20260916100000_keten_tag_kolommen.sql` | tag-kolommen, indexen uit spec 5.1 (behalve ivfflat), index op `products (retailer)`, `keten_controleer_retailer`, RPC's `keten_tag_kandidaten` en `keten_schrijf_tags`, pg_cron aan |
| `supabase/migrations/20260916100100_keten_embedding_rpcs.sql` | RPC's `keten_embed_kandidaten` en `keten_schrijf_embeddings` |
| `supabase/migrations/20260916100200_keten_get_kandidaten_score.sql` | `get_kandidaten` met de volledige score uit spec 5.3 plus `p_retailer`, `security invoker` |
| `supabase/migrations/20260916100300_keten_dedupe_embedding.sql` | ivfflat-index (na de embed-run, zodat de lijsten op echte data trainen), RPC `keten_dedupe_embedding` (cosine >= 0.999) |
| `supabase/migrations/20260916100400_keten_feed_gates.sql` | tabel `feed_gates` (lezen via `is_current_user_admin()`), RPC `keten_dekkingsmatrix` |
| `supabase/migrations/20260916100500_keten_cron.sql` | pg_net, `keten_cron_log`, `keten_roep_edge`, `keten_wekelijkse_import`, `keten_vul_nieuwe_producten`, `keten_vul_na_import`, drie cron-jobs |

Wijzigen:

| Bestand | Wat |
|---|---|
| `package.json` (regels 28-29, 31-46) | npm-scripts `keten:tag` en `keten:poort`; dependency `@anthropic-ai/sdk` |
| `.gitignore` (na regel 187) | uitzondering op `*.py` voor `scripts/keten` |
| `scripts/visual-embeddings/embed_products.py` (regels 58-65 en 76-93) | modelladen en embedden naar herbruikbare functies `laad_model` en `embed_afbeeldingen` |
| `scripts/keten/persona-run.ts` (uit plan 1 taak 11; de regel `const { data, error } = await client.rpc("get_kandidaten", params);` in `haalKandidaten`) | vlag `--retailer` doorgeven als `p_retailer` |
| `supabase/functions/import-daisycon-feed/index.ts` (regels 495-527, 565) | `corsHeaders` echt aanmaken (staat nu nergens gedefinieerd), service-role-aanroep door pg_cron toestaan |

---

### Taak 1: Retailer-naam en scripts-fundament (SDK, env, args, retailers, npm-scripts)

**Bestanden:**
- Aanmaken: `scripts/keten/.gitignore`, `scripts/keten/env.ts`, `scripts/keten/args.ts`, `scripts/keten/retailers.ts`
- Wijzigen: `package.json` regels 28-29 (npm-scripts) en 31-46 (dependency)
- Test: `scripts/keten/__tests__/env.test.ts`, `scripts/keten/__tests__/args.test.ts`

**Interfaces:**
- Levert:
  - `STANDAARD_RETAILER: string` (letterlijke waarde van `products.retailer` voor H&M)
  - `parseDotEnv(tekst: string): Record<string, string>`
  - `leesDotEnv(pad?: string): Record<string, string>`
  - `leesEnv(bron?: Record<string, string | undefined>, opties?: { anthropic?: boolean }): { SUPABASE_URL: string; SUPABASE_SERVICE_ROLE_KEY: string; ANTHROPIC_API_KEY?: string }` (gooit `Error` met alleen de namen van wat ontbreekt)
  - `leesVlag(argv: string[], naam: string): string | undefined` en `heeftVlag(argv: string[], naam: string): boolean`

- [ ] Controleer de CLI-koppeling en de migratiehistorie:

```bash
supabase migration list --linked
```

Verwacht: een tabel met de kolommen Local en Remote; `20260914120000`, `20260914120100` en `20260914120200` staan onder Local en niet onder Remote, net als circa veertig oudere bestanden (op 2026-09-16 gemeten: 41 alleen lokaal, 17 alleen remote, 171 in beide). Staan de plan 1-bestanden wel onder Remote, dan is plan 1 met een ander mechanisme toegepast dan dit plan verwacht; lees dan plan 1 regel 25 opnieuw en gebruik in dit plan toch overal `supabase db query --linked -f`, want dat werkt in beide gevallen. Gebruik nergens `supabase db push`: zolang er bestanden alleen lokaal staan, wil `db push` die allemaal opnieuw tegen productie draaien.

- [ ] Zoek de exacte retailer-naam op. Dit is de programmanaam uit de Daisycon-feed en kan afwijken van wat op de site staat:

```bash
supabase db query --linked "select retailer, count(*) as producten from products group by 1 order by 2 desc limit 15" -o table
```

Noteer de waarde van de H&M-rij letterlijk (hoofdletters, spaties, haakjes). In de rest van dit plan staat `H&M (NL)`; wijkt de werkelijke waarde af, dan vervang je hem in `scripts/keten/retailers.ts` (volgende stappen) en in elk `--retailer`- en `p_retailer`-voorbeeld. Vanaf taak 2 geeft elke RPC een fout bij een naam die niet in `products.retailer` voorkomt, dus een typefout valt direct op.

- [ ] Installeer de SDK: `npm install @anthropic-ai/sdk@latest`. Controleer dat `package.json` onder `dependencies` nu `"@anthropic-ai/sdk"` bevat en dat `package-lock.json` is bijgewerkt.
- [ ] Voeg npm-scripts toe. Vervang in `package.json` regels 28-29:

```json
    "design:check:ci": "node scripts/check-design-compliance.mjs --strict",
    "start": "vite"
```

door:

```json
    "design:check:ci": "node scripts/check-design-compliance.mjs --strict",
    "keten:tag": "vite-node scripts/keten/tag-products.ts",
    "keten:poort": "vite-node scripts/keten/feed-poort.ts",
    "start": "vite"
```

- [ ] Maak `scripts/keten/.gitignore`:

```
# Batch-id's van lopende tag-runs en lokale uitvoer. Machinestaat, geen broncode.
.batches.json
out/
```

- [ ] Schrijf de falende tests. Maak `scripts/keten/__tests__/env.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { leesEnv, parseDotEnv } from "../env";

describe("parseDotEnv", () => {
  it("leest KEY=waarde, met en zonder aanhalingstekens, en slaat commentaar over", () => {
    const uit = parseDotEnv(`# commentaar\nSUPABASE_URL="https://x.supabase.co"\nFOO=bar\n\nlower=nee\n`);
    expect(uit).toEqual({ SUPABASE_URL: "https://x.supabase.co", FOO: "bar" });
  });
});

describe("leesEnv", () => {
  it("geeft de drie sleutels terug en valt terug op VITE_SUPABASE_URL", () => {
    const uit = leesEnv({
      VITE_SUPABASE_URL: "https://x.supabase.co",
      SUPABASE_SERVICE_ROLE_KEY: "sleutel",
      ANTHROPIC_API_KEY: "sk-ant",
    });
    expect(uit.SUPABASE_URL).toBe("https://x.supabase.co");
    expect(uit.SUPABASE_SERVICE_ROLE_KEY).toBe("sleutel");
    expect(uit.ANTHROPIC_API_KEY).toBe("sk-ant");
  });

  it("noemt alleen de namen van wat ontbreekt, nooit waarden", () => {
    expect(() => leesEnv({ SUPABASE_URL: "https://x.supabase.co" })).toThrow(
      "Ontbrekende omgevingsvariabelen: SUPABASE_SERVICE_ROLE_KEY"
    );
  });

  it("laat ANTHROPIC_API_KEY optioneel als je dat vraagt", () => {
    const uit = leesEnv({ SUPABASE_URL: "u", SUPABASE_SERVICE_ROLE_KEY: "k" }, { anthropic: false });
    expect(uit.ANTHROPIC_API_KEY).toBeUndefined();
  });
});
```

Maak `scripts/keten/__tests__/args.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { heeftVlag, leesVlag } from "../args";
import { STANDAARD_RETAILER } from "../retailers";

describe("leesVlag", () => {
  it("geeft de waarde na de vlag", () => {
    expect(leesVlag(["--retailer", "H&M (NL)", "--limit", "5"], "retailer")).toBe("H&M (NL)");
    expect(leesVlag(["--retailer", "H&M (NL)", "--limit", "5"], "limit")).toBe("5");
  });

  it("geeft undefined als de vlag ontbreekt en een lege string als hij geen waarde heeft", () => {
    expect(leesVlag(["--ja"], "retailer")).toBeUndefined();
    expect(leesVlag(["--retailer", "--ja"], "retailer")).toBe("");
  });
});

describe("heeftVlag", () => {
  it("herkent een losse vlag", () => {
    expect(heeftVlag(["--met-foto", "--ja"], "met-foto")).toBe(true);
    expect(heeftVlag(["--ja"], "met-foto")).toBe(false);
  });
});

describe("STANDAARD_RETAILER", () => {
  it("is een niet-lege naam zonder witruimte aan de randen", () => {
    expect(STANDAARD_RETAILER.length).toBeGreaterThan(0);
    expect(STANDAARD_RETAILER).toBe(STANDAARD_RETAILER.trim());
  });
});
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/env.test.ts scripts/keten/__tests__/args.test.ts` en zie beide falen met `Failed to resolve import "../env"` respectievelijk `"../args"`.
- [ ] Maak `scripts/keten/env.ts`:

```ts
/**
 * Omgevingsvariabelen voor de keten-scripts. Leest de repo-root .env (staat in
 * .gitignore) en het proces. Waarden worden nooit gelogd; een foutmelding
 * noemt alleen de naam van wat ontbreekt.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export function parseDotEnv(tekst: string): Record<string, string> {
  const uit: Record<string, string> = {};
  for (const regel of tekst.split("\n")) {
    const m = regel.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m) uit[m[1]] = m[2];
  }
  return uit;
}

export function leesDotEnv(pad: string = join(root, ".env")): Record<string, string> {
  if (!existsSync(pad)) return {};
  return parseDotEnv(readFileSync(pad, "utf8"));
}

export interface KetenEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ANTHROPIC_API_KEY?: string;
}

export function leesEnv(
  bron: Record<string, string | undefined> = { ...leesDotEnv(), ...process.env },
  opties: { anthropic?: boolean } = { anthropic: true }
): KetenEnv {
  const url = bron.SUPABASE_URL ?? bron.VITE_SUPABASE_URL;
  const serviceKey = bron.SUPABASE_SERVICE_ROLE_KEY;
  const anthropicKey = bron.ANTHROPIC_API_KEY;

  const ontbreekt: string[] = [];
  if (!url) ontbreekt.push("SUPABASE_URL");
  if (!serviceKey) ontbreekt.push("SUPABASE_SERVICE_ROLE_KEY");
  if (opties.anthropic !== false && !anthropicKey) ontbreekt.push("ANTHROPIC_API_KEY");
  if (ontbreekt.length > 0) {
    throw new Error(`Ontbrekende omgevingsvariabelen: ${ontbreekt.join(", ")}`);
  }

  return {
    SUPABASE_URL: url!.replace(/\/$/, ""),
    SUPABASE_SERVICE_ROLE_KEY: serviceKey!,
    ANTHROPIC_API_KEY: anthropicKey,
  };
}
```

- [ ] Maak `scripts/keten/args.ts`:

```ts
/** Minimale parser voor `--naam waarde` en losse `--vlag` argumenten. */
export function leesVlag(argv: string[], naam: string): string | undefined {
  const i = argv.indexOf(`--${naam}`);
  if (i === -1) return undefined;
  const waarde = argv[i + 1];
  if (waarde === undefined || waarde.startsWith("--")) return "";
  return waarde;
}

export function heeftVlag(argv: string[], naam: string): boolean {
  return argv.includes(`--${naam}`);
}
```

- [ ] Maak `scripts/keten/retailers.ts` met de waarde die je in de tweede stap hebt opgezocht:

```ts
/**
 * De ene plek waar de retailer-naam staat. De waarde is products.retailer
 * letterlijk: dat is de programmanaam uit de Daisycon-feed (zie
 * supabase/functions/import-daisycon-feed/index.ts, "retailer: programName").
 * Opgezocht in plan 2 taak 1 met:
 *   supabase db query --linked "select retailer, count(*) from products group by 1 order by 2 desc" -o table
 * Elke RPC met p_retailer controleert de naam tegen products.retailer en
 * geeft een fout bij een onbekende waarde.
 */
export const STANDAARD_RETAILER = "H&M (NL)";
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/env.test.ts scripts/keten/__tests__/args.test.ts` en zie 8 tests slagen.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add package.json package-lock.json scripts/keten/.gitignore scripts/keten/env.ts scripts/keten/args.ts scripts/keten/retailers.ts scripts/keten/__tests__/env.test.ts scripts/keten/__tests__/args.test.ts && git commit -m "feat(keten): scripts-fundament met Anthropic SDK, env-, args- en retailer-helpers"`

---

### Taak 2: Migratie tag-kolommen, indexen, retailer-controle en tag-RPC's

**Bestanden:**
- Aanmaken: `supabase/migrations/20260916100000_keten_tag_kolommen.sql`
- Test: `scripts/keten/__tests__/migraties.test.ts` (contract, offline), `scripts/keten/__tests__/migraties.live.test.ts` (gedrag, live)

**Interfaces:**
- Gebruikt: tabel `product_attributes(product_id, canonical_id, is_fashion, category, gender, price_band, embedding, tagged_at)` uit plan 1; tabel `products(id, name, brand, description, price, retailer, category, image_url, in_stock)`; `STANDAARD_RETAILER` (taak 1).
- Levert:
  - kolommen `formality smallint`, `occasions text[]`, `silhouette text`, `color_temp text`, `lightness text`, `pattern text`, `shoe_type text`, `colors text[]`, `materials text[]`, `seasons text[]`, `confidence real`, `tagger_version text` (en `embedding`, `tagged_at` als plan 1 die nog niet had)
  - `keten_controleer_retailer(p_retailer text) returns void`: gooit `Onbekende retailer: "<naam>"` als de naam niet in `products.retailer` voorkomt; `null` is toegestaan (betekent: alle retailers)
  - `keten_tag_kandidaten(p_retailer text, p_modus text, p_versie text, p_limit int, p_after uuid) returns table (product_id uuid, name text, brand text, description text, price numeric, retailer text, raw_category text, gender text, image_url text, confidence real)`; alleen canonieke, in-stock, geclassificeerde (`classifier_version is not null`) fashionrijen
  - `keten_schrijf_tags(p_rijen jsonb) returns integer` (aantal bijgewerkte rijen); schrijft alle tags behalve `category`; `is_fashion` kan alleen van waar naar onwaar

Wat de spec openlaat en hier is besloten:
- `category` blijft van de classifier uit plan 1 (zie Globale randvoorwaarden). De tagger levert `category` wel (structured output, spec 5.1); `keten_schrijf_tags` gebruikt hem alleen om `is_fashion` te verlagen (`category = 'geen'` of `is_fashion = false` van de tagger) en `valideerTags` (taak 3) om `shoe_type` op null te zetten buiten footwear.
- Alleen geclassificeerde rijen komen bij de tagger. Een rij zonder `classifier_version` heeft de ruwe feedcategorie, en die is in 50.618 gevallen aantoonbaar fout (plan 1, Controle vooraf). Nieuwe producten uit de wekelijkse import gaan dus eerst door `npm run keten:classificeer` (plan 1 taak 2) en dan door `npm run keten:tag`.

- [ ] Schrijf de falende contract-test. Maak `scripts/keten/__tests__/migraties.test.ts`:

```ts
/**
 * Contract-test op de migratiebestanden van plan 2: kolomnamen, indexen,
 * functienamen, policies en cron-jobs. Dit is een tekstcontrole op de
 * bestanden, geen bewijs dat de SQL werkt. Het gedrag wordt bewezen door
 * migraties.live.test.ts (tegen de gekoppelde database) en door de
 * controle-queries per taak in het plan.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const MIGRATIES = join(__dirname, "..", "..", "..", "supabase", "migrations");
const lees = (naam: string) => readFileSync(join(MIGRATIES, naam), "utf8").toLowerCase();

describe("20260916100000_keten_tag_kolommen", () => {
  const sql = lees("20260916100000_keten_tag_kolommen.sql");

  it("voegt elke tag-kolom uit spec 5.1 toe", () => {
    for (const kolom of [
      "formality", "occasions", "silhouette", "color_temp", "lightness", "pattern",
      "shoe_type", "colors", "materials", "seasons", "confidence", "tagger_version",
      "embedding", "tagged_at",
    ]) {
      expect(sql).toContain(`add column if not exists ${kolom}`);
    }
  });

  it("maakt de indexen uit spec 5.1 (ivfflat volgt na de embed-run) plus retailer en tagger_version", () => {
    expect(sql).toContain("on product_attributes (canonical_id)");
    expect(sql).toContain("on product_attributes (gender, category, price_band)");
    expect(sql).toContain("using gin (occasions)");
    expect(sql).toContain("on products (retailer)");
    expect(sql).toContain("on product_attributes (tagger_version, product_id)");
    expect(sql).not.toContain("where tagger_version is null");
  });

  it("levert de retailer-controle en de twee tag-RPC's met security definer", () => {
    expect(sql).toContain("function keten_controleer_retailer(");
    expect(sql).toContain("onbekende retailer");
    expect(sql).toContain("function keten_tag_kandidaten(");
    expect(sql).toContain("function keten_schrijf_tags(");
    expect((sql.match(/security definer/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect((sql.match(/select keten_controleer_retailer\(p_retailer\)/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });

  it("beperkt de tag-RPC's tot de service role", () => {
    expect(sql).toContain("revoke all on function keten_tag_kandidaten");
    expect(sql).toContain("revoke all on function keten_schrijf_tags");
  });

  it("tagt alleen geclassificeerde rijen en laat category aan de classifier", () => {
    expect(sql).toContain("and pa.classifier_version is not null");
    expect(sql).not.toContain("category = case");
    expect(sql).not.toContain("category = r->>");
    expect(sql).toContain("is_fashion = pa.is_fashion");
  });
});
```

- [ ] Schrijf de falende live test. Maak `scripts/keten/__tests__/migraties.live.test.ts`:

```ts
/**
 * Gedragstest van de plan 2-migraties tegen de gekoppelde database. Draait
 * alleen als SUPABASE_URL (of VITE_SUPABASE_URL) en SUPABASE_SERVICE_ROLE_KEY
 * in de omgeving staan; anders overgeslagen, zodat `npx vitest run` offline
 * groen blijft. De RLS-checks gebruiken daarnaast VITE_SUPABASE_ANON_KEY.
 *
 * Draaien:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... VITE_SUPABASE_ANON_KEY=... \
 *     npx vitest run scripts/keten/__tests__/migraties.live.test.ts
 * Waarden komen uit je shell, nooit uit de repo, en worden niet gelogd.
 */
import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { STANDAARD_RETAILER } from "../retailers";

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const service = () => createClient(url!, serviceKey!, { auth: { persistSession: false } });
const anon = () => createClient(url!, anonKey!, { auth: { persistSession: false } });

describe.skipIf(!url || !serviceKey)("20260916100000_keten_tag_kolommen (live)", () => {
  it("keten_tag_kandidaten geeft alleen producten van de gevraagde retailer, met de velden voor de tagger", async () => {
    const { data, error } = await service().rpc("keten_tag_kandidaten", {
      p_retailer: STANDAARD_RETAILER, p_modus: "tekst", p_versie: "haiku-4.5-v1", p_limit: 3, p_after: null,
    });
    expect(error).toBeNull();
    const rijen = (data ?? []) as Array<Record<string, unknown>>;
    // Na de volledige tag-run (taak 5) is dit terecht leeg; de vorm wordt dan niet meer gecontroleerd.
    for (const r of rijen) {
      expect(r.retailer).toBe(STANDAARD_RETAILER);
      expect(typeof r.name).toBe("string");
      expect(r).toHaveProperty("raw_category");
      expect(r).toHaveProperty("image_url");
      expect(r).toHaveProperty("confidence");
    }
  });

  it("keten_tag_kandidaten geeft een fout bij een onbekende retailer in plaats van nul rijen", async () => {
    const { error } = await service().rpc("keten_tag_kandidaten", {
      p_retailer: "bestaat niet", p_modus: "tekst", p_versie: "haiku-4.5-v1", p_limit: 1, p_after: null,
    });
    expect(error?.message ?? "").toContain("Onbekende retailer");
  });

  it("keten_schrijf_tags met een lege lijst schrijft nul rijen", async () => {
    const { data, error } = await service().rpc("keten_schrijf_tags", { p_rijen: [] });
    expect(error).toBeNull();
    expect(Number(data)).toBe(0);
  });

  it.skipIf(!anonKey)("de tag-RPC's zijn niet aanroepbaar met de anon-sleutel", async () => {
    const { error } = await anon().rpc("keten_tag_kandidaten", {
      p_retailer: null, p_modus: "tekst", p_versie: "haiku-4.5-v1", p_limit: 1, p_after: null,
    });
    expect(error?.message ?? "").toContain("permission denied");
  });
});
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie hem falen met `ENOENT: no such file or directory ... 20260916100000_keten_tag_kolommen.sql` (alle 5 tests). Draai `npx vitest run scripts/keten/__tests__/migraties.live.test.ts` zonder omgevingsvariabelen en zie `skipped`.
- [ ] Maak `supabase/migrations/20260916100000_keten_tag_kolommen.sql`:

```sql
/*
  # Keten plan 2: tag-kolommen op product_attributes

  ## Probleem
  De engine heeft geen formaliteit, gelegenheid, silhouet of kleurtemperatuur
  per product. Engine v2 compenseert met regex op productnamen.

  ## Wat deze migratie doet
  - Voegt de tag-kolommen uit spec 5.1 toe aan product_attributes, met
    check-constraints op de vaste waardenlijsten. embedding en tagged_at
    bestaan al sinds plan 1; "if not exists" maakt dat onschadelijk.
  - Indexen uit spec 5.1: canonical_id, (gender, category, price_band),
    GIN op occasions. De ivfflat-index op embedding volgt in
    20260916100300, na de embed-run, zodat de lijsten op echte data trainen.
  - Index op products (retailer): elke RPC in dit plan filtert daarop.
  - Index op (tagger_version, product_id): de vraag "wat is nog niet getagd"
    en de foto-ronde (tagger_version = versie and confidence < 0.6). Bewust
    geen partiele index op "tagger_version is null": zodra de versie wordt
    opgehoogd is niets meer null en zou zo'n index niets meer dekken.
  - keten_controleer_retailer: gooit een fout bij een retailer-naam die niet
    in products voorkomt, zodat een typefout nooit stil nul rijen geeft.
  - Twee RPC's voor het tag-script, alleen aanroepbaar met de service role:
    keten_tag_kandidaten (nog niet getagde canonieke, geclassificeerde
    producten, keyset-paginatie) en keten_schrijf_tags (schrijft een
    jsonb-array met tags). category wordt niet geschreven: die is van de
    classifier uit plan 1 (zet_classificatie, classifier_version); het harnas
    uit plan 1 gaat rood als de client-classifier en product_attributes het
    oneens zijn. is_fashion kan alleen van waar naar onwaar.
  - pg_cron aan: nodig voor de eenmalige-job-uitwijk bij lange queries
    (taak 6 en 8) en voor de jobs in 20260916100500.

  ## Terugdraaien
  drop function if exists keten_schrijf_tags(jsonb);
  drop function if exists keten_tag_kandidaten(text, text, text, int, uuid);
  drop function if exists keten_controleer_retailer(text);
  drop index if exists idx_products_retailer;
  drop index if exists idx_product_attributes_tagger_version;
  alter table product_attributes
    drop column if exists formality, drop column if exists occasions,
    drop column if exists silhouette, drop column if exists color_temp,
    drop column if exists lightness, drop column if exists pattern,
    drop column if exists shoe_type, drop column if exists colors,
    drop column if exists materials, drop column if exists seasons,
    drop column if exists confidence, drop column if exists tagger_version;
*/

create extension if not exists vector with schema extensions;
create extension if not exists pg_cron;

alter table product_attributes
  add column if not exists formality smallint
    check (formality between 1 and 5),
  add column if not exists occasions text[] not null default '{}',
  add column if not exists silhouette text
    check (silhouette in ('slim', 'regular', 'relaxed', 'oversized')),
  add column if not exists color_temp text
    check (color_temp in ('warm', 'koel', 'neutraal')),
  add column if not exists lightness text
    check (lightness in ('licht', 'medium', 'donker')),
  add column if not exists pattern text
    check (pattern in ('effen', 'subtiel', 'statement')),
  add column if not exists shoe_type text
    check (shoe_type in ('sneaker', 'net', 'laars', 'sandaal')),
  add column if not exists colors text[] not null default '{}',
  add column if not exists materials text[] not null default '{}',
  add column if not exists seasons text[] not null default '{}',
  add column if not exists confidence real
    check (confidence between 0 and 1),
  add column if not exists tagger_version text,
  add column if not exists embedding extensions.vector(512),
  add column if not exists tagged_at timestamptz;

alter table product_attributes
  drop constraint if exists product_attributes_occasions_check;
alter table product_attributes
  add constraint product_attributes_occasions_check
  check (occasions <@ array['work', 'casual', 'formal', 'date', 'travel', 'sport', 'party']::text[]);

-- Indexen. "if not exists" omdat plan 1 canonical_id al geindexeerd kan
-- hebben onder dezelfde naam.
create index if not exists idx_products_retailer
  on products (retailer);
create index if not exists idx_product_attributes_canonical
  on product_attributes (canonical_id);
create index if not exists idx_product_attributes_gender_category_band
  on product_attributes (gender, category, price_band);
create index if not exists idx_product_attributes_occasions
  on product_attributes using gin (occasions);
create index if not exists idx_product_attributes_tagger_version
  on product_attributes (tagger_version, product_id);

-- Retailer-controle. null betekent "alle retailers" en is altijd goed.
create or replace function keten_controleer_retailer(p_retailer text)
returns void
language plpgsql
stable
security definer
set search_path = public, extensions
as $$
begin
  if p_retailer is not null
     and not exists (select 1 from products where retailer = p_retailer) then
    raise exception 'Onbekende retailer: "%". Zoek de exacte naam op met: select retailer, count(*) from products group by 1 order by 2 desc', p_retailer
      using errcode = 'P0002';
  end if;
end;
$$;

-- get_kandidaten (security invoker, taak 7) roept deze controle aan namens
-- anon en authenticated; de functie leest alleen of een naam bestaat.
grant execute on function keten_controleer_retailer(text) to anon, authenticated;

-- Nog niet getagde canonieke producten voor het tag-script. Alleen rijen die
-- de classifier uit plan 1 heeft gezien (classifier_version is not null):
-- de ruwe feedcategorie is te vaak fout om op te taggen.
-- p_modus 'tekst': rijen zonder tags van deze versie (ook niet de foto-variant).
-- p_modus 'foto':  rijen die met p_versie getagd zijn en confidence < 0.6 hebben
--                  en een foto-URL hebben; na de foto-ronde krijgt de rij
--                  tagger_version p_versie || '-foto' en valt hij hier uit.
-- Bekende beperking: bij een versiewissel matcht "not like p_versie || '%'"
-- elke rij en is de index op tagger_version geen hulp; dat is dan een
-- volledige scan van de tabel per pagina, wat bij ~287k rijen seconden kost
-- en acceptabel is voor een eenmalige her-tagging.
create or replace function keten_tag_kandidaten(
  p_retailer text default null,
  p_modus text default 'tekst',
  p_versie text default 'haiku-4.5-v1',
  p_limit int default 1000,
  p_after uuid default null
)
returns table (
  product_id uuid,
  name text,
  brand text,
  description text,
  price numeric,
  retailer text,
  raw_category text,
  gender text,
  image_url text,
  confidence real
)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select keten_controleer_retailer(p_retailer);

  select
    pa.product_id,
    p.name,
    p.brand,
    left(coalesce(p.description, ''), 1200) as description,
    p.price,
    p.retailer,
    p.category as raw_category,
    pa.gender,
    p.image_url,
    pa.confidence
  from product_attributes pa
  join products p on p.id = pa.product_id
  where pa.canonical_id = pa.product_id
    and pa.is_fashion
    and pa.classifier_version is not null
    and p.in_stock
    and (p_retailer is null or p.retailer = p_retailer)
    and (p_after is null or pa.product_id > p_after)
    and case p_modus
          when 'foto' then
            pa.tagger_version = p_versie
            and pa.confidence < 0.6
            and p.image_url like 'http%'
          else
            pa.tagger_version is null
            or pa.tagger_version not like p_versie || '%'
        end
  order by pa.product_id
  limit p_limit;
$$;

revoke all on function keten_tag_kandidaten(text, text, text, int, uuid) from public, anon, authenticated;

-- Schrijft een jsonb-array van tagrijen. Elke rij:
-- { product_id, is_fashion, category, gender, formality, occasions, silhouette,
--   color_temp, lightness, pattern, shoe_type, colors, materials, seasons,
--   confidence, tagger_version }
-- category blijft van de classifier (plan 1) en wordt hier niet geschreven.
-- De category van de tagger telt alleen mee voor is_fashion: 'geen' of
-- is_fashion false van de tagger zet is_fashion op false. Van onwaar naar
-- waar kan niet: de classifier en de kinder-/niet-kledingregels gaan voor.
create or replace function keten_schrijf_tags(p_rijen jsonb)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_aantal integer;
begin
  update product_attributes pa
  set
    is_fashion = pa.is_fashion
                 and coalesce((r->>'is_fashion')::boolean, true)
                 and coalesce(r->>'category', '') <> 'geen',
    gender = coalesce(nullif(r->>'gender', ''), pa.gender),
    formality = (r->>'formality')::smallint,
    occasions = coalesce(array(select jsonb_array_elements_text(r->'occasions')), '{}'),
    silhouette = r->>'silhouette',
    color_temp = r->>'color_temp',
    lightness = r->>'lightness',
    pattern = r->>'pattern',
    shoe_type = nullif(r->>'shoe_type', ''),
    colors = coalesce(array(select jsonb_array_elements_text(r->'colors')), '{}'),
    materials = coalesce(array(select jsonb_array_elements_text(r->'materials')), '{}'),
    seasons = coalesce(array(select jsonb_array_elements_text(r->'seasons')), '{}'),
    confidence = (r->>'confidence')::real,
    tagger_version = r->>'tagger_version',
    tagged_at = now()
  from jsonb_array_elements(coalesce(p_rijen, '[]'::jsonb)) as r
  where pa.product_id = (r->>'product_id')::uuid;

  get diagnostics v_aantal = row_count;
  return v_aantal;
end;
$$;

revoke all on function keten_schrijf_tags(jsonb) from public, anon, authenticated;
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie 5 tests slagen.
- [ ] Zet de migratie live:

```bash
supabase db query --linked -f supabase/migrations/20260916100000_keten_tag_kolommen.sql
```

Verwacht: geen fout. Faalt hij op `extension "pg_cron" is not available`, schakel pg_cron dan in via het dashboard (Database, Extensions) en draai het bestand opnieuw; alles erin is idempotent.

- [ ] Controleer live:

```bash
supabase db query --linked "select count(*) as ongetagd, count(*) filter (where classifier_version is null) as nog_te_classificeren from product_attributes where tagger_version is null and canonical_id = product_id and is_fashion" -o table
supabase db query --linked "select product_id, name, price from keten_tag_kandidaten('H&M (NL)', 'tekst', 'haiku-4.5-v1', 3, null)" -o table
supabase db query --linked "select * from keten_tag_kandidaten('bestaat niet', 'tekst', 'haiku-4.5-v1', 1, null)" -o table
supabase db query --linked "select indexname from pg_indexes where tablename in ('products', 'product_attributes') and indexname like 'idx_product%' order by 1" -o table
```

Verwacht: de eerste geeft `ongetagd` groter dan nul en `nog_te_classificeren` kleiner dan `ongetagd` (de rijen zonder classifier komen niet bij de tagger; is dat voor H&M meer dan nul, draai dan eerst `npm run keten:classificeer -- --retailer "H&M (NL)"` uit plan 1); de tweede drie H&M-producten; de derde een fout die begint met `Onbekende retailer: "bestaat niet"`; de vierde bevat `idx_products_retailer` en `idx_product_attributes_tagger_version`.

- [ ] Draai de live test: `SUPABASE_URL=$SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY npx vitest run scripts/keten/__tests__/migraties.live.test.ts` en zie 4 tests slagen.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add supabase/migrations/20260916100000_keten_tag_kolommen.sql scripts/keten/__tests__/migraties.test.ts scripts/keten/__tests__/migraties.live.test.ts && git commit -m "feat(keten): tag-kolommen, indexen, retailer-controle en tag-RPC's op product_attributes"`

---

### Taak 3: tagging.ts, de pure kern van het tag-script

**Bestanden:**
- Aanmaken: `scripts/keten/tagging.ts`
- Test: `scripts/keten/__tests__/tagging.test.ts`

**Interfaces:**
- Gebruikt: `Anthropic.MessageCreateParamsNonStreaming` uit `@anthropic-ai/sdk`.
- Levert:
  - constanten `TAGGER_MODEL` (`process.env.TAGGER_MODEL ?? "claude-haiku-4-5-20251001"`), `TAGGER_VERSION = "haiku-4.5-v1"`, `TAGGER_VERSION_FOTO = "haiku-4.5-v1-foto"`, `CONFIDENCE_DREMPEL_FOTO = 0.6`, `TAG_SCHEMA`
  - `type Modus = "tekst" | "foto"`
  - `interface TagProduct` (de rij uit `keten_tag_kandidaten`)
  - `interface TagUitvoer` (het tagschema) en `interface TagRij extends TagUitvoer { product_id: string; tagger_version: string }`
  - `bouwSysteemPrompt(): string`
  - `bouwGebruikersTekst(p: TagProduct): string`
  - `bouwVerzoek(p: TagProduct, modus: Modus): { custom_id: string; params: Anthropic.MessageCreateParamsNonStreaming }`
  - `valideerTags(obj: unknown): TagUitvoer | null`
  - `schatKosten(invoer: { aantal: number; gemInputTokens: number; gemOutputTokens: number }): { inputUsd: number; outputUsd: number; totaalUsd: number }`
  - `verwerkResultaten(resultaten: BatchResultaat[], modus: Modus): { rijen: TagRij[]; fouten: { custom_id: string; reden: string }[] }`

- [ ] Schrijf de falende test. Maak `scripts/keten/__tests__/tagging.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  TAG_SCHEMA,
  TAGGER_VERSION,
  TAGGER_VERSION_FOTO,
  bouwVerzoek,
  schatKosten,
  valideerTags,
  verwerkResultaten,
  type TagProduct,
} from "../tagging";

const product: TagProduct = {
  product_id: "11111111-1111-4111-8111-111111111111",
  name: "Slim fit overhemd van katoen",
  brand: "H&M",
  description: "Overhemd van geweven katoen met een slanke pasvorm.",
  price: 29.99,
  retailer: "H&M (NL)",
  raw_category: "top",
  gender: "male",
  image_url: "https://example.com/overhemd.jpg",
  confidence: null,
};

const geldigeTags = {
  is_fashion: true,
  category: "top",
  gender: "male",
  formality: 3,
  occasions: ["work", "date"],
  silhouette: "slim",
  color_temp: "koel",
  lightness: "licht",
  pattern: "effen",
  shoe_type: null,
  colors: ["wit"],
  materials: ["katoen"],
  seasons: ["lente", "zomer", "herfst"],
  confidence: 0.85,
};

describe("TAG_SCHEMA", () => {
  it("eist elk veld en verbiedt extra velden", () => {
    expect(TAG_SCHEMA.additionalProperties).toBe(false);
    expect([...TAG_SCHEMA.required].sort()).toEqual(Object.keys(TAG_SCHEMA.properties).sort());
    expect(TAG_SCHEMA.properties.occasions.items.enum).toEqual([
      "work", "casual", "formal", "date", "travel", "sport", "party",
    ]);
  });
});

describe("bouwVerzoek", () => {
  it("gebruikt het product_id als custom_id en structured output met het schema", () => {
    const v = bouwVerzoek(product, "tekst");
    expect(v.custom_id).toBe(product.product_id);
    expect(v.params.output_config).toEqual({ format: { type: "json_schema", schema: TAG_SCHEMA } });
    expect(typeof v.params.messages[0].content).toBe("string");
    expect(v.params.messages[0].content).toContain("H&M (NL)");
  });

  it("stuurt in foto-modus de afbeelding mee als url-blok", () => {
    const v = bouwVerzoek(product, "foto");
    const inhoud = v.params.messages[0].content as Array<{ type: string }>;
    expect(inhoud[0]).toEqual({ type: "image", source: { type: "url", url: product.image_url } });
    expect(inhoud[1].type).toBe("text");
  });
});

describe("valideerTags", () => {
  it("accepteert een geldige uitvoer", () => {
    expect(valideerTags(geldigeTags)).toEqual(geldigeTags);
  });

  it("wijst een waarde buiten de lijst af", () => {
    expect(valideerTags({ ...geldigeTags, color_temp: "cool" })).toBeNull();
    expect(valideerTags({ ...geldigeTags, occasions: ["werk"] })).toBeNull();
    expect(valideerTags({ ...geldigeTags, confidence: 1.4 })).toBeNull();
  });

  it("zet shoe_type op null als de categorie geen footwear is", () => {
    expect(valideerTags({ ...geldigeTags, shoe_type: "sneaker" })?.shoe_type).toBeNull();
    expect(valideerTags({ ...geldigeTags, category: "footwear", shoe_type: "sneaker" })?.shoe_type).toBe("sneaker");
  });
});

describe("schatKosten", () => {
  it("rekent met de batchprijs van Haiku 4.5 (helft van 1 en 5 dollar per miljoen)", () => {
    const k = schatKosten({ aantal: 100_000, gemInputTokens: 900, gemOutputTokens: 150 });
    expect(k.inputUsd).toBeCloseTo(45, 2);
    expect(k.outputUsd).toBeCloseTo(37.5, 2);
    expect(k.totaalUsd).toBeCloseTo(82.5, 2);
  });
});

describe("verwerkResultaten", () => {
  const geslaagd = {
    custom_id: product.product_id,
    result: {
      type: "succeeded",
      message: { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(geldigeTags) }] },
    },
  };

  it("maakt van een geslaagd resultaat een tagrij met de juiste versie", () => {
    const uit = verwerkResultaten([geslaagd], "tekst");
    expect(uit.fouten).toEqual([]);
    expect(uit.rijen[0]).toMatchObject({ product_id: product.product_id, tagger_version: TAGGER_VERSION, formality: 3 });
    expect(verwerkResultaten([geslaagd], "foto").rijen[0].tagger_version).toBe(TAGGER_VERSION_FOTO);
  });

  it("zet errored, expired en onleesbare uitvoer bij de fouten", () => {
    const uit = verwerkResultaten(
      [
        { custom_id: "a", result: { type: "errored", error: { type: "invalid_request" } } },
        { custom_id: "b", result: { type: "expired" } },
        { custom_id: "c", result: { type: "succeeded", message: { stop_reason: "end_turn", content: [{ type: "text", text: "{geen json" }] } } },
      ],
      "tekst"
    );
    expect(uit.rijen).toEqual([]);
    expect(uit.fouten.map((f) => f.custom_id)).toEqual(["a", "b", "c"]);
  });
});
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/tagging.test.ts` en zie hem falen met `Failed to resolve import "../tagging"`.
- [ ] Maak `scripts/keten/tagging.ts`:

```ts
/**
 * Pure kern van het tag-script: schema, prompts, verzoeken, validatie, kosten
 * en resultaatverwerking. Geen netwerk, zodat alles hier testbaar is.
 * Het tagschema is spec 5.1 van docs/superpowers/specs/2026-09-14-keten-herbouw-design.md.
 */
import type Anthropic from "@anthropic-ai/sdk";

export const TAGGER_MODEL = process.env.TAGGER_MODEL ?? "claude-haiku-4-5-20251001";
export const TAGGER_VERSION = "haiku-4.5-v1";
export const TAGGER_VERSION_FOTO = "haiku-4.5-v1-foto";
export const CONFIDENCE_DREMPEL_FOTO = 0.6;
export const MAX_TOKENS = 600;

// Batchprijs: 50 procent van 1 dollar (input) en 5 dollar (output) per miljoen tokens.
export const BATCH_INPUT_USD_PER_MTOK = 0.5;
export const BATCH_OUTPUT_USD_PER_MTOK = 2.5;

export type Modus = "tekst" | "foto";

export const CATEGORIES = ["top", "bottom", "footwear", "outerwear", "dress", "accessory", "geen"] as const;
export const GENDERS = ["male", "female", "unisex"] as const;
export const OCCASIONS = ["work", "casual", "formal", "date", "travel", "sport", "party"] as const;
export const SILHOUETTES = ["slim", "regular", "relaxed", "oversized"] as const;
export const COLOR_TEMPS = ["warm", "koel", "neutraal"] as const;
export const LIGHTNESS = ["licht", "medium", "donker"] as const;
export const PATTERNS = ["effen", "subtiel", "statement"] as const;
export const SHOE_TYPES = ["sneaker", "net", "laars", "sandaal"] as const;
export const COLORS = [
  "zwart", "wit", "grijs", "navy", "beige", "camel", "bruin", "groen", "rood",
  "roze", "blauw", "geel", "paars", "oranje", "multicolor",
] as const;
export const MATERIALS = ["katoen", "wol", "denim", "linnen", "leer", "synthetisch", "zijde", "tricot", "onbekend"] as const;
export const SEASONS = ["lente", "zomer", "herfst", "winter"] as const;

export interface TagProduct {
  product_id: string;
  name: string;
  brand: string | null;
  description: string | null;
  price: number;
  retailer: string | null;
  raw_category: string | null;
  gender: string | null;
  image_url: string | null;
  confidence: number | null;
}

export interface TagUitvoer {
  is_fashion: boolean;
  category: (typeof CATEGORIES)[number];
  gender: (typeof GENDERS)[number];
  formality: 1 | 2 | 3 | 4 | 5;
  occasions: (typeof OCCASIONS)[number][];
  silhouette: (typeof SILHOUETTES)[number];
  color_temp: (typeof COLOR_TEMPS)[number];
  lightness: (typeof LIGHTNESS)[number];
  pattern: (typeof PATTERNS)[number];
  shoe_type: (typeof SHOE_TYPES)[number] | null;
  colors: (typeof COLORS)[number][];
  materials: (typeof MATERIALS)[number][];
  seasons: (typeof SEASONS)[number][];
  confidence: number;
}

export interface TagRij extends TagUitvoer {
  product_id: string;
  tagger_version: string;
}

// JSON Schema voor structured output. Numerieke grenzen (confidence 0..1)
// ondersteunt de API niet; die controleert valideerTags.
export const TAG_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "is_fashion", "category", "gender", "formality", "occasions", "silhouette",
    "color_temp", "lightness", "pattern", "shoe_type", "colors", "materials",
    "seasons", "confidence",
  ],
  properties: {
    is_fashion: { type: "boolean" },
    category: { type: "string", enum: [...CATEGORIES] },
    gender: { type: "string", enum: [...GENDERS] },
    formality: { type: "integer", enum: [1, 2, 3, 4, 5] },
    occasions: { type: "array", items: { type: "string", enum: [...OCCASIONS] } },
    silhouette: { type: "string", enum: [...SILHOUETTES] },
    color_temp: { type: "string", enum: [...COLOR_TEMPS] },
    lightness: { type: "string", enum: [...LIGHTNESS] },
    pattern: { type: "string", enum: [...PATTERNS] },
    shoe_type: { anyOf: [{ type: "string", enum: [...SHOE_TYPES] }, { type: "null" }] },
    colors: { type: "array", items: { type: "string", enum: [...COLORS] } },
    materials: { type: "array", items: { type: "string", enum: [...MATERIALS] } },
    seasons: { type: "array", items: { type: "string", enum: [...SEASONS] } },
    confidence: { type: "number" },
  },
} as const;

export function bouwSysteemPrompt(): string {
  return [
    "Je tagt kledingproducten van Nederlandse webwinkels voor een stijladvies-app.",
    "Je krijgt naam, merk, beschrijving, prijs, winkel en de ruwe categorie uit de feed, soms ook een foto.",
    "Geef uitsluitend het gevraagde JSON-object terug. Regels per veld:",
    "- is_fashion: false voor alles wat geen kleding, schoenen of kledingaccessoire voor volwassenen is (vazen, lampen, servies, fan-merchandise, kinderkleding, ondergoed, zwemkleding). Dan category 'geen'.",
    "- category: top (shirts, blouses, truien, hoodies), bottom (broeken, rokken, shorts), footwear, outerwear (jassen, blazers als buitenlaag), dress (jurken, jumpsuits), accessory (tassen, riemen, sjaals, sieraden, hoeden).",
    "- gender: male, female of unisex, op basis van de doelgroep van het product.",
    "- formality: 1 sport of loungewear, 2 casual, 3 smart casual, 4 net, 5 formeel.",
    "- occasions: alle gelegenheden waar dit item past, uit work, casual, formal, date, travel, sport, party. Minimaal een.",
    "- silhouette: slim, regular, relaxed of oversized; bij schoenen en accessoires regular.",
    "- color_temp: warm (beige, camel, bruin, rood, oranje, geel, olijf), koel (navy, blauw, grijs, zwart, wit, roze, paars) of neutraal (gemengd of onduidelijk).",
    "- lightness: licht, medium of donker, van de hoofdkleur.",
    "- pattern: effen, subtiel (fijne streep, ruit, structuur) of statement (print, logo, opvallend dessin).",
    "- shoe_type: alleen bij footwear: sneaker, net, laars of sandaal. Anders null.",
    "- colors: hoofdkleuren uit de vaste lijst, genormaliseerd naar het Nederlands; multicolor bij drie of meer gelijkwaardige kleuren.",
    "- materials: uit de vaste lijst; onbekend als de tekst niets zegt.",
    "- seasons: seizoenen waarin je dit draagt, uit lente, zomer, herfst, winter.",
    "- confidence: 0 tot 1, hoe zeker je bent van het geheel. Onder 0.6 als de tekst te weinig zegt over kleur, pasvorm of formaliteit.",
  ].join("\n");
}

export function bouwGebruikersTekst(p: TagProduct): string {
  return [
    `Naam: ${p.name}`,
    `Merk: ${p.brand ?? "onbekend"}`,
    `Winkel: ${p.retailer ?? "onbekend"}`,
    `Prijs: ${Number(p.price).toFixed(2)} EUR`,
    `Ruwe categorie uit de feed: ${p.raw_category ?? "onbekend"}`,
    `Geslacht volgens de feed: ${p.gender ?? "onbekend"}`,
    `Beschrijving: ${p.description?.trim() || "geen"}`,
  ].join("\n");
}

export function bouwVerzoek(
  p: TagProduct,
  modus: Modus
): { custom_id: string; params: Anthropic.MessageCreateParamsNonStreaming } {
  const tekst = bouwGebruikersTekst(p);
  const content: Anthropic.MessageCreateParamsNonStreaming["messages"][number]["content"] =
    modus === "foto" && p.image_url
      ? [
          { type: "image", source: { type: "url", url: p.image_url } },
          { type: "text", text: tekst },
        ]
      : tekst;

  return {
    custom_id: p.product_id,
    params: {
      model: TAGGER_MODEL,
      max_tokens: MAX_TOKENS,
      system: bouwSysteemPrompt(),
      messages: [{ role: "user", content }],
      output_config: { format: { type: "json_schema", schema: TAG_SCHEMA } },
    },
  };
}

function inLijst<T extends readonly string[]>(lijst: T, w: unknown): w is T[number] {
  return typeof w === "string" && (lijst as readonly string[]).includes(w);
}

function alleInLijst<T extends readonly string[]>(lijst: T, w: unknown): w is T[number][] {
  return Array.isArray(w) && w.every((x) => inLijst(lijst, x));
}

export function valideerTags(obj: unknown): TagUitvoer | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;

  if (typeof o.is_fashion !== "boolean") return null;
  if (!inLijst(CATEGORIES, o.category)) return null;
  if (!inLijst(GENDERS, o.gender)) return null;
  if (![1, 2, 3, 4, 5].includes(o.formality as number)) return null;
  if (!alleInLijst(OCCASIONS, o.occasions)) return null;
  if (!inLijst(SILHOUETTES, o.silhouette)) return null;
  if (!inLijst(COLOR_TEMPS, o.color_temp)) return null;
  if (!inLijst(LIGHTNESS, o.lightness)) return null;
  if (!inLijst(PATTERNS, o.pattern)) return null;
  if (o.shoe_type !== null && !inLijst(SHOE_TYPES, o.shoe_type)) return null;
  if (!alleInLijst(COLORS, o.colors)) return null;
  if (!alleInLijst(MATERIALS, o.materials)) return null;
  if (!alleInLijst(SEASONS, o.seasons)) return null;
  if (typeof o.confidence !== "number" || o.confidence < 0 || o.confidence > 1) return null;

  return {
    is_fashion: o.is_fashion,
    category: o.category,
    gender: o.gender,
    formality: o.formality as TagUitvoer["formality"],
    occasions: [...new Set(o.occasions)],
    silhouette: o.silhouette,
    color_temp: o.color_temp,
    lightness: o.lightness,
    pattern: o.pattern,
    shoe_type: o.category === "footwear" ? (o.shoe_type as TagUitvoer["shoe_type"]) : null,
    colors: [...new Set(o.colors)],
    materials: [...new Set(o.materials)],
    seasons: [...new Set(o.seasons)],
    confidence: o.confidence,
  };
}

export function schatKosten(invoer: { aantal: number; gemInputTokens: number; gemOutputTokens: number }) {
  const inputUsd = (invoer.aantal * invoer.gemInputTokens * BATCH_INPUT_USD_PER_MTOK) / 1_000_000;
  const outputUsd = (invoer.aantal * invoer.gemOutputTokens * BATCH_OUTPUT_USD_PER_MTOK) / 1_000_000;
  return { inputUsd, outputUsd, totaalUsd: inputUsd + outputUsd };
}

// Structureel type voor batchresultaten, zodat de verwerking zonder SDK-object
// te testen is. De SDK levert dezelfde vorm (custom_id + result).
export interface BatchResultaat {
  custom_id: string;
  result: {
    type: string;
    message?: { stop_reason?: string | null; content: Array<{ type: string; text?: string }> };
    error?: { type?: string; message?: string };
  };
}

export function verwerkResultaten(
  resultaten: BatchResultaat[],
  modus: Modus
): { rijen: TagRij[]; fouten: { custom_id: string; reden: string }[] } {
  const versie = modus === "foto" ? TAGGER_VERSION_FOTO : TAGGER_VERSION;
  const rijen: TagRij[] = [];
  const fouten: { custom_id: string; reden: string }[] = [];

  for (const r of resultaten) {
    if (r.result.type !== "succeeded" || !r.result.message) {
      fouten.push({ custom_id: r.custom_id, reden: `${r.result.type}: ${r.result.error?.type ?? "geen detail"}` });
      continue;
    }
    if (r.result.message.stop_reason === "max_tokens") {
      fouten.push({ custom_id: r.custom_id, reden: "max_tokens: uitvoer afgekapt" });
      continue;
    }
    const tekst = r.result.message.content.find((b) => b.type === "text")?.text ?? "";
    let obj: unknown;
    try {
      obj = JSON.parse(tekst);
    } catch {
      fouten.push({ custom_id: r.custom_id, reden: "geen geldige JSON" });
      continue;
    }
    const tags = valideerTags(obj);
    if (!tags) {
      fouten.push({ custom_id: r.custom_id, reden: "waarde buiten schema" });
      continue;
    }
    rijen.push({ ...tags, product_id: r.custom_id, tagger_version: versie });
  }

  return { rijen, fouten };
}
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/tagging.test.ts` en zie 9 tests slagen.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add scripts/keten/tagging.ts scripts/keten/__tests__/tagging.test.ts && git commit -m "feat(keten): tagschema, prompts, validatie en kostenschatting voor de tagger"`

---

### Taak 4: batchesStore.ts, hervatbare batch-administratie

**Bestanden:**
- Aanmaken: `scripts/keten/batchesStore.ts`
- Test: `scripts/keten/__tests__/batchesStore.test.ts`

**Interfaces:**
- Levert:
  - `interface BatchRecord { id: string; retailer: string; modus: Modus; tagger_version: string; aantal: number; aangemaakt: string; status: "open" | "verwerkt"; verwerkt_op?: string }`
  - `interface BatchesBestand { batches: BatchRecord[] }`
  - `leesBatches(pad: string): BatchesBestand` (leeg bestand als het pad niet bestaat)
  - `schrijfBatches(pad: string, data: BatchesBestand): void` (schrijft via tijdelijk bestand en rename)
  - `openBatches(data: BatchesBestand, retailer: string, modus: Modus): BatchRecord[]`
  - `markeerVerwerkt(data: BatchesBestand, id: string, wanneer?: string): BatchesBestand`

- [ ] Schrijf de falende test. Maak `scripts/keten/__tests__/batchesStore.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { leesBatches, markeerVerwerkt, openBatches, schrijfBatches, type BatchRecord } from "../batchesStore";

let dir: string;
beforeEach(() => { dir = mkdtempSync(join(tmpdir(), "keten-batches-")); });
afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

const record = (extra: Partial<BatchRecord> = {}): BatchRecord => ({
  id: "msgbatch_1",
  retailer: "H&M (NL)",
  modus: "tekst",
  tagger_version: "haiku-4.5-v1",
  aantal: 10,
  aangemaakt: "2026-09-16T10:00:00.000Z",
  status: "open",
  ...extra,
});

describe("leesBatches en schrijfBatches", () => {
  it("geeft een leeg bestand als er nog niets is", () => {
    expect(leesBatches(join(dir, ".batches.json"))).toEqual({ batches: [] });
  });

  it("schrijft en leest hetzelfde terug, zonder tijdelijk bestand achter te laten", () => {
    const pad = join(dir, ".batches.json");
    schrijfBatches(pad, { batches: [record()] });
    expect(leesBatches(pad)).toEqual({ batches: [record()] });
    expect(() => readFileSync(pad + ".tmp")).toThrow();
  });
});

describe("openBatches en markeerVerwerkt", () => {
  it("filtert op retailer, modus en status open", () => {
    const data = { batches: [record(), record({ id: "b", modus: "foto" }), record({ id: "c", status: "verwerkt" }), record({ id: "d", retailer: "Giglio" })] };
    expect(openBatches(data, "H&M (NL)", "tekst").map((b) => b.id)).toEqual(["msgbatch_1"]);
  });

  it("markeert een batch verwerkt zonder de invoer te muteren", () => {
    const data = { batches: [record()] };
    const uit = markeerVerwerkt(data, "msgbatch_1", "2026-09-16T11:00:00.000Z");
    expect(uit.batches[0]).toMatchObject({ status: "verwerkt", verwerkt_op: "2026-09-16T11:00:00.000Z" });
    expect(data.batches[0].status).toBe("open");
  });
});
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/batchesStore.test.ts` en zie hem falen met `Failed to resolve import "../batchesStore"`.
- [ ] Maak `scripts/keten/batchesStore.ts`:

```ts
/**
 * Administratie van verstuurde Batch API-batches in scripts/keten/.batches.json
 * (gitignored). Hiermee kan tag-products.ts na een crash of Ctrl-C verder:
 * open batches worden eerst opgehaald en verwerkt voordat er nieuwe komen.
 */
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import type { Modus } from "./tagging";

export interface BatchRecord {
  id: string;
  retailer: string;
  modus: Modus;
  tagger_version: string;
  aantal: number;
  aangemaakt: string;
  status: "open" | "verwerkt";
  verwerkt_op?: string;
}

export interface BatchesBestand {
  batches: BatchRecord[];
}

export function leesBatches(pad: string): BatchesBestand {
  if (!existsSync(pad)) return { batches: [] };
  const data = JSON.parse(readFileSync(pad, "utf8")) as Partial<BatchesBestand>;
  return { batches: Array.isArray(data.batches) ? data.batches : [] };
}

export function schrijfBatches(pad: string, data: BatchesBestand): void {
  const tmp = pad + ".tmp";
  writeFileSync(tmp, JSON.stringify(data, null, 2) + "\n");
  renameSync(tmp, pad);
}

export function openBatches(data: BatchesBestand, retailer: string, modus: Modus): BatchRecord[] {
  return data.batches.filter((b) => b.status === "open" && b.retailer === retailer && b.modus === modus);
}

export function markeerVerwerkt(data: BatchesBestand, id: string, wanneer: string = new Date().toISOString()): BatchesBestand {
  return {
    batches: data.batches.map((b) => (b.id === id ? { ...b, status: "verwerkt", verwerkt_op: wanneer } : b)),
  };
}
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/batchesStore.test.ts` en zie 4 tests slagen.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add scripts/keten/batchesStore.ts scripts/keten/__tests__/batchesStore.test.ts && git commit -m "feat(keten): hervatbare batch-administratie in .batches.json"`

---

### Taak 5: tag-products.ts, de CLI

**Bestanden:**
- Aanmaken: `scripts/keten/tag-products.ts`
- Test: droge run en een echte run met `--limit 25` (de pure logica is in taak 3 en 4 getest)

**Interfaces:**
- Gebruikt: `keten_tag_kandidaten` en `keten_schrijf_tags` (taak 2), `leesEnv`, `leesVlag`/`heeftVlag` en `STANDAARD_RETAILER` (taak 1), alles uit `tagging.ts` (taak 3) en `batchesStore.ts` (taak 4), `client.messages.batches.create/retrieve/results` en `client.messages.countTokens` uit `@anthropic-ai/sdk`.
- Levert: het commando `npm run keten:tag -- [--retailer "H&M (NL)"] [--met-foto] [--limit N] [--ja]`. Zonder `--ja` schat het alleen de kosten en stopt (droge run). Open batches worden altijd eerst afgerond, ook zonder `--ja`. Zonder `--retailer` geldt `STANDAARD_RETAILER`.

- [ ] Maak `scripts/keten/tag-products.ts`:

```ts
/**
 * Tagt canonieke producten via de Anthropic Batch API met Haiku 4.5 en
 * schrijft de tags naar product_attributes (spec 5.1).
 *
 * Gebruik:
 *   npm run keten:tag                                       droge run op STANDAARD_RETAILER: telt, schat kosten, stopt
 *   npm run keten:tag -- --retailer "H&M (NL)" --ja         verstuurt, pollt, schrijft
 *   npm run keten:tag -- --retailer "H&M (NL)" --met-foto --ja
 *                                                           tweede ronde met foto voor confidence < 0.6
 *   --limit N   alleen de eerste N kandidaten (voor een proefrun)
 *
 * Idempotent: rijen met dezelfde tagger_version worden overgeslagen (de RPC
 * doet die selectie). Hervatbaar: batch-id's staan in scripts/keten/.batches.json;
 * bij een nieuwe start worden open batches eerst opgehaald en weggeschreven.
 * Een onbekende retailer-naam geeft een fout uit de database, geen lege run.
 *
 * Omgeving: ANTHROPIC_API_KEY, SUPABASE_URL (of VITE_SUPABASE_URL),
 * SUPABASE_SERVICE_ROLE_KEY. Nooit in de repo.
 */
import Anthropic from "@anthropic-ai/sdk";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { heeftVlag, leesVlag } from "./args";
import { leesBatches, markeerVerwerkt, openBatches, schrijfBatches, type BatchRecord } from "./batchesStore";
import { leesEnv } from "./env";
import { STANDAARD_RETAILER } from "./retailers";
import {
  TAGGER_MODEL,
  TAGGER_VERSION,
  TAGGER_VERSION_FOTO,
  bouwVerzoek,
  schatKosten,
  verwerkResultaten,
  type BatchResultaat,
  type Modus,
  type TagProduct,
  type TagRij,
} from "./tagging";

const here = dirname(fileURLToPath(import.meta.url));
const BATCHES_PAD = join(here, ".batches.json");
const OUT = join(here, "out");

const PAGINA = 1000;
const MAX_PER_BATCH = 10_000;
const SCHRIJF_CHUNK = 500;
const POLL_MS = 60_000;
const KOSTEN_STEEKPROEF = 20;
const GESCHATTE_OUTPUT_TOKENS = 160;

async function haalKandidaten(supabase: SupabaseClient, retailer: string, modus: Modus, limiet: number): Promise<TagProduct[]> {
  const alles: TagProduct[] = [];
  let after: string | null = null;
  for (;;) {
    const { data, error } = await supabase.rpc("keten_tag_kandidaten", {
      p_retailer: retailer,
      p_modus: modus,
      p_versie: TAGGER_VERSION,
      p_limit: PAGINA,
      p_after: after,
    });
    if (error) throw new Error(`keten_tag_kandidaten: ${error.message}`);
    const pagina = (data ?? []) as TagProduct[];
    alles.push(...pagina);
    process.stdout.write(`\r  kandidaten opgehaald: ${alles.length}`);
    if (pagina.length < PAGINA) break;
    if (limiet > 0 && alles.length >= limiet) break;
    after = pagina[pagina.length - 1].product_id;
  }
  process.stdout.write("\n");
  return limiet > 0 ? alles.slice(0, limiet) : alles;
}

async function schatKostenLive(
  anthropic: Anthropic,
  verzoeken: ReturnType<typeof bouwVerzoek>[]
): Promise<{ gemInputTokens: number; totaalUsd: number; inputUsd: number; outputUsd: number }> {
  const steekproef = verzoeken.slice(0, KOSTEN_STEEKPROEF);
  let som = 0;
  for (const v of steekproef) {
    const telling = await anthropic.messages.countTokens({
      model: v.params.model,
      system: v.params.system,
      messages: v.params.messages,
    });
    som += telling.input_tokens;
  }
  const gemInputTokens = steekproef.length ? Math.round(som / steekproef.length) : 0;
  const kosten = schatKosten({ aantal: verzoeken.length, gemInputTokens, gemOutputTokens: GESCHATTE_OUTPUT_TOKENS });
  return { gemInputTokens, ...kosten };
}

async function schrijfRijen(supabase: SupabaseClient, rijen: TagRij[]): Promise<number> {
  let geschreven = 0;
  for (let i = 0; i < rijen.length; i += SCHRIJF_CHUNK) {
    const chunk = rijen.slice(i, i + SCHRIJF_CHUNK);
    const { data, error } = await supabase.rpc("keten_schrijf_tags", { p_rijen: chunk });
    if (error) throw new Error(`keten_schrijf_tags: ${error.message}`);
    geschreven += Number(data ?? 0);
  }
  return geschreven;
}

async function verwerkBatch(anthropic: Anthropic, supabase: SupabaseClient, record: BatchRecord): Promise<void> {
  console.log(`Batch ${record.id} (${record.aantal} verzoeken, ${record.modus}): wachten tot hij klaar is...`);
  for (;;) {
    const batch = await anthropic.messages.batches.retrieve(record.id);
    if (batch.processing_status === "ended") {
      console.log(`  klaar: ${batch.request_counts.succeeded} geslaagd, ${batch.request_counts.errored} fout, ${batch.request_counts.expired} verlopen`);
      break;
    }
    console.log(`  ${new Date().toISOString()} status ${batch.processing_status}, nog ${batch.request_counts.processing} in verwerking`);
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  const resultaten: BatchResultaat[] = [];
  for await (const r of await anthropic.messages.batches.results(record.id)) {
    resultaten.push(r);
  }
  const { rijen, fouten } = verwerkResultaten(resultaten, record.modus);
  const geschreven = await schrijfRijen(supabase, rijen);

  mkdirSync(OUT, { recursive: true });
  const foutPad = join(OUT, `tag-fouten-${record.id}.json`);
  writeFileSync(foutPad, JSON.stringify(fouten, null, 2) + "\n");
  console.log(`  ${geschreven} rijen geschreven, ${fouten.length} fouten (zie ${foutPad}). Fouten blijven ongetagd en komen bij de volgende run terug.`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const retailer = leesVlag(argv, "retailer") || STANDAARD_RETAILER;
  const modus: Modus = heeftVlag(argv, "met-foto") ? "foto" : "tekst";
  const limiet = Number(leesVlag(argv, "limit") ?? 0) || 0;
  const ja = heeftVlag(argv, "ja");
  const versie = modus === "foto" ? TAGGER_VERSION_FOTO : TAGGER_VERSION;

  const env = leesEnv();
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

  console.log(`Tagger ${versie} met model ${TAGGER_MODEL}, retailer "${retailer}", modus ${modus}`);

  // 1. Open batches van een eerdere run eerst afronden.
  let store = leesBatches(BATCHES_PAD);
  for (const b of openBatches(store, retailer, modus)) {
    await verwerkBatch(anthropic, supabase, b);
    store = markeerVerwerkt(store, b.id);
    schrijfBatches(BATCHES_PAD, store);
  }

  // 2. Kandidaten en kosten.
  const producten = await haalKandidaten(supabase, retailer, modus, limiet);
  if (producten.length === 0) {
    console.log("Niets te taggen: alle canonieke producten van deze retailer hebben deze versie al.");
    return;
  }
  const verzoeken = producten.map((p) => bouwVerzoek(p, modus));
  const kosten = await schatKostenLive(anthropic, verzoeken);
  console.log(
    `Kostenschatting voor ${verzoeken.length} producten: gemiddeld ${kosten.gemInputTokens} input-tokens, ` +
      `${GESCHATTE_OUTPUT_TOKENS} output-tokens; input $${kosten.inputUsd.toFixed(2)} + output $${kosten.outputUsd.toFixed(2)} = $${kosten.totaalUsd.toFixed(2)} (batchprijs)`
  );
  if (!ja) {
    console.log("Droge run. Voeg --ja toe om de batch echt te versturen.");
    return;
  }

  // 3. Versturen, id direct bewaren.
  for (let i = 0; i < verzoeken.length; i += MAX_PER_BATCH) {
    const deel = verzoeken.slice(i, i + MAX_PER_BATCH);
    const batch = await anthropic.messages.batches.create({ requests: deel });
    store.batches.push({
      id: batch.id,
      retailer,
      modus,
      tagger_version: versie,
      aantal: deel.length,
      aangemaakt: new Date().toISOString(),
      status: "open",
    });
    schrijfBatches(BATCHES_PAD, store);
    console.log(`Batch verstuurd: ${batch.id} (${deel.length} verzoeken)`);
  }

  // 4. Pollen en schrijven.
  for (const b of openBatches(store, retailer, modus)) {
    await verwerkBatch(anthropic, supabase, b);
    store = markeerVerwerkt(store, b.id);
    schrijfBatches(BATCHES_PAD, store);
  }
  console.log("Klaar.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
```

- [ ] Droge run: `npm run keten:tag -- --limit 25`. Verwachte uitvoer: de regel `Tagger haiku-4.5-v1 met model claude-haiku-4-5-20251001, retailer "H&M (NL)" ...`, `kandidaten opgehaald: 25`, een kostenschatting rond `$0.01` en `Droge run. Voeg --ja toe ...`. Ontbreekt een sleutel, dan stopt het script met `Ontbrekende omgevingsvariabelen: ...` zonder waarden te tonen.
- [ ] Foute retailer: `npm run keten:tag -- --retailer "bestaat niet"` stopt met `keten_tag_kandidaten: Onbekende retailer: "bestaat niet" ...` en exit code 1 (`echo $?`).
- [ ] Echte proefrun: `npm run keten:tag -- --limit 25 --ja`. Verwacht: `Batch verstuurd: msgbatch_...`, daarna pollen (meestal binnen enkele minuten klaar), `25 rijen geschreven, 0 fouten`. Controleer dat `scripts/keten/.batches.json` de batch met `"status": "verwerkt"` bevat en dat `git status` het bestand niet toont.
- [ ] Controleer live:

```bash
supabase db query --linked "select p.name, pa.category, pa.formality, pa.occasions, pa.color_temp, pa.colors, pa.confidence from product_attributes pa join products p on p.id = pa.product_id where pa.tagger_version = 'haiku-4.5-v1' order by pa.tagged_at desc limit 10" -o table
```

Beoordeel de tien rijen op geloofwaardigheid (een overhemd met formality 3 en occasions work; een hoodie met formality 2 en casual). Klopt de helft niet, stop dan en pas de systeemprompt in `tagging.ts` aan voordat je de volledige run doet.

- [ ] Hervattest: start `npm run keten:tag -- --limit 25 --ja`, druk Ctrl-C zodra `Batch verstuurd` verschijnt, start hetzelfde commando opnieuw. Verwacht: het script begint met `Batch msgbatch_... : wachten tot hij klaar is...` en schrijft die batch weg voordat het nieuwe kandidaten zoekt.
- [ ] Volledige run voor H&M: `npm run keten:tag -- --ja`. Noteer de geprinte kostenschatting in de commitboodschap van deze taak. Daarna de foto-ronde: `npm run keten:tag -- --met-foto --ja`.
- [ ] Controleer na afloop: `supabase db query --linked "select tagger_version, count(*), round(avg(confidence)::numeric, 2) as gem_conf from product_attributes where canonical_id = product_id group by 1" -o table`. Verwacht: een rij `haiku-4.5-v1`, een rij `haiku-4.5-v1-foto` (alleen de lage-confidence-rijen) en een rij met `null` voor de producten van andere retailers.
- [ ] Vanaf nu geldt: `vul_product_attributes()` uit plan 1 niet meer aanroepen (zie Globale randvoorwaarden). Controleer dat niets het aanroept: `grep -rn "vul_product_attributes" scripts src supabase/functions` geeft geen treffer.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add scripts/keten/tag-products.ts && git commit -m "feat(keten): tag-products.ts tagt canonieke producten via de Batch API (H&M: <aantal> producten, geschat $<bedrag>)"`

---

### Taak 6: Embeddings naar product_attributes

**Bestanden:**
- Aanmaken: `supabase/migrations/20260916100100_keten_embedding_rpcs.sql`, `scripts/keten/embed-products.py`
- Wijzigen: `scripts/visual-embeddings/embed_products.py` regels 58-65 en 76-93; `.gitignore` na regel 187
- Test: `scripts/keten/__tests__/migraties.test.ts` en `migraties.live.test.ts` (uitbreiden), `scripts/keten/__tests__/test_embed_products.py`

**Interfaces:**
- Gebruikt: `download(url) -> bytes | None`, `MODEL`, `BATCH` uit `scripts/visual-embeddings/embed_products.py`; kolom `product_attributes.embedding`; `keten_controleer_retailer` (taak 2).
- Levert:
  - SQL: `keten_embed_kandidaten(p_retailer text, p_limit int, p_after uuid) returns table (product_id uuid, image_url text)` en `keten_schrijf_embeddings(p_rijen jsonb) returns integer` waarbij elke rij `{ "product_id": uuid, "embedding": "[f1,...,f512]" }` is
  - Python in `embed_products.py`: `laad_model() -> (model, processor, device)` en `embed_afbeeldingen(model, processor, device, imgs) -> list[list[float]]`
  - Python in `embed-products.py`: `vector_naar_pg(vec) -> str`, `verdeel(items, n) -> list[list]`; `--retailer` is verplicht (Python heeft geen toegang tot `retailers.ts`, en een tweede standaardwaarde zou een tweede bron van waarheid zijn)

- [ ] Breid de contract-test uit. Voeg onderaan `scripts/keten/__tests__/migraties.test.ts` toe:

```ts
describe("20260916100100_keten_embedding_rpcs", () => {
  const sql = lees("20260916100100_keten_embedding_rpcs.sql");

  it("levert de twee embedding-RPC's met retailer-controle, alleen voor de service role", () => {
    expect(sql).toContain("function keten_embed_kandidaten(");
    expect(sql).toContain("select keten_controleer_retailer(p_retailer)");
    expect(sql).toContain("function keten_schrijf_embeddings(");
    expect(sql).toContain("::extensions.vector");
    expect(sql).toContain("revoke all on function keten_embed_kandidaten");
    expect(sql).toContain("revoke all on function keten_schrijf_embeddings");
  });
});
```

- [ ] Breid de live test uit. Voeg onderaan `scripts/keten/__tests__/migraties.live.test.ts` toe:

```ts
describe.skipIf(!url || !serviceKey)("20260916100100_keten_embedding_rpcs (live)", () => {
  it("keten_embed_kandidaten geeft alleen rijen met een http-afbeelding en weigert een onbekende retailer", async () => {
    const goed = await service().rpc("keten_embed_kandidaten", { p_retailer: STANDAARD_RETAILER, p_limit: 5, p_after: null });
    expect(goed.error).toBeNull();
    for (const r of (goed.data ?? []) as Array<{ image_url: string }>) {
      expect(r.image_url.startsWith("http")).toBe(true);
    }
    const fout = await service().rpc("keten_embed_kandidaten", { p_retailer: "bestaat niet", p_limit: 1, p_after: null });
    expect(fout.error?.message ?? "").toContain("Onbekende retailer");
  });

  it("keten_schrijf_embeddings met een lege lijst schrijft nul rijen", async () => {
    const { data, error } = await service().rpc("keten_schrijf_embeddings", { p_rijen: [] });
    expect(error).toBeNull();
    expect(Number(data)).toBe(0);
  });
});
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie de nieuwe test falen met `ENOENT ... 20260916100100_keten_embedding_rpcs.sql`.
- [ ] Maak `supabase/migrations/20260916100100_keten_embedding_rpcs.sql`:

```sql
/*
  # Keten plan 2: RPC's voor FashionCLIP-embeddings

  ## Wat deze migratie doet
  Twee functies voor scripts/keten/embed-products.py, alleen met de service role:
  - keten_embed_kandidaten: canonieke, in-stock fashionproducten zonder embedding,
    met een http-afbeelding, keyset-paginatie op product_id. Onbekende
    retailer-naam geeft een fout (keten_controleer_retailer).
  - keten_schrijf_embeddings: schrijft een jsonb-array {product_id, embedding}
    waarbij embedding de pgvector-tekstvorm "[f1,...,f512]" is.

  ## Terugdraaien
  drop function if exists keten_schrijf_embeddings(jsonb);
  drop function if exists keten_embed_kandidaten(text, int, uuid);
*/

create or replace function keten_embed_kandidaten(
  p_retailer text default null,
  p_limit int default 500,
  p_after uuid default null
)
returns table (product_id uuid, image_url text)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select keten_controleer_retailer(p_retailer);

  select pa.product_id, p.image_url
  from product_attributes pa
  join products p on p.id = pa.product_id
  where pa.canonical_id = pa.product_id
    and pa.is_fashion
    and p.in_stock
    and pa.embedding is null
    and p.image_url like 'http%'
    and (p_retailer is null or p.retailer = p_retailer)
    and (p_after is null or pa.product_id > p_after)
  order by pa.product_id
  limit p_limit;
$$;

revoke all on function keten_embed_kandidaten(text, int, uuid) from public, anon, authenticated;

create or replace function keten_schrijf_embeddings(p_rijen jsonb)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_aantal integer;
begin
  update product_attributes pa
  set embedding = (r->>'embedding')::extensions.vector
  from jsonb_array_elements(coalesce(p_rijen, '[]'::jsonb)) as r
  where pa.product_id = (r->>'product_id')::uuid;

  get diagnostics v_aantal = row_count;
  return v_aantal;
end;
$$;

revoke all on function keten_schrijf_embeddings(jsonb) from public, anon, authenticated;
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie alles slagen. Zet live: `supabase db query --linked -f supabase/migrations/20260916100100_keten_embedding_rpcs.sql`. Draai daarna de live test (zelfde commando als in taak 2) en zie 6 tests slagen.
- [ ] Voeg de git-uitzondering toe. Vervang in `.gitignore` regel 187:

```
*.py
```

door:

```
*.py
# Uitzondering: de keten-scripts in Python horen wel in de repo, net als
# scripts/visual-embeddings/embed_products.py dat al is.
!scripts/keten/*.py
!scripts/keten/__tests__/*.py
```

- [ ] Refactor `scripts/visual-embeddings/embed_products.py` zodat de keten het model kan hergebruiken. Vervang regels 58-65:

```python
    import torch
    from PIL import Image
    from transformers import CLIPModel, CLIPProcessor

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    model = CLIPModel.from_pretrained(MODEL).to(device)
    model.train(False)  # inferentie-modus, geen gradients nodig
    processor = CLIPProcessor.from_pretrained(MODEL)
```

door:

```python
    from PIL import Image

    model, processor, device = laad_model()
```

en vervang regels 76-93 (de hele `def flush()` tot en met `batch_ids.clear()`):

```python
    def flush() -> None:
        if not batch_imgs:
            return
        for pid, vec in zip(batch_ids, embed_afbeeldingen(model, processor, device, batch_imgs)):
            embeddings[pid] = vec
        batch_imgs.clear()
        batch_ids.clear()
```

en voeg direct boven `def main() -> None:` (regel 46) deze twee functies toe:

```python
def laad_model():
    """Laadt FashionCLIP eenmalig. Geeft (model, processor, device)."""
    import torch
    from transformers import CLIPModel, CLIPProcessor

    device = "mps" if torch.backends.mps.is_available() else "cpu"
    model = CLIPModel.from_pretrained(MODEL).to(device)
    model.train(False)  # inferentie-modus, geen gradients nodig
    processor = CLIPProcessor.from_pretrained(MODEL)
    return model, processor, device


def embed_afbeeldingen(model, processor, device, imgs) -> "list[list[float]]":
    """L2-genormaliseerde beeld-embeddings (512 floats, 6 decimalen) voor PIL-afbeeldingen."""
    import torch

    inputs = processor(images=imgs, return_tensors="pt").to(device)
    with torch.no_grad():
        out = model.get_image_features(**inputs)
    # transformers <5 geeft een tensor, v5 een output-object
    if torch.is_tensor(out):
        feats = out
    elif hasattr(out, "image_embeds"):
        feats = out.image_embeds
    else:
        feats = out.pooler_output
    feats = feats / feats.norm(dim=-1, keepdim=True)
    return [[round(x, 6) for x in vec] for vec in feats.cpu().tolist()]


```

Controleer dat het oude script nog werkt: `~/.cache/fitfi-visual-venv/bin/python scripts/visual-embeddings/embed_products.py --limit 3 --input scripts/visual-embeddings/out/catalog-images.json --output /tmp/embed-check.json` eindigt met `Klaar: 3 embeddings` (bestaat `catalog-images.json` niet, draai eerst `node scripts/visual-embeddings/fetch-catalog.mjs`).

- [ ] Schrijf de falende Python-test. Maak `scripts/keten/__tests__/test_embed_products.py`:

```python
"""Draaien: ~/.cache/fitfi-visual-venv/bin/python -m unittest scripts/keten/__tests__/test_embed_products.py"""
import importlib.util
import unittest
from pathlib import Path

PAD = Path(__file__).resolve().parents[1] / "embed-products.py"
spec = importlib.util.spec_from_file_location("embed_products_keten", PAD)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)


class VectorNaarPg(unittest.TestCase):
    def test_pgvector_tekstvorm(self):
        self.assertEqual(mod.vector_naar_pg([0.1, -0.25, 1.0]), "[0.100000,-0.250000,1.000000]")

    def test_lengte_512_blijft_512_waarden(self):
        tekst = mod.vector_naar_pg([0.0] * 512)
        self.assertEqual(tekst.count(",") + 1, 512)


class Verdeel(unittest.TestCase):
    def test_verdeelt_in_stukken(self):
        self.assertEqual(mod.verdeel([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]])
        self.assertEqual(mod.verdeel([], 3), [])


if __name__ == "__main__":
    unittest.main()
```

- [ ] Draai `~/.cache/fitfi-visual-venv/bin/python -m unittest scripts/keten/__tests__/test_embed_products.py` en zie hem falen met `FileNotFoundError` op `embed-products.py`.
- [ ] Maak `scripts/keten/embed-products.py`:

```python
#!/usr/bin/env python3
"""FashionCLIP-embeddings voor canonieke producten, rechtstreeks naar
product_attributes.embedding (spec 5.1). Hergebruikt het model, de download-
cache en de embed-functie uit scripts/visual-embeddings/embed_products.py.

Setup (eenmalig, zelfde venv als de visual-embeddings-scripts):
  python3 -m venv ~/.cache/fitfi-visual-venv
  ~/.cache/fitfi-visual-venv/bin/pip install torch transformers pillow requests

Gebruik:
  ~/.cache/fitfi-visual-venv/bin/python scripts/keten/embed-products.py --retailer "H&M (NL)" [--limit N]

--retailer is verplicht en moet de letterlijke waarde uit products.retailer
zijn (dezelfde als STANDAARD_RETAILER in scripts/keten/retailers.ts). Een
onbekende naam geeft een fout uit de database, geen lege run.

Omgeving: SUPABASE_URL (of VITE_SUPABASE_URL) en SUPABASE_SERVICE_ROLE_KEY,
uit het proces of de repo-root .env. Waarden worden nooit gelogd.
Idempotent: de RPC geeft alleen rijen zonder embedding terug.
"""
import argparse
import io
import os
import re
import sys
from pathlib import Path

import requests

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE.parent / "visual-embeddings"))
from embed_products import BATCH, download, embed_afbeeldingen, laad_model  # noqa: E402

PAGINA = 500
SCHRIJF_CHUNK = 64


def lees_dotenv() -> "dict[str, str]":
    pad = ROOT / ".env"
    if not pad.exists():
        return {}
    uit = {}
    for regel in pad.read_text().split("\n"):
        m = re.match(r'^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$', regel)
        if m:
            uit[m.group(1)] = m.group(2)
    return uit


def lees_env() -> "tuple[str, str]":
    bron = {**lees_dotenv(), **os.environ}
    url = bron.get("SUPABASE_URL") or bron.get("VITE_SUPABASE_URL")
    key = bron.get("SUPABASE_SERVICE_ROLE_KEY")
    ontbreekt = [n for n, w in (("SUPABASE_URL", url), ("SUPABASE_SERVICE_ROLE_KEY", key)) if not w]
    if ontbreekt:
        print(f"Ontbrekende omgevingsvariabelen: {', '.join(ontbreekt)}", file=sys.stderr)
        sys.exit(1)
    return url.rstrip("/"), key


def vector_naar_pg(vec) -> str:
    """pgvector leest de tekstvorm '[f1,f2,...]'."""
    return "[" + ",".join(f"{x:.6f}" for x in vec) + "]"


def verdeel(items, n):
    return [items[i : i + n] for i in range(0, len(items), n)]


class Supabase:
    def __init__(self, url: str, key: str) -> None:
        self.url = url
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }

    def rpc(self, naam: str, body: dict):
        r = requests.post(f"{self.url}/rest/v1/rpc/{naam}", json=body, headers=self.headers, timeout=60)
        if not r.ok:
            raise RuntimeError(f"{naam} gaf {r.status_code}: {r.text[:300]}")
        return r.json()


def haal_kandidaten(sb: Supabase, retailer: str, limiet: int) -> "list[dict]":
    alles: "list[dict]" = []
    after = None
    while True:
        pagina = sb.rpc("keten_embed_kandidaten", {"p_retailer": retailer, "p_limit": PAGINA, "p_after": after})
        alles.extend(pagina)
        if len(pagina) < PAGINA or (limiet and len(alles) >= limiet):
            break
        after = pagina[-1]["product_id"]
    return alles[:limiet] if limiet else alles


def schrijf(sb: Supabase, rijen: "list[dict]") -> int:
    if not rijen:
        return 0
    return int(sb.rpc("keten_schrijf_embeddings", {"p_rijen": rijen}))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--retailer", required=True, help="letterlijke waarde uit products.retailer")
    ap.add_argument("--limit", type=int, default=0, help="alleen eerste N producten")
    args = ap.parse_args()

    url, key = lees_env()
    sb = Supabase(url, key)

    producten = haal_kandidaten(sb, args.retailer, args.limit)
    print(f"{len(producten)} canonieke producten zonder embedding voor {args.retailer!r}")
    if not producten:
        return

    from PIL import Image

    model, processor, device = laad_model()

    batch_imgs: list = []
    batch_ids: "list[str]" = []
    wachtrij: "list[dict]" = []
    geschreven = 0
    overgeslagen = 0

    def flush() -> None:
        nonlocal geschreven
        if not batch_imgs:
            return
        for pid, vec in zip(batch_ids, embed_afbeeldingen(model, processor, device, batch_imgs)):
            wachtrij.append({"product_id": pid, "embedding": vector_naar_pg(vec)})
        batch_imgs.clear()
        batch_ids.clear()
        if len(wachtrij) >= SCHRIJF_CHUNK:
            geschreven += schrijf(sb, wachtrij)
            wachtrij.clear()
            print(f"  {geschreven}/{len(producten)} geschreven")

    for p in producten:
        raw = download(p["image_url"])
        if raw is None:
            overgeslagen += 1
            continue
        try:
            img = Image.open(io.BytesIO(raw)).convert("RGB")
        except Exception as e:
            print(f"  onleesbare afbeelding ({e}): {p['product_id']}", file=sys.stderr)
            overgeslagen += 1
            continue
        batch_imgs.append(img)
        batch_ids.append(p["product_id"])
        if len(batch_imgs) >= BATCH:
            flush()

    flush()
    geschreven += schrijf(sb, wachtrij)
    print(f"Klaar: {geschreven} embeddings geschreven, {overgeslagen} overgeslagen (geen of onleesbare afbeelding)")


if __name__ == "__main__":
    main()
```

- [ ] Draai `~/.cache/fitfi-visual-venv/bin/python -m unittest scripts/keten/__tests__/test_embed_products.py` en zie `Ran 3 tests ... OK`.
- [ ] Foute retailer: `~/.cache/fitfi-visual-venv/bin/python scripts/keten/embed-products.py --retailer "bestaat niet"` stopt met `RuntimeError: keten_embed_kandidaten gaf 400: ... Onbekende retailer ...`.
- [ ] Proefrun: `~/.cache/fitfi-visual-venv/bin/python scripts/keten/embed-products.py --retailer "H&M (NL)" --limit 40`. Verwacht: `40 canonieke producten zonder embedding ...`, daarna `Klaar: 40 embeddings geschreven` (min de overgeslagen). Controleer: `supabase db query --linked "select count(*) from product_attributes where embedding is not null" -o table` geeft 40 (of iets minder). Draai hetzelfde commando nog eens: nu meldt hij minder of geen kandidaten (idempotent).
- [ ] Volledige run: `~/.cache/fitfi-visual-venv/bin/python scripts/keten/embed-products.py --retailer "H&M (NL)"`. Op een M4 doet FashionCLIP circa 10 tot 20 afbeeldingen per seconde; de downloads zijn de bottleneck. Laat het draaien; het script is hervatbaar omdat de RPC alleen rijen zonder embedding geeft.
- [ ] Uitwijk bij een tijdslimiet (geldt voor elke zware query in dit plan, hier nog niet nodig, wel hier vastgelegd): geeft `supabase db query --linked` een fout met `timeout` of `deadline exceeded`, plan de aanroep dan als eenmalige pg_cron-job die zichzelf opruimt, en lees het resultaat in `cron.job_run_details`:

```bash
supabase db query --linked "select cron.schedule('keten-eenmalig', '* * * * *', \$\$select cron.unschedule('keten-eenmalig'); select keten_dedupe_embedding('H&M (NL)')\$\$)" -o table
sleep 90
supabase db query --linked "select jobname, status, return_message, start_time, end_time from cron.job_run_details where jobname = 'keten-eenmalig' order by start_time desc limit 1" -o table
```

Vervang de tweede statement in de job door de query die te lang duurde. pg_cron heeft geen tijdslimiet van de Management API; `status = 'succeeded'` en `return_message` tonen de uitkomst.

- [ ] Controleer dat git de Python-bestanden ziet: `git status --short scripts/keten` toont `embed-products.py` en `__tests__/test_embed_products.py` als nieuw.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add .gitignore supabase/migrations/20260916100100_keten_embedding_rpcs.sql scripts/visual-embeddings/embed_products.py scripts/keten/embed-products.py scripts/keten/__tests__/test_embed_products.py scripts/keten/__tests__/migraties.test.ts scripts/keten/__tests__/migraties.live.test.ts && git commit -m "feat(keten): FashionCLIP-embeddings naar product_attributes.embedding"`

---

### Taak 7: get_kandidaten met de volledige score uit spec 5.3

**Bestanden:**
- Aanmaken: `supabase/migrations/20260916100200_keten_get_kandidaten_score.sql`
- Test: `scripts/keten/__tests__/migraties.test.ts` en `migraties.live.test.ts` (uitbreiden), live controle

**Interfaces:**
- Gebruikt: `get_kandidaten` met acht parameters (wordt vervangen); de live versie is `20260914120500_get_kandidaten_op_attributes.sql` uit plan 1 taak 3 (controller-ruling), niet de oorspronkelijke `20260914120100`. Die live versie filtert en rangschikt volledig op `product_attributes` en joint `products` pas na de topN-afkap; de vorige vorm (join naar `products` per kandidaatrij, vóór de afkap) mat 56,5 seconden pure uitvoertijd en gaf via de anon-route `57014` op de 8 seconden statement-timeout (`.superpowers/sdd/2026-09-14-plan-1-fundament/taak-3-report.md`). Verder gebruikt: tag-kolommen en embedding (taak 2 en 6), `keten_controleer_retailer` (taak 2), partiële index `idx_product_attributes_kandidaten (gender, category, price) where product_id = canonical_id and is_fashion and in_stock` (`20260914120400`).
- Levert: `get_kandidaten(p_gender text, p_occasions text[], p_budget_min int, p_budget_max int, p_axes jsonb, p_liked_ids uuid[], p_disliked_ids uuid[], p_per_category int default 12, p_retailer text default null) returns table (product_id uuid, category text, score real, attrs jsonb, product jsonb)`. De negende parameter heeft een default, dus elke aanroep uit plan 1 blijft werken. `p_axes` heeft de vorm `{ "formality": {"value": 3, "confidence": 0.8}, "silhouette": {"value": "slim", "confidence": 1}, ... }` (spec 5.2). De functie blijft `security invoker` zoals in plan 1: de aanroeper leest `products` en `product_attributes` onder zijn eigen RLS (select-policies `using (true)`), en er is geen reden voor meer rechten op een publiek aanroepbare functie.

Wat de spec openlaat en hier is besloten: alleen getagde rijen (`tagger_version is not null`) doen mee. Spec 5.3 noemt dat filter niet, maar 0.8 van de score komt uit tags; een ongetagde rij scoort nul en zou toch een plek in een outfit vullen. Een retailer die nog niet getagd is komt dus niet in kandidaten voor; `npm run keten:personas` zonder `--retailer` ziet na deze taak alleen H&M tot een tweede retailer door taak 5 is gegaan. Nieuwe producten uit de wekelijkse import (taak 12) blijven onzichtbaar tot de eerstvolgende classificeer- en tag-run.

Niet-onderhandelbaar voor deze taak: de score-termen komen erbij zonder de queryvorm van `20260914120500` te verlaten. Filteren, uitsluiten (`p_disliked_ids`) en rangschikken (de `row_number() over (partition by category ...)`) gebeurt volledig op `product_attributes`, inclusief `price`, `in_stock`, `retailer` en de tag-kolommen; `products` wordt pas na `where rn <= p_per_category` gejoind, alleen voor de rijen die worden teruggegeven, met `to_jsonb(p.*)` zodat plan 1 taak 6 en plan 3 nog steeds `colors`, `sizes` en `description` uit dat object kunnen lezen. Een join naar `products` vóór de afkap (zoals een eerdere versie van deze taak per ongeluk deed, geschreven vóór `20260914120400`/`20260914120500` bestonden) reproduceert de 56,5s/57014-regressie zodra deze migratie de live functie vervangt.

- [ ] Breid de contract-test uit. Voeg onderaan `scripts/keten/__tests__/migraties.test.ts` toe:

```ts
describe("20260916100200_keten_get_kandidaten_score", () => {
  const sql = lees("20260916100200_keten_get_kandidaten_score.sql");

  it("vervangt de oude signatuur en voegt p_retailer met default en controle toe", () => {
    expect(sql).toContain("drop function if exists get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int)");
    expect(sql).toContain("p_retailer text default null");
    expect(sql).toContain("select keten_controleer_retailer(p_retailer)");
  });

  it("geeft alleen getagde rijen terug", () => {
    expect(sql).toContain("and pa.tagger_version is not null");
  });

  it("weegt de drie onderdelen 0.5, 0.3 en 0.2 en is deterministisch op product_id", () => {
    expect(sql).toContain("0.5 *");
    expect(sql).toContain("0.3 *");
    expect(sql).toContain("0.2 *");
    expect(sql).toContain("order by g.category, g.score desc, g.product_id");
  });

  it("filtert en rangschikt volledig op product_attributes; products wordt pas na de topN-afkap gejoind", () => {
    expect(sql).not.toContain("join products p on p.id = pa.product_id");
    expect(sql).toContain("and pa.in_stock");
    expect(sql).toContain("and (p_retailer is null or pa.retailer = p_retailer)");
    expect(sql).toContain("join products p on p.id = g.product_id");
    expect(sql).toContain("where g.rn <= p_per_category");
    expect(sql).toContain("to_jsonb(p.*) as product");
  });

  it("blijft security invoker en aanroepbaar voor de frontend", () => {
    expect(sql).toContain("security invoker");
    expect(sql).not.toContain("security definer");
    expect(sql).toContain("grant execute on function get_kandidaten");
  });
});
```

- [ ] Breid de live test uit. Voeg onderaan `scripts/keten/__tests__/migraties.live.test.ts` toe:

```ts
describe.skipIf(!url || !serviceKey)("20260916100200_keten_get_kandidaten_score (live)", () => {
  const params = {
    p_gender: "male",
    p_occasions: ["work", "casual"],
    p_budget_min: 20,
    p_budget_max: 150,
    p_axes: { formality: { value: 3, confidence: 1 }, color_temp: { value: "koel", confidence: 0.5 } },
    p_liked_ids: [] as string[],
    p_disliked_ids: [] as string[],
    p_per_category: 12,
    p_retailer: STANDAARD_RETAILER,
  };

  it("geeft per categorie hooguit p_per_category rijen van de retailer, score tussen 0 en 1, deterministisch", async () => {
    const een = await service().rpc("get_kandidaten", params);
    const twee = await service().rpc("get_kandidaten", params);
    expect(een.error).toBeNull();
    const rijen = (een.data ?? []) as Array<{ product_id: string; category: string; score: number; product: { retailer: string; price: number } }>;
    expect(rijen.length).toBeGreaterThan(0);
    expect(rijen.map((r) => r.product_id)).toEqual(((twee.data ?? []) as Array<{ product_id: string }>).map((r) => r.product_id));
    const perCategorie = new Map<string, number>();
    for (const r of rijen) {
      perCategorie.set(r.category, (perCategorie.get(r.category) ?? 0) + 1);
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1);
      expect(r.product.retailer).toBe(STANDAARD_RETAILER);
      expect(Number(r.product.price)).toBeGreaterThanOrEqual(20);
      expect(Number(r.product.price)).toBeLessThanOrEqual(150);
    }
    for (const n of perCategorie.values()) expect(n).toBeLessThanOrEqual(12);
  });

  it("weigert een onbekende retailer", async () => {
    const { error } = await service().rpc("get_kandidaten", { ...params, p_retailer: "bestaat niet" });
    expect(error?.message ?? "").toContain("Onbekende retailer");
  });

  it.skipIf(!anonKey)("is aanroepbaar met de anon-sleutel (security invoker, select-policies)", async () => {
    const { error } = await anon().rpc("get_kandidaten", { ...params, p_per_category: 1 });
    expect(error).toBeNull();
  });
});
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie de nieuwe tests falen met `ENOENT`.
- [ ] Maak `supabase/migrations/20260916100200_keten_get_kandidaten_score.sql`:

```sql
/*
  # Keten plan 2: get_kandidaten met de volledige score (spec 5.3)

  ## Probleem
  Plan 1 leverde get_kandidaten zonder tags: alleen harde filters. Nu de
  tag-kolommen en embeddings er zijn, komt de score erbij:
    0.5 * as-overeenkomst  (assen waarop attrs gelijk is aan axes.value,
                            gewogen met confidence, gedeeld door de som van
                            de confidences)
  + 0.3 * gelegenheid-overlap (aandeel van p_occasions dat in occasions zit)
  + 0.2 * max cosine-similariteit met de embeddings van p_liked_ids (0 als leeg)

  De live get_kandidaten (20260914120500, plan 1 taak 3, controller-ruling)
  filtert en rangschikt volledig op product_attributes en joint products pas
  na de topN-afkap. De vorige vorm (20260914120100, join naar products per
  kandidaatrij, vóór de afkap) liet de planner 526 rijen schatten tegen
  39.046 werkelijke, deed daarvoor ~39.000 losse heap-fetches op products en
  kwam op 56,5 seconden pure uitvoertijd; via de anon-route (8s
  statement-timeout) faalde de RPC met 57014. Deze migratie voegt de
  score-termen toe zonder die vorm te verlaten: geen join naar products vóór
  de afkap.

  ## Wat deze migratie doet
  - Dropt de oude signatuur (een extra parameter zou anders een tweede
    overload maken in plaats van een vervanging).
  - Voegt p_retailer toe (default null) zodat de feed-poort de keten op
    een enkele feed kan draaien (spec 5.7); onbekende naam geeft een fout.
  - Filtert, sluit uit (p_disliked_ids) en rangschikt volledig op
    product_attributes: price, in_stock, retailer en de tag-kolommen
    (formality, silhouette, color_temp, lightness, pattern, shoe_type,
    occasions, embedding) staan daar al. Geen join naar products in de
    kandidaat-CTE's. products wordt pas na "where rn <= p_per_category"
    gejoind, alleen voor de rijen die worden teruggegeven (maximaal
    6 x p_per_category, bij de default 12 dus maximaal 72), met
    to_jsonb(p.*) zodat plan 1 taak 6 en plan 3 nog steeds colors, sizes en
    description uit dat object lezen.
  - Top p_per_category per categorie, deterministisch op product_id.
  - Alleen getagde rijen (tagger_version is not null): 0.8 van de score komt
    uit tags, een ongetagde rij is niet te scoren. Een retailer telt pas mee
    na taggen en de poort (spec 3, 5.7).
  - Een unisex-profiel ziet alle geslachten; male en female zien hun eigen
    geslacht plus unisex.
  - Blijft security invoker, zoals in plan 1: de aanroeper leest onder zijn
    eigen select-policies. Geen bevoegdheidsverhoging op een publieke functie.

  ## Verwachting bij de partiële index
  idx_product_attributes_kandidaten (20260914120400) op (gender, category,
  price) where product_id = canonical_id and is_fashion and in_stock dekt
  precies de voorwaarden die hier ook gelden: de query hieronder voegt geen
  voorwaarde toe die de index minder bruikbaar maakt. De extra voorwaarden
  in deze versie (tagger_version is not null, retailer, de disliked-
  uitsluiting) staan niet in de index, maar worden toegepast als filter op
  een rij die de index-scan toch al heeft opgehaald (dezelfde heap-tuple
  die ook attrs vult): geen extra tabel, geen extra I/O. Verwachting: de
  index blijft de query bedienen en de duur blijft in dezelfde orde van
  grootte als de 20260914120500-meting (onder de twee seconden), niet terug
  naar de tientallen seconden van de nested-loop-naar-products. Bewezen, niet
  aangenomen: zie de twee metingen in de checklist hieronder.

  ## Terugdraaien
  Zet de functie uit 20260914120500 terug:
  supabase db query --linked -f supabase/migrations/20260914120500_get_kandidaten_op_attributes.sql
*/

drop function if exists get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int);
drop function if exists get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int, text);

create or replace function get_kandidaten(
  p_gender text,
  p_occasions text[],
  p_budget_min int,
  p_budget_max int,
  p_axes jsonb,
  p_liked_ids uuid[],
  p_disliked_ids uuid[],
  p_per_category int default 12,
  p_retailer text default null
)
returns table (product_id uuid, category text, score real, attrs jsonb, product jsonb)
language sql
stable
security invoker
set search_path = public, extensions
as $$
  select keten_controleer_retailer(p_retailer);

  with liked as (
    select embedding
    from product_attributes
    where product_id = any(coalesce(p_liked_ids, '{}'::uuid[]))
      and embedding is not null
    limit 50
  ),
  assen as (
    select key as as_naam,
           value->>'value' as as_waarde,
           coalesce((value->>'confidence')::real, 0) as as_conf
    from jsonb_each(coalesce(p_axes, '{}'::jsonb))
    where jsonb_typeof(value) = 'object'
      and value->>'value' is not null
  ),
  totaal_conf as (
    select coalesce(sum(as_conf), 0)::real as som from assen
  ),
  basis as (
    select
      pa.product_id,
      pa.category,
      pa.embedding,
      pa.occasions,
      to_jsonb(pa) - 'embedding' as attrs,
      (
        select coalesce(sum(a.as_conf), 0)::real
        from assen a
        where (a.as_naam = 'formality'  and pa.formality::text = a.as_waarde)
           or (a.as_naam = 'silhouette' and pa.silhouette = a.as_waarde)
           or (a.as_naam = 'color_temp' and pa.color_temp = a.as_waarde)
           or (a.as_naam = 'lightness'  and pa.lightness = a.as_waarde)
           or (a.as_naam = 'pattern'    and pa.pattern = a.as_waarde)
           or (a.as_naam = 'shoe_type'  and pa.shoe_type = a.as_waarde)
      ) as as_som
    from product_attributes pa
    where pa.product_id = pa.canonical_id
      and pa.is_fashion
      and pa.in_stock
      and pa.tagger_version is not null
      and pa.category in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory')
      and (p_gender = 'unisex' or pa.gender in (p_gender, 'unisex'))
      and pa.price between p_budget_min and p_budget_max
      and not (pa.product_id = any(coalesce(p_disliked_ids, '{}'::uuid[])))
      and (p_retailer is null or pa.retailer = p_retailer)
  ),
  gescoord as (
    select
      b.product_id,
      b.category,
      b.attrs,
      (
        0.5 * case when t.som > 0 then b.as_som / t.som else 0 end
      + 0.3 * case
                when coalesce(cardinality(p_occasions), 0) > 0 then
                  (select count(*) from unnest(b.occasions) o where o = any(p_occasions))::real
                  / cardinality(p_occasions)
                else 0
              end
      + 0.2 * coalesce(
                (select max(1 - (b.embedding <=> l.embedding)) from liked l where b.embedding is not null),
                0)
      )::real as score
    from basis b
    cross join totaal_conf t
  ),
  gerangschikt as (
    select *,
           row_number() over (partition by category order by score desc, product_id) as rn
    from gescoord
  )
  select
    g.product_id,
    g.category,
    g.score,
    g.attrs,
    to_jsonb(p.*) as product
  from gerangschikt g
  join products p on p.id = g.product_id
  where g.rn <= p_per_category
  order by g.category, g.score desc, g.product_id;
$$;

grant execute on function get_kandidaten(text, text[], int, int, jsonb, uuid[], uuid[], int, text) to anon, authenticated;
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie alles slagen. Zet live: `supabase db query --linked -f supabase/migrations/20260916100200_keten_get_kandidaten_score.sql`. Draai de live test en zie 9 tests slagen.
- [ ] Controleer live met een profiel dat op de assen stuurt:

```bash
supabase db query --linked "select category, count(*), round(max(score)::numeric, 3) as max_score, round(min(score)::numeric, 3) as min_score from get_kandidaten('male', array['work','casual'], 20, 150, '{\"formality\": {\"value\": 3, \"confidence\": 1}, \"color_temp\": {\"value\": \"koel\", \"confidence\": 0.5}}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12, 'H&M (NL)') group by 1 order by 1" -o table
```

Verwacht: maximaal zes rijen (een per categorie), elk `count <= 12`, `max_score` boven 0.5 in minstens een categorie (een product met formality 3 en koele kleur dat bij work of casual past scoort 0.5 + 0.3 = 0.8 zonder liked-items).

- [ ] Controleer de embedding-term: pak een product_id met embedding en geef die als liked:

```bash
supabase db query --linked "select product_id from product_attributes where embedding is not null and canonical_id = product_id limit 1" -o table
supabase db query --linked "select product_id, category, round(score::numeric, 3) as score from get_kandidaten('male', array['casual'], 10, 200, '{}'::jsonb, array['<dat id>']::uuid[], '{}'::uuid[], 3) order by score desc limit 5" -o table
```

Verwacht: het liked-product zelf staat bovenaan met score `0.5` (cosine 1 keer 0.2 plus 0.3 als het casual is) of `0.2`.

- [ ] Determinisme buiten de test om: draai de eerste query twee keer met `-o json` naar twee bestanden en vergelijk:

```bash
supabase db query --linked "select product_id, score from get_kandidaten('male', array['work','casual'], 20, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12, 'H&M (NL)')" -o json > /tmp/keten-run1.json
supabase db query --linked "select product_id, score from get_kandidaten('male', array['work','casual'], 20, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12, 'H&M (NL)')" -o json > /tmp/keten-run2.json
diff /tmp/keten-run1.json /tmp/keten-run2.json && echo "gelijk"
```

Verwacht: `gelijk`.

- [ ] Meet de duur na het toepassen, op dezelfde manier als plan 1 taak 3 (`.superpowers/sdd/2026-09-14-plan-1-fundament/taak-3-report.md`, addendum "De lat: aanroep onder de 8 seconden, bewezen op twee manieren"). Dit is de enige poort die telt: de browser roept `get_kandidaten` aan via de anon-route van PostgREST, met een statement-timeout van 8 seconden.

  1. Getimed via `supabase db query --linked`, drie opeenvolgende aanroepen (cache warmt op):

  ```bash
  time supabase db query --linked "select count(*) from get_kandidaten('male', array['work','casual'], 20, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12, 'H&M (NL)')" -o table
  time supabase db query --linked "select count(*) from get_kandidaten('male', array['work','casual'], 20, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12, 'H&M (NL)')" -o table
  time supabase db query --linked "select count(*) from get_kandidaten('male', array['work','casual'], 20, 150, '{}'::jsonb, '{}'::uuid[], '{}'::uuid[], 12, 'H&M (NL)')" -o table
  ```

  2. Via de anon-route met curl, dezelfde aanroep die vóór `20260914120500` op `57014` faalde:

  ```bash
  curl -s -w "\nHTTP_STATUS:%{http_code} TIME:%{time_total}\n" -X POST "$VITE_SUPABASE_URL/rest/v1/rpc/get_kandidaten" \
    -H "apikey: $VITE_SUPABASE_ANON_KEY" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{"p_gender":"male","p_occasions":["work","casual"],"p_budget_min":20,"p_budget_max":150,"p_axes":{},"p_liked_ids":[],"p_disliked_ids":[],"p_per_category":12,"p_retailer":"H&M (NL)"}'
  ```

  Verwacht: `HTTP_STATUS:200` en `TIME` ruim onder de 8 seconden, ook op de eerste (koude) aanroep. Harde grens, geen richtlijn: blijft een van beide metingen op of boven de 8 seconden, dan is deze taak niet af. Herstel dat niet door `products` vóór de afkap terug te joinen; de eerstvolgende stap is dan een aanvullende partiële index die ook `tagger_version` en `retailer` in het predicaat opneemt (analoog aan `idx_product_attributes_kandidaten` uit `20260914120400`), niet een structuurwijziging die de topN-afkap weer vóór de `products`-toegang zet.

- [ ] Controleer meteen of elders in dit plan een tweede plek `product_attributes` weer via een join naar `products` filtert waar de kolommen `price`, `in_stock` of `retailer` al op `product_attributes` staan (taak 9's `keten_dekkingsmatrix` is hier al op gecontroleerd en gefixt, zie hieronder); vind je een nieuwe plek, fix hem in dezelfde vorm als hierboven voordat je verder gaat.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add supabase/migrations/20260916100200_keten_get_kandidaten_score.sql scripts/keten/__tests__/migraties.test.ts scripts/keten/__tests__/migraties.live.test.ts && git commit -m "feat(keten): get_kandidaten scoort op assen, gelegenheid en embedding, filter en rangschikking blijven op product_attributes"`

---

### Taak 8: ivfflat-index en dedupe op embedding (cosine >= 0.999)

**Bestanden:**
- Aanmaken: `supabase/migrations/20260916100300_keten_dedupe_embedding.sql`
- Test: `scripts/keten/__tests__/migraties.test.ts` en `migraties.live.test.ts` (uitbreiden), live controle

**Interfaces:**
- Gebruikt: `product_attributes.canonical_id` en `.embedding` (gevuld in taak 6), `keten_controleer_retailer` (taak 2).
- Levert: de ivfflat-index `idx_product_attributes_embedding` (spec 5.1; hier en niet in taak 2, zodat de lijsten op echte vectoren trainen) en `keten_dedupe_embedding(p_retailer text default null, p_drempel real default 0.999) returns integer` (aantal rijen waarvan `canonical_id` is aangepast).

Wat de spec openlaat en hier is besloten (spec 5.1 zegt alleen "cosine >= 0.999"):
- Alleen binnen dezelfde retailer. De feed-poort (spec 5.7) en de affiliate-links werken per retailer; een product van retailer A mag niet verdwijnen achter een canoniek product van retailer B.
- Geen beperking op gender of category. Die velden komen uit de tagger; een tagfout zou een terechte match blokkeren, en twee producten met dezelfde foto zijn hetzelfde product ongeacht wat de tagger ervan maakte.
- Placeholder-beveiliging: een `image_url` die tien of meer producten van de retailer delen is een "geen afbeelding"-plaatje. Zonder deze regel zou een placeholder honderden verschillende producten tot een groep maken.
- De goedkoopste in-stock variant wordt canoniek (spec 5.1), deterministisch op `(in_stock desc, price asc, id asc)`.

- [ ] Breid de contract-test uit. Voeg onderaan `scripts/keten/__tests__/migraties.test.ts` toe:

```ts
describe("20260916100300_keten_dedupe_embedding", () => {
  const sql = lees("20260916100300_keten_dedupe_embedding.sql");

  it("maakt de ivfflat-index uit spec 5.1 na de embed-run", () => {
    expect(sql).toContain("using ivfflat (embedding extensions.vector_cosine_ops)");
  });

  it("dedupet op cosine-afstand met drempel 0.999 binnen de retailer, zonder gender- of category-eis, met placeholder-beveiliging", () => {
    expect(sql).toContain("function keten_dedupe_embedding(");
    expect(sql).toContain("p_drempel real default 0.999");
    expect(sql).toContain("perform keten_controleer_retailer(p_retailer)");
    expect(sql).toContain("<=>");
    expect(sql).toContain("ivfflat.probes");
    expect(sql).toContain("keten_placeholder");
    expect(sql).not.toContain("b.gender = a.gender");
    expect(sql).not.toContain("b.category = a.category");
    expect(sql).toContain("order by x.in_stock desc, x.price asc, x.id asc");
    expect(sql).toContain("revoke all on function keten_dedupe_embedding");
  });
});
```

- [ ] Breid de live test uit. Voeg onderaan `scripts/keten/__tests__/migraties.live.test.ts` toe:

```ts
describe.skipIf(!url || !serviceKey)("20260916100300_keten_dedupe_embedding (live)", () => {
  it("weigert een onbekende retailer en is niet aanroepbaar met de anon-sleutel", async () => {
    const fout = await service().rpc("keten_dedupe_embedding", { p_retailer: "bestaat niet", p_drempel: 0.999 });
    expect(fout.error?.message ?? "").toContain("Onbekende retailer");
    if (anonKey) {
      const anonFout = await anon().rpc("keten_dedupe_embedding", { p_retailer: null, p_drempel: 0.999 });
      expect(anonFout.error?.message ?? "").toContain("permission denied");
    }
  });
});
```

De echte dedupe-run staat niet in de test (hij duurt minuten en schrijft); die doe je hieronder met de hand, met de controle op kapotte ketens en idempotentie.

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie de nieuwe tests falen met `ENOENT`.
- [ ] Maak `supabase/migrations/20260916100300_keten_dedupe_embedding.sql`:

```sql
/*
  # Keten plan 2: ivfflat-index en dedupe op embedding

  ## Probleem
  Plan 1 dedupet op retailer + merk + genormaliseerde naam. Kleurvarianten met
  een andere naam en identieke foto's blijven dan los staan; de engine kan ze
  als twee items in een outfit zetten.

  ## Wat deze migratie doet
  - ivfflat-index op embedding (spec 5.1). Bewust pas nu, na de embed-run uit
    taak 6: ivfflat traint zijn lijsten op de data die er bij het aanmaken is.
    Na een volledige her-embedding: reindex index idx_product_attributes_embedding.
  - keten_dedupe_embedding(p_retailer, p_drempel): voor elk canoniek product met
    embedding zoekt hij (via de index, probes = 10) de buren binnen dezelfde
    retailer met cosine-similariteit >= p_drempel. Geen eis op gender of
    category (die komen uit de tagger en kunnen fout zijn). Afbeeldingen die
    tien of meer producten delen zijn placeholders en doen niet mee. Per paar
    wint de variant die het eerst sorteert op (in_stock desc, price asc, id asc);
    de verliezer krijgt canonical_id = winnaar. Daarna worden rijen die naar een
    verliezer wezen doorgezet naar de winnaar (padcompressie), tot er niets meer
    verandert. Geeft het aantal aangepaste rijen terug. Idempotent: een tweede
    aanroep geeft 0.

  Draai na embed-products.py:
    select keten_dedupe_embedding('H&M (NL)');

  ## Terugdraaien
  drop function if exists keten_dedupe_embedding(text, real);
  drop index if exists idx_product_attributes_embedding;
  De naam-dedupe uit plan 1 opnieuw draaien zet canonical_id terug op basis van
  naam, maar overschrijft ook de tags; doe dat alleen voor een her-tagging.
*/

create index if not exists idx_product_attributes_embedding
  on product_attributes using ivfflat (embedding extensions.vector_cosine_ops)
  with (lists = 100);

create or replace function keten_dedupe_embedding(
  p_retailer text default null,
  p_drempel real default 0.999
)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_totaal integer := 0;
  v_stap integer;
begin
  perform keten_controleer_retailer(p_retailer);
  -- Meer lijsten doorzoeken dan de standaard (1): met een afstandsfilter en
  -- limit 5 zou de index anders echte buren missen.
  perform set_config('ivfflat.probes', '10', true);

  drop table if exists keten_placeholder;
  drop table if exists keten_paren;

  -- 0. Placeholder-afbeeldingen: een image_url die tien of meer producten
  --    delen is geen productfoto. Die embeddings doen niet mee.
  create temp table keten_placeholder on commit drop as
  select image_url
  from products
  where (p_retailer is null or retailer = p_retailer)
    and image_url is not null
  group by image_url
  having count(*) >= 10;

  -- 1. Paren met cosine-afstand <= 1 - drempel, binnen dezelfde retailer.
  create temp table keten_paren on commit drop as
  select a.product_id as a_id, n.product_id as b_id
  from product_attributes a
  join products p on p.id = a.product_id
  cross join lateral (
    select b.product_id
    from product_attributes b
    join products q on q.id = b.product_id
    where b.product_id <> a.product_id
      and b.canonical_id = b.product_id
      and b.embedding is not null
      and q.retailer is not distinct from p.retailer
      and not exists (select 1 from keten_placeholder ph where ph.image_url = q.image_url)
      and (a.embedding <=> b.embedding) <= (1 - p_drempel)
    order by a.embedding <=> b.embedding
    limit 5
  ) n
  where a.canonical_id = a.product_id
    and a.embedding is not null
    and (p_retailer is null or p.retailer = p_retailer)
    and not exists (select 1 from keten_placeholder ph where ph.image_url = p.image_url);

  -- 2. Per paar de winnaar: goedkoopste in-stock variant, deterministisch.
  with rangorde as (
    select kp.a_id, kp.b_id,
      (select x.id from products x
        where x.id in (kp.a_id, kp.b_id)
        order by x.in_stock desc, x.price asc, x.id asc
        limit 1) as winnaar
    from keten_paren kp
  ),
  verliezers as (
    select distinct case when winnaar = a_id then b_id else a_id end as verliezer, winnaar
    from rangorde
  )
  update product_attributes pa
  set canonical_id = v.winnaar
  from verliezers v
  where pa.product_id = v.verliezer
    and pa.canonical_id = pa.product_id
    and v.winnaar <> pa.product_id;
  get diagnostics v_stap = row_count;
  v_totaal := v_totaal + v_stap;

  -- 3. Padcompressie: wie naar een verliezer wees, wijst nu naar diens winnaar.
  loop
    update product_attributes x
    set canonical_id = y.canonical_id
    from product_attributes y
    where x.canonical_id = y.product_id
      and y.canonical_id <> y.product_id
      and x.canonical_id <> y.canonical_id;
    get diagnostics v_stap = row_count;
    exit when v_stap = 0;
    v_totaal := v_totaal + v_stap;
  end loop;

  return v_totaal;
end;
$$;

revoke all on function keten_dedupe_embedding(text, real) from public, anon, authenticated;
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie alles slagen. Zet live: `supabase db query --linked -f supabase/migrations/20260916100300_keten_dedupe_embedding.sql`. Duurt het aanmaken van de index te lang voor de Management API, gebruik dan de uitwijk uit taak 6 met als statement `create index if not exists idx_product_attributes_embedding on product_attributes using ivfflat (embedding extensions.vector_cosine_ops) with (lists = 100)` en draai daarna het migratiebestand opnieuw (de index bestaat dan al, de functie wordt aangemaakt). Draai de live test en zie 10 tests slagen.
- [ ] Controleer live (na de volledige embed-run uit taak 6):

```bash
supabase db query --linked "select count(*) as canoniek_voor from product_attributes pa join products p on p.id = pa.product_id where pa.canonical_id = pa.product_id and p.retailer = 'H&M (NL)'" -o table
supabase db query --linked "select image_url, count(*) from products where retailer = 'H&M (NL)' and image_url is not null group by 1 having count(*) >= 10 order by 2 desc limit 5" -o table
supabase db query --linked "select keten_dedupe_embedding('H&M (NL)') as aangepast" -o table
supabase db query --linked "select count(*) as canoniek_na from product_attributes pa join products p on p.id = pa.product_id where pa.canonical_id = pa.product_id and p.retailer = 'H&M (NL)'" -o table
supabase db query --linked "select count(*) as kapotte_ketens from product_attributes x join product_attributes y on y.product_id = x.canonical_id where y.canonical_id <> y.product_id" -o table
supabase db query --linked "select keten_dedupe_embedding('H&M (NL)') as tweede_keer" -o table
```

Verwacht: de tweede query toont de placeholder-afbeeldingen (mag leeg zijn); `canoniek_na` kleiner dan of gelijk aan `canoniek_voor`; `kapotte_ketens` gelijk aan 0; `tweede_keer` gelijk aan 0 (idempotent). Loopt de derde query op de tijdslimiet, gebruik de uitwijk uit taak 6.

- [ ] Steekproef op de groepen, met de grootste eerst:

```bash
supabase db query --linked "select pa.canonical_id, count(*) as groep from product_attributes pa join products p on p.id = pa.product_id where p.retailer = 'H&M (NL)' group by 1 having count(*) > 1 order by 2 desc limit 5" -o table
supabase db query --linked "select p.name, p.price, p.in_stock, (pa.canonical_id = pa.product_id) as canoniek from product_attributes pa join products p on p.id = pa.product_id where pa.canonical_id = '<grootste canonical_id>' order by canoniek desc, p.price" -o table
```

Verwacht: de grootste groep bestaat uit varianten van hetzelfde product (kleur, maat), met de goedkoopste in-stock variant als canoniek. Bevat de grootste groep duidelijk verschillende producten, dan is er een placeholder-afbeelding onder de grens van tien; verlaag dan de grens in de migratie naar 5, draai het bestand opnieuw en herstel de groep met `update product_attributes set canonical_id = product_id where canonical_id = '<die id>'` voordat je de dedupe opnieuw draait.

- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add supabase/migrations/20260916100300_keten_dedupe_embedding.sql scripts/keten/__tests__/migraties.test.ts scripts/keten/__tests__/migraties.live.test.ts && git commit -m "feat(keten): ivfflat-index en dedupe op embedding met cosine 0.999"`

---

### Taak 9: Tabel feed_gates en dekkingsmatrix

**Bestanden:**
- Aanmaken: `supabase/migrations/20260916100400_keten_feed_gates.sql`
- Test: `scripts/keten/__tests__/migraties.test.ts` en `migraties.live.test.ts` (uitbreiden), live controle

**Interfaces:**
- Gebruikt: `public.is_current_user_admin() returns boolean` (bestaand, laatste versie in `supabase/migrations/20260305085011_fix_is_current_user_admin_direct_table_bypass_rls.sql`: JWT `app_metadata.is_admin`, met terugval op `profiles.is_admin`); `keten_controleer_retailer` (taak 2).
- Levert:
  - tabel `feed_gates(id uuid pk, retailer text, run_at timestamptz, groen boolean, matrix jsonb, persona_output jsonb)`; RLS aan, select voor admins via `is_current_user_admin()`, schrijven alleen service role (geen insert/update-policy)
  - `keten_dekkingsmatrix(p_retailer text) returns jsonb` met vorm `{ "male": { "work": { "tot50": n, "50tot100": n, "100tot200": n, "boven200": n }, ... }, "female": { ... } }`; unisex-producten tellen bij beide geslachten mee (zo ziet `get_kandidaten` ze ook)

Waarom niet een losse JWT-check in de policy: nergens in de migraties wordt een claim `app_metadata.role` gezet, en de migratie van `is_current_user_admin()` legt vast dat de admin-gebruikers `is_admin = true` in `raw_app_meta_data` hebben. Vijf oudere migraties gebruiken wel `->> 'role'` (`newsletter_subscribers`, `contact_messages`, `daisycon_imports`, `affiliate_campaigns`, `critical_security_fixes_final`); of die policies een admin doorlaten hangt af van iets dat in de repo niet te zien is, en dit plan neemt dat patroon daarom niet over. `is_current_user_admin()` is de twee keer geharde helper die op `is_admin` controleert, met terugval op `profiles.is_admin`. Een policy die niemand doorlaat geeft geen fout, alleen een lege resultset; daarom test de live test met de anon-sleutel dat lezen leeg is en dat de service role wel leest, en controleer je hieronder met `pg_get_expr` welke expressie er echt staat.

`keten_dekkingsmatrix` is `grant`ed aan `authenticated`, dus bereikbaar via dezelfde PostgREST-route als `get_kandidaten` (taak 7), niet alleen via de service role. De functie telt 2 x 7 x 4 = 56 cellen, en elke cel deed in een eerdere versie van deze taak een eigen `join products` om `in_stock` en `retailer` te toetsen: precies de vorm die in taak 7 op 56,5 seconden voor één enkele combinatie uitkwam, hier vermenigvuldigd met 56 combinaties in één aanroep. `product_attributes` heeft `in_stock` en `retailer` al staan (`20260914120400`); de telling hieronder filtert daarom volledig op `product_attributes` en raakt `products` helemaal niet aan, ook niet na een afkap, want er wordt geen enkele kolom van `products` teruggegeven.

- [ ] Breid de contract-test uit. Voeg onderaan `scripts/keten/__tests__/migraties.test.ts` toe:

```ts
describe("20260916100400_keten_feed_gates", () => {
  const sql = lees("20260916100400_keten_feed_gates.sql");

  it("maakt feed_gates met de kolommen uit het plan en RLS via de admin-helper", () => {
    expect(sql).toContain("create table if not exists feed_gates");
    for (const kolom of ["retailer text", "run_at timestamptz", "groen boolean", "matrix jsonb", "persona_output jsonb"]) {
      expect(sql).toContain(kolom);
    }
    expect(sql).toContain("alter table feed_gates enable row level security");
    expect(sql).toContain("using (is_current_user_admin())");
    expect(sql).not.toContain("->> 'role'");
  });

  it("levert keten_dekkingsmatrix over gender x gelegenheid x prijsband met retailer-controle", () => {
    expect(sql).toContain("function keten_dekkingsmatrix(");
    expect(sql).toContain("select keten_controleer_retailer(p_retailer)");
    expect(sql).toContain("'tot50', '50tot100', '100tot200', 'boven200'");
    expect(sql).toContain("'work', 'casual', 'formal', 'date', 'travel', 'sport', 'party'");
  });

  it("telt volledig op product_attributes, zonder join naar products", () => {
    expect(sql).not.toContain("join products");
    expect(sql).toContain("and pa.in_stock");
    expect(sql).toContain("and pa.retailer = p_retailer");
  });
});
```

- [ ] Breid de live test uit. Voeg onderaan `scripts/keten/__tests__/migraties.live.test.ts` toe:

```ts
describe.skipIf(!url || !serviceKey)("20260916100400_keten_feed_gates (live)", () => {
  it("keten_dekkingsmatrix geeft male en female, zeven gelegenheden, vier banden met getallen", async () => {
    const { data, error } = await service().rpc("keten_dekkingsmatrix", { p_retailer: STANDAARD_RETAILER });
    expect(error).toBeNull();
    const m = data as Record<string, Record<string, Record<string, number>>>;
    expect(Object.keys(m).sort()).toEqual(["female", "male"]);
    for (const g of ["male", "female"]) {
      expect(Object.keys(m[g]).sort()).toEqual(["casual", "date", "formal", "party", "sport", "travel", "work"]);
      for (const o of Object.keys(m[g])) {
        expect(Object.keys(m[g][o]).sort()).toEqual(["100tot200", "50tot100", "boven200", "tot50"]);
        for (const n of Object.values(m[g][o])) expect(typeof n).toBe("number");
      }
    }
  });

  it("weigert een onbekende retailer", async () => {
    const { error } = await service().rpc("keten_dekkingsmatrix", { p_retailer: "bestaat niet" });
    expect(error?.message ?? "").toContain("Onbekende retailer");
  });

  it("feed_gates: de service role leest, de anon-sleutel leest leeg en mag niet schrijven", async () => {
    const svc = await service().from("feed_gates").select("id").limit(1);
    expect(svc.error).toBeNull();
    if (anonKey) {
      const lezen = await anon().from("feed_gates").select("id").limit(1);
      expect(lezen.error).toBeNull();
      expect(lezen.data).toEqual([]);
      const schrijven = await anon().from("feed_gates").insert({ retailer: "test", groen: false, matrix: {} });
      expect(schrijven.error).not.toBeNull();
    }
  });
});
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie de nieuwe tests falen met `ENOENT`.
- [ ] Maak `supabase/migrations/20260916100400_keten_feed_gates.sql`:

```sql
/*
  # Keten plan 2: feed_gates en dekkingsmatrix (spec 5.7)

  ## Wat deze migratie doet
  - Tabel feed_gates: een rij per poort-run van scripts/keten/feed-poort.ts
    (retailer, run_at, groen, matrix, persona_output). Admins lezen via
    is_current_user_admin() (JWT app_metadata.is_admin, terugval op
    profiles.is_admin); alleen de service role schrijft (geen insert-policy).
    Bewust geen losse JWT-check op een claim "role" gelijk aan admin: geen
    migratie in dit project zet die claim, de admins hebben is_admin.
  - keten_dekkingsmatrix(p_retailer): telt canonieke, in-stock fashionproducten
    per gender x gelegenheid x prijsband. Unisex telt bij male en female mee.
    Onbekende retailer-naam geeft een fout. Telt volledig op product_attributes
    (in_stock en retailer staan daar al sinds 20260914120400): geen join naar
    products. Zonder die keuze zou elke van de 56 cellen (2 gender x 7
    gelegenheid x 4 band) een eigen join naar products doen om in_stock en
    retailer te toetsen, precies de vorm die get_kandidaten (taak 7) op 56,5
    seconden voor een enkele combinatie liet uitkomen, hier 56 keer in een
    aanroep. keten_dekkingsmatrix is grant'ed aan authenticated en loopt dus,
    net als get_kandidaten, via de PostgREST-route met een statement-timeout.

  ## Terugdraaien
  drop function if exists keten_dekkingsmatrix(text);
  drop table if exists feed_gates;
*/

create table if not exists feed_gates (
  id uuid primary key default gen_random_uuid(),
  retailer text not null,
  run_at timestamptz not null default now(),
  groen boolean not null,
  matrix jsonb not null,
  persona_output jsonb not null default '{}'::jsonb
);

create index if not exists idx_feed_gates_retailer_run_at
  on feed_gates (retailer, run_at desc);

alter table feed_gates enable row level security;

drop policy if exists "Admins lezen feed_gates" on feed_gates;
create policy "Admins lezen feed_gates"
  on feed_gates for select
  to authenticated
  using (is_current_user_admin());

create or replace function keten_dekkingsmatrix(p_retailer text)
returns jsonb
language sql
stable
security definer
set search_path = public, extensions
as $$
  select keten_controleer_retailer(p_retailer);

  with g as (select unnest(array['male', 'female']) as gender),
  o as (select unnest(array['work', 'casual', 'formal', 'date', 'travel', 'sport', 'party']) as occasion),
  b as (select unnest(array['tot50', '50tot100', '100tot200', 'boven200']) as band),
  cel as (
    select g.gender, o.occasion, b.band,
      (
        select count(*)
        from product_attributes pa
        where pa.canonical_id = pa.product_id
          and pa.is_fashion
          and pa.in_stock
          and pa.retailer = p_retailer
          and pa.gender in (g.gender, 'unisex')
          and pa.price_band = b.band
          and o.occasion = any(pa.occasions)
      ) as n
    from g cross join o cross join b
  ),
  per_occ as (
    select gender, occasion, jsonb_object_agg(band, n) as banden
    from cel group by gender, occasion
  ),
  per_gender as (
    select gender, jsonb_object_agg(occasion, banden) as gelegenheden
    from per_occ group by gender
  )
  select jsonb_object_agg(gender, gelegenheden) from per_gender;
$$;

revoke all on function keten_dekkingsmatrix(text) from public, anon;
grant execute on function keten_dekkingsmatrix(text) to authenticated;
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie alles slagen. Zet live: `supabase db query --linked -f supabase/migrations/20260916100400_keten_feed_gates.sql`. Draai de live test en zie 13 tests slagen.
- [ ] Controleer live: `supabase db query --linked "select jsonb_pretty(keten_dekkingsmatrix('H&M (NL)'))" -o table`. Verwacht: twee sleutels `male` en `female`, elk zeven gelegenheden, elk vier banden met een getal. Ook: `supabase db query --linked "select polname, pg_get_expr(polqual, polrelid) as using_expr from pg_policy where polrelid = 'feed_gates'::regclass" -o table` toont `is_current_user_admin()`.
- [ ] Meet de duur, zelfde reden als bij `get_kandidaten` (taak 7): `time supabase db query --linked "select keten_dekkingsmatrix('H&M (NL)')" -o table`. Verwacht: ruim onder de 8 seconden (deze functie raakt `products` niet aan, dus dit zou ruim binnen een seconde moeten liggen). Ligt de duur hoger, is de eerste vraag of `products` per ongeluk toch weer wordt aangeraakt (`grep -n "join products" supabase/migrations/20260916100400_keten_feed_gates.sql` moet niets teruggeven), niet een index toevoegen.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add supabase/migrations/20260916100400_keten_feed_gates.sql scripts/keten/__tests__/migraties.test.ts scripts/keten/__tests__/migraties.live.test.ts && git commit -m "feat(keten): feed_gates (admin-lezen via is_current_user_admin) en dekkingsmatrix"`

---

### Taak 10: feed-poort.ts en de vlag --retailer in persona-run

**Bestanden:**
- Aanmaken: `scripts/keten/poort.ts`, `scripts/keten/feed-poort.ts`
- Wijzigen: `scripts/keten/persona-run.ts` (uit plan 1 taak 11): het importblok bovenin en de ene regel `const { data, error } = await client.rpc("get_kandidaten", params);` in `haalKandidaten`
- Test: `scripts/keten/__tests__/poort.test.ts`, een echte poort-run

**Interfaces:**
- Gebruikt: `keten_dekkingsmatrix` (taak 9), tabel `feed_gates` (taak 9), `get_kandidaten(..., p_retailer)` (taak 7), `leesEnv`, `leesVlag`, `heeftVlag`, `STANDAARD_RETAILER` (taak 1); in `persona-run.ts`: `naarKandidatenParams(answers): KandidatenParams` uit `src/services/outfits/kandidaten.ts` (plan 1 taak 6; `KandidatenParams` heeft acht vaste velden, geen indexsignatuur, dus `p_retailer` gaat er via spread naast en niet erin).
- Levert:
  - `type Matrix = Record<string, Record<string, Record<string, number>>>`
  - `interface PersonaOutput { overgeslagen: boolean; exit_code?: number; stdout?: string; stderr?: string }`
  - `legeCellen(matrix: Matrix, banden?: string[]): string[]` (standaard banden `tot50` en `50tot100`, spec 5.7), elke cel als `"male/work/tot50"`
  - `isGroen(leeg: string[], persona: PersonaOutput): boolean`
  - het commando `npm run keten:poort -- [--retailer "H&M (NL)"] [--zonder-persona]`; exit code 0 bij groen, 1 anders
  - `persona-run.ts` accepteert `--retailer <naam>` en geeft die als `p_retailer` aan `get_kandidaten`

- [ ] Schrijf de falende test. Maak `scripts/keten/__tests__/poort.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { isGroen, legeCellen, type Matrix } from "../poort";

const vol = (n: number): Matrix => {
  const m: Matrix = {};
  for (const g of ["male", "female"]) {
    m[g] = {};
    for (const o of ["work", "casual", "formal", "date", "travel", "sport", "party"]) {
      m[g][o] = { tot50: n, "50tot100": n, "100tot200": 0, boven200: 0 };
    }
  }
  return m;
};

describe("legeCellen", () => {
  it("kijkt alleen naar de banden tot50 en 50tot100", () => {
    expect(legeCellen(vol(3))).toEqual([]);
  });

  it("noemt elke lege cel als gender/gelegenheid/band", () => {
    const m = vol(3);
    m.female.formal.tot50 = 0;
    m.male.party["50tot100"] = 0;
    expect(legeCellen(m)).toEqual(["male/party/50tot100", "female/formal/tot50"]);
  });

  it("telt een ontbrekende cel als leeg", () => {
    const m = vol(3);
    delete m.male.work;
    expect(legeCellen(m)).toContain("male/work/tot50");
  });
});

describe("isGroen", () => {
  it("is alleen groen als de matrix vol is en de persona-run exit 0 gaf", () => {
    expect(isGroen([], { overgeslagen: false, exit_code: 0 })).toBe(true);
    expect(isGroen(["male/work/tot50"], { overgeslagen: false, exit_code: 0 })).toBe(false);
    expect(isGroen([], { overgeslagen: false, exit_code: 1 })).toBe(false);
    expect(isGroen([], { overgeslagen: true })).toBe(false);
  });
});
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/poort.test.ts` en zie hem falen met `Failed to resolve import "../poort"`.
- [ ] Maak `scripts/keten/poort.ts`:

```ts
/** Pure besluitlogica van de feed-poort (spec 5.7). Geen netwerk. */
export type Matrix = Record<string, Record<string, Record<string, number>>>;

export interface PersonaOutput {
  overgeslagen: boolean;
  exit_code?: number;
  stdout?: string;
  stderr?: string;
}

export const GENDERS = ["male", "female"] as const;
export const OCCASIONS = ["work", "casual", "formal", "date", "travel", "sport", "party"] as const;
export const POORT_BANDEN = ["tot50", "50tot100"] as const;

export function legeCellen(matrix: Matrix, banden: readonly string[] = POORT_BANDEN): string[] {
  const leeg: string[] = [];
  for (const g of GENDERS) {
    for (const o of OCCASIONS) {
      for (const b of banden) {
        const n = matrix?.[g]?.[o]?.[b] ?? 0;
        if (n <= 0) leeg.push(`${g}/${o}/${b}`);
      }
    }
  }
  return leeg;
}

export function isGroen(leeg: string[], persona: PersonaOutput): boolean {
  if (leeg.length > 0) return false;
  if (persona.overgeslagen) return false;
  return persona.exit_code === 0;
}
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/poort.test.ts` en zie 4 tests slagen.
- [ ] Geef `persona-run.ts` de vlag `--retailer`. Controleer eerst dat het bestand de vorm uit plan 1 heeft: `grep -n 'rpc("get_kandidaten"' scripts/keten/persona-run.ts` geeft precies een regel, namelijk `const { data, error } = await client.rpc("get_kandidaten", params);`. Voeg dan direct na de regel

```ts
import {
  bereidKandidatenVoor,
  naarKandidatenParams,
  telCategorieAfwijkingen,
  type KandidaatRij,
} from "../../src/services/outfits/kandidaten";
```

dit toe:

```ts
import { leesVlag } from "./args";

// Feed-poort (spec 5.7): met --retailer draait het harnas op een enkele feed.
// null betekent alle retailers, precies zoals get_kandidaten dat verstaat.
const RETAILER: string | null = leesVlag(process.argv.slice(2), "retailer") || null;
```

en vervang in `haalKandidaten` de regel

```ts
  const { data, error } = await client.rpc("get_kandidaten", params);
```

door

```ts
  // KandidatenParams heeft acht vaste velden; p_retailer gaat er via spread naast.
  const { data, error } = await client.rpc("get_kandidaten", { ...params, p_retailer: RETAILER });
```

Controleer: `npx vite-node scripts/keten/persona-run.ts --retailer "H&M (NL)"` draait de vier persona's alleen op H&M (de kandidatentelling per persona is kleiner dan of gelijk aan die zonder vlag), en `npx vite-node scripts/keten/persona-run.ts --retailer "bestaat niet"; echo "exit=$?"` stopt met `Harnas gestopt: get_kandidaten faalde: Onbekende retailer: "bestaat niet" ...` en `exit=1`.

- [ ] Maak `scripts/keten/feed-poort.ts`:

```ts
/**
 * Feed-poort (spec 5.7): draait het persona-harnas voor een retailer, berekent
 * de dekkingsmatrix gender x gelegenheid x prijsband en schrijft het resultaat
 * naar feed_gates. Groen als de matrix in de banden tot50 en 50tot100 geen
 * lege cel heeft en persona-run exit code 0 gaf.
 *
 * Gebruik:
 *   npm run keten:poort                                        (STANDAARD_RETAILER)
 *   npm run keten:poort -- --retailer "H&M (NL)"
 *   npm run keten:poort -- --retailer "H&M (NL)" --zonder-persona   (alleen de matrix; nooit groen)
 *
 * Exit code 0 bij groen, 1 anders. Omgeving: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * en voor persona-run.ts (anon-sleutel, plan 1) VITE_SUPABASE_URL en VITE_SUPABASE_ANON_KEY.
 */
import { createClient } from "@supabase/supabase-js";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { heeftVlag, leesVlag } from "./args";
import { leesEnv } from "./env";
import { isGroen, legeCellen, type Matrix, type PersonaOutput } from "./poort";
import { STANDAARD_RETAILER } from "./retailers";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const MAX_LOG_TEKENS = 20_000;

const kort = (s: string | null | undefined) => (s ?? "").slice(-MAX_LOG_TEKENS);

function draaiPersonaRun(retailer: string): PersonaOutput {
  const run = spawnSync("npx", ["vite-node", "scripts/keten/persona-run.ts", "--retailer", retailer], {
    cwd: root,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { overgeslagen: false, exit_code: run.status ?? -1, stdout: kort(run.stdout), stderr: kort(run.stderr) };
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const retailer = leesVlag(argv, "retailer") || STANDAARD_RETAILER;
  const zonderPersona = heeftVlag(argv, "zonder-persona");

  const env = leesEnv(undefined, { anthropic: false });
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  const { data: matrix, error } = await supabase.rpc("keten_dekkingsmatrix", { p_retailer: retailer });
  if (error) throw new Error(`keten_dekkingsmatrix: ${error.message}`);
  const leeg = legeCellen(matrix as Matrix);

  const persona: PersonaOutput = zonderPersona ? { overgeslagen: true } : draaiPersonaRun(retailer);
  const groen = isGroen(leeg, persona);

  const { error: schrijfFout } = await supabase.from("feed_gates").insert({
    retailer,
    groen,
    matrix,
    persona_output: persona,
  });
  if (schrijfFout) throw new Error(`feed_gates: ${schrijfFout.message}`);

  console.log(`Feed-poort voor "${retailer}": ${groen ? "GROEN" : "ROOD"}`);
  console.log(`  lege cellen (tot50, 50tot100): ${leeg.length === 0 ? "geen" : leeg.join(", ")}`);
  console.log(`  persona-run: ${persona.overgeslagen ? "overgeslagen" : `exit ${persona.exit_code}`}`);
  if (!persona.overgeslagen && persona.exit_code !== 0) {
    console.log("  laatste regels van persona-run:");
    console.log((persona.stdout ?? "").split("\n").slice(-15).join("\n"));
  }
  process.exit(groen ? 0 : 1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
```

- [ ] Draai `npm run keten:poort -- --zonder-persona`. Verwacht: `Feed-poort voor "H&M (NL)": ROOD`, een regel met lege cellen of `geen`, `persona-run: overgeslagen`, exit code 1.
- [ ] Draai `npm run keten:poort -- --retailer "bestaat niet"`. Verwacht: `keten_dekkingsmatrix: Onbekende retailer: "bestaat niet" ...` en exit code 1, zonder rij in `feed_gates`.
- [ ] Draai `npm run keten:poort`. Verwacht: persona-run draait (enkele minuten), daarna GROEN of ROOD met reden. Controleer de rij: `supabase db query --linked "select retailer, run_at, groen, persona_output->>'exit_code' as exit, jsonb_pretty(matrix->'female'->'work') as female_work from feed_gates order by run_at desc limit 1" -o table`.
- [ ] Is de poort rood door lege cellen, noteer welke cellen leeg zijn in de commitboodschap. Dat is een feit over de H&M-feed, geen fout in dit plan; de spec zegt dat een feed dan nog niet meetelt.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add scripts/keten/poort.ts scripts/keten/feed-poort.ts scripts/keten/persona-run.ts scripts/keten/__tests__/poort.test.ts && git commit -m "feat(keten): feed-poort met dekkingsmatrix en persona-run per retailer"`

---

### Taak 11: import-daisycon-feed aanroepbaar door pg_cron

**Bestanden:**
- Wijzigen: `supabase/functions/import-daisycon-feed/index.ts` regels 495-527 en 565
- Test: deploy en twee curl-aanroepen

**Interfaces:**
- Gebruikt: `buildCorsHeaders(req)` uit `supabase/functions/_shared/cors.ts`; `processFeed(supabaseAdmin, feed, userId, campaignId)` (regel 364, bestaand; schrijft `products.retailer = programName` uit de feed, regel 427, en `products.updated_at = now()` per aanwezig product, regel 443).
- Levert: de functie accepteert naast een gebruikers-JWT ook `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`; dan is `triggered_by` in `daisycon_imports` null. Bijvangst: `corsHeaders` wordt nu echt aangemaakt. In het huidige bestand wordt `buildCorsHeaders` geïmporteerd maar nooit aangeroepen, terwijl `corsHeaders` overal gebruikt wordt; elke aanroep eindigt daardoor in een `ReferenceError`.

- [ ] Vervang regels 495-527 (van `Deno.serve(async (req) => {` tot en met de sluitende `}` van het `authError`-blok):

```ts
Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL"), serviceRoleKey);

    // pg_cron roept deze functie aan met de service role (zie migratie
    // 20260916100500_keten_cron.sql). Dan is er geen gebruiker; triggered_by
    // blijft null. Elke andere aanroep moet een geldige gebruikerssessie zijn.
    const token = authHeader.replace(/^Bearer\s+/i, "");
    let userId: string | null = null;
    if (token !== serviceRoleKey) {
      const userClient = createClient(
        Deno.env.get("SUPABASE_URL"),
        Deno.env.get("SUPABASE_ANON_KEY"),
        { global: { headers: { Authorization: authHeader } } },
      );
      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      userId = user.id;
    }
```

- [ ] Vervang op de regel die nu `const result = await processFeed(supabaseAdmin, feed, user.id, body.campaignId);` is (was regel 565) `user.id` door `userId`:

```ts
    const result = await processFeed(supabaseAdmin, feed, userId, body.campaignId);
```

- [ ] Controleer dat `corsHeaders` nergens meer buiten de handler wordt gebruikt: `grep -n "corsHeaders" supabase/functions/import-daisycon-feed/index.ts | head -3` toont als eerste treffer de regel `const corsHeaders = buildCorsHeaders(req);`.
- [ ] Deploy: `supabase functions deploy import-daisycon-feed`. Verwacht: `Deployed Functions on project ...`.
- [ ] Test zonder token: `curl -s -o /dev/null -w "%{http_code}\n" -X POST "$SUPABASE_URL/functions/v1/import-daisycon-feed" -H "Content-Type: application/json" -d '{}'` geeft `401`.
- [ ] Test met de service role en een lege feed (raakt de database niet omdat er geen programma's in zitten):

```bash
curl -s -X POST "$SUPABASE_URL/functions/v1/import-daisycon-feed" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"feed": {"datafeed": {"programs": []}}}'
```

Verwacht: status 400 met de bestaande foutmelding uit de functie die begint met `{"error":"Ongeldige feed structuur`. Dat bewijst dat de service role langs de auth-controle komt en de functie niet meer crasht op `corsHeaders`.

- [ ] Test dat de admin-pagina nog werkt: log in als admin op de site, ga naar de affiliate-campagnes-pagina en klik op synchroniseren bij een campagne; de toast `... producten gesynchroniseerd` verschijnt.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add supabase/functions/import-daisycon-feed/index.ts && git commit -m "fix(import-daisycon-feed): corsHeaders bestond niet; service-role-aanroep voor pg_cron"`

---

### Taak 12: Cron voor feed-import, vulling van nieuwe producten, voorraad en linkcontrole

**Bestanden:**
- Aanmaken: `supabase/migrations/20260916100500_keten_cron.sql`
- Test: `scripts/keten/__tests__/migraties.test.ts` en `migraties.live.test.ts` (uitbreiden), live controle

**Interfaces:**
- Gebruikt: edge functions `import-daisycon-feed` (taak 11, body `{ feedUrl, campaignId }`) en `validate-product-links` (bestaand, accepteert `?limit=` tot 200, constante `MAX_PRODUCTS_PER_RUN`); tabellen `affiliate_campaigns(id, name, feed_url, is_active, last_sync_log_id)` en `daisycon_imports(id, imported_at, status, inserted_count)`; `products.campaign_id`, `products.updated_at`, `products.in_stock`; `normaliseer_productnaam(text)` uit plan 1; `is_current_user_admin()`; Vault-secrets `keten_project_url` en `keten_service_key`.
- Levert:
  - tabel `keten_cron_log(id bigint pk, job text, run_at timestamptz, resultaat jsonb)`; admins lezen, alleen de functies schrijven
  - `keten_roep_edge(p_functie text, p_body jsonb default '{}', p_query text default '') returns bigint` (het request-id van pg_net)
  - `keten_wekelijkse_import() returns integer` (aantal aangeroepen campagnes; logt naar `keten_cron_log`)
  - `keten_vul_nieuwe_producten(p_retailer text default null) returns table (aantal_nieuw bigint, aantal_feedvelden_ververst bigint)`: geeft producten zonder rij in `product_attributes` een rij (dedupe op naam naar een bestaande canonieke rij als die er is), en ververst `price`, `in_stock`, `retailer` en `price_band` uit `products` voor elke rij van de retailer, canoniek of niet (dit is het ververswerk dat `vul_product_attributes()` deed vóór taak 5, zie Globale randvoorwaarden); raakt bestaande `is_fashion`, `category`, `gender`, `canonical_id` en tags nooit aan
  - `keten_vul_na_import() returns jsonb`: wacht tot elke actieve campagne een geslaagde import jonger dan twaalf uur heeft, zet dan verdwenen producten op `in_stock = false`, roept `keten_vul_nieuwe_producten()` aan en logt het resultaat; idempotent binnen een importronde
  - cron-jobs `keten-feed-import-wekelijks` (zondag 03:00 UTC), `keten-vul-na-import` (zondag elk uur 05:00 tot en met 11:00 UTC), `keten-links-elke-10-min` (elke tien minuten, 200 producten per keer)

Wat de spec openlaat en hier is besloten:
- De vulstap overschrijft niets van de classificatie of de tags. Plan 1's `vul_product_attributes()` doet `on conflict do update` op `is_fashion`, `category`, `gender` en `canonical_id` en zou elke zondag de tags uit taak 5 en de dedupe uit taak 8 terugdraaien zonder dat `tagger_version` verandert. Daarom een aparte functie die nieuwe rijen alleen invoegt.
- `price`, `in_stock` en `retailer` op `product_attributes` zijn sinds plan 1 taak 3 (migratie `20260914120400`, controller-ruling) gedenormaliseerd vanuit `products`; `vul_product_attributes()` ververste ze tot dan toe bij elke run. Omdat die functie na taak 5 nooit meer draait (Globale randvoorwaarden), ververst `keten_vul_nieuwe_producten()` deze drie kolommen voortaan zelf, samen met `price_band`, voor elke rij van de retailer, canoniek of niet. Alleen die vier kolommen staan in de update-stap; `canonical_id` blijft erbuiten (de volledige afweging tussen alleen verversen en de hele functie opnieuw draaien staat bij "Wat de spec openlaat en hier is besloten" bovenaan dit plan).
- Een nieuw product dat op retailer, merk en genormaliseerde naam gelijk is aan een bestaande rij, wijst naar de canonieke rij van die groep en neemt het canoniek-zijn niet over, ook niet als het goedkoper is. De bestaande rij is getagd, de nieuwe niet, en `get_kandidaten` ziet sinds taak 7 alleen getagde canonieke producten. Bij een her-tagging (nieuwe `TAGGER_VERSION`) kan de dedupe uit taak 8 de rangorde opnieuw bepalen.
- Nieuwe rijen krijgen geen `classifier_version` en geen tags; dat doen twee handmatige runs na de zondagse import, in deze volgorde: `npm run keten:classificeer -- --retailer "<naam>"` (plan 1 taak 2), `npm run keten:tag -- --retailer "<naam>" --ja`, daarna `embed-products.py --retailer "<naam>"` (taak 6) en `select keten_dedupe_embedding('<naam>')` (taak 8). Tot die tijd zijn de nieuwe producten voor de engine onzichtbaar; dat is bewust, een ongeclassificeerd product met een ruwe feedcategorie hoort niet in een outfit. Automatisch taggen vanuit cron staat niet in dit plan: het kost geld per run en de kostenschatting met `--ja` is een bewuste stap (scope b).
- Afhankelijkheid tussen de jobs is een controle op data, geen geraden tijdsoffset: de import loopt via `pg_net` (fire-and-forget), dus de vulstap kijkt in `daisycon_imports` of de laatste import per actieve campagne `success` is en jonger dan twaalf uur. Anders schrijft hij `status: wacht` in het log en probeert het een uur later opnieuw.
- Voorraad (spec 9, "cron voor feed en voorraad"): de import zet `in_stock` alleen voor producten die in de feed staan. Producten met `campaign_id` van een campagne waarvan de laatste import geslaagd is en `inserted_count > 0`, en met `updated_at` ouder dan het begin van die import, stonden niet in de feed en gaan op `in_stock = false`. Dit is de enige plek in dit plan die `products` bijwerkt.
- Linkcontrole: 200 per aanroep is de limiet van de bestaande functie; elke tien minuten geeft 28.800 controles per dag en een volledige ronde in ongeveer tien dagen. De functie kiest zelf de producten die het langst niet gecontroleerd zijn.

- [ ] Zet de twee secrets in de Vault. Dit gebeurt in de SQL-editor van het Supabase-dashboard, nooit in een migratie of in de repo:

```sql
select vault.create_secret('https://<project-ref>.supabase.co', 'keten_project_url');
select vault.create_secret('<service_role_key>', 'keten_service_key');
```

Controleer: `supabase db query --linked "select name from vault.decrypted_secrets where name like 'keten_%'" -o table` geeft twee rijen.

- [ ] Breid de contract-test uit. Voeg onderaan `scripts/keten/__tests__/migraties.test.ts` toe:

```ts
describe("20260916100500_keten_cron", () => {
  const sql = lees("20260916100500_keten_cron.sql");

  it("schakelt pg_cron en pg_net in en roept edge functions via de vault aan", () => {
    expect(sql).toContain("create extension if not exists pg_cron");
    expect(sql).toContain("create extension if not exists pg_net");
    expect(sql).toContain("function keten_roep_edge(");
    expect(sql).toContain("vault.decrypted_secrets");
    expect(sql).not.toMatch(/eyj[a-z0-9]{20,}/i);
  });

  it("vult alleen nieuwe producten, controleert de import vooraf en logt elke run", () => {
    expect(sql).toContain("create table if not exists keten_cron_log");
    expect(sql).toContain("using (is_current_user_admin())");
    expect(sql).toContain("function keten_vul_nieuwe_producten(");
    expect(sql).toContain("not exists (select 1 from product_attributes pa where pa.product_id = p.id)");
    expect(sql).toContain("on conflict (product_id) do nothing");
    expect(sql).not.toContain("vul_product_attributes(");
    expect(sql).toContain("function keten_vul_na_import(");
    expect(sql).toContain("di.status <> 'success'");
    expect(sql).toContain("set in_stock = false");
  });

  it("ververst price, in_stock, retailer en price_band voor elke rij van de retailer, zonder canonical_id aan te raken", () => {
    expect(sql).toContain(
      "insert into product_attributes (product_id, canonical_id, is_fashion, category, gender, price_band, price, in_stock, retailer)"
    );
    expect(sql).toContain("returns table (aantal_nieuw bigint, aantal_feedvelden_ververst bigint)");
    expect(sql).toContain("set price = b.price,");
    expect(sql).toContain("in_stock = b.in_stock,");
    expect(sql).toContain("retailer = b.retailer,");
    expect(sql).not.toContain("canonical_id = b.");
    expect(sql).toContain("v_vul.aantal_feedvelden_ververst");
    expect(sql).toContain("'feedvelden_ververst'");
  });

  it("plant de drie jobs en maakt ze herhaalbaar", () => {
    for (const job of ["keten-feed-import-wekelijks", "keten-vul-na-import", "keten-links-elke-10-min"]) {
      expect(sql).toContain(`cron.unschedule('${job}')`);
      expect(sql).toContain(`cron.schedule('${job}'`);
    }
    expect(sql).toContain("'0 3 * * 0'");
    expect(sql).toContain("'0 5-11 * * 0'");
    expect(sql).toContain("'*/10 * * * *'");
    expect(sql).toContain("validate-product-links");
    expect(sql).toContain("keten_vul_na_import()");
  });
});
```

- [ ] Breid de live test uit. Voeg onderaan `scripts/keten/__tests__/migraties.live.test.ts` toe:

```ts
describe.skipIf(!url || !serviceKey)("20260916100500_keten_cron (live)", () => {
  it("keten_vul_nieuwe_producten weigert een onbekende retailer en is idempotent op een retailer zonder nieuwe producten of wijzigingen", async () => {
    const fout = await service().rpc("keten_vul_nieuwe_producten", { p_retailer: "bestaat niet" });
    expect(fout.error?.message ?? "").toContain("Onbekende retailer");
    const een = await service().rpc("keten_vul_nieuwe_producten", { p_retailer: STANDAARD_RETAILER });
    expect(een.error).toBeNull();
    const twee = await service().rpc("keten_vul_nieuwe_producten", { p_retailer: STANDAARD_RETAILER });
    expect(twee.error).toBeNull();
    const rij = ((twee.data ?? []) as Array<{ aantal_nieuw: number; aantal_feedvelden_ververst: number }>)[0];
    expect(Number(rij.aantal_nieuw)).toBe(0);
    expect(Number(rij.aantal_feedvelden_ververst)).toBe(0);
  });

  it("keten_vul_nieuwe_producten ververst price, in_stock en retailer naar de huidige stand van products", async () => {
    const vul = await service().rpc("keten_vul_nieuwe_producten", { p_retailer: STANDAARD_RETAILER });
    expect(vul.error).toBeNull();

    const attrs = await service()
      .from("product_attributes")
      .select("product_id, price, in_stock, retailer")
      .eq("retailer", STANDAARD_RETAILER)
      .limit(50);
    expect(attrs.error).toBeNull();
    const rijen = (attrs.data ?? []) as Array<{
      product_id: string; price: number | null; in_stock: boolean | null; retailer: string | null;
    }>;
    expect(rijen.length).toBeGreaterThan(0);

    const ids = rijen.map((r) => r.product_id);
    const producten = await service().from("products").select("id, price, in_stock, retailer").in("id", ids);
    expect(producten.error).toBeNull();
    const perId = new Map((producten.data ?? []).map((p: any) => [p.id, p]));

    for (const r of rijen) {
      const p = perId.get(r.product_id);
      expect(p).toBeDefined();
      expect(Number(r.price)).toBe(Number(p.price));
      expect(r.in_stock).toBe(p.in_stock);
      expect(r.retailer).toBe(p.retailer);
    }
  });

  it("keten_cron_log is leesbaar met de service role en leeg voor de anon-sleutel", async () => {
    const svc = await service().from("keten_cron_log").select("job").limit(1);
    expect(svc.error).toBeNull();
    if (anonKey) {
      const lezen = await anon().from("keten_cron_log").select("job").limit(1);
      expect(lezen.error).toBeNull();
      expect(lezen.data).toEqual([]);
    }
  });
});
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie de nieuwe tests falen met `ENOENT`.
- [ ] Maak `supabase/migrations/20260916100500_keten_cron.sql`:

```sql
/*
  # Keten plan 2: cron voor feed-import, vulling van nieuwe producten,
  # voorraad en linkcontrole

  ## Probleem
  De feed wordt alleen met de hand geimporteerd, nieuwe producten krijgen
  geen rij in product_attributes, verdwenen producten blijven "op voorraad"
  en links worden niet gecontroleerd. De vulfunctie uit plan 1 kan hier niet
  voor dienen: die overschrijft bij elke run is_fashion, category, gender en
  canonical_id en zou de LLM-tags en de embedding-dedupe terugdraaien.

  Diezelfde vulfunctie ververst sinds plan 1 taak 3 (migratie 20260914120400,
  controller-ruling) ook price, in_stock en retailer op product_attributes,
  nodig omdat get_kandidaten anders via products vastliep op de statement-
  timeout. Zonder vervanging zouden die drie kolommen na taak 5 permanent
  bevriezen op de stand van vlak voor taak 5, terwijl products.in_stock via
  de voorraadstap hieronder wel doorloopt: kandidaten zouden dan producten
  tonen die niet meer op voorraad zijn of een andere prijs hebben.

  ## Wat deze migratie doet
  - Schakelt pg_cron en pg_net in.
  - keten_cron_log: een regel per run van de keten-jobs (admins lezen).
  - keten_roep_edge(functie, body, query): POST naar een edge function met de
    service role. URL en sleutel komen uit de Vault (secrets keten_project_url
    en keten_service_key, aangemaakt in de SQL-editor, niet in deze migratie).
    Zonder Authorization-header antwoordt de gateway 401 terwijl pg_cron
    "succes" meldt; het antwoord staat in net._http_response.
  - keten_wekelijkse_import(): roept import-daisycon-feed aan voor elke actieve
    campagne in affiliate_campaigns (feedUrl + campaignId, zelfde payload als
    de admin-pagina). Fire-and-forget via pg_net.
  - keten_vul_nieuwe_producten(p_retailer): geeft producten zonder rij in
    product_attributes een rij, met dezelfde heuristiek als plan 1 voor
    is_fashion, category, gender en price_band, en dedupe op naam naar een
    bestaande canonieke rij als die er is. Ververst daarnaast price,
    in_stock, retailer en price_band uit products, voor elke rij van de
    retailer, canoniek of niet: dat ververswerk deed tot en met plan 1 taak 3
    de vulfunctie uit plan 1 (migratie 20260914120400), en die functie draait
    in dit plan nooit meer (Globale randvoorwaarden). canonical_id staat niet
    in die ververs-stap; de dedupe verschuift alleen via taak 8
    (keten_dedupe_embedding) of een nieuwe classificeer/tag-ronde. Raakt
    bestaande tags en classificatie nooit aan.
  - keten_vul_na_import(): controleert eerst per actieve campagne of de laatste
    import (affiliate_campaigns.last_sync_log_id -> daisycon_imports) status
    'success' heeft en jonger dan twaalf uur is. Zo niet: log 'wacht' en stop.
    Anders: producten van die campagne die niet in de import zaten
    (updated_at ouder dan het begin van de import) op in_stock = false, dan
    keten_vul_nieuwe_producten(). Idempotent binnen een importronde.
  - Drie jobs (tijden in UTC):
      keten-feed-import-wekelijks  zondag 03:00        import van alle actieve feeds
      keten-vul-na-import          zondag 05:00-11:00  elk uur, tot hij 'klaar' logt
      keten-links-elke-10-min      elke 10 minuten     validate-product-links, 200 per keer
    unschedule vooraf maakt de migratie herhaalbaar.

  ## Terugdraaien
  select cron.unschedule('keten-feed-import-wekelijks');
  select cron.unschedule('keten-vul-na-import');
  select cron.unschedule('keten-links-elke-10-min');
  drop function if exists keten_vul_na_import();
  drop function if exists keten_vul_nieuwe_producten(text);
  drop function if exists keten_wekelijkse_import();
  drop function if exists keten_roep_edge(text, jsonb, text);
  drop table if exists keten_cron_log;
*/

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create table if not exists keten_cron_log (
  id bigint generated always as identity primary key,
  job text not null,
  run_at timestamptz not null default now(),
  resultaat jsonb not null
);

create index if not exists idx_keten_cron_log_job_run_at
  on keten_cron_log (job, run_at desc);

alter table keten_cron_log enable row level security;

drop policy if exists "Admins lezen keten_cron_log" on keten_cron_log;
create policy "Admins lezen keten_cron_log"
  on keten_cron_log for select
  to authenticated
  using (is_current_user_admin());

create or replace function keten_roep_edge(
  p_functie text,
  p_body jsonb default '{}'::jsonb,
  p_query text default ''
)
returns bigint
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  v_url text;
  v_key text;
  v_id bigint;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'keten_project_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'keten_service_key';
  if v_url is null or v_key is null then
    raise exception 'Vault-secrets keten_project_url en keten_service_key ontbreken';
  end if;

  select net.http_post(
    url := rtrim(v_url, '/') || '/functions/v1/' || p_functie || p_query,
    body := p_body,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    timeout_milliseconds := 300000
  ) into v_id;

  return v_id;
end;
$$;

revoke all on function keten_roep_edge(text, jsonb, text) from public, anon, authenticated;

create or replace function keten_wekelijkse_import()
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  c record;
  v_aantal integer := 0;
  v_namen text[] := '{}';
begin
  for c in
    select id, name, feed_url from affiliate_campaigns where is_active order by name
  loop
    perform keten_roep_edge(
      'import-daisycon-feed',
      jsonb_build_object('feedUrl', c.feed_url, 'campaignId', c.id)
    );
    v_aantal := v_aantal + 1;
    v_namen := v_namen || c.name;
  end loop;

  insert into keten_cron_log (job, resultaat)
  values ('keten-feed-import-wekelijks', jsonb_build_object('campagnes', v_aantal, 'namen', to_jsonb(v_namen)));

  return v_aantal;
end;
$$;

revoke all on function keten_wekelijkse_import() from public, anon, authenticated;

-- Alleen invoegen wat nog geen rij heeft. Zelfde heuristiek als plan 1 voor
-- is_fashion, category, gender en price_band; dedupe op naam: bestaat er al
-- een rij met dezelfde retailer, merk en genormaliseerde naam, dan wijst de
-- nieuwe rij naar de canonieke rij van die groep. Anders wint binnen de
-- nieuwe rijen de goedkoopste in-stock variant.
--
-- price, in_stock en retailer zijn sinds migratie 20260914120400 (plan 1
-- taak 3, controller-ruling) gedenormaliseerd naar product_attributes:
-- get_kandidaten liep anders via een join naar products vast op de 8
-- seconden statement-timeout van de browser-route. Die migratie liet de
-- vulfunctie uit plan 1 die drie kolommen bij elke run verversen; omdat die
-- functie in dit plan nooit meer draait (Globale randvoorwaarden), doet
-- deze functie dat verversen voortaan zelf, voor elke rij van de retailer,
-- canoniek of niet, ongeacht classifier_version of tagger_version. Dit zijn
-- feed-eigenschappen, geen classificatie of tag: canonical_id, gender,
-- category, is_fashion en alle tag-kolommen worden in die stap niet
-- aangeraakt.
create or replace function keten_vul_nieuwe_producten(p_retailer text default null)
returns table (aantal_nieuw bigint, aantal_feedvelden_ververst bigint)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  niet_kleding constant text :=
    '\m(vaas|vazen|lamp|lampen|servies|bord|borden|beker|mok|mokken|kussen|kussens|kaars|kaarsen|poster|handdoek|handdoeken|deken|plaid|fotolijst|spiegel|speelgoed|knuffel|puzzel|sticker|telefoonhoesje|supporter|supporters|fanshirt|thuisshirt|uitshirt|matchworn|hondenjas|hondentuig|halsband|kattenmand)\M';
  v_nieuw bigint;
  v_ververst bigint;
begin
  perform keten_controleer_retailer(p_retailer);

  with nieuwe_rijen as (
    select
      p.id,
      p.retailer,
      lower(coalesce(p.brand, '')) as merk,
      normaliseer_productnaam(p.name) as naam,
      p.in_stock,
      p.price,
      lower(coalesce(p.category, '')) as cat,
      lower(coalesce(p.gender, 'unisex')) as gen,
      coalesce(p.is_kids, false) as is_kids,
      p.name as ruwe_naam
    from products p
    where (p_retailer is null or p.retailer = p_retailer)
      and not exists (select 1 from product_attributes pa where pa.product_id = p.id)
  ),
  bestaand as (
    select distinct on (x.retailer, lower(coalesce(x.brand, '')), normaliseer_productnaam(x.name))
      x.retailer,
      lower(coalesce(x.brand, '')) as merk,
      normaliseer_productnaam(x.name) as naam,
      pa.canonical_id
    from product_attributes pa
    join products x on x.id = pa.product_id
    where x.retailer in (select distinct n.retailer from nieuwe_rijen n where n.retailer is not null)
    order by x.retailer, lower(coalesce(x.brand, '')), normaliseer_productnaam(x.name),
             (pa.canonical_id = pa.product_id) desc, x.id
  ),
  gerangschikt as (
    select
      n.*,
      first_value(n.id) over (
        partition by n.retailer, n.merk, n.naam
        order by (n.in_stock is true) desc, n.price asc, n.id asc
      ) as groep_canoniek
    from nieuwe_rijen n
  )
  insert into product_attributes (product_id, canonical_id, is_fashion, category, gender, price_band, price, in_stock, retailer)
  select
    g.id,
    coalesce(b.canonical_id, g.groep_canoniek),
    (
      g.cat in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory')
      and g.is_kids = false
      and g.ruwe_naam !~* niet_kleding
    ),
    case
      when g.cat in ('top', 'bottom', 'footwear', 'outerwear', 'dress', 'accessory') then g.cat
      else null
    end,
    case when g.gen in ('male', 'female') then g.gen else 'unisex' end,
    case
      when g.price < 50 then 'tot50'
      when g.price < 100 then '50tot100'
      when g.price < 200 then '100tot200'
      else 'boven200'
    end,
    g.price,
    g.in_stock,
    g.retailer
  from gerangschikt g
  left join bestaand b
    on b.retailer is not distinct from g.retailer
   and b.merk = g.merk
   and b.naam = g.naam
  on conflict (product_id) do nothing;
  get diagnostics v_nieuw = row_count;

  -- price, in_stock, retailer en price_band komen uit products en zijn
  -- nooit een tag: altijd verversen, voor elke rij van deze retailer,
  -- canoniek of niet, net als de vulfunctie uit plan 1 deed vóór taak 5.
  -- canonical_id staat hier niet in de set-lijst: de dedupe verschuift
  -- nooit door deze stap, alleen door taak 8 (keten_dedupe_embedding) of
  -- een nieuwe classificeer/tag-ronde (zie "Wat de spec openlaat" bovenaan
  -- dit plan voor de afweging).
  update product_attributes pa
  set price = b.price,
      in_stock = b.in_stock,
      retailer = b.retailer,
      price_band = b.band
  from (
    select p.id, p.price, p.in_stock, p.retailer,
      case
        when p.price < 50 then 'tot50'
        when p.price < 100 then '50tot100'
        when p.price < 200 then '100tot200'
        else 'boven200'
      end as band
    from products p
    where (p_retailer is null or p.retailer = p_retailer)
  ) b
  where pa.product_id = b.id
    and (
      pa.price is distinct from b.price
      or pa.in_stock is distinct from b.in_stock
      or pa.retailer is distinct from b.retailer
      or pa.price_band is distinct from b.band
    );
  get diagnostics v_ververst = row_count;

  return query select v_nieuw, v_ververst;
end;
$$;

revoke all on function keten_vul_nieuwe_producten(text) from public, anon, authenticated;

create or replace function keten_vul_na_import()
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_wacht text[];
  v_laatste timestamptz;
  v_verdwenen bigint := 0;
  v_stap bigint;
  v_vul record;
  v_uit jsonb;
  c record;
begin
  -- 1. Elke actieve campagne moet een geslaagde import van de laatste 12 uur hebben.
  select coalesce(array_agg(ac.name order by ac.name), '{}'), max(di.imported_at)
  into v_wacht, v_laatste
  from affiliate_campaigns ac
  left join daisycon_imports di on di.id = ac.last_sync_log_id
  where ac.is_active
    and (di.id is null or di.status <> 'success' or di.imported_at < now() - interval '12 hours');

  if cardinality(v_wacht) > 0 then
    v_uit := jsonb_build_object('status', 'wacht', 'campagnes_zonder_verse_import', to_jsonb(v_wacht));
    insert into keten_cron_log (job, resultaat) values ('keten-vul-na-import', v_uit);
    return v_uit;
  end if;

  -- 2. Al gedaan voor deze importronde? Dan niets doen (de job loopt elk uur).
  select max(di.imported_at) into v_laatste
  from affiliate_campaigns ac
  join daisycon_imports di on di.id = ac.last_sync_log_id
  where ac.is_active;

  if exists (
    select 1 from keten_cron_log l
    where l.job = 'keten-vul-na-import'
      and l.resultaat->>'status' = 'klaar'
      and l.run_at > coalesce(v_laatste, '-infinity'::timestamptz)
  ) then
    return jsonb_build_object('status', 'al_gedaan');
  end if;

  -- 3. Voorraad: producten van een campagne die niet in de laatste geslaagde
  --    import zaten (updated_at ouder dan het begin van die import) zijn weg.
  for c in
    select ac.id as campaign_id, di.imported_at
    from affiliate_campaigns ac
    join daisycon_imports di on di.id = ac.last_sync_log_id
    where ac.is_active and di.status = 'success' and di.inserted_count > 0
  loop
    update products p
    set in_stock = false
    where p.campaign_id = c.campaign_id
      and p.in_stock
      and p.updated_at < c.imported_at;
    get diagnostics v_stap = row_count;
    v_verdwenen := v_verdwenen + v_stap;
  end loop;

  -- 4. Nieuwe producten een rij geven, en price, in_stock, retailer en
  --    price_band verversen voor alle bestaande rijen van elke retailer;
  --    tags, classificatie en canonical_id blijven onaangeroerd. De
  --    voorraadstap hierboven staat al in products voordat deze stap
  --    product_attributes ernaar bijwerkt.
  select * into v_vul from keten_vul_nieuwe_producten(null);

  v_uit := jsonb_build_object(
    'status', 'klaar',
    'nieuw', v_vul.aantal_nieuw,
    'feedvelden_ververst', v_vul.aantal_feedvelden_ververst,
    'uit_voorraad', v_verdwenen
  );
  insert into keten_cron_log (job, resultaat) values ('keten-vul-na-import', v_uit);
  return v_uit;
end;
$$;

revoke all on function keten_vul_na_import() from public, anon, authenticated;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'keten-feed-import-wekelijks') then
    perform cron.unschedule('keten-feed-import-wekelijks');
  end if;
  if exists (select 1 from cron.job where jobname = 'keten-vul-na-import') then
    perform cron.unschedule('keten-vul-na-import');
  end if;
  if exists (select 1 from cron.job where jobname = 'keten-links-elke-10-min') then
    perform cron.unschedule('keten-links-elke-10-min');
  end if;
end;
$$;

select cron.schedule('keten-feed-import-wekelijks', '0 3 * * 0', $$select keten_wekelijkse_import()$$);
select cron.schedule('keten-vul-na-import', '0 5-11 * * 0', $$select keten_vul_na_import()$$);
select cron.schedule('keten-links-elke-10-min', '*/10 * * * *', $$select keten_roep_edge('validate-product-links', '{}'::jsonb, '?limit=200')$$);
```

- [ ] Draai `npx vitest run scripts/keten/__tests__/migraties.test.ts` en zie alles slagen. Zet live: `supabase db query --linked -f supabase/migrations/20260916100500_keten_cron.sql`. Faalt hij op `extension "pg_net" is not available`, schakel pg_net dan in via het dashboard (Database, Extensions) en draai het bestand opnieuw. Draai de live test en zie 16 tests slagen.
- [ ] Controleer de jobs: `supabase db query --linked "select jobname, schedule, command from cron.job where jobname like 'keten-%' order by jobname" -o table` geeft drie rijen.
- [ ] Test de edge-aanroep handmatig, klein:

```bash
supabase db query --linked "select keten_roep_edge('validate-product-links', '{}'::jsonb, '?limit=5') as request_id" -o table
sleep 20
supabase db query --linked "select id, status_code, left(content::text, 160) as antwoord from net._http_response order by id desc limit 1" -o table
```

Verwacht: `status_code 200` en een antwoord dat begint met `{"message":"Link validation complete","checked":5`. Een `401` betekent dat de Vault-sleutel niet klopt; een `404` dat `keten_project_url` verkeerd is.

- [ ] Test de wachtstand van de vulstap voordat er een verse import is: `supabase db query --linked "select keten_vul_na_import()" -o table` geeft `{"status": "wacht", "campagnes_zonder_verse_import": [...]}` met de namen van de actieve campagnes (tenzij je vandaag al met de hand hebt geimporteerd; dan gaat hij direct door naar de volgende stap).
- [ ] Test de wekelijkse import handmatig: `supabase db query --linked "select keten_wekelijkse_import()" -o table` geeft het aantal actieve campagnes. Na enkele minuten: `supabase db query --linked "select program_name, status, inserted_count, triggered_by, imported_at from daisycon_imports order by imported_at desc limit 3" -o table` toont nieuwe rijen met `triggered_by` null en status `success` (of `running` als de import nog loopt; wacht dan).
- [ ] Test de vulstap na de import: `supabase db query --linked "select keten_vul_na_import()" -o table` geeft `{"status": "klaar", "nieuw": n, "feedvelden_ververst": n, "uit_voorraad": n}`. Loopt hij op de tijdslimiet, gebruik de uitwijk uit taak 6 met `select keten_vul_na_import()` als statement. Nog een keer aanroepen geeft `{"status": "al_gedaan"}`. Daarna:

```bash
supabase db query --linked "select count(*) as zonder_rij from products p left join product_attributes pa on pa.product_id = p.id where pa.product_id is null" -o table
supabase db query --linked "select count(*) as tags_intact from product_attributes where tagger_version is not null" -o table
supabase db query --linked "select count(*) as afwijkend from product_attributes pa join products p on p.id = pa.product_id where pa.price is distinct from p.price or pa.in_stock is distinct from p.in_stock or pa.retailer is distinct from p.retailer" -o table
supabase db query --linked "select job, run_at, resultaat from keten_cron_log order by run_at desc limit 5" -o table
```

Verwacht: `zonder_rij` is 0; `tags_intact` is gelijk aan het aantal uit de controle in taak 5 (geen tag verloren); `afwijkend` is 0 (`price`, `in_stock` en `retailer` in `product_attributes` zijn gelijk aan `products`, voor elke rij, niet alleen de canonieke); het log toont de runs. Nieuwe producten hebben `classifier_version` en `tagger_version` null; ze komen pas in `get_kandidaten` na `npm run keten:classificeer -- --retailer "H&M (NL)"` (plan 1) gevolgd door `npm run keten:tag -- --ja`, en daarna `embed-products.py` en `keten_dedupe_embedding` (zie "Wat de spec openlaat" hierboven). Controleer dat de volgorde klopt: `supabase db query --linked "select count(*) as nieuw_zonder_classifier from product_attributes where classifier_version is null and tagger_version is null" -o table` geeft het aantal nieuwe rijen, en `keten_tag_kandidaten('H&M (NL)', 'tekst', 'haiku-4.5-v1', 5, null)` geeft nul rijen zolang de classificeer-run niet gedraaid is.

- [ ] Controleer de volgende ochtend: `supabase db query --linked "select jobname, status, return_message, start_time from cron.job_run_details where jobname like 'keten-%' order by start_time desc limit 10" -o table` toont `succeeded` voor `keten-links-elke-10-min` (meerdere keren per uur) en na de eerste zondag ook voor de andere twee. `supabase db query --linked "select count(*) filter (where link_last_checked_at > now() - interval '1 day') as vandaag_gecontroleerd from products" -o table` ligt na een volle dag rond 28.000.
- [ ] Poorten: `npx tsc --noEmit && npx vitest run && npx vite build && npm run design:check:ci`.
- [ ] Commit: `git add supabase/migrations/20260916100500_keten_cron.sql scripts/keten/__tests__/migraties.test.ts scripts/keten/__tests__/migraties.live.test.ts && git commit -m "feat(keten): wekelijkse feed-import, vulling van nieuwe producten, voorraad en linkcontrole via pg_cron"`

---

## Zelfcontrole

| Spec-eis | Taak |
|---|---|
| 5.1 tag-kolommen formality, occasions, silhouette, color_temp, lightness, pattern, shoe_type, colors, materials, seasons, confidence, tagger_version, embedding vector(512), tagged_at | Taak 2 |
| 5.1 indexen canonical_id, (gender, category, price_band), GIN op occasions, ivfflat op embedding | Taak 2 (eerste drie), taak 8 (ivfflat, na de embed-run) |
| 5.1 RLS: lezen voor iedereen, schrijven alleen service role (tabel uit plan 1; de nieuwe RPC's zijn alleen voor de service role) | Taak 2, 6, 8, 12 |
| 5.1 tagger krijgt naam, merk, beschrijving, prijs, retailer en ruwe categorie; foto alleen bij confidence < 0.6 in een tweede ronde | Taak 2 (RPC-selectie), 3 (prompt), 5 (`--met-foto`) |
| 5.1 uitvoer strikt volgens schema, structured output, een product per verzoek, Batch API | Taak 3 (`TAG_SCHEMA`, `bouwVerzoek`), 5 |
| 5.1 idempotent: dezelfde tagger_version wordt overgeslagen; tags worden door geen enkele job overschreven | Taak 2 (RPC), 5, 12 (`keten_vul_nieuwe_producten` voegt nieuwe rijen alleen in en ververst op bestaande rijen alleen de feed-velden price, in_stock, retailer en price_band; tags en classificatie blijven ongemoeid) |
| `price`, `in_stock` en `retailer` op `product_attributes` blijven na elke feed-import gelijk aan `products`; `canonical_id` verschuift niet door deze ververs-stap (bevinding tijdens uitvoering plan 1 taak 3, migratie `20260914120400`) | Globale randvoorwaarden, "Wat de spec openlaat en hier is besloten", taak 12 (`keten_vul_nieuwe_producten`, contract- en live-test, controle-query `afwijkend`) |
| 5.1 `category` een van de zes waarden; eigenaar blijft de classifier uit plan 1 (aanname, expliciet benoemd: de tagger levert `category` maar `keten_schrijf_tags` schrijft hem niet; `is_fashion` alleen omlaag; alleen geclassificeerde rijen worden getagd) | Globale randvoorwaarden, taak 2 (contract-test: `classifier_version is not null` aanwezig, `category = case` en `category = r->>` afwezig), 12 (volgorde classificeer, tag, embed, dedupe na de import) |
| 5.3 alleen getagde rijen in `get_kandidaten` (aanname, expliciet benoemd) | Taak 7 (`tagger_version is not null`, contract-test) |
| Scope (b): model claude-haiku-4-5-20251001, tagger_version haiku-4.5-v1 met confidence, batch-id's in gitignored `.batches.json`, hervatbaar, kosten printen voor de start, sleutels alleen uit de omgeving | Taak 1, 3, 4, 5 |
| 5.1 embeddings via FashionCLIP, hergebruik van scripts/visual-embeddings/embed_products.py, in batches naar product_attributes.embedding | Taak 6 |
| 5.1 dedupe ook bij embedding cosine >= 0.999, goedkoopste in-stock variant canoniek (aannames: zelfde retailer, geen gender/category-eis, placeholder-beveiliging; expliciet benoemd) | Taak 8 |
| 5.3 get_kandidaten score 0.5 as-overeenkomst (gewogen met confidence) + 0.3 gelegenheid-overlap + 0.2 max cosine met liked; top p_per_category per categorie; deterministisch op product_id; alleen canoniek, is_fashion, in_stock, gender, budget, niet disliked; security invoker | Taak 7 |
| 5.7 feed telt pas mee als de harnas-run met alleen die feed groen is en de dekkingsmatrix gender x gelegenheid x prijsband geen lege cel heeft in tot50 en 50tot100 | Taak 9 (matrix), 10 (poort, `--retailer` in persona-run met exacte patch) |
| Scope (f): tabel feed_gates(retailer, run_at, groen, matrix, persona_output), lezen alleen voor admins via `is_current_user_admin()` (geen losse `role`-claim; live test plus `pg_get_expr`-controle) | Taak 9, 10 |
| Plan 1 stopregel 2 blijft geldig: het harnas in de feed-poort telt categorie-afwijkingen en mag door dit plan niet rood worden | Taak 2 (`category` niet geschreven), 10 (`telCategorieAfwijkingen` blijft geimporteerd en gebruikt) |
| Scope (g) / spec 9: cron voor feed en voorraad, link-checker aangesloten: wekelijks import-daisycon-feed, vulstap met controle op de importstatus, verdwenen producten uit voorraad, linkcontrole elke tien minuten (rollende steekproef, hele catalogus in circa tien dagen) | Taak 11 (functie aanroepbaar door cron), 12 |
| Retailer-naam op een plek en nooit stil nul rijen | Taak 1 (`retailers.ts`), 2 (`keten_controleer_retailer`, gebruikt in taak 6, 7, 8, 9, 12) |
| Migraties toepassen zonder psql en zonder `db push` | Globale randvoorwaarden, elke SQL-taak (`supabase db query --linked -f`), uitwijk via eenmalige pg_cron-job in taak 6 |
| Migratietests bewijzen gedrag, niet alleen tekst | `migraties.live.test.ts` in taak 2, 6, 7, 8, 9, 12 plus de controle-queries per taak |
| 8 poorten: tsc, vitest, vite build, design:check:ci per taak | elke taak, laatste stappen |
| Engine v2 niet aanpassen (7); llmTags.ts blijft staan tot plan 3 | geen enkele taak raakt `src/engine` |
| Geen sleutels in de repo | Taak 1 (`env.ts`), 12 (Vault in plaats van migratie; test controleert op JWT-patronen) |
