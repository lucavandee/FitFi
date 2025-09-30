import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";

const NAV_LINKS = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
  );
  const location = useLocation();

  // Sluit menu bij routewissel
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Sluit menu bij resize naar desktop
  useEffect(() => {
    const onResize = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      setIsDesktop(desktop);
      if (desktop) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header role="banner" className="ff-nav-glass">
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          <NavLink to="/" className="font-heading text-lg tracking-wide text-[var(--ff-color-text)]">
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
              <svg className="h-5 w-5 text-[var(--ff-color-text)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </nav>

      {/* Portal overlay (boven ALLES) */}
      <MobileNavDrawer open={open && !isDesktop} onClose={() => setOpen(false)} links={NAV_LINKS} />
    </header>
  );
}