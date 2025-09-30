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
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
];

export default function Navbar() {
  // Gebruik een state om te bepalen of het mobiele menu open is. Wanneer
  // het menu open staat, tonen we een overlay met de navigatie-items.
  const [open, setOpen] = React.useState(false);
  return (
    <header role="banner" className="ff-nav-glass">
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          <NavLink to="/" className="font-heading text-lg tracking-wide text-[var(--ff-color-text)]">
            FitFi
          </NavLink>
          {/* Desktop navigatie */}
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
          {/* Desktop CTA's */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/login" className="ff-btn ff-btn-secondary h-9">Inloggen</NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-9">Start gratis</NavLink>
            <DarkModeToggle />
          </div>
          {/* Mobiele navigatie: hamburger en dark mode toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)]"
            >
              {/* Hamburger icoon */}
              <span className="sr-only">Menu</span>
              {/* We gebruiken een eenvoudige unicode hamburger als fallback */}
              <svg
                className="h-5 w-5 text-[var(--ff-color-text)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <DarkModeToggle />
          </div>
        </div>
      </nav>
      {/* Mobiele menu overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--ff-color-bg)]/90 backdrop-blur-sm">
          {/* Sluitknop */}
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Sluit menu"
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)]"
            >
              {/* Kruisicoon */}
              <span className="sr-only">Sluit</span>
              <svg
                className="h-5 w-5 text-[var(--ff-color-text)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {/* Mobiele navigatie-items */}
          <nav aria-label="Mobiel" className="flex flex-col items-start gap-4 p-6 pt-0">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => ["ff-navlink text-lg", isActive ? "ff-nav-active" : ""].join(" ")}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink to="/login" className="ff-btn ff-btn-secondary w-full h-10" onClick={() => setOpen(false)}>
              Inloggen
            </NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-primary w-full h-10" onClick={() => setOpen(false)}>
              Start gratis
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}