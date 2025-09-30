import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";

type LinkItem = { to: string; label: string };
type Props = {
  open: boolean;
  onClose: () => void;
  links: LinkItem[];
};

export default function MobileNavDrawer({ open, onClose, links }: Props) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);

  // iOS-veilige body lock
  useBodyScrollLock(open);

  // Esc + focus-trap + init focus
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && overlayRef.current) {
        const focusables = overlayRef.current.querySelectorAll<HTMLElement>(
          'a,button,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          (last as HTMLElement).focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          (first as HTMLElement).focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    // init focus
    setTimeout(() => firstLinkRef.current?.focus(), 0);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      id="ff-mobile-menu"
      role="dialog"
      aria-modal="true"
      // Volledig dekkend, boven alle stacking-contexten, geen transparantie
      className="fixed inset-0 z-[2147483647] isolation-isolate bg-[var(--ff-color-bg)] text-[var(--ff-color-text)] flex flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ff-container flex items-center justify-between p-4">
        <span aria-hidden className="font-heading text-base">Menu</span>
        <button
          type="button"
          aria-label="Sluit menu"
          onClick={onClose}
          className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] shadow-[var(--ff-shadow-soft)] ff-focus-ring"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav aria-label="Mobiele navigatie" className="ff-container flex-1 pb-6 overflow-y-auto">
        <ul className="flex flex-col gap-4">
          {links.map((item, i) => (
            <li key={item.to}>
              <NavLink
                ref={i === 0 ? firstLinkRef : undefined}
                to={item.to}
                className={({ isActive }) =>
                  ["ff-navlink text-lg", isActive ? "ff-nav-active" : ""].join(" ")
                }
                onClick={onClose}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <NavLink to="/login" className="ff-btn ff-btn-secondary h-10 w-full" onClick={onClose}>
            Inloggen
          </NavLink>
          <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-10 w-full" onClick={onClose}>
            Start gratis
          </NavLink>
        </div>
      </nav>
    </div>,
    document.body
  );
}