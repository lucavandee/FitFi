import React from "react";
import { NavLink } from "react-router-dom";
import { Mail, Instagram, Linkedin, Twitter } from "lucide-react";

const productLinks = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/over-ons", label: "Over ons" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/blog", label: "Blog" }
];

const legalLinks = [
  { to: "/privacy", label: "Privacy" },
  { to: "/voorwaarden", label: "Voorwaarden" },
  { to: "/cookies", label: "Cookies" },
  { to: "/verwerkers", label: "Verwerkers" }
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer role="contentinfo" className="bg-[var(--ff-color-bg)] text-[var(--ff-color-text)] border-t border-[var(--ff-color-border)] mt-12">
      <div className="ff-container py-12 ff-stack gap-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Merk & nieuwsbrief */}
          <div className="ff-stack gap-4">
            <NavLink to="/" className="font-heading text-xl tracking-wide">FitFi</NavLink>
            <p className="text-[var(--ff-color-text)]/80 max-w-xs">
              Rust in je garderobe. Outfits die kloppen — elke dag.
            </p>
            {/* Nieuwsbrief inschrijving */}
            <form
              onSubmit={(e) => e.preventDefault()}
              aria-label="Nieuwsbrief inschrijving"
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                E‑mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Jouw e‑mailadres"
                className="flex-grow min-w-[12rem] rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] px-3 py-2 text-sm focus:outline-none ff-focus-ring"
              />
              <button type="submit" className="ff-btn ff-btn-primary h-9">
                Aanmelden
              </button>
            </form>
            {/* Social icons */}
            <div className="mt-4 flex gap-4">
              <a href="mailto:support@fitfi.ai" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--ff-color-border)] hover:bg-[var(--ff-color-surface)]" aria-label="Mail">
                <Mail size={16} className="text-[var(--ff-color-text)]" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--ff-color-border)] hover:bg-[var(--ff-color-surface)]" aria-label="Instagram">
                <Instagram size={16} className="text-[var(--ff-color-text)]" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--ff-color-border)] hover:bg-[var(--ff-color-surface)]" aria-label="Twitter">
                <Twitter size={16} className="text-[var(--ff-color-text)]" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener" className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-[var(--ff-color-border)] hover:bg-[var(--ff-color-surface)]" aria-label="LinkedIn">
                <Linkedin size={16} className="text-[var(--ff-color-text)]" />
              </a>
            </div>
          </div>

          {/* Navigatiekolommen */}
          <nav aria-label="Footer links" className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-[var(--ff-color-text)]/80">Product</h3>
              <ul className="mt-2 ff-stack-sm">
                {productLinks.map((l) => (
                  <li key={l.to}>
                    <NavLink className="ff-navlink" to={l.to}>
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--ff-color-text)]/80">Resources</h3>
              <ul className="mt-2 ff-stack-sm">
                <li>
                  <NavLink className="ff-navlink" to="/veelgestelde-vragen">
                    Veelgestelde vragen
                  </NavLink>
                </li>
                <li>
                  <NavLink className="ff-navlink" to="/blog">
                    Blog
                  </NavLink>
                </li>
                <li>
                  <a className="ff-navlink" href="mailto:support@fitfi.ai">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--ff-color-text)]/80">Juridisch</h3>
              <ul className="mt-2 ff-stack-sm">
                {legalLinks.map((l) => (
                  <li key={l.to}>
                    <NavLink className="ff-navlink" to={l.to}>
                      {l.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Onderste rij met copyright en extra links */}
        <div className="ff-divider pt-8 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-[var(--ff-color-text)]/70">© {year} FitFi — Alle rechten voorbehouden</p>
          <div className="flex gap-3">
            <NavLink to="/privacy" className="ff-navlink text-sm">
              Privacy
            </NavLink>
            <NavLink to="/voorwaarden" className="ff-navlink text-sm">
              Voorwaarden
            </NavLink>
            <NavLink to="/cookies" className="ff-navlink text-sm">
              Cookies
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}