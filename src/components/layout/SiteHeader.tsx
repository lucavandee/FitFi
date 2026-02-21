import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";
import { ThemeToggleCompact } from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Drawer sluit altijd bij route-wissel
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header role="banner" className="nav-glass sticky top-0 z-50">
      {/* Exact dezelfde containerbreedte/padding als homepage */}
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 w-full flex items-center justify-between">
          {/* Brand */}
          <NavLink
            to="/"
            className="font-heading text-lg tracking-wide text-[var(--color-text)]"
          >
            FitFi
          </NavLink>

          {/* Desktop navigatie */}
          <div className="hidden md:flex items-center gap-5">
            <ul className="flex items-center gap-5">
              {NAV_LINKS.map((item) => (
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

          {/* Mobiele trigger */}
          <button
            type="button"
            aria-label="Open menu"
            aria-controls="ff-mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-colors ff-focus-ring"
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

      {/* Drawer (bestaand component) */}
      <MobileNavDrawer open={open} onClose={() => setOpen(false)} links={NAV_LINKS} />
    </header>
  );
}