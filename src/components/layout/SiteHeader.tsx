import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";

const NAV_LINKS = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
];

export default function SiteHeader() {
  const location = useLocation();

  // Is desktop?
  const [isDesktop, setIsDesktop] = useState<boolean>(
    typeof window !== "undefined"
      ? window.matchMedia("(min-width: 768px)").matches
      : false
  );

  // Mobile drawer state
  const [open, setOpen] = useState(false);

  // Sluit drawer bij routewissel
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Houd breakpoint in sync en sluit drawer zodra we desktop raken
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const matches = "matches" in e ? e.matches : (e as MediaQueryList).matches;
      setIsDesktop(matches);
      if (matches) setOpen(false);
    };

    // init + subscribe (backwards compatible APIs)
    onChange(mql);
    try {
      mql.addEventListener("change", onChange as (e: MediaQueryListEvent) => void);
      return () => mql.removeEventListener("change", onChange as (e: MediaQueryListEvent) => void);
    } catch {
      mql.addListener(onChange as () => void);
      return () => mql.removeListener(onChange as () => void);
    }
  }, []);

  return (
    <header role="banner" className="ff-nav-glass">
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <NavLink
            to="/"
            className="font-heading text-lg tracking-wide text-[var(--ff-color-text)]"
          >
            FitFi
          </NavLink>

          {/* Desktop navigatie */}
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

          {/* Desktop CTA's */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/login" className="ff-btn ff-btn-secondary h-9">
              Inloggen
            </NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-9">
              Start gratis
            </NavLink>
          </div>

          {/* Mobiele trigger — beter zichtbaar (groter, solid primary, hoge contrast) */}
          <div
            data-mobile-only
            className="md:hidden flex items-center"
            aria-hidden={isDesktop}
            hidden={isDesktop}
            style={{ display: isDesktop ? "none" : undefined }}
          >
            <button
              type="button"
              aria-label="Open menu"
              aria-controls="ff-mobile-menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              disabled={isDesktop}
              tabIndex={isDesktop ? -1 : 0}
              className={[
                // grootte & layout
                "h-11 w-11 inline-flex items-center justify-center",
                // visuele hiërarchie
                "rounded-[var(--radius-xl)] border border-transparent",
                "bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)]",
                "shadow-[var(--shadow-soft)] ff-focus-ring",
                // typografie/icon
                "text-white",
                // feedback
                "transition-transform active:scale-[0.98]"
              ].join(" ")}
            >
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer alleen actief op mobiel */}
      <MobileNavDrawer open={open && !isDesktop} onClose={() => setOpen(false)} links={NAV_LINKS} />
    </header>
  );
}