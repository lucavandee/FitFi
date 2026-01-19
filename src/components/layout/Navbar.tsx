import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, Heart } from "lucide-react";
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
  { to: "/prijzen", label: "Prijzen" },
  { to: "/blog", label: "Blog" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useUser();
  const isAuthed = !!user;
  useLockBody(open);

  const [savedOutfitsCount, setSavedOutfitsCount] = React.useState(0);

  React.useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]");
      setSavedOutfitsCount(saved.length);
    } catch {
      setSavedOutfitsCount(0);
    }

    const handleStorageChange = () => {
      try {
        const saved = JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]");
        setSavedOutfitsCount(saved.length);
      } catch {
        setSavedOutfitsCount(0);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 2000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

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
          className="inline-flex items-center rounded-xl px-3 py-2 min-h-[44px] focus-visible:shadow-[var(--shadow-ring)]"
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

          {/* CTA's - 44px touch targets */}
          <div className="flex items-center gap-2">
            {!isAuthed ? (
              <>
                <a href="/inloggen" className="inline-flex ff-btn ff-btn-secondary min-h-[44px] px-4" data-event="nav_login">
                  Inloggen
                </a>
                <a href="/registreren" className="inline-flex ff-btn ff-btn-primary min-h-[44px] px-4" data-event="nav_start_gratis">
                  Begin gratis
                </a>
              </>
            ) : (
              <>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 ff-btn ff-btn-primary min-h-[44px] px-4 relative"
                  data-event="nav_dashboard"
                >
                  Dashboard
                  {savedOutfitsCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full">
                      <Heart className="w-3 h-3 fill-white" />
                      {savedOutfitsCount}
                    </span>
                  )}
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex ff-btn ff-btn-secondary min-h-[44px] px-4"
                  data-event="nav_logout"
                >
                  Uitloggen
                </button>
                <div
                  aria-label="Account"
                  className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-[var(--overlay-accent-08a)] text-[var(--color-primary)]"
                >
                  <span className="text-sm font-semibold">{userInitial}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle - 44px touch target */}
        <button
          type="button"
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-xl)] border-2 border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--ff-color-primary-600)] hover:bg-[var(--ff-color-primary-50)] focus-visible:shadow-[var(--shadow-ring)] ml-2 transition-all group"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="h-6 w-6 text-[var(--ff-color-primary-700)] group-hover:text-[var(--ff-color-primary-800)]" strokeWidth={2.5} aria-hidden />
          ) : (
            <Menu className="h-6 w-6 text-[var(--ff-color-primary-700)] group-hover:text-[var(--ff-color-primary-800)]" strokeWidth={2.5} aria-hidden />
          )}
        </button>
      </div>

      {/* Mobile sheet */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]"
        aria-label="Mobiel menu"
      >
        <div className="ff-container py-4">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    [
                      "block px-4 py-3 min-h-[44px] rounded-xl focus-visible:shadow-[var(--shadow-ring)] transition-colors font-medium",
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

          {/* Auth CTA's mobiel - 44px touch targets */}
          {!isAuthed ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <a href="/inloggen" className="ff-btn ff-btn-secondary min-h-[44px] w-full">Log in</a>
              <a href="/registreren" className="ff-btn ff-btn-primary min-h-[44px] w-full">Start gratis</a>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <a
                href="/dashboard"
                className="ff-btn ff-btn-primary min-h-[44px] w-full col-span-2 flex items-center justify-center gap-2"
              >
                Dashboard
                {savedOutfitsCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full">
                    <Heart className="w-3 h-3 fill-white" />
                    {savedOutfitsCount}
                  </span>
                )}
              </a>
              <button onClick={handleLogout} className="ff-btn ff-btn-secondary min-h-[44px] w-full">Uit</button>
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
          "inline-flex items-center rounded-full px-4 py-2 text-sm min-h-[44px]",
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