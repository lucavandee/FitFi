import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/ui/Logo";

const HOME_PATHS = ["/", ""];

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
  const [savedOutfitsCount, setSavedOutfitsCount] = React.useState(0);
  const { pathname } = useLocation();
  const { user, logout } = useUser();
  const isAuthed = !!user;
  const isHome = HOME_PATHS.includes(pathname);
  const isOnboarding = pathname === '/onboarding' || pathname.startsWith('/onboarding');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  useLockBody(open && !isOnboarding);

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
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Sluit menu bij routewissel of ESC
  React.useEffect(() => setOpen(false), [pathname]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus trap: zet focus op eerste focusbaar element als menu opent
  React.useEffect(() => {
    if (!open || !menuRef.current) return;
    const focusable = menuRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    focusable[0]?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !menuRef.current) return;
      const all = Array.from(menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      ));
      if (!all.length) return;
      const first = all[0];
      const last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [open]);

  // Verberg navbar tijdens quiz/onboarding — altijd ná alle hooks
  if (isOnboarding) {
    return null;
  }

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
          className="inline-flex items-center rounded-xl px-2 py-2 min-h-[44px] focus-visible:shadow-[var(--shadow-ring)] transition-opacity hover:opacity-85"
          aria-label="FitFi Home"
        >
          <Logo size="sm" variant="default" />
        </a>

        {/* Desktop nav - Right aligned */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <nav className="flex items-center gap-2" aria-label="Hoofdmenu">
            {links.map((l) => (
              <NavChip key={l.to} to={l.to} label={l.label} />
            ))}
          </nav>

          {/* CTA's - op homepagina verborgen; hero-CTAs nemen de rol over */}
          <div className="flex items-center gap-2">
            {!isAuthed ? (
              !isHome && (
                <>
                  <a href="/inloggen" className="inline-flex ff-btn ff-btn-secondary min-h-[44px] px-4" data-event="nav_login">
                    Inloggen
                  </a>
                  <a href="/registreren" className="inline-flex ff-btn ff-btn-primary min-h-[44px] px-4" data-event="nav_start_gratis">
                    Stijladvies ontvangen
                  </a>
                </>
              )
            ) : (
              <>
                <a
                  href="/dashboard"
                  className="inline-flex items-center gap-2 ff-btn ff-btn-primary min-h-[44px] px-4 relative"
                  data-event="nav_dashboard"
                >
                  Dashboard
                  {savedOutfitsCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--ff-color-primary-700)] text-white text-xs font-bold rounded-full">
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
                  aria-hidden="true"
                  className="inline-flex items-center justify-center h-11 w-11 rounded-full bg-[var(--overlay-accent-08a)] text-[var(--color-primary)] select-none"
                >
                  <span className="text-sm font-semibold">{userInitial}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle - 44px touch target */}
        <button
          ref={toggleRef}
          type="button"
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl ml-2 transition-all group outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2 hover:bg-[var(--ff-color-primary-50)]"
          aria-label={open ? "Menu sluiten" : "Menu openen"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform"
              aria-hidden="true"
              style={{
                stroke: 'var(--color-text)',
                color: 'var(--color-text)'
              }}
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:scale-110 transition-transform"
              aria-hidden="true"
              style={{
                stroke: 'var(--color-text)',
                color: 'var(--color-text)'
              }}
            >
              <path d="M4 12h16" />
              <path d="M4 6h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile sheet */}
      <div
        ref={menuRef}
        id="mobile-menu"
        hidden={!open}
        role="dialog"
        aria-modal="true"
        aria-label="Mobiel navigatiemenu"
        className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)]"
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

          {/* Auth CTA's mobiel - op homepagina verborgen */}
          {!isAuthed ? (
            !isHome && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <a href="/inloggen" className="ff-btn ff-btn-secondary min-h-[44px] w-full">Log in</a>
                <a href="/registreren" className="ff-btn ff-btn-primary min-h-[44px] w-full">Stijladvies ontvangen</a>
              </div>
            )
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2">
              <a
                href="/dashboard"
                className="ff-btn ff-btn-primary min-h-[44px] w-full col-span-2 flex items-center justify-center gap-2"
              >
                Dashboard
                {savedOutfitsCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--ff-color-primary-700)] text-white text-xs font-bold rounded-full">
                    <Heart className="w-3 h-3 fill-white" />
                    {savedOutfitsCount}
                  </span>
                )}
              </a>
              <button onClick={handleLogout} className="ff-btn ff-btn-secondary min-h-[44px] w-full">Uitloggen</button>
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
          "outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-600)] focus-visible:ring-offset-2",
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