import React from "react";

type Props = { className?: string; rounded?: number };

export default function Skeleton({ className = "", rounded = 12 }: Props) {
  return (
    <div
      className={`bg-white/10 relative overflow-hidden ${className}`}
      style={{ borderRadius: rounded }}
      aria-busy="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <style>{`@keyframes shimmer{100%{transform:translateX(100%);}}`}</style>
    </div>
  );
}