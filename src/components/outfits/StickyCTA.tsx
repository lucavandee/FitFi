// src/components/outfits/StickyCTA.tsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * StickyCTA — mobiele sticky CTA-balk (alleen <= md zichtbaar)
 * - Tokens-first; ff-utilities; geen portals of externe deps.
 * - Props: primary/secondary labels + routes.
 */
type Props = {
  primaryTo: string;
  primaryLabel: string;
  secondaryTo?: string;
  secondaryLabel?: string;
};

export default function StickyCTA({
  primaryTo,
  primaryLabel,
  secondaryTo,
  secondaryLabel,
}: Props) {
  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-2">
        <div className="text-sm text-text/80">Klaar? Ga verder.</div>
        <div className="flex gap-2">
          {secondaryTo && secondaryLabel ? (
            <NavLink to={secondaryTo} className="bg-white border border-[#E5E5E5] hover:border-[#C2654A] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl">
              {secondaryLabel}
            </NavLink>
          ) : null}
          <NavLink to={primaryTo} className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl">
            {primaryLabel}
          </NavLink>
        </div>
      </div>
    </div>
  );
}