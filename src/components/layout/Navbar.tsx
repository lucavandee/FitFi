import React, { useEffect, useState } from "react";
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
  /**
   * De navigatie heeft twee belangrijke toestanden: `open` voor het mobiele
   * overlay‑menu en `isDesktop` voor het bepalen welke layout getoond moet
   * worden. We luisteren naar `resize` zodat het overlay automatisch
   * sluit wanneer de gebruiker naar een groter scherm navigeert. Dit voorkomt
   * dat het hamburger‑menu per ongeluk open blijft bij een herlaad of
   * schermrotatie.
   */
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false
  );

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      setIsDesktop(desktop);
      // Sluit het mobiele menu bij overschakeling naar desktop
      if (desktop) setOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header role="banner" className="ff-nav-glass">
      <nav aria-label="Hoofdmenu" className="ff-container">
        <div className="h-16 flex items-center justify-between">
          <NavLink to="/" className="font-heading text-lg tracking-wide text-[var(--ff-color-text)]">
            FitFi
          </NavLink>
          {/* Links & CTA's voor desktop */}
          {isDesktop && (
            <>
              <ul className="flex items-center gap-4">
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
              <div className="flex items-center gap-2">
                <NavLink to="/login" className="ff-btn ff-btn-secondary h-9">Inloggen</NavLink>
                <NavLink to="/prijzen" className="ff-btn ff-btn-primary h-9">Start gratis</NavLink>
                <DarkModeToggle />
              </div>
            </>
          )}
          {/* Mobiele menu knop */}
          {!isDesktop && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label="Open menu"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] shadow-[var(--ff-shadow-soft)]"
              >
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
                <span className="sr-only">Menu</span>
              </button>
              <DarkModeToggle />
            </div>
          )}
        </div>
      </nav>
      {/* Mobiele overlay */}
      {!isDesktop && open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--ff-color-bg)]/95 backdrop-blur-md">
          <div className="flex justify-end p-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Sluit menu"
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] shadow-[var(--ff-shadow-soft)]"
            >
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
              <span className="sr-only">Sluit</span>
            </button>
          </div>
          <nav aria-label="Mobiele navigatie" className="flex flex-col gap-4 p-6 overflow-y-auto">
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
            <NavLink
              to="/login"
              className="ff-btn ff-btn-secondary h-10 w-full"
              onClick={() => setOpen(false)}
            >
              Inloggen
            </NavLink>
            <NavLink
              to="/prijzen"
              className="ff-btn ff-btn-primary h-10 w-full"
              onClick={() => setOpen(false)}
            >
              Start gratis
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}