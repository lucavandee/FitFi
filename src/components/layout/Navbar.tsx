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
      className="fixed top-0 w-full bg-[#FAFAF8]/90 backdrop-blur-md border-b border-[#E5E5E5]/60 z-40"
      role="banner"
    >
      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[60] focus:rounded-xl focus:border focus:border-[#E5E5E5] focus:bg-white focus:px-3 focus:py-2 focus:shadow-sm"
      >
        Naar hoofdinhoud
      </a>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <a
          href="/"
          className="flex-shrink-0 inline-flex items-center rounded-xl px-2 py-2 min-h-[44px] transition-opacity hover:opacity-85"
          aria-label="FitFi Home"
        >
          <Logo size="sm" variant="default" />
        </a>

        {/* Desktop nav - Center */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Hoofdmenu">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                [
                  "text-sm transition-colors duration-200",
                  isActive
                    ? "font-semibold text-[#1A1A1A]"
                    : "font-medium text-[#4A4A4A] hover:text-[#1A1A1A]",
                ].join(" ")
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA's */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthed ? (
            <>
              <a
                href="/inloggen"
                className="text-sm font-medium text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors duration-200"
                data-event="nav_login"
              >
                Inloggen
              </a>
              {!isHome && (
                <a
                  href="/registreren"
                  className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors duration-200"
                  data-event="nav_start_gratis"
                >
                  Begin gratis
                </a>
              )}
            </>
          ) : (
            <>
              <a
                href="/dashboard"
                className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-sm py-2.5 px-5 rounded-xl transition-colors duration-200 inline-flex items-center gap-2"
                data-event="nav_dashboard"
              >
                Dashboard
                {savedOutfitsCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[#A8513A] text-white text-xs font-bold rounded-full">
                    <Heart className="w-3 h-3 fill-white" />
                    {savedOutfitsCount}
                  </span>
                )}
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-medium text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors duration-200"
                data-event="nav_logout"
              >
                Uitloggen
              </button>
              <div
                aria-hidden="true"
                className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-[#C2654A]/10 text-[#C2654A] select-none"
              >
                <span className="text-sm font-semibold">{userInitial}</span>
              </div>
            </>
          )}
        </div>

        {/* Mobile toggle - 44px touch target */}
        <button
          ref={toggleRef}
          type="button"
          className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-xl ml-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A] focus-visible:ring-offset-2 hover:bg-[#F5F0EB]"
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
              stroke="#1A1A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
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
              stroke="#1A1A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 12h16" />
              <path d="M4 6h16" />
              <path d="M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Slide-in panel */}
          <div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobiel navigatiemenu"
            className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-[#FAFAF8] shadow-xl z-50 md:hidden"
          >
            {/* Close button */}
            <div className="flex items-center justify-end h-16 px-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Menu sluiten"
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[#F5F0EB] transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1A1A1A"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col py-8 px-6 space-y-1" aria-label="Mobiel hoofdmenu">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "py-3 px-4 text-base rounded-xl transition-colors duration-200",
                      isActive
                        ? "font-semibold text-[#1A1A1A] bg-[#F5F0EB]"
                        : "font-medium text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#F5F0EB]",
                    ].join(" ")
                  }
                >
                  {l.label}
                </NavLink>
              ))}

              {/* Auth CTA's mobiel */}
              {!isAuthed ? (
                <div className="mt-6 pt-4 border-t border-[#E5E5E5] space-y-3">
                  <a
                    href="/inloggen"
                    className="block text-center text-sm font-medium text-[#4A4A4A] hover:text-[#1A1A1A] py-3 transition-colors duration-200"
                  >
                    Inloggen
                  </a>
                  <a
                    href="/registreren"
                    className="block bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl text-center transition-colors duration-200"
                  >
                    Begin gratis
                  </a>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t border-[#E5E5E5] space-y-3">
                  <a
                    href="/dashboard"
                    className="block bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-base py-3 px-6 rounded-xl text-center transition-colors duration-200"
                  >
                    Dashboard
                    {savedOutfitsCount > 0 && (
                      <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-[#A8513A] text-white text-xs font-bold rounded-full">
                        <Heart className="w-3 h-3 fill-white" />
                        {savedOutfitsCount}
                      </span>
                    )}
                  </a>
                  <button
                    onClick={() => { handleLogout(); setOpen(false); }}
                    className="block w-full text-center text-sm font-medium text-[#4A4A4A] hover:text-[#1A1A1A] py-3 transition-colors duration-200"
                  >
                    Uitloggen
                  </button>
                </div>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
