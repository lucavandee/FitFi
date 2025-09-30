import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

// Publieke navigatie (desktop + mobiel)
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

  // Focus management voor het mobiele menu
  const firstLinkRef = useRef<HTMLAnchorElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // Sluit bij routewissel (voorkomt 'hangend' menu)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Desktop-resize → menu dicht & layout switch
  useEffect(() => {
    const onResize = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      setIsDesktop(desktop);
      if (desktop) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Esc-toets & focus-trap in overlay
  useEffect(() => {
    if (!open) return;
    // scroll-lock
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    // focus binnen menu
    firstLinkRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
      if (e.key === "Tab") {
        // Simpele trap tussen eerste link en sluitknop
        const focusables = overlayRef.current?.querySelectorAll<HTMLElement>(
          'a,button,[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          (last as HTMLElement).focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          (first as HTMLElement).focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header role="banner" className="ff-nav-glass">
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          <NavLink
            to="/"
            className="font-heading text-lg tracking-wide text-[var(--ff-color-text)]"
          >
            FitFi
          </NavLink>

          {/* Desktop */}
          {isDesktop && (
            <>
              <ul className="hidden md:flex items-center gap-5">
                {NAV_LINKS.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        ["ff-navlink", isActive ? "ff-nav-active" : ""].join(" ")
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
              <div className="hidden md:flex items-center gap-2">
                <NavLink to="/login" className="ff-btn ff-btn-secondary h-9">
                  Inloggen
                </NavLink>
                <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-9">
                  Start gratis
                </NavLink>
                <DarkModeToggle />
              </div>
            </>
          )}

          {/* Mobiel trigger */}
          {!isDesktop && (
            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                aria-label="Open menu"
                aria-controls="mobile-menu"
                aria-expanded={open}
                onClick={() => setOpen(true)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] shadow-[var(--ff-shadow-soft)] ff-focus-ring"
              >
                <svg
                  className="h-5 w-5 text-[var(--ff-color-text)]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <DarkModeToggle />
            </div>
          )}
        </div>
      </nav>

      {/* Mobiele overlay */}
      {!isDesktop && open && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex flex-col bg-[var(--ff-color-bg)]/95 backdrop-blur-md"
        >
          {/* Close */}
          <div className="flex justify-end p-4">
            <button
              ref={closeBtnRef}
              type="button"
              aria-label="Sluit menu"
              onClick={() => setOpen(false)}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] shadow-[var(--ff-shadow-soft)] ff-focus-ring"
            >
              <svg
                className="h-5 w-5 text-[var(--ff-color-text)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav aria-label="Mobiele navigatie" className="ff-container flex-1 pb-6">
            <ul className="flex flex-col gap-4">
              {NAV_LINKS.map((item, idx) => (
                <li key={item.to}>
                  <NavLink
                    ref={idx === 0 ? firstLinkRef : undefined}
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
              <NavLink
                to="/login"
                className="ff-btn ff-btn-secondary h-10 w-full"
                onClick={() => setOpen(false)}
              >
                Inloggen
              </NavLink>
              <NavLink
                to="/prijzen"
                className="ff-btn ff-btn-primary h-10 w-full"
                onClick={() => setOpen(false)}
              >
                Start gratis
              </NavLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}