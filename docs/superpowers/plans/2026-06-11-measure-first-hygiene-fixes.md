# Measure-First Hygiene Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove fabricated data from the results experience, mount the feedback loop, and fix two broken wirings, so the concierge test (spec: `docs/superpowers/specs/2026-06-11-measure-first-design.md`) measures real v2 output.

**Architecture:** Five isolated fixes, no engine logic changes. Pure-logic fixes (quizService, DataRouter) get vitest tests first (TDD, node environment, vitest picks up the `@` alias from `vite.config.ts`). Component fixes (modal, results page) are verified with `npm run typecheck` + `npm run build` since there is no component-test infra (no jsdom/testing-library, and adding deps is out of scope).

**Tech Stack:** Vite + React 18 + TypeScript, vitest (already installed), Supabase client.

**Known limitation (flag to Luc, do NOT fix here):** `ResultsFeedbackWidget` only inserts into Supabase `results_feedback` when a user is logged in (`client && user?.id`). Anonymous testers only reach the `track()` analytics call. Changing this requires RLS/Supabase work, which is off-limits. Mitigation for the concierge test: give testers accounts, or rely on the external form.

---

### Task 1: Add missing quizService methods (fixes useQuizAnswers wiring)

`src/hooks/useQuizAnswers.ts` calls `quizService.getUserAnswers(userId)`, `quizService.submitAnswers(userId, answers)` and `quizService.resetQuiz(userId)`. None exist on `quizService` (`src/services/quizService.ts`). The hook currently has zero consumers, but it is exported API; fix the service side with thin wrappers over existing functions so the hook works as written. Note: the hook expects `QuizSubmission` shaped per `src/types/quiz.ts:54` (`user_id`, `completed_at`, `created_at`, `updated_at`), while `submit()` builds a `userId`/`createdAt`/`status` object behind an `as` cast. The new wrappers must return the `src/types/quiz.ts` shape.

**Files:**
- Test: `src/services/__tests__/quizService.test.ts` (create)
- Modify: `src/services/quizService.ts`

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/quizService.test.ts`:

```typescript
import { beforeEach, describe, expect, it } from "vitest";
import { quizService } from "../quizService";

// quizService guards on `typeof window` and uses window.localStorage at call
// time, so a minimal stub is enough in the node environment.
function installLocalStorageStub() {
  const store = new Map<string, string>();
  (globalThis as any).window = {
    localStorage: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => void store.set(k, String(v)),
      removeItem: (k: string) => void store.delete(k),
    },
  };
}

describe("quizService compat methods (used by useQuizAnswers)", () => {
  beforeEach(() => {
    installLocalStorageStub();
  });

  it("getUserAnswers returns null when nothing was submitted", async () => {
    const result = await quizService.getUserAnswers("user-1");
    expect(result).toBeNull();
  });

  it("submitAnswers stores answers and getUserAnswers returns a QuizSubmission", async () => {
    const ok = await quizService.submitAnswers("user-1", { gender: "male" } as any);
    expect(ok).toBe(true);

    const submission = await quizService.getUserAnswers("user-1");
    expect(submission).not.toBeNull();
    expect(submission!.user_id).toBe("user-1");
    expect(submission!.answers).toMatchObject({ gender: "male" });
    expect(typeof submission!.completed_at).toBe("string");
    expect(typeof submission!.created_at).toBe("string");
  });

  it("resetQuiz clears the stored submission", async () => {
    await quizService.submitAnswers("user-1", { gender: "male" } as any);
    const ok = await quizService.resetQuiz("user-1");
    expect(ok).toBe(true);
    expect(await quizService.getUserAnswers("user-1")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/__tests__/quizService.test.ts`
Expected: FAIL — `quizService.getUserAnswers is not a function` (and the other two methods missing).

- [ ] **Step 3: Implement the wrappers**

In `src/services/quizService.ts`, add above the `export const quizService = {` block:

```typescript
/**
 * Compat-laag voor src/hooks/useQuizAnswers.ts. Geeft submissions terug in de
 * QuizSubmission-vorm uit src/types/quiz.ts (user_id/completed_at/...).
 */
async function getUserAnswers(userId: string): Promise<QuizSubmission | null> {
  const stored = safeRead<Record<string, any> | null>(LS_SUB(userId), null);
  if (!stored || !stored.answers) return null;
  const createdAt = stored.created_at ?? stored.createdAt ?? new Date().toISOString();
  return {
    id: stored.id ?? `local-${userId}`,
    user_id: stored.user_id ?? stored.userId ?? userId,
    answers: stored.answers as QuizAnswers,
    completed_at: stored.completed_at ?? stored.createdAt ?? createdAt,
    created_at: createdAt,
    updated_at: stored.updated_at ?? createdAt,
  };
}

async function submitAnswers(userId: string, answers: QuizAnswers): Promise<boolean> {
  await setAnswers(userId, answers);
  const now = new Date().toISOString();
  const submission: QuizSubmission = {
    id: crypto.randomUUID(),
    user_id: userId,
    answers,
    completed_at: now,
    created_at: now,
    updated_at: now,
  };
  safeWrite(LS_SUB(userId), submission);
  return true;
}

async function resetQuiz(userId: string): Promise<boolean> {
  await clearAnswers(userId);
  safeWrite(LS_SUB(userId), null);
  return true;
}
```

And register them inside the `quizService` object (after `getSteps: getQuizSteps,`):

```typescript
  // compat met useQuizAnswers
  getUserAnswers,
  submitAnswers,
  resetQuiz,
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/__tests__/quizService.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck` — expected: no NEW errors in `src/services/quizService.ts` or `src/hooks/useQuizAnswers.ts` (record pre-existing baseline first if the repo has standing errors).

```bash
git add src/services/quizService.ts src/services/__tests__/quizService.test.ts
git commit -m "fix: add quizService methods that useQuizAnswers depends on"
```

---

### Task 2: Fix DataRouter.getFallbackOutfits (always returned [])

`src/services/DataRouter.ts:64-74`: `getFallbackOutfits()` chunks `const prods = []` — an empty literal — so every fallback path returns `[]`. Restore the intent: fetch products (fetchProducts has its own `FALLBACK_PRODUCTS` safety net and never throws) and chunk them into simple outfits.

**Files:**
- Test: `src/services/__tests__/dataRouterFallback.test.ts` (create)
- Modify: `src/services/DataRouter.ts`

- [ ] **Step 1: Write the failing test**

Create `src/services/__tests__/dataRouterFallback.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/data/dataService", () => ({
  fetchProducts: vi.fn(async () => ({
    data: Array.from({ length: 12 }, (_, i) => ({
      id: `p-${i}`,
      title: `Product ${i}`,
      name: `Product ${i}`,
      brand: "TestBrand",
      price: 10 + i,
      imageUrl: "",
      url: "",
      retailer: "test",
      category: "top",
      tags: [],
    })),
    source: "fallback",
  })),
  fetchOutfits: vi.fn(async () => ({ data: [], source: "fallback" })),
}));

vi.mock("@/services/outfits/outfitService", () => ({
  outfitService: { generateOutfits: vi.fn(async () => []) },
}));

import { getOutfitRecommendations } from "@/services/DataRouter";

describe("DataRouter fallback outfits", () => {
  it("returns non-empty fallback outfits when generation yields nothing", async () => {
    // No quiz answers in (absent) localStorage -> fallback path.
    const outfits = await getOutfitRecommendations(undefined, { limit: 3 });
    expect(outfits.length).toBeGreaterThan(0);
    for (const outfit of outfits) {
      expect(outfit.products.length).toBeGreaterThan(0);
    }
  });
});
```

Note: `getOutfitRecommendations` reads `localStorage` inside a try/catch; in the node environment `localStorage` is undefined, which throws and lands in the catch → `getFallbackOutfits()`. That is exactly the path under test. If the import chain of `DataRouter` pulls in browser-only modules that crash at import time, mock those modules the same way and document it in the test file.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/services/__tests__/dataRouterFallback.test.ts`
Expected: FAIL — `outfits.length` is 0.

- [ ] **Step 3: Implement the fix**

In `src/services/DataRouter.ts`, replace the entire `getFallbackOutfits` function (lines 64-74) with:

```typescript
async function getFallbackOutfits(): Promise<Outfit[]> {
  const { data } = await fetchProducts({ limit: 12 });
  const prods = (data || []).map((p) => ({
    id: p.id,
    title: p.title || p.name || "Product",
    name: p.name ?? p.title,
    brand: p.brand,
    price: p.price,
    imageUrl: p.imageUrl || p.image,
    url: p.url,
    retailer: p.retailer,
    category: p.category,
    tags: p.tags,
  })) as Product[];
  const chunks: Product[][] = [prods.slice(0, 4), prods.slice(4, 8), prods.slice(8, 12)];
  return chunks
    .filter((c) => c.length > 0)
    .map((c, i) => ({
      id: `outfit-${i + 1}`,
      title: `Outfit ${i + 1}`,
      products: c,
    }));
}
```

The three call sites in `getOutfitRecommendations` already sit in an async function; `return getFallbackOutfits();` returns the promise directly, which is valid. No call-site changes needed.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/services/__tests__/dataRouterFallback.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/services/DataRouter.ts src/services/__tests__/dataRouterFallback.test.ts
git commit -m "fix: DataRouter fallback outfits were always empty"
```

---

### Task 3: Remove fabricated match score in OutfitZoomModal

`src/components/results/OutfitZoomModal.tsx:62` fabricates `Math.floor(75 + Math.random() * 20)` when `match_score` is missing. Show real scores only; hide the badge and the "% match" text otherwise. (Component currently has no mount point, but it is exported UI; the fake number must not survive a future re-mount.)

**Files:**
- Modify: `src/components/results/OutfitZoomModal.tsx`

- [ ] **Step 1: Replace the fabricated score**

Line 62, replace:

```typescript
  const matchScore = outfit.match_score || Math.floor(75 + Math.random() * 20);
```

with:

```typescript
  const matchScore = typeof outfit.match_score === "number" ? Math.round(outfit.match_score) : null;
```

- [ ] **Step 2: Conditionally render the badge**

Lines 116-119, replace:

```tsx
                      {/* Match Badge */}
                      <div className="absolute top-4 left-4">
                        <StyleDNAMatchBadge score={matchScore} size="lg" />
                      </div>
```

with:

```tsx
                      {/* Match Badge */}
                      {matchScore !== null && (
                        <div className="absolute top-4 left-4">
                          <StyleDNAMatchBadge score={matchScore} size="lg" />
                        </div>
                      )}
```

- [ ] **Step 3: Conditionally render the "% match" text**

Lines 158-160, replace:

```tsx
                      <p className="text-[#8A8A8A]">
                        {outfit.products.length} items · {matchScore}% match met jouw stijl
                      </p>
```

with:

```tsx
                      <p className="text-[#8A8A8A]">
                        {outfit.products.length} items
                        {matchScore !== null ? ` · ${matchScore}% match met jouw stijl` : ""}
                      </p>
```

- [ ] **Step 4: Typecheck and commit**

Run: `npm run typecheck` — expected: no new errors.

```bash
git add src/components/results/OutfitZoomModal.tsx
git commit -m "fix: stop fabricating match scores in OutfitZoomModal"
```

---

### Task 4: Remove mock swipe insights from EnhancedResultsPage

`src/pages/EnhancedResultsPage.tsx:302-304` always feeds `getMockSwipeInsights()` into `StyleIdentityHero`, which renders a fake "Voorkeur: ..." insight. The `swipeInsights` prop is optional (`src/components/results/StyleIdentityHero.tsx:11`) and `buildInsights` handles its absence; drop the mock entirely.

**Files:**
- Modify: `src/pages/EnhancedResultsPage.tsx`

- [ ] **Step 1: Remove the import (line 23)**

Delete:

```typescript
import { getMockSwipeInsights } from "@/services/visualPreferences/swipeInsightExtractor";
```

- [ ] **Step 2: Remove the memo (lines 302-304)**

Delete:

```typescript
  const swipeInsights = React.useMemo(() => {
    return getMockSwipeInsights();
  }, []);
```

- [ ] **Step 3: Drop the prop (line 786)**

In the `<StyleIdentityHero ... />` call, delete the line:

```tsx
                swipeInsights={swipeInsights}
```

- [ ] **Step 4: Verify no other usages, typecheck, commit**

Run: `grep -n "swipeInsights\|getMockSwipeInsights" src/pages/EnhancedResultsPage.tsx`
Expected: no matches.

Run: `npm run typecheck` — expected: no new errors.

```bash
git add src/pages/EnhancedResultsPage.tsx
git commit -m "fix: remove mock swipe insights from results page"
```

---

### Task 5: Mount ResultsFeedbackWidget on the results page

`src/components/results/ResultsFeedbackWidget.tsx` is complete (self-delays 5s, localStorage 30-day dedupe, writes to Supabase `results_feedback` for logged-in users, tracks analytics) but is imported nowhere. Mount it on `EnhancedResultsPage` for quiz-completed visitors. It renders `position: fixed` bottom-right, so placement in JSX is about lifecycle, not layout: put it with the other overlays at the end of the page.

**Files:**
- Modify: `src/pages/EnhancedResultsPage.tsx`

- [ ] **Step 1: Add the import**

Next to the other `@/components/results/` imports (around line 14-45):

```typescript
import { ResultsFeedbackWidget } from "@/components/results/ResultsFeedbackWidget";
```

- [ ] **Step 2: Mount the widget**

After the `<ExitIntentModal ... />` line (line 1840) and before the mobile bottom padding div, insert:

```tsx
      {/* Feedback widget — meet of het stijlprofiel herkenbaar is */}
      {hasCompletedQuiz && (
        <ResultsFeedbackWidget
          archetype={archetypeName}
          colorProfile={activeColorProfile}
        />
      )}
```

- [ ] **Step 3: Typecheck, build, commit**

Run: `npm run typecheck` — expected: no new errors.
Run: `npm run build` — expected: build succeeds.

```bash
git add src/pages/EnhancedResultsPage.tsx
git commit -m "feat: mount results feedback widget on results page"
```

---

### Task 6: Full verification

- [ ] **Step 1: Run the new tests**

Run: `npx vitest run src/services/__tests__/quizService.test.ts src/services/__tests__/dataRouterFallback.test.ts`
Expected: all PASS.

- [ ] **Step 2: Run the pre-existing engine tests**

Run: `npx vitest run src/engine/__tests__/productClassifier.test.ts`
Expected: same result as before this work (run it on a clean checkout first if unsure; do not fix unrelated failures, just record them).

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: success, no new warnings about missing imports.

- [ ] **Step 4: Smoke test in the running app**

Start dev server (`npm run dev`), complete the quiz once, verify on `/results`:
1. No match percentage appears anywhere unless it comes from real outfit data (and repeated page loads never change a displayed percentage).
2. The hero insights no longer show a fabricated "Voorkeur: ..." line.
3. The feedback widget slides in after ~5 seconds; submitting as a logged-in user creates a row in Supabase `results_feedback`; anonymous submission shows the thank-you state (analytics only — known limitation).

- [ ] **Step 5: Report**

Report results to Luc, including the anonymous-feedback limitation and any pre-existing test failures found in Step 2.
