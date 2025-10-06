import React from "react";

type OutfitPiece = {
  type: "top" | "bottom" | "shoes" | "accessory";
  label: string;
  color: string;
};

type OutfitVisualProps = {
  pieces: OutfitPiece[];
  className?: string;
};

function TopIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 140" fill="none" className="w-full h-full">
      <path
        d="M20 20 L30 10 L50 15 L60 5 L70 15 L90 10 L100 20 L100 120 L80 130 L40 130 L20 120 Z"
        fill={color}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="60" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="60" cy="75" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="60" cy="90" r="3" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

function BottomIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 140" fill="none" className="w-full h-full">
      <path
        d="M30 10 L90 10 L95 50 L100 130 L80 140 L70 90 L50 90 L40 140 L20 130 L25 50 Z"
        fill={color}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="60" y1="10" x2="60" y2="50" stroke="currentColor" opacity="0.2" strokeWidth="1" />
    </svg>
  );
}

function ShoesIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 80" fill="none" className="w-full h-full">
      <ellipse cx="35" cy="55" rx="30" ry="20" fill={color} stroke="currentColor" strokeWidth="2" />
      <path
        d="M15 55 Q20 35 40 30 L50 35 L45 55 Z"
        fill={color}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="85" cy="55" rx="30" ry="20" fill={color} stroke="currentColor" strokeWidth="2" />
      <path
        d="M65 55 Q70 35 90 30 L100 35 L95 55 Z"
        fill={color}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccessoryIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 60" fill="none" className="w-full h-full">
      <rect x="20" y="15" width="80" height="30" rx="15" fill={color} stroke="currentColor" strokeWidth="2" />
      <circle cx="40" cy="30" r="8" fill="currentColor" opacity="0.2" />
      <circle cx="60" cy="30" r="8" fill="currentColor" opacity="0.2" />
      <circle cx="80" cy="30" r="8" fill="currentColor" opacity="0.2" />
    </svg>
  );
}

const PIECE_ICONS = {
  top: TopIcon,
  bottom: BottomIcon,
  shoes: ShoesIcon,
  accessory: AccessoryIcon,
};

export default function OutfitVisual({ pieces, className = "" }: OutfitVisualProps) {
  return (
    <div className={`bg-[var(--color-bg)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 ${className}`}>
      <div className="space-y-6">
        {pieces.map((piece, idx) => {
          const Icon = PIECE_ICONS[piece.type];
          return (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-20 h-20 flex-shrink-0 text-[var(--color-text)]/60">
                <Icon color={piece.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] flex-shrink-0"
                    style={{ backgroundColor: piece.color }}
                    aria-label={`Color: ${piece.color}`}
                  />
                  <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                    {piece.type}
                  </span>
                </div>
                <p className="text-sm font-medium truncate">{piece.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function OutfitVisualCompact({ pieces, className = "" }: OutfitVisualProps) {
  return (
    <div className={`aspect-[3/4] bg-gradient-to-br from-[var(--color-bg)] to-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 flex flex-col justify-center ${className}`}>
      <div className="space-y-8">
        {pieces.slice(0, 3).map((piece, idx) => {
          const Icon = PIECE_ICONS[piece.type];
          return (
            <div key={idx} className="flex flex-col items-center">
              <div className="w-24 h-24 mb-3 text-[var(--color-text)]/40">
                <Icon color={piece.color} />
              </div>
              <div
                className="w-12 h-3 rounded-full"
                style={{ backgroundColor: piece.color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
