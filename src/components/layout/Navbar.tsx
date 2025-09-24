import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/blog", label: "Blog" }
];

export default function Navbar() {
  return (
    <header role="banner" className="bg-surface border-b border-border sticky top-0 z-50">
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          <NavLink to="/" className="font-heading text-lg tracking-wide text-text">
            FitFi
          </NavLink>

          <ul className="hidden md:flex items-center gap-3">
            {links.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => 
                    isActive ? "ff-navlink ff-nav-active" : "ff-navlink"
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
            <NavLink to="/quiz" className="ff-btn ff-btn-primary h-9">
              Start gratis
            </NavLink>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <NavLink to="/quiz" className="ff-btn ff-btn-primary h-9">
              Menu
            </NavLink>
          </div>
        </div>
      </nav>
    </header>
  );
}