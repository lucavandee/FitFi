import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { createPortal } from "react-dom";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";

type LinkItem = { to: string; label: string };
type Props = { open: boolean; onClose: () => void; links: LinkItem[] };

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input[type="text"]:not([disabled])',
    'input[type="radio"]:not([disabled])',
    'input[type="checkbox"]:not([disabled])',
    'select:not([disabled])'
  ].join(',');
  return Array.from(container.querySelectorAll<HTMLElement>(selectors))
    .filter(el => !el.hasAttribute('tabindex') || el.tabIndex >= 0);
}

export default function MobileNavDrawer({ open, onClose, links }: Props) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

  // Scroll lock zolang open
  useBodyScrollLock(open);

  // Focus-trap + ESC
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const panel = panelRef.current;

    const focusables = getFocusableElements(panel);
    const target = closeBtnRef.current ?? focusables[0];
    target?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const elems = getFocusableElements(panel);
        if (elems.length === 0) return;
        const first = elems[0];
        const last = elems[elems.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Click-outside
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (!panel.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]" role="presentation" aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "saturate(180%) blur(6px)",
          background: "color-mix(in oklab, var(--color-surface) 72%, transparent)"
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobiele navigatie"
        className="absolute inset-x-0 top-0 mx-auto max-w-md w-full rounded-b-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl ff-animate-fade-in"
      >
        <div className="flex items-center justify-between h-16 px-4">
          <NavLink to="/" onClick={onClose} className="font-heading text-lg tracking-wide text-[var(--color-text)]">
            FitFi
          </NavLink>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Sluit menu"
            className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] focus:outline-none"
            style={{ boxShadow: "var(--shadow-ring)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobiele hoofdmenu" className="px-4 pb-6 max-h-[calc(100dvh-4rem)] overflow-y-auto">
          <ul className="flex flex-col gap-2">
            {links.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="px-3 py-2 rounded-full text-base font-medium text-[var(--color-text)]"
                  style={({ isActive }) => (isActive ? { background: "color-mix(in oklab, var(--color-accent) 22%, white)" } : undefined) as any}
                  onClick={onClose}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-6 grid grid-cols-1 gap-2">
            <NavLink to="/inloggen" className="h-10 inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)]" onClick={onClose}>
              Inloggen
            </NavLink>
            <NavLink to="/prijzen" className="h-10 inline-flex items-center justify-center rounded-lg text-white"
              style={{ background: "var(--ff-color-primary-700)" }}
              onClick={onClose}
            >
              Start gratis
            </NavLink>
          </div>
        </nav>
      </div>
    </div>,
    document.body
  );
}