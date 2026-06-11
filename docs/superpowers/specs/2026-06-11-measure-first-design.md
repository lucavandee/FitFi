# FitFi Measure-First Phase (Option C) — Design Spec

Date: 2026-06-11
Status: approved by Luc (2026-06-11)
Context: multi-agent deep dive + sparring session, full reports in
`~/claude-artifacts/brainstorms/fitfi-engine-herontwerp/` (01-verkenning, 02-sparring, 03-synthese).

## Goal

Answer one question empirically before any engine v3 work starts: **is the
recommendation quality problem caused by the engine logic or by the product
data?** Primary metric: recognisability ("dit ben ik"), rated by 10-15 real
target-audience testers.

## Background (key findings the design rests on)

- Engine v2 (`src/engine/v2/`) is the engine that actually runs in production;
  `shouldUseEngineV2()` in `src/services/outfits/outfitService.ts` defaults on.
  V1 is fallback only.
- The catalog is thin: ~50 seeded products, `style` column NULL everywhere, no
  archetype tags, fake affiliate URLs.
- Match percentages shown to users are partly fabricated
  (`75 + Math.random() * 20` in `OutfitZoomModal.tsx`); swipe insights are
  always mocked.
- The feedback loop (`ResultsFeedbackWidget`, Supabase table
  `results_feedback`) exists but is mounted nowhere. There is zero user
  measurement.
- Known broken code: `useQuizAnswers` calls three methods that do not exist on
  `quizService`; `DataRouter.getFallbackOutfits()` always returns an empty
  array.

## Scope note (no-touch contract)

This initiative is explicitly blessed by Luc to go beyond the styling-only
no-touch contract in `CLAUDE.md`. The contract remains in force for regular
styling sessions. Within this phase: no engine logic changes; only broken
wiring and fake data are touched.

## Part 1 — Hygiene fixes (so the measurement is not polluted)

1. **Remove fake match score**: replace `75 + Math.random() * 20` in
   `src/components/outfits/OutfitZoomModal.tsx` with the real v2 score, or hide
   the percentage when no real score exists.
2. **Remove mock swipe insights**: stop rendering `getMockSwipeInsights()`
   output on the results page; hide the section until real data exists.
3. **Mount `ResultsFeedbackWidget`** on the results page so every tester (and
   later every user) can rate outfits. It already writes to Supabase
   `results_feedback`.
4. **Fix `useQuizAnswers`**: align the hook with the methods that actually
   exist on `quizService` (or add the missing methods as thin wrappers — choose
   whichever keeps behavior identical for working callers).
5. **Fix `DataRouter.getFallbackOutfits()`** so the emergency fallback returns
   actual fallback outfits instead of an empty array.

Out of scope in this part: any change to scoring, archetype derivation,
outfit composition, or engine routing.

## Part 2 — Concierge test (A/B/C)

Testers complete the quiz on the live site, then fill in a short form
(Tally or Google Form) with screenshots. Each tester rates three sets,
blind, in randomized order:

- **Set A**: the real v2 output for their profile.
- **Set B**: hand-curated outfits from the **same catalog** + a hand-written
  profile text.
- **Set C**: hand-curated outfits from **external real products** (e.g.
  Zalando).

Per set: recognisability 1-5 ("hoe goed past dit bij jou?"), per outfit a
single flag "dit zou ik nooit dragen", one open question. Separate block:
profile text only, "herken je jezelf hierin?" (1-5).

Production of the sets: Claude generates the A-sets per tester profile,
curates B and C as a draft; Luc approves the curation before the test runs.
Claude builds the form and a scoring sheet.

## Decision rules (fixed in advance)

- **B ≈ A, C ≫ both** → data is the problem; engine rebuild is wasted time.
  Next: catalog track (300+ products per gender, LLM tagging pipeline filling
  archetype/formality/silhouette per product), then sanitation (option A) as a
  cleanup, not as a fix.
- **B ≫ A (≥ 1 point average)** → the engine leaves value on the table even on
  this thin catalog. Next: option A sanitation with golden tests, using the
  B-set curations as reference cases.
- **A ≈ B ≈ C, all low** → the quiz/profile itself is the problem, not the
  outfits. Next: redesign the quiz-to-profile translation before anything
  else.
- **Mean recognisability of A ≥ 4 and < 10% never-wear flags** → engine is good
  enough; go straight to the data track.

## Explicitly out of scope (this phase)

- Engine changes, v1 removal, dashboard/results engine consistency fix (the
  dashboard inconsistency is a known issue; testers are only sent to the
  results page).
- Catalog expansion before the measurement.
- Any LLM reranking architecture (option B); its LLM element returns later as
  a catalog tagging pipeline if the data track wins.

## Verification

- `npm run build` + existing tests after every fix.
- Feedback widget verified end-to-end: a test record visible in Supabase.
- One full quiz run as smoke test before testers are invited.

## Success criteria for the phase

- The five hygiene fixes are live and verified.
- ≥ 10 testers completed quiz + form.
- A decision rule fired and the next track (data / engine sanitation / quiz
  redesign) is chosen on evidence, not intuition.
