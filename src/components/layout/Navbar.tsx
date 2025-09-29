import React from "react";
import { NavLink } from "react-router-dom";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

// Hoofdmenu items. In lijn met de SaaS standaard wordt er expliciet
// verwezen naar het product, prijzen, veelgestelde vragen en een
// contactpagina. De volgorde is bewust gekozen om gebruikers snel
// naar de juiste plek te leiden.
const links = [
  { to: "/product", label: "Product" },
  { to: "/prijzen", label: "Prijs" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

// Definitieve navigatie voor het hoofdmenu. We verwijzen naar de
// belangrijkste publieke pagina's en laten de contactpagina weg
// (support verloopt via mail of het contactformulier). De labels
// sluiten aan op de live routes. Deze array wordt gebruikt in de
// rendering i.p.v. `links`, dat behouden blijft voor backwards
// compatibiliteit van andere modules.
const navLinks = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen",       label: "Prijzen" },
  { to: "/over-ons",       label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
];

export default function Navbar() {
  return (
    <header role="banner" className="ff-nav-glass">
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          <NavLink to="/" className="font-heading text-lg tracking-wide text-text">FitFi</NavLink>

          <ul className="hidden md:flex items-center gap-4">
            {navLinks.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => ["ff-navlink", isActive ? "ff-nav-active" : ""].join(" ")}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/login" className="ff-btn ff-btn-secondary h-9">Inloggen</NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-9">Start gratis</NavLink>
            <DarkModeToggle />
          </div>

          {/* Mobiel: één CTA die naar het prijsoverzicht leidt en eventueel een drawer opent */}
          <div className="md:hidden flex items-center gap-2">
            <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-9">Menu</NavLink>
            <DarkModeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
}