import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useUser } from "@/context/UserContext";

/**
 * Eén premium Navbar:
 * - Sticky + lichte blur
 * - Desktop: links + (Login/Start gratis) of (Dashboard/Uitloggen) bij auth
 * - Mobiel: sheet met dezelfde opties
 * - A11Y: skiplink, aria-expanded, ESC sluit, focus-ring via tokens
 * - Auth: Supabase via UserContext
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
  { to: "/results", label: "Voorbeeld" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useUser();
  const isAuthed = !!user;
  useLockBody(open);

  // Sluit menu bij routewissel of ESC
  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const userInitial = user?.name?.[0]?.toUpperCase() || "U";

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

        {/* Desktop nav - Right aligned */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <nav className="flex items-center gap-2" aria-label="Hoofdmenu">
            {links.map((l) => (
              <NavChip key={l.to} to={l.to} label={l.label} />
            ))}
          </nav>

          {/* CTA's */}
          <div className="flex items-center gap-2">
            {!isAuthed ? (
              <>
                <a href="/inloggen" className="inline-flex ff-btn ff-btn-secondary h-9" data-event="nav_login">
                  Inloggen
                </a>
                <a href="/onboarding" className="inline-flex ff-btn ff-btn-primary h-9" data-event="nav_start_gratis">
                  Begin gratis
                </a>
              </>
            ) : (
              <>
                <a href="/dashboard" className="inline-flex ff-btn ff-btn-primary h-9" data-event="nav_dashboard">
                  Dashboard
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex ff-btn ff-btn-secondary h-9"
                  data-event="nav_logout"
                >
                  Uitloggen
                </button>
                <div
                  aria-label="Account"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[var(--overlay-accent-08a)] text-[var(--color-primary)]"
                >
                  <span className="text-sm font-semibold">{userInitial}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] focus-visible:shadow-[var(--shadow-ring)] ml-2"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
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
          {!isAuthed ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <a href="/inloggen" className="ff-btn ff-btn-secondary h-10 w-full">Log in</a>
              <a href="/results" className="ff-btn ff-btn-primary h-10 w-full">Start gratis</a>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <a href="/dashboard" className="ff-btn ff-btn-primary h-10 w-full col-span-2">Dashboard</a>
              <button onClick={handleLogout} className="ff-btn ff-btn-secondary h-10 w-full">Uitloggen</button>
            </div>
          )}
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