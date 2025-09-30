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
    <footer role="contentinfo" className="bg-[var(--ff-color-bg)] text-[var(--ff-color-text)] border-t border-[var(--ff-color-border)]">
      <div className="ff-container py-12">
        {/* Strakke 12-koloms layout met vaste spans — perfect uitgelijnd */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-8 items-start">
          {/* Merk & nieuwsbrief (4 kolommen) */}
          <section aria-label="Over FitFi" className="md:col-span-4 flex flex-col gap-4">
            <NavLink to="/" className="font-heading text-xl tracking-wide">FitFi</NavLink>
            <p className="text-[var(--ff-color-text)]/80 max-w-sm">
              Rust in je garderobe. Outfits die kloppen — elke dag.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              aria-label="Nieuwsbrief"
              className="flex w-full max-w-sm items-center gap-2"
            >
              <label htmlFor="ff-news-email" className="sr-only">E-mail</label>
              <input
                id="ff-news-email"
                type="email"
                inputMode="email"
                placeholder="Jouw e-mailadres"
                className="w-full rounded-md border border-[var(--ff-color-border)] bg-[var(--ff-color-surface)] px-3 py-2 text-sm focus:outline-none ff-focus-ring"
              />
              <button type="submit" className="ff-btn ff-btn-primary h-9">Aanmelden</button>
            </form>

            <div className="flex gap-3 pt-1">
              {[
                { Icon: Mail, href: "mailto:support@fitfi.ai", label: "E-mail" },
                { Icon: Instagram, href: "https://instagram.com", label: "Instagram" },
                { Icon: Twitter, href: "https://twitter.com", label: "Twitter" },
                { Icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener" : undefined}
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ff-color-border)] hover:bg-[var(--ff-color-surface)] ff-focus-ring"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </section>

          {/* Product (3 kolommen) */}
          <nav aria-label="Product" className="md:col-span-3">
            <h3 className="text-sm font-semibold text-[var(--ff-color-text)]/80 mb-2">Product</h3>
            <ul className="space-y-2">
              {product.map((l) => (
                <li key={l.to}><NavLink className="ff-navlink" to={l.to}>{l.label}</NavLink></li>
              ))}
            </ul>
          </nav>

          {/* Resources (3 kolommen) */}
          <nav aria-label="Resources" className="md:col-span-3">
            <h3 className="text-sm font-semibold text-[var(--ff-color-text)]/80 mb-2">Resources</h3>
            <ul className="space-y-2">
              {resources.map((l) => (
                <li key={l.to}><NavLink className="ff-navlink" to={l.to}>{l.label}</NavLink></li>
              ))}
            </ul>
          </nav>

          {/* Juridisch (2 kolommen) */}
          <nav aria-label="Juridisch" className="md:col-span-2">
            <h3 className="text-sm font-semibold text-[var(--ff-color-text)]/80 mb-2">Juridisch</h3>
            <ul className="space-y-2">
              {legal.map((l) => (
                <li key={l.to}><NavLink className="ff-navlink" to={l.to}>{l.label}</NavLink></li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Onderste rij — zelfde container, perfecte baseline */}
        <div className="mt-10 border-t border-[var(--ff-color-border)] pt-4 grid grid-cols-1 md:grid-cols-12 items-center gap-y-4">
          <p className="md:col-span-6 text-sm text-[var(--ff-color-text)]/70">
            © {year} FitFi — Alle rechten voorbehouden
          </p>
          <div className="md:col-span-6 md:justify-self-end flex flex-wrap gap-6">
            <NavLink to="/privacy" className="ff-navlink text-sm">Privacy</NavLink>
            <NavLink to="/voorwaarden" className="ff-navlink text-sm">Voorwaarden</NavLink>
            <NavLink to="/cookies" className="ff-navlink text-sm">Cookies</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}