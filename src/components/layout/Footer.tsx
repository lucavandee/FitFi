import React from "react";
import { NavLink } from "react-router-dom";
import { Instagram, Linkedin } from "lucide-react";

/**
 * Premium minimalist Footer
 * Apple × Lululemon aesthetic: rustig, ruim, essentieel
 */

const links = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen", label: "Prijzen" },
  { to: "/blog", label: "Blog" },
  { to: "/veelgestelde-vragen", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];

const legal = [
  { to: "/privacy", label: "Privacy" },
  { to: "/terms", label: "Voorwaarden" },
  { to: "/cookies", label: "Cookies" },
];

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="ff-container">

        {/* Main section - Rust en ruimte */}
        <div className="py-16 sm:py-20 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 lg:gap-16">

          {/* Brand side - Minimaal maar aanwezig */}
          <div className="lg:max-w-xs space-y-6">
            <div className="font-heading text-2xl text-[var(--color-text)] tracking-tight">
              FitFi
            </div>
            <p className="text-[var(--color-muted)] text-sm leading-relaxed">
              Persoonlijk stijladvies, powered by AI
            </p>

            {/* Social - subtiel */}
            <div className="flex gap-3 pt-2">
              <a
                href="https://instagram.com/fitfi.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] flex items-center justify-center transition-all hover:scale-105"
              >
                <Instagram size={16} className="text-[var(--color-muted)]" />
              </a>
              <a
                href="https://linkedin.com/company/fitfi-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full border border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] flex items-center justify-center transition-all hover:scale-105"
              >
                <Linkedin size={16} className="text-[var(--color-muted)]" />
              </a>
            </div>
          </div>

          {/* Navigation side - Schoon en georganiseerd */}
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-16 lg:gap-20">

            {/* Main links */}
            <nav aria-label="Footer navigatie">
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors inline-block"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal links */}
            <nav aria-label="Juridische paginas">
              <ul className="space-y-3">
                {legal.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors inline-block"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar - Subtiel en clean */}
        <div className="border-t border-[var(--color-border)] py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-muted)]">
            <div>
              © {new Date().getFullYear()} FitFi B.V.
            </div>
            <div className="flex items-center gap-4">
              <span>KVK 97225665</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">Amsterdam</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}