// src/components/ai/TypingSkeleton.tsx
import React from "react";

type Props = {
  lines?: number;
  className?: string;
};

const TypingSkeleton: React.FC<Props> = ({ lines = 3, className }) => {
  return (
    <div
      className={`ff-card card p-4 md:p-5 ${className || ""}`}
      aria-label="Nova is aan het typen"
      aria-busy="true"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full skeleton" aria-hidden="true" />
        <div className="flex-1 space-y-2">
          {Array.from({ length: Math.max(1, lines) }).map((_, i) => (
            <div key={i} className="h-4 rounded skeleton" />
          ))}
          <div className="h-4 w-1/3 rounded skeleton" />
        </div>
      </div>
    </div>
  );
};

export default TypingSkeleton;