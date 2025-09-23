// src/components/layout/Navbar.tsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Eén enkele, semantische Navbar.
 * - Tokens-first (geen hex).
 * - Actieve link gebruikt `.ff-nav-active`.
 * - CTA's: .ff-btn-primary (solid), .ff-btn-secondary (ghost).
 */
const links = [
  { to: "/how-it-works", label: "Hoe het werkt" },
  { to: "/pricing", label: "Prijzen" },
  { to: "/about", label: "Over ons" },
  { to: "/faq", label: "FAQ" },
  { to: "/blog", label: "Blog" },
];

export default function Navbar() {
  return (
    <header role="banner" className="bg-surface border-b border-border sticky top-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-surface focus:border focus:border-border focus:px-3 focus:py-2 focus:rounded-md"
      >
        Naar hoofdinhoud
      </a>

      <nav aria-label="Hoofdmenu" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="min-w-0">
            <NavLink to="/" className="font-heading text-lg tracking-wide text-text hover:opacity-90">
              FitFi
            </NavLink>
          </div>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-3">
            {links.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "px-3 py-2 rounded-md text-sm font-medium text-text/90 hover:text-text transition-colors",
                      isActive ? "ff-nav-active" : "border border-transparent",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/login" className="ff-btn ff-btn-secondary h-9">
              Inloggen
            </NavLink>
            <NavLink to="/start" className="ff-btn ff-btn-primary h-9">
              Start gratis
            </NavLink>
          </div>

          {/* Mobile placeholder (bestaand drawer-component kan hier worden gemount) */}
          <div className="md:hidden">
            {/* Laat bestaande MobileNavDrawer staan indien aanwezig */}
          </div>
        </div>
      </nav>
    </header>
  );
}