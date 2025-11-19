import React from "react";

type Props = { className?: string; rounded?: number };

export default function Skeleton({ className = "", rounded = 12 }: Props) {
  return (
    <div
      className={`bg-[var(--color-surface)] dark:bg-gray-800 relative overflow-hidden ${className}`}
      style={{ borderRadius: rounded }}
      aria-busy="true"
      aria-label="Aan het laden..."
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-200/30 dark:via-gray-600/30 to-transparent" />
      <style>{`@keyframes shimmer{100%{transform:translateX(100%);}}`}</style>
    </div>
  );
}