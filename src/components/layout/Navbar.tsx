import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

/**
 * Premium, rustige Navbar:
 * - Sticky + lichte blur
 * - Eén Navbar (geen extra headers)
 * - Desktop: links + Log in (secondary) + Start gratis (primary)
 * - Mobiel: sheet met dezelfde links + Log in / Start gratis
 * - A11Y: skiplink, aria-expanded, ESC sluit, focus-ring via tokens
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

  // Sluit menu bij routewissel of ESC
  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b border-[var(--color-border)]",
        "backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in oklab,var(--color-surface) 80%,transparent)]",
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

      <div className="ff-container h-16 flex items-center justify-between">
        {/* Brand */}
        <a
          href="/"
          className="inline-flex items-center rounded-xl px-2 py-1 focus-visible:shadow-[var(--shadow-ring)]"
          aria-label="FitFi Home"
        >
          <span className="text-base font-semibold tracking-wide">FitFi</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2" aria-label="Hoofdmenu">
          {links.map((l) => (
            <NavChip key={l.to} to={l.to} label={l.label} />
          ))}
        </nav>

        {/* CTA's + Mobile toggle */}
        <div className="flex items-center gap-2">
          {/* Nieuw: Log in (secondary/ghost) — ≥ sm */}
          <a href="/login" className="hidden sm:inline-flex ff-btn ff-btn-secondary h-9" data-event="nav_login">
            Log in
          </a>
          {/* Primaire CTA */}
          <a href="/results" className="hidden sm:inline-flex ff-btn ff-btn-primary h-9" data-event="nav_start_gratis">
            Start gratis
          </a>

          {/* Mobile toggle */}
          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] focus-visible:shadow-[var(--shadow-ring)]"
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
        <div className="ff-container py-3">
          <ul className="flex flex-col divide-y divide-[var(--color-border)]">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    [
                      "block px-2 py-3 rounded-xl focus-visible:shadow-[var(--shadow-ring)] transition-colors",
                      isActive
                        ? "bg-[color-mix(in oklab,var(--color-primary) 14%,transparent)] border border-[var(--color-primary)]"
                        : "hover:bg-[color-mix(in oklab,var(--color-primary) 10%,transparent)] border border-transparent",
                    ].join(" ")
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Auth CTA's mobiel */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <a href="/login" className="ff-btn ff-btn-secondary h-10 w-full">
              Log in
            </a>
            <a href="/results" className="ff-btn ff-btn-primary h-10 w-full">
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
          "inline-flex items-center rounded-full px-3 py-1.5 text-sm",
          "focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring)]",
          "transition-colors",
          isActive
            ? "bg-[color-mix(in oklab,var(--color-primary) 12%,transparent)] border border-[var(--color-primary)]"
            : "hover:bg-[color-mix(in oklab,var(--color-primary) 10%,transparent)] border border-transparent",
        ].join(" ")
      }
      aria-current={({ isActive }) => (isActive ? "page" : undefined) as any}
    >
      {label}
    </NavLink>
  );
}