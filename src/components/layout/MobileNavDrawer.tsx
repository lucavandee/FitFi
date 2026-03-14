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
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel — slide in from right */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobiele navigatie"
        className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-[#FAFAF8] shadow-xl"
      >
        {/* Close button */}
        <div className="flex items-center justify-end h-16 px-4">
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Sluit menu"
            className="inline-flex items-center justify-center h-11 w-11 rounded-xl hover:bg-[#F5F0EB] transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1A1A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobiele hoofdmenu" className="flex flex-col py-8 px-6 space-y-1">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  "py-3 px-4 text-base rounded-xl border-0 shadow-none outline-none ring-0 transition-colors duration-200",
                  isActive
                    ? "font-semibold text-[#1A1A1A] bg-[#F5F0EB]"
                    : "font-medium text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#F5F0EB]",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}

          <div className="mt-6 pt-4 border-t border-[#E5E5E5] space-y-3">
            <NavLink
              to="/inloggen"
              onClick={onClose}
              className="block text-center text-sm font-medium text-[#4A4A4A] hover:text-[#1A1A1A] py-3 transition-colors duration-200"
            >
              Inloggen
            </NavLink>
            <NavLink
              to="/registreren"
              onClick={onClose}
              className="block bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl text-center transition-colors duration-200"
            >
              Begin gratis
            </NavLink>
          </div>
        </nav>
      </div>
    </div>,
    document.body
  );
}
