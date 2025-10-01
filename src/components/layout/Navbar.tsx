// /src/components/layout/Navbar.tsx
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

/**
 * Premium, rustige Navbar:
 * - Sticky + lichte blur
 * - Perfecte horizontale uitlijning via ff-container
 * - EÉN header, EÉN Navbar
 * - Primaire CTA: "Start gratis"
 * - Secundaire CTA: "Log in" (nieuw)
 * - A11Y: skiplink, aria-expanded, ESC sluit, focus-ring via tokens
 * - Active nav = subtiele chip (accent-tint)
 */

function useLockBody(lock: boolean) {
  React.useEffect(() => {
    const original = document.body.style.overflow;
    if (lock) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [lock]);
}

const links: Array<{ to: string; label: string }> = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/blog", label: "Blog" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();
  useLockBody(open);

  // Sluit mobiel menu bij routewissel of ESC
  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-[var(--color-border)]",
        "backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--color-surface)_80%,transparent)]",
        "bg-[var(--color-surface)]/90",
      ].join(" ")}
      role="banner"
    >
      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-xl focus:border focus:border-[var(--color-border)] focus:bg-[var(--color-surface)] focus:px-3 focus:py-2 focus:shadow-[var(--shadow-ring)]"
      >
        Naar hoofdinhoud
      </a>

      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="inline-flex items-center rounded-xl px-2 py-1 focus-visible:shadow-[var(--shadow-ring)]"
            aria-label="FitFi Home"
          >
            {/* Tekst-wordmark; vervang gerust door <img> met alt als je logo-asset gebruikt */}
            <span className="text-base font-semibold tracking-wide text-[var(--color-text)]">FitFi</span>
          </a>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2" aria-label="Hoofdmenu">
          {links.map((l) => (
            <NavChip key={l.to} to={l.to} label={l.label} />
          ))}
        </nav>

        {/* CTA's + Mobile toggle */}
        <div className="flex items-center gap-2">
          {/* Nieuw: Log in (secondary/ghost) — zichtbaar op ≥sm */}
          <a
            href="/login"
            className="hidden sm:inline-flex items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)] focus-visible:shadow-[var(--shadow-ring)] h-9"
            data-event="nav_login"
          >
            Log in
          </a>

          {/* Bestond: Start gratis (primary) */}
          <a
            href="/results"
            className="hidden sm:inline-flex items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:shadow-[var(--shadow-ring)] h-9"
            data-event="nav_start_gratis"
          >
            Start gratis
          </a>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus-visible:shadow-[var(--shadow-ring)]"
            aria-label={open ? "Menu sluiten" : "Menu openen"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]"
        aria-label="Mobiel menu"
      >
        <div className="container mx-auto px-4 md:px-6 py-3">
          <ul className="flex flex-col divide-y divide-[var(--color-border)]">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    [
                      "block px-2 py-3 rounded-xl focus-visible:shadow-[var(--shadow-ring)]",
                      "transition-colors text-[var(--color-text)]",
                      isActive
                        ? "bg-[color-mix(in_oklab,var(--color-primary)_14%,transparent)] border border-[var(--color-primary)]"
                        : "hover:bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)] border border-transparent",
                    ].join(" ")
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Nieuw: Auth CTA's ook mobiel beschikbaar */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a 
              href="/login" 
              className="inline-flex items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface)] focus-visible:shadow-[var(--shadow-ring)] h-10 w-full"
            >
              Log in
            </a>
            <a 
              href="/results" 
              className="inline-flex items-center justify-center rounded-[var(--radius-xl)] bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:shadow-[var(--shadow-ring)] h-10 w-full"
            >
              Start gratis
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavChip({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "inline-flex items-center rounded-full px-3 py-1.5 text-sm text-[var(--color-text)]",
          "focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring)]",
          "transition-colors",
          isActive
            ? "bg-[color-mix(in_oklab,var(--color-primary)_12%,transparent)] border border-[var(--color-primary)]"
            : "hover:bg-[color-mix(in_oklab,var(--color-primary)_10%,transparent)] border border-transparent",
        ].join(" ")
      }
      aria-current={({ isActive }) => (isActive ? "page" : undefined) as any}
    >
      {label}
    </NavLink>
  );
}