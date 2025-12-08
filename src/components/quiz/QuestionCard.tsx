import React from "react";

type Choice<T extends string> = { value: T; label: string; help?: string };
type Props<T extends string> = {
  title: string;
  help?: string;
  name: string;
  value?: T | T[];
  multiple?: boolean;
  choices: Choice<T>[];
  onChange: (next: T | T[]) => void;
};

export default function QuestionCard<T extends string>({
  title, help, name, value, multiple, choices, onChange,
}: Props<T>) {
  const isActive = (v: T) =>
    multiple ? Array.isArray(value) && (value as T[]).includes(v) : value === v;

  function toggle(v: T) {
    if (multiple) {
      const arr = Array.isArray(value) ? [...(value as T[])] : [];
      const i = arr.indexOf(v);
      if (i >= 0) arr.splice(i, 1); else arr.push(v);
      onChange(arr as T[]);
    } else {
      onChange(v);
    }
  }

  return (
    <div
      className={[
        "rounded-2xl sm:rounded-[var(--radius-2xl)] border border-[var(--color-border)]",
        "bg-[var(--color-surface)] shadow-[var(--shadow-soft)]",
        "pt-6 sm:pt-7 pb-5 sm:pb-6 px-4 sm:px-5 lg:px-6",
      ].join(" ")}
      aria-labelledby={`${name}-title`}
    >
      <h2 id={`${name}-title`} className="text-base sm:text-lg font-semibold">{title}</h2>
      {help ? <p className="mt-1 text-sm text-[var(--color-text)]/70">{help}</p> : null}

      <div className="mt-5 sm:mt-4 grid gap-3 sm:gap-2 sm:grid-cols-2">
        {choices.map((c) => (
          <button
            key={c.value}
            type="button"
            aria-pressed={isActive(c.value)}
            onClick={() => toggle(c.value)}
            className={[
              "text-left rounded-xl sm:rounded-[var(--radius-xl)] border px-4 py-3.5 min-h-[52px] sm:min-h-[48px] transition-all",
              isActive(c.value)
                ? "border-[var(--color-primary)] bg-[color-mix(in oklab,var(--ff-color-primary-700) 8%,transparent)] shadow-sm"
                : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-primary)] active:scale-[0.98]",
            ].join(" ")}
          >
            <div className="text-sm sm:text-sm font-medium">{c.label}</div>
            {c.help ? <div className="text-xs opacity-70 mt-0.5">{c.help}</div> : null}
          </button>
        ))}
      </div>
    </div>
  );
}