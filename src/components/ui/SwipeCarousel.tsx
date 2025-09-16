// src/components/ui/SwipeCarousel.tsx
import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
};

const SwipeCarousel: React.FC<Props> = ({ ariaLabel, children, className = "" }) => {
  const ref = useRef<HTMLDivElement>(null);

  const scrollByAmount = (dir: "prev" | "next") => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.9, 280);
    el.scrollBy({ left: dir === "next" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Visually hidden title for a11y */}
      <h2 className="sr-only">{ariaLabel}</h2>

      {/* Track */}
      <div
        ref={ref}
        className="swipe"
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        {React.Children.map(children, (child, idx) => (
          <div key={idx} className="swipe__item" aria-roledescription="slide" aria-label={`Item ${idx + 1}`}>
            {child}
          </div>
        ))}
      </div>

      {/* Nav buttons (hidden on small if wanted) */}
      <div className="hidden md:flex items-center gap-2 absolute -top-14 right-0">
        <button
          type="button"
          className="btn btn-ghost"
          aria-label="Vorige"
          onClick={() => scrollByAmount("prev")}
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Vorige
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          aria-label="Volgende"
          onClick={() => scrollByAmount("next")}
        >
          Volgende
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default SwipeCarousel;