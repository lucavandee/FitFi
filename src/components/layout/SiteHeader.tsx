import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";
import { ThemeToggleCompact } from "@/components/ui/ThemeToggle";
import Logo from "@/components/ui/Logo";

export const HEADER_NAV_LINKS = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === "/";

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }
    setScrolled(window.scrollY > 20);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const mobileTransparent = isHome && !scrolled && !open;

  return (
    <header
      role="banner"
      className={[
        "sticky top-0 z-50 transition-all duration-300",
        mobileTransparent
          ? "bg-transparent border-b border-transparent shadow-none md:nav-glass"
          : "nav-glass",
      ].join(" ")}
    >
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 w-full flex items-center justify-between">

          {/* Brand */}
          <NavLink
            to="/"
            className="inline-flex items-center transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:shadow-[var(--shadow-ring)] rounded-sm"
            aria-label="FitFi Home"
          >
            <Logo size="md" variant={mobileTransparent ? "default" : "default"} />
          </NavLink>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-5">
            <ul className="flex items-center gap-5">
              {HEADER_NAV_LINKS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      ["ff-navlink", isActive ? "ff-nav-active" : ""].join(" ")
                    }
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <ThemeToggleCompact />
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label="Open menu"
            aria-controls="ff-mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg transition-colors ff-focus-ring"
            style={{ color: "var(--color-text)" }}
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      <MobileNavDrawer open={open} onClose={() => setOpen(false)} links={HEADER_NAV_LINKS} />
    </header>
  );
}
