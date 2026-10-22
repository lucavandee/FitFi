import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/ui/Logo";
import { useHoogteInVariabele } from "@/hooks/useHoogteInVariabele";
import { useKamerNav } from "@/components/landing/v3/kamerNav";

/**
 * Eén premium Navbar:
 * - Floating pill op een dekkende band, op elke pagina en vanaf de eerste pixel.
 *   Op / stond hij eerst transparant boven de hero, met witte tekst op 70
 *   procent. Gemeten op 9 oktober 2026 (fase 4, L24-methode): Inloggen 1,08:1,
 *   Contact 1,14 tot 1,4:1, Hoe het werkt 2,3 tot 3,1:1 op de lichte kant van
 *   de hero, van 768 tot 1440 breed. WCAG 1.4.3 vraagt 4,5:1.
 * - Desktopnavigatie vanaf lg (1024 px). Tussen 768 en 1023 px paste hij niet:
 *   'Hoe het werkt' brak af, de kop groeide naar 104 tot 125 px en op 768 viel
 *   'Begin gratis' 10 px buiten beeld. Daaronder het menu achter de knop.
 * - Zichtbare focus op het logo en elke link: 2 px #1A1A1A met 2 px afstand.
 *   Hier stond outline-none ring-0, en dat zette de globale ring uit
 *   (WCAG 2.4.7).
 * - Auth: Supabase via UserContext
 * - Op de homepage, zolang de kleurkamer bovenin staat: transparant, zonder
 *   band en pil, met tekst in de kleur van de kamer en zonder eigen knop (de
 *   held heeft de enige primaire knop). De tekstkleur komt uit de kamer en is
 *   per kamer op contrast getoetst; dat is wat de oude transparante kop miste.
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

/** De focusring voor de kop en het menu: beide liggen op wit of #FAFAF8. */
const FOCUS = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]";

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
  const kamer = useKamerNav();
  const opHome = pathname === "/";
  const opKamer = opHome && kamer.actief && !open;
  /** Op de homepage: een platte balk in de vormtaal van de kleurkamer; tekst in de kamerkleur of in inkt. */
  const homeKleur = opKamer ? kamer.tekst : "#1A1A1A";
  const kamerTekst: React.CSSProperties | undefined = opHome ? { color: homeKleur, outlineColor: homeKleur } : undefined;
  const HOME_LINK_BASIS = "inline-flex items-center min-h-[44px] text-[15px] px-3 underline-offset-[6px] decoration-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";
  const HOME_LINK = `${HOME_LINK_BASIS} transition-colors duration-200`;
  /*
   * De knop rechts houdt altijd zijn plek (9,5 rem breed, 1 rem ervoor), zodat
   * het menu in het midden nooit verschuift. Boven de kamer is hij weg en staat
   * Inloggen op die plek, op de rechterrand; na de held schuift Inloggen terug
   * (transform, geen layoutverschuiving) en komt de knop op.
   */
  const inloggenStijl: React.CSSProperties | undefined = opHome ? { ...kamerTekst, transform: opKamer ? "translateX(10.5rem)" : "none" } : undefined;
  const isOnboarding = pathname === '/onboarding' || pathname.startsWith('/onboarding');
  const menuRef = React.useRef<HTMLDivElement>(null);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const headerRef = React.useRef<HTMLElement>(null);
  useLockBody(open && !isOnboarding);

  // De kop heeft geen vaste hoogteklasse: een zwevende pil met eigen padding,
  // 90 px op elke breedte en hoger bij grotere tekst. index.css rekent
  // scroll-padding-top uit --header-h; sticky labels en ankers kunnen hem ook
  // lezen. Op de quiz is er geen kop en valt de variabele terug op 90 px.
  useHoogteInVariabele(headerRef, "--header-h", !isOnboarding);

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

  // Het menu bestaat alleen onder lg. Draait een tablet naar liggend terwijl
  // het open staat, dan verdwijnt het paneel via lg:hidden, maar bleef de body
  // op slot (useLockBody) en kon niemand meer scrollen.
  React.useEffect(() => {
    if (!open) return;
    const breed = window.matchMedia("(min-width: 1024px)");
    const sluit = () => {
      if (breed.matches) setOpen(false);
    };
    sluit();
    breed.addEventListener("change", sluit);
    return () => breed.removeEventListener("change", sluit);
  }, [open]);
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
      ref={headerRef}
      className="fixed top-0 w-full z-50"
      role="banner"
    >
      {/* Dekkende band achter de pill. De pill dekt maar een deel van de 90 px
          hoge header, dus zonder deze laag scrolt tekst er zichtbaar doorheen. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[#FAFAF8] border-b border-[#E5E5E5]"
        style={
          opKamer
            ? { backgroundColor: kamer.veld, borderBottomColor: "transparent", transition: "background-color 420ms cubic-bezier(0.2, 0, 0, 1)" }
            : opHome
              ? { borderBottomColor: "rgba(26,26,26,0.14)" }
              : undefined
        }
      />

      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[55] focus:flex focus:items-center focus:min-h-[44px] focus:rounded-xl focus:border focus:border-[#E5E5E5] focus:bg-white focus:px-3 focus:py-2 focus:shadow-sm"
      >
        Naar hoofdinhoud
      </a>

      {/* Outer container with padding around the pill */}
      <div className={opHome ? "relative flex h-14 items-center px-[var(--rand)] lg:h-16" : "relative max-w-[1400px] mx-auto px-6 md:px-12 py-4"}>
        {/* The pill (op de homepage: geen pil, een platte balk) */}
        <div
          className={
            opHome
              ? "flex w-full items-center justify-between"
              : "flex items-center justify-between rounded-full pl-7 pr-1.5 py-1.5 transition-colors duration-200 bg-white border border-[#E5E5E5] transition-shadow hover:shadow-md"
          }
        >
          {/* Brand */}
          <a
            href="/"
            style={kamerTekst}
            className={`flex-shrink-0 inline-flex items-center min-h-[44px] transition-opacity hover:opacity-85 ${opHome ? "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2" : `rounded-xl ${FOCUS}`}`}
            aria-label="FitFi Home"
          >
            {/* Op de homepage een maat groter: in de platte balk is het woordmerk het enige merkteken. */}
            <Logo size={opHome ? "md" : "sm"} variant={opKamer && kamer.licht ? "light" : opHome ? "inkt" : "default"} />
          </a>

          {/* Desktop nav - Center */}
          <nav className="hidden lg:flex items-center gap-1 mx-auto" aria-label="Hoofdmenu">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                style={kamerTekst}
                className={({ isActive }) =>
                  opHome
                    ? `${HOME_LINK} ${isActive ? "underline font-semibold" : "font-medium hover:underline"}`
                    : [
                        `inline-flex items-center min-h-[44px] text-sm px-[18px] py-2 rounded-full transition-all duration-250 tracking-[0.1px] border-0 bg-transparent shadow-none ${FOCUS}`,
                        isActive
                          ? "text-[#1A1A1A] font-semibold bg-[#F5F0EB]"
                          : "font-medium text-[#6E6E6E] hover:text-[#1A1A1A] hover:bg-[#F5F0EB]/80",
                      ].join(" ")
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA's */}
          <div className="hidden lg:flex items-center gap-1 flex-shrink-0">
            {!isAuthed ? (
              <>
                <a
                  href="/inloggen"
                  style={inloggenStijl}
                  className={
                    opHome
                      ? `${HOME_LINK_BASIS} font-medium hover:underline transition-[transform,color] duration-[420ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none`
                      : `inline-flex items-center min-h-[44px] text-sm font-medium px-[18px] py-2 rounded-full transition-all duration-200 text-[#4A4A4A] hover:text-[#1A1A1A] hover:bg-[#F5F0EB] ${FOCUS}`
                  }
                  data-event="nav_login"
                >
                  Inloggen
                </a>
                {opHome ? (
                  /* Boven de kamer onzichtbaar maar op zijn plek: de held heeft de enige
                     primaire knop, en het menu verspringt niet als de knop terugkomt. */
                  <a
                    href="/onboarding"
                    aria-hidden={opKamer || undefined}
                    tabIndex={opKamer ? -1 : undefined}
                    className={`ml-3 inline-flex min-h-[40px] w-[9.5rem] items-center justify-center bg-[#1A1A1A] text-[15px] font-semibold text-[#FAFAF8] transition-[opacity,visibility,background-color] duration-200 hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A] motion-reduce:transition-none ${opKamer ? "invisible opacity-0" : "visible opacity-100"}`}
                    data-event="nav_start_gratis"
                  >
                    Begin gratis
                  </a>
                ) : (
                  <a
                    href="/onboarding"
                    className="inline-flex items-center min-h-[44px] bg-[#A85740] hover:bg-[#9A503B] text-white text-sm font-semibold px-7 py-2.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ml-2"
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
                  style={kamerTekst}
                  className={
                    opHome
                      ? `${HOME_LINK} gap-2 font-semibold underline`
                      : "bg-[#A85740] hover:bg-[#9A503B] text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all duration-200 inline-flex items-center gap-2 min-h-[44px]"
                  }
                  data-event="nav_dashboard"
                >
                  Dashboard
                  {savedOutfitsCount > 0 && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#9A503B] text-white text-xs font-bold rounded-full">
                      <Heart className="w-3 h-3 fill-white" />
                      {savedOutfitsCount}
                    </span>
                  )}
                </a>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={kamerTekst}
                  className={
                    opHome
                      ? `${HOME_LINK} font-medium hover:underline`
                      : "inline-flex items-center min-h-[44px] text-sm font-medium text-[#6E6E6E] px-3.5 py-2 rounded-full hover:text-[#4A4A4A] transition-all duration-200"
                  }
                  data-event="nav_logout"
                >
                  Uitloggen
                </button>
                {!opHome && (
                <div
                  aria-hidden="true"
                  className="w-[34px] h-[34px] rounded-[10px] bg-[#F4E8E3] flex items-center justify-center text-xs font-bold text-[#A85740] cursor-pointer transition-all duration-200 hover:bg-[#A85740] hover:text-white hover:scale-105 ml-1 select-none"
                >
                  <span>{userInitial}</span>
                </div>
                )}
              </>
            )}
          </div>

          {/* Mobile toggle - 44px touch target */}
          <button
            ref={toggleRef}
            type="button"
            style={opHome ? { outlineColor: homeKleur } : undefined}
            className={
              opHome
                ? "lg:hidden inline-flex h-11 w-11 items-center justify-center ml-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                : "lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-full ml-2 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#A85740] focus-visible:ring-offset-2 hover:bg-[#F5F0EB]/20"
            }
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
                stroke={opHome ? homeKleur : "#1A1A1A"}
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
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Slide-in panel */}
          <div
            ref={menuRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Mobiel navigatiemenu"
            className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-[#FAFAF8] shadow-xl z-50 lg:hidden"
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
                      `py-3 px-4 text-base rounded-xl border-0 shadow-none transition-colors duration-200 ${FOCUS}`,
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
                    href="/onboarding"
                    className="block bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base py-3 px-6 rounded-xl text-center transition-colors duration-200"
                  >
                    Begin gratis
                  </a>
                </div>
              ) : (
                <div className="mt-6 pt-4 border-t border-[#E5E5E5] space-y-3">
                  <a
                    href="/dashboard"
                    className="block bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base py-3 px-6 rounded-xl text-center transition-colors duration-200"
                  >
                    Dashboard
                    {savedOutfitsCount > 0 && (
                      <span className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 bg-[#9A503B] text-white text-xs font-bold rounded-full">
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
