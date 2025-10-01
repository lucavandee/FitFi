// /src/components/quiz/QuizStepper.tsx
import React from "react";

type Props = { total: number; current: number };

export default function QuizStepper({ total, current }: Props) {
  return (
    <div className="flex items-center gap-2" aria-label="Voortgang">
      {Array.from({ length: total }).map((_, i) => {
        const active = i <= current;
        return (
          <span
            key={i}
            aria-hidden
            className={[
              "h-2 rounded-full transition-all",
              active ? "bg-[var(--ff-color-primary-700)]" : "bg-[var(--color-border)]",
              // breedte varieert voor subtiel ritme
              i === current ? "w-8" : "w-4",
            ].join(" ")}
          />
        );
      })}
      <span className="sr-only">
        Stap {current + 1} van {total}
      </span>
    </div>
  );
}