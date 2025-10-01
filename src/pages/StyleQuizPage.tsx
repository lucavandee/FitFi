// /src/pages/StyleQuizPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";
import QuestionCard from "@/components/quiz/QuestionCard";
import PhotoUpload from "@/components/quiz/PhotoUpload";
import QuizStepper from "@/components/quiz/QuizStepper";
import { computeResult } from "@/lib/quiz/logic";
import type { AnswerMap, QuizStep } from "@/lib/quiz/types";
import { LS_KEYS } from "@/lib/quiz/types";

const STEPS: QuizStep[] = [
  "goals",
  "fit",
  "comfort",
  "jewelry",
  "neutrals",
  "lightness",
  "contrast",
  "prints",
  "materials",
  "occasions",
  "photo",
  "review",
];

export default function StyleQuizPage() {
  const nav = useNavigate();
  const [stepIdx, setStepIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerMap>(() => {
    try {
      const raw = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS);
      return raw ? (JSON.parse(raw) as AnswerMap) : {};
    } catch {
      return {};
    }
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify(answers));
    } catch {}
  }, [answers]);

  function next() {
    setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function prev() {
    setStepIdx((i) => Math.max(i - 1, 0));
  }

  function finish() {
    const result = computeResult(answers);
    try {
      localStorage.setItem(LS_KEYS.COLOR_PROFILE, JSON.stringify(result.color));
      localStorage.setItem(LS_KEYS.ARCHETYPE, JSON.stringify(result.archetype));
      localStorage.setItem(LS_KEYS.RESULTS_TS, Date.now().toString());
      localStorage.setItem(LS_KEYS.QUIZ_COMPLETED, "1");
    } catch {}
    nav("/results", { replace: true });
  }

  const current = STEPS[stepIdx];

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo
        title="Stijlquiz — FitFi"
        description="Beantwoord enkele vragen en ontvang je kleurprofiel en stijl-archetype."
        path="/stijlquiz"
      />
      <PageHero
        eyebrow="STIJLQUIZ"
        title="Snel en rustig — zoals het hoort"
        subtitle="6–10 korte vragen. Privacy-first. Resultaat: kleurprofiel + stijl-archetype."
        align="left"
        size="sm"
        ctas={[]}
        note={<QuizStepper total={STEPS.length} current={stepIdx} />}
      />

      <section className="ff-container pt-10 pb-16 space-y-6">
        {current === "goals" && (
          <QuestionCard
            title="Waar ga je je outfits vooral voor gebruiken?"
            help="Je kunt meer dan één optie kiezen."
            name="goals"
            multiple
            value={answers.goals}
            choices={[
              { value: "werk", label: "Werk / Office" },
              { value: "casual", label: "Casual / Weekend" },
              { value: "avond", label: "Avond / Diner" },
              { value: "sport", label: "Sportief-net" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, goals: v as any }))}
          />
        )}

        {current === "fit" && (
          <QuestionCard
            title="Welke silhouet-balans past het meest bij jou?"
            name="fit"
            value={answers.fit}
            choices={[
              { value: "slim", label: "Getailleerd / Slim" },
              { value: "straight", label: "Recht / Regular" },
              { value: "relaxed", label: "Relaxed / Losser" },
              { value: "oversizedTop_slimBottom", label: "Ruime top + slanke broek" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, fit: v as any }))}
          />
        )}

        {current === "comfort" && (
          <QuestionCard
            title="Hoe gestructureerd wil je dat je kleding voelt?"
            name="comfort"
            value={answers.comfort}
            choices={[
              { value: "structured", label: "Gestructureerd", help: "Strakke lijnen, nette look." },
              { value: "balanced", label: "Gebalanceerd", help: "Mix tussen netjes en comfy." },
              { value: "relaxed", label: "Relaxed", help: "Zacht, beweeglijk, cozy." },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, comfort: v as any }))}
          />
        )}

        {current === "jewelry" && (
          <QuestionCard
            title="Welke sieraden flatteren je vaak het meest?"
            name="jewelry"
            value={answers.jewelry}
            choices={[
              { value: "goud", label: "Goud" },
              { value: "zilver", label: "Zilver" },
              { value: "beide", label: "Beide ongeveer gelijk" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, jewelry: v as any }))}
          />
        )}

        {current === "neutrals" && (
          <QuestionCard
            title="Welke neutrale basiskleuren trekken je aan?"
            name="neutrals"
            value={answers.neutrals}
            choices={[
              { value: "warm", label: "Warm (zand, camel, klei)" },
              { value: "koel", label: "Koel (grijs, navy, steenkleur)" },
              { value: "neutraal", label: "Neutraal (beide oké)" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, neutrals: v as any }))}
          />
        )}

        {current === "lightness" && (
          <QuestionCard
            title="Voel je je het best in lichte of donkere outfits?"
            name="lightness"
            value={answers.lightness}
            choices={[
              { value: "licht", label: "Licht" },
              { value: "medium", label: "Tussenin" },
              { value: "donker", label: "Donker" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, lightness: v as any }))}
          />
        )}

        {current === "contrast" && (
          <QuestionCard
            title="Hoeveel contrast wil je meestal in je look?"
            name="contrast"
            value={answers.contrast}
            choices={[
              { value: "laag", label: "Laag (tonal, zacht)" },
              { value: "medium", label: "Gemiddeld" },
              { value: "hoog", label: "Hoog (licht vs. donker)" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, contrast: v as any }))}
          />
        )}

        {current === "prints" && (
          <QuestionCard
            title="Wat vind je van prints?"
            name="prints"
            value={answers.prints}
            choices={[
              { value: "geen", label: "Liever geen prints" },
              { value: "effen", label: "Overwegend effen" },
              { value: "subtiel", label: "Subtiele patronen / textuur" },
              { value: "statement", label: "Statement af en toe" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, prints: v as any }))}
          />
        )}

        {current === "materials" && (
          <QuestionCard
            title="Welke materialen spreken je aan?"
            name="materials"
            value={answers.materials}
            choices={[
              { value: "mat", label: "Mat" },
              { value: "textuur", label: "Zachte textuur (wol, brei)" },
              { value: "glans", label: "Lichte glans (satijn, nylon)" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, materials: v as any }))}
          />
        )}

        {current === "occasions" && (
          <QuestionCard
            title="Welke setting beschrijft je week het beste?"
            help="Meerdere keuzes mogelijk."
            name="occasions"
            multiple
            value={answers.occasions}
            choices={[
              { value: "office", label: "Office / Meeting" },
              { value: "smartcasual", label: "Smart-casual" },
              { value: "leisure", label: "Leisure / Weekend" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, occasions: v as any }))}
          />
        )}

        {current === "photo" && (
          <PhotoUpload
            value={answers.photoDataUrl}
            onChange={(v) => setAnswers((s) => ({ ...s, photoDataUrl: v }))}
          />
        )}

        {current === "review" && (
          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] pt-7 pb-6 px-5 sm:px-6">
            <h2 className="text-lg font-semibold">Bijna klaar</h2>
            <p className="mt-1 text-sm text-[var(--color-text)]/80">
              We genereren je kleurprofiel en stijl-archetype op basis van je antwoorden.
              Je kunt later altijd bijstellen.
            </p>

            <div className="mt-4 grid gap-2 text-sm">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <strong>Silhouet:</strong> {answers.fit ?? "—"} • <strong>Comfort:</strong> {answers.comfort ?? "—"}
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <strong>Kleur:</strong> {answers.neutrals ?? "—"} • <strong>Contrast:</strong> {answers.contrast ?? "—"} • <strong>Lichtheid:</strong> {answers.lightness ?? "—"}
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <strong>Situaties:</strong> {(answers.goals || []).join(", ") || "—"}
              </div>
            </div>
          </div>
        )}

        {/* Navigatie */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={prev} disabled={stepIdx === 0}>
            Terug
          </Button>
          {current !== "review" ? (
            <Button variant="primary" onClick={next}>
              Volgende
            </Button>
          ) : (
            <Button variant="primary" onClick={finish}>
              Toon mijn resultaten
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}