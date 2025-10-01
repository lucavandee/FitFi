// /src/components/results/ResultsQuizGate.tsx
import React, { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";

type Answers = {
  focus?: "Fit" | "Kleur" | "Silhouet";
  setting?: "Werk" | "Weekend" | "Avond";
  color?: "Neutraal" | "Aards" | "Koel";
};

const STEPS = [
  {
    key: "focus" as const,
    title: "Waar wil je de nadruk op leggen?",
    options: ["Fit", "Kleur", "Silhouet"] as const,
  },
  {
    key: "setting" as const,
    title: "Welke setting is nu relevant?",
    options: ["Werk", "Weekend", "Avond"] as const,
  },
  {
    key: "color" as const,
    title: "Welke kleurfamilie voelt goed?",
    options: ["Neutraal", "Aards", "Koel"] as const,
  },
];

const ResultsQuizGate: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const current = STEPS[step];
  const canNext = Boolean(answers[current.key]);

  const select = (opt: string) => {
    setAnswers((a) => ({ ...a, [current.key]: opt as any }));
  };

  const finish = () => {
    try {
      window.localStorage.setItem("ff_quiz_answers", JSON.stringify(answers));
    } catch {}
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
    >
      <div className="w-full max-w-lg rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-medium text-[var(--color-text)]">Even afstemmen</h2>
          <button
            aria-label="Sluiten"
            className="opacity-70 hover:opacity-100"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <p className="mb-3 text-[var(--color-text)]/80">{current.title}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {current.options.map((opt) => (
              <button
                key={opt}
                onClick={() => select(opt)}
                aria-pressed={answers[current.key] === opt}
                className={`px-3 py-2 rounded-xl border border-[var(--color-border)] ${
                  answers[current.key] === opt ? "ring-2 ring-[var(--color-primary)]" : ""
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            {step < STEPS.length - 1 ? (
              <Button
                variant="primary"
                size="md"
                disabled={!canNext}
                onClick={() => setStep((s) => s + 1)}
                icon={<ChevronRight className="w-4 h-4" />}
                iconPosition="right"
              >
                Volgende
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                disabled={!canNext}
                onClick={finish}
              >
                Toon resultaten
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsQuizGate;