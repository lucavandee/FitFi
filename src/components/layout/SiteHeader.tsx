import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import DarkModeToggle from "@/components/ui/DarkModeToggle";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";

const NAV_LINKS = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  const [open, setOpen] = React.useState(false);
  const [isDesktop, setIsDesktop] = React.useState(
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
  );
  const location = useLocation();

  // Sluit bij routewissel
  React.useEffect(() => { setOpen(false); }, [location.pathname]);

  // Sync met viewport-breedte
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const match = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
      setIsDesktop(match);
      if (match) setOpen(false);
    };
    mql.addEventListener?.("change", onChange as any);
    mql.addListener?.(onChange as any);
    onChange(mql);
    return () => {
      mql.removeEventListener?.("change", onChange as any);
      mql.removeListener?.(onChange as any);
    };
  }, []);

  return (
    <header
      role="banner"
      className="sticky top-0 z-50"
      style={{
        backdropFilter: "saturate(180%) blur(8px)",
        background: "color-mix(in oklab, var(--color-surface) 88%, transparent)",
        borderBottom: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-soft)"
      }}
    >
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <NavLink to="/" className="font-heading text-lg tracking-wide text-[var(--color-text)]">
            FitFi
          </NavLink>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-5">
            {NAV_LINKS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="px-3 py-2 rounded-full font-medium text-[var(--color-text)]"
                  style={({ isActive }) => (isActive ? { background: "color-mix(in oklab, var(--color-accent) 22%, white)" } : undefined) as any}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Acties rechts */}
          <div className="flex items-center gap-2">
            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-controls="mobile-menu"
              aria-expanded={open}
              className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
              style={{ boxShadow: "var(--shadow-ring)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" aria-hidden="true" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop CTA's */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink to="/login" className="px-3 h-9 inline-flex items-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)]">
                Inloggen
              </NavLink>
              <NavLink
                to="/prijzen"
                className="px-3 h-9 inline-flex items-center rounded-lg text-white"
                style={{ background: "var(--ff-color-primary-700)" }}
              >
                Start gratis
              </NavLink>
            </div>

            <DarkModeToggle />
          </div>
        </div>
      </nav>

      {/* Overlay (portal) */}
      <MobileNavDrawer open={open && !isDesktop} onClose={() => setOpen(false)} links={NAV_LINKS} />
    </header>
  );
}