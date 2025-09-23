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
            <NavLink to={secondaryTo} className="ff-btn ff-btn-secondary h-10">
              {secondaryLabel}
            </NavLink>
          ) : null}
          <NavLink to={primaryTo} className="ff-btn ff-btn-primary h-10">
            {primaryLabel}
          </NavLink>
        </div>
      </div>
    </div>
  );
}