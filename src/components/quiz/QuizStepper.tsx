import React from "react";
export default function QuizStepper({ total, current }: { total: number; current: number }) {
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
              active ? "bg-[#A8513A]" : "bg-[#E5E5E5]",
              i === current ? "w-8" : "w-4",
            ].join(" ")}
          />
        );
      })}
      <span className="sr-only">Stap {current + 1} van {total}</span>
    </div>
  );
}