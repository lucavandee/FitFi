import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
];

export default function SiteHeader() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Sluit de mobile drawer bij routewissel
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header role="banner" className="ff-nav-glass">
      {/* BELANGRIJK: exact dezelfde containerbreedte/padding als homepage */}
      <div className="ff-container px-4 md:px-6">
        <div className="h-16 w-full flex items-center justify-between">
          {/* Brand */}
          <NavLink
            to="/"
            className="font-heading text-lg tracking-wide text-[var(--color-text)]"
          >
            FitFi
          </NavLink>

          {/* Desktop navigatie */}
          <ul className="hidden md:flex items-center gap-5">
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

          {/* Mobiele trigger – alleen zichtbaar < md */}
          <button
            type="button"
            aria-label="Open menu"
            aria-controls="ff-mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className={[
              "md:hidden",
              "h-11 w-11 inline-flex items-center justify-center",
              "rounded-[var(--radius-xl)] border border-transparent",
              "bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)]",
              "shadow-[var(--shadow-soft)] ff-focus-ring",
              "text-white transition-transform active:scale-[0.98]"
            ].join(" ")}
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
      </div>

      {/* Mobile drawer wordt in bestaand component gerenderd (ongewijzigd) */}
    </header>
  );
}