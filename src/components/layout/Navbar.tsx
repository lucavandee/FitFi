import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/ui/Logo";

const HOME_PATHS = ["/", ""];

/**
 * Eén premium Navbar:
 * - Floating pill design met blur
 * - Transparent op homepage hero, solid na scroll (>60px)
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
  const [scrolled, setScrolled] = React.useState(false);
  const { pathname } = useLocation();
  const { user, logout } = useUser();
  const isAuthed = !!user;
  const isHome = HOME_PATHS.includes(pathname);
  const isOnboarding = pathname === '/onboarding' || pathname.startsWith('/onboarding');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  useLockBody(open && !isOnboarding);

  // Scroll listener: transparent at top, frosted after scroll (all pages)
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Transparent only on homepage hero (not yet scrolled); all other pages always solid
  const isTransparent = isHome && !scrolled;
  const navTextClass = isTransparent
    ? "text-white/70 hover:text-white"
    : "text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F5F0EB]/80";
  const navActiveTextClass = isTransparent
    ? "text-white font-semibold"
    : "text-[#1A1A1A] font-semibold bg-[#F5F0EB]";
  const hamburgerStroke = isTransparent ? "#FFFFFF" : "#1A1A1A";

  return (
    <header
      className="fixed top-0 w-full z-50"
      role="banner"
    >
      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[55] focus:rounded-xl focus:border focus:border-[#E5E5E5] focus:bg-white focus:px-3 focus:py-2 focus:shadow-sm"
      >
        Naar hoofdinhoud
      </a>

      {/* Outer container with padding around the pill */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-4">
        {/* The pill */}
        <div
          className={[
            "flex items-center justify-between rounded-full pl-7 pr-1.5 py-1.5 transition-all duration-500",
            isTransparent
              ? "bg-transparent border border-transparent shadow-none"
              : "bg-white/85 backdrop-blur-[20px] border border-[#E5E5E5]/50 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:border-[#E5E5E5]/80",
          ].join(" ")}
        >
          {/* Brand */}
          <a
            href="/"
            className="flex-shrink-0 inline-flex items-center min-h-[44px] transition-opacity hover:opacity-85"
            aria-label="FitFi Home"
          >
            <Logo size="sm" variant={isTransparent ? "light" : "default"} />
          </a>

          {/* Desktop nav - Center */}
          <nav className="hidden md:flex items-center gap-1 mx-auto" aria-label="Hoofdmenu">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  [
                    "text-[13px] px-[18px] py-2 rounded-full transition-all duration-250 tracking-[0.1px] border-0 bg-transparent shadow-none outline-none ring-0",
                    isActive ? navActiveTextClass : `font-medium ${navTextClass}`,
                  ].join(" ")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA's */}
          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            {!isAuthed ? (
              <>
                <a
                  href="/inloggen"
                  className={[
                    "text-[13px] font-medium px-[18px] py-2 rounded-full transition-all duration-200",
                    isTransparent
                      ? "text-white/70 hover:text-white hover:bg-white/10"
                      : "text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#F5F0EB]",
                  ].join(" ")}
                  data-event="nav_login"
                >
                  Inloggen
                </a>
                <a
                  href="/registreren"
                  className="bg-[#C2654A] hover:bg-[#A8513A] text-white text-[13px] font-semibold px-7 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(194,101,74,0.2)] ml-2"
                  data-event="nav_start_gratis"
                >
                  Begin gratis
                </a>
              </>
            ) : (
              <>
                <a
                  href="/dashboard"
                  className="bg-[#C2654A] hover:bg-[#A8513A] text-white text-[13px] font-semibold px-6 py-2.5 rounded-full transition-all duration-200 inline-flex items-center gap-2"
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
                  className="text-[13px] font-medium text-[#8A8A8A] px-3.5 py-2 rounded-full hover:text-[#4A4A4A] transition-all duration-200"
                  data-event="nav_logout"
                >
                  Uitloggen
                </button>
                <div
                  aria-hidden="true"
                  className="w-[34px] h-[34px] rounded-[10px] bg-[#F4E8E3] flex items-center justify-center text-xs font-bold text-[#C2654A] cursor-pointer transition-all duration-200 hover:bg-[#C2654A] hover:text-white hover:scale-105 ml-1 select-none"
                >
                  <span>{userInitial}</span>
                </div>
              </>
            )}
          </div>

          {/* Mobile toggle - 44px touch target */}
          <button
            ref={toggleRef}
            type="button"
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full ml-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#C2654A] focus-visible:ring-offset-2 hover:bg-[#F5F0EB]/20"
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
                stroke={hamburgerStroke}
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
                stroke={hamburgerStroke}
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
                      "py-3 px-4 text-base rounded-xl border-0 shadow-none outline-none ring-0 transition-colors duration-200",
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
