import React from "react";

const Block: React.FC<{ className?: string }> = ({ className = "" }) =>
  <div aria-hidden className={`animate-pulse rounded-[var(--radius-lg)] bg-[color-mix(in_oklab,_var(--color-surface)_60%,_var(--color-border))] ${className}`} />;

const ResultsSkeleton: React.FC = () => (
  <section className="ff-section">
    <div className="ff-container">
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Block className="h-6 w-40 mb-4" />
          <Block className="h-10 w-4/5 mb-3" />
          <Block className="h-10 w-2/3 mb-6" />
          <div className="flex gap-3">
            <Block className="h-10 w-28" />
            <Block className="h-10 w-36" />
          </div>
        </div>
        <div className="lg:col-span-5"><Block className="aspect-[4/3] w-full" /></div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">
        <Block className="aspect-square" />
        <Block className="aspect-square" />
        <Block className="aspect-square" />
      </div>
    </div>
  </section>
);

export default ResultsSkeleton;