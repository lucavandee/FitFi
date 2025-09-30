import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import useBodyScrollLock from "@/hooks/useBodyScrollLock";

// Publieke navigatie
const NAV_LINKS = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
  );
  const location = useLocation();

  // iOS-veilige body lock
  useBodyScrollLock(open && !isDesktop);

  // Focus-refs voor trap
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Sluit bij routewissel
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Desktop switch
  useEffect(() => {
    const onResize = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      setIsDesktop(desktop);
      if (desktop) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Esc + focus-trap
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && overlayRef.current) {
        const els = overlayRef.current.querySelectorAll<HTMLElement>(
          'a,button,[tabindex]:not([tabindex="-1"])'
        );
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey && active === first) {
          e.preventDefault(); (last as HTMLElement).focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault(); (first as HTMLElement).focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    // eerste focus
    setTimeout(() => firstLinkRef.current?.focus(), 0);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Opaque portal-overlay (boven ALLES) — niets kan erdoorheen prikken
  const MobileOverlay = open && !isDesktop
    ? createPortal(
        <div
          ref={overlayRef}
          id="ff-mobile-menu"
          role="dialog"
          aria-modal="true"
          className="
            fixed inset-0 z-[2147483647] isolation-isolate
            bg-[var(--ff-color-bg)] text-[var(--ff-color-text)]
            flex flex-col
          "
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="ff-container flex items-center justify-between p-4">
            <span aria-hidden className="font-heading text-base">Menu</span>
            <button
              type="button"
              aria-label="Sluit menu"
              onClick={() => setOpen(false)}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] shadow-[var(--ff-shadow-soft)] ff-focus-ring"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav aria-label="Mobiele navigatie" className="ff-container flex-1 pb-6 overflow-y-auto">
            <ul className="flex flex-col gap-4">
              {NAV_LINKS.map((item, i) => (
                <li key={item.to}>
                  <NavLink
                    ref={i === 0 ? firstLinkRef : undefined}
                    to={item.to}
                    className={({ isActive }) =>
                      ["ff-navlink text-lg", isActive ? "ff-nav-active" : ""].join(" ")
                    }
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2">
              <NavLink to="/login" className="ff-btn ff-btn-secondary h-10 w-full" onClick={() => setOpen(false)}>
                Inloggen
              </NavLink>
              <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-10 w-full" onClick={() => setOpen(false)}>
                Start gratis
              </NavLink>
            </div>
          </nav>
        </div>,
        document.body
      )
    : null;

  return (
    <header role="banner" className="ff-nav-glass">
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          <NavLink to="/" className="font-heading text-lg tracking-wide text-[var(--ff-color-text)]">
            FitFi
          </NavLink>

          {/* Desktop */}
          <ul className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => ["ff-navlink", isActive ? "ff-nav-active" : ""].join(" ")}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/login" className="ff-btn ff-btn-secondary h-9">Inloggen</NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-9">Start gratis</NavLink>
            <DarkModeToggle />
          </div>

          {/* Mobiel trigger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              aria-label="Open menu"
              aria-controls="ff-mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] shadow-[var(--ff-shadow-soft)] ff-focus-ring"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      {/* Portal overlay (boven ALLES) */}
      {MobileOverlay}
    </header>
  );
}