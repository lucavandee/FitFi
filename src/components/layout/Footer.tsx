import React from "react";
import { NavLink } from "react-router-dom";
import { Mail, Instagram, Linkedin, Twitter } from "lucide-react";

const product = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
];

const resources = [
  { to: "/blog", label: "Blog" },
  { to: "/veelgestelde-vragen", label: "Support / FAQ" },
  { to: "/contact", label: "Contact" },
];

const legal = [
  { to: "/privacy", label: "Privacy" },
  { to: "/voorwaarden", label: "Voorwaarden" },
  { to: "/cookies", label: "Cookies" },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      role="contentinfo"
      className="bg-[var(--ff-color-bg)] text-[var(--ff-color-text)] border-t border-[var(--ff-color-border)]"
    >
      {/* Bovenste grid */}
      <div className="ff-container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 items-start">
          {/* Merk / tagline / nieuwsbrief / socials */}
          <section aria-label="Over FitFi" className="flex flex-col gap-4">
            <NavLink to="/" className="font-heading text-xl tracking-wide">
              FitFi
            </NavLink>
            <p className="text-[var(--ff-color-text)]/80 max-w-xs">
              Rust in je garderobe. Outfits die kloppen — elke dag.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-wrap items-center gap-2"
              aria-label="Nieuwsbrief"
            >
              <label htmlFor="ff-news-email" className="sr-only">E-mail</label>
              <input
                id="ff-news-email"
                type="email"
                inputMode="email"
                placeholder="Jouw e-mailadres"
                className="flex-grow min-w-[12rem] rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] px-3 py-2 text-sm focus:outline-none ff-focus-ring"
              />
              <button type="submit" className="ff-btn ff-btn-primary h-9">
                Aanmelden
              </button>
            </form>

            <div className="flex gap-3 pt-1">
              <a
                href="mailto:support@fitfi.ai"
                aria-label="E-mail"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ff-color-border)] hover:bg-[var(--ff-color-surface)] ff-focus-ring"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ff-color-border)] hover:bg-[var(--ff-color-surface)] ff-focus-ring"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener"
                aria-label="Twitter"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ff-color-border)] hover:bg-[var(--ff-color-surface)] ff-focus-ring"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener"
                aria-label="LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ff-color-border)] hover:bg-[var(--ff-color-surface)] ff-focus-ring"
              >
                <Linkedin size={16} />
              </a>
            </div>
          </section>

          {/* Product */}
          <nav aria-label="Product" className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-[var(--ff-color-text)]/80">Product</h3>
            <ul className="space-y-2">
              {product.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} className="ff-navlink">
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Resources */}
          <nav aria-label="Resources" className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-[var(--ff-color-text)]/80">Resources</h3>
            <ul className="space-y-2">
              {resources.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} className="ff-navlink">
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Juridisch */}
          <nav aria-label="Juridisch" className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-[var(--ff-color-text)]/80">Juridisch</h3>
            <ul className="space-y-2">
              {legal.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} className="ff-navlink">
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Onderrij */}
        <div className="mt-8 border-t border-[var(--ff-color-border)] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--ff-color-text)]/70">
            © {year} FitFi — Alle rechten voorbehouden
          </p>
          <div className="flex flex-wrap gap-4">
            <NavLink to="/privacy" className="ff-navlink text-sm">Privacy</NavLink>
            <NavLink to="/voorwaarden" className="ff-navlink text-sm">Voorwaarden</NavLink>
            <NavLink to="/cookies" className="ff-navlink text-sm">Cookies</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}