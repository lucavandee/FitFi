import React from "react";

type Props = {
  bullets: string[]; // 1–4 korte verklaringen
};

const WhyItFits: React.FC<Props> = ({ bullets }) => {
  if (!bullets?.length) return null;

  return (
    <aside className="card p-6" aria-labelledby="why-title">
      <h2 id="why-title" className="text-lg font-semibold mb-3">
        Waarom dit past
      </h2>
      <ul className="space-y-2 leading-7">
        {bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2">
            <span
              aria-hidden
              className="mt-2 inline-block h-2 w-2 rounded-full"
              style={{
                background:
                  "color-mix(in oklab, var(--ff-color-primary-700) 60%, var(--color-accent))",
              }}
            />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default WhyItFits;