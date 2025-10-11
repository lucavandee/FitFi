import React, { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink } from "react-router-dom";

type Answer = string | number | string[];

const STEPS = [
  { id: "goal", label: "Wat is je doel?", type: "single", options: ["Smart casual", "Business", "Casual", "Minimal"] },
  { id: "fit", label: "Wat is je pasvorm-voorkeur?", type: "single", options: ["Slim", "Regular", "Relaxed"] },
  { id: "palette", label: "Welke kleuren spreken je aan?", type: "multi", options: ["Neutraal", "Aards", "Koel", "Warm"] },
  { id: "budget", label: "Wat is je budget per item?", type: "single", options: ["€", "€€", "€€€"] },
] as const;

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});

  const progress = useMemo(() => Math.round(((step + 1) / STEPS.length) * 100), [step]);

  const current = STEPS[step];

  const canNext = useMemo(() => {
    const a = answers[current.id];
    if (current.type === "multi") return Array.isArray(a) && a.length > 0;
    return Boolean(a);
  }, [answers, current]);

  function toggleMulti(id: string, value: string) {
    setAnswers((prev) => {
      const list = Array.isArray(prev[id]) ? (prev[id] as string[]) : [];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...prev, [id]: next };
    });
  }

  function setSingle(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  function onNext() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }

  function onBack() {
    if (step > 0) setStep((s) => s - 1);
  }

  return (
    <main id="main" className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen">
      <Helmet>
        <title>Quiz – FitFi</title>
        <meta name="description" content="Beantwoord enkele vragen en ontvang een persoonlijk AI Style Report." />
        <link rel="canonical" href="https://fitfi.ai/quiz" />
      </Helmet>

      <section className="ff-section pt-24 sm:pt-28">
        <div className="ff-container--home max-w-3xl mx-auto">
          <div className="w-full h-2 bg-[var(--color-surface)] rounded-full overflow-hidden mb-6 border border-[var(--color-border)]">
            <div
              className="h-full bg-[var(--ff-color-primary-600)] transition-all"
              style={{ width: `${progress}%` }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              role="progressbar"
            />
          </div>

          <header className="mb-6">
            <h1 className="ff-h1">Vertel ons je voorkeuren</h1>
            <p className="text-gray-600">Stap {step + 1} van {STEPS.length}</p>
          </header>

          <form
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6"
            onSubmit={(e) => e.preventDefault()}
          >
            <fieldset>
              <legend className="ff-h2 mb-4">{current.label}</legend>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.options.map((opt) => {
                  const key = `${current.id}:${opt}`;
                  const isActive =
                    current.type === "multi"
                      ? Array.isArray(answers[current.id]) && (answers[current.id] as string[]).includes(opt)
                      : answers[current.id] === opt;

                  const base =
                    "w-full text-left rounded-xl border px-4 py-3 transition outline-none focus-visible:ring-2";
                  const active =
                    "border-[var(--ff-color-primary-600)] ring-[var(--ff-color-primary-300)]";
                  const inactive = "border-[var(--color-border)] hover:border-[var(--ff-color-primary-400)]";

                  return (
                    <button
                      type="button"
                      key={key}
                      aria-pressed={isActive}
                      className={`${base} ${isActive ? active : inactive}`}
                      onClick={() =>
                        current.type === "multi"
                          ? toggleMulti(current.id, opt)
                          : setSingle(current.id, opt)
                      }
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                className="ff-btn ff-btn-ghost"
                onClick={onBack}
                disabled={step === 0}
              >
                Terug
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  className="ff-btn ff-btn-primary"
                  onClick={onNext}
                  disabled={!canNext}
                >
                  Volgende
                </button>
              ) : (
                <NavLink
                  to="/results"
                  className="ff-btn ff-btn-primary"
                  state={{ answers }}
                  aria-disabled={!canNext}
                  onClick={(e) => {
                    if (!canNext) e.preventDefault();
                  }}
                >
                  Bekijk jouw Style Report
                </NavLink>
              )}
            </div>
          </form>

          <p className="text-gray-600 text-xs mt-4">
            Je gegevens worden minimalistisch verwerkt. Geen spam, geen dark patterns.
          </p>
        </div>
      </section>
    </main>
  );
}
