import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

/**
 * Premium, rustige Navbar:
 * - Sticky + lichte blur
 * - Perfecte horizontale uitlijning via ff-container
 * - Eén CTA ("Start gratis")
 * - Toetsenbord/a11y-proof (skiplink, aria-expanded, ESC sluit)
 * - Active nav = subtiele chip (accent-tint) + duidelijke focus-ring
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
        "backdrop-blur supports-[backdrop-filter]:bg-[color-mix(in oklab,var(--color-surface) 80%,transparent)]",
        "bg-[var(--color-surface)]/90",
      ].join(" ")}
      role="banner"
    >
      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60] focus:rounded-[var(--radius-xl)] focus:bg-[var(--color-surface)] focus:px-3 focus:py-2 focus:shadow-[var(--shadow-ring)]"
      >
        Naar hoofdinhoud
      </a>

      <div className="ff-container h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className="font-heading text-lg tracking-tight hover:opacity-90 focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring)] rounded-[var(--radius-xl)] px-1 py-1"
            aria-label="FitFi Home"
          >
            FitFi
          </NavLink>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Hoofdmenu">
          {links.map((l) => (
            <NavChip key={l.to} to={l.to} label={l.label} />
          ))}
        </nav>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-2">
          <a
            href="/results"
            className="hidden sm:inline-flex ff-btn ff-btn-primary h-9"
            data-event="nav_start_gratis"
          >
            Start gratis
          </a>
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
        role="dialog"
        aria-modal="true"
        aria-label="Mobiel menu"
      >
        <div className="ff-container py-3">
          <ul className="grid">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    [
                      "block px-2 py-2 rounded-[var(--radius-lg)]",
                      "hover:bg-[color-mix(in oklab,var(--color-primary) 10%,transparent)]",
                      isActive
                        ? "bg-[color-mix(in oklab,var(--color-primary) 14%,transparent)] border border-[var(--color-primary)]"
                        : "border border-transparent",
                    ].join(" ")
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <a href="/results" className="ff-btn ff-btn-primary w-full h-10">
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