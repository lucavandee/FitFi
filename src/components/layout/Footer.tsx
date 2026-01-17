import React from "react";
import { NavLink } from "react-router-dom";
import { Mail, Instagram, Linkedin, Twitter, Shield } from "lucide-react";

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
  { to: "/privacy", label: "Privacyverklaring" },
  { to: "/terms", label: "Algemene Voorwaarden" },
  { to: "/cookies", label: "Cookiebeleid" },
  { to: "/disclosure", label: "Affiliate Disclosure" },
];

export default function Footer() {
  return (
    <footer className="mt-12 sm:mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="ff-container py-8 sm:py-10 lg:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Bedrijfsinfo */}
          <div className="space-y-4">
            <div className="font-heading text-base sm:text-lg text-[var(--color-text)]">FitFi</div>
            <p className="text-[var(--color-muted)] text-sm leading-relaxed">
              Persoonlijk stijladvies op basis van AI en jouw unieke voorkeuren.
            </p>
            <div className="flex gap-2 pt-2">
              <a href="mailto:hello@fitfi.ai" aria-label="Mail" className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors">
                <Mail size={18} />
              </a>
              <a href="https://instagram.com/fitfi.ai" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://linkedin.com/company/fitfi-ai" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="https://twitter.com/fitfi_ai" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Product</h3>
            <ul className="space-y-1">
              {product.map((p) => (
                <li key={p.to}>
                  <NavLink className="block py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px] flex items-center" to={p.to}>
                    {p.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Resources</h3>
            <ul className="space-y-1">
              {resources.map((r) => (
                <li key={r.to}>
                  <NavLink className="block py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px] flex items-center" to={r.to}>
                    {r.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Juridisch */}
          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-4 flex items-center gap-2">
              <Shield size={16} className="text-[var(--color-primary)]" />
              Juridisch
            </h3>
            <ul className="space-y-1">
              {legal.map((l) => (
                <li key={l.to}>
                  <NavLink className="block py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px] flex items-center" to={l.to}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 sm:mt-10 border-t border-[var(--color-border)] pt-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-[var(--color-muted)]">
            {/* Copyright + Bedrijfsgegevens */}
            <div className="text-center lg:text-left">
              <div className="font-medium text-[var(--color-text)] mb-1">
                © {new Date().getFullYear()} FitFi — Alle rechten voorbehouden
              </div>
              <div className="text-xs space-y-0.5">
                <div>FitFi B.V. — KVK: 97225665 — BTW: NL005258495B15</div>
                <div>Keizersgracht 520 H · 1017 EK Amsterdam</div>
              </div>
            </div>

            {/* Juridische links (duplicaat voor snelle toegang) */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <NavLink to="/privacy" className="py-2 hover:text-[var(--color-text)] transition-colors">
                Privacy
              </NavLink>
              <NavLink to="/cookies" className="py-2 hover:text-[var(--color-text)] transition-colors">
                Cookies
              </NavLink>
              <NavLink to="/terms" className="py-2 hover:text-[var(--color-text)] transition-colors">
                Voorwaarden
              </NavLink>
              <NavLink to="/disclosure" className="py-2 hover:text-[var(--color-text)] transition-colors">
                Disclosure
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}