import React from "react";
import { NavLink } from "react-router-dom";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

/**
 * Sticky, translucente navigatie met snelle links.
 * Respecteert tokens en bestaande glass-styles via `ff-nav-glass`.
 */
const links = [
  { to: "/product", label: "Product" },
  { to: "/prijzen", label: "Prijs" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header role="banner" className="ff-nav-glass">
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          <NavLink to="/" className="font-heading text-lg tracking-wide text-text">
            FitFi
          </NavLink>

          <ul className="hidden md:flex items-center gap-4">
            {links.map((item) => (
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

          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/login" className="ff-btn ff-btn-secondary h-9">
              Inloggen
            </NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-9">
              Start gratis
            </NavLink>
            <DarkModeToggle />
          </div>

          {/* Mobiel: compacte actie + toggle */}
          <div className="md:hidden flex items-center gap-2">
            <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-9">
              Menu
            </NavLink>
            <DarkModeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}