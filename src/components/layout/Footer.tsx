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

export default function Footer() {
  return (
    <footer className="mt-12 sm:mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="ff-container py-8 sm:py-10 lg:py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          <div className="space-y-3">
            <div className="font-heading text-base sm:text-lg text-[var(--color-text)]">FitFi</div>
            <p className="text-[var(--color-muted)] text-sm leading-relaxed">
              Stijladvies op basis van je voorkeuren.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Product</h3>
            <ul className="space-y-1">
              {product.map((p) => (
                <li key={p.to}>
                  <NavLink className="block py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px] flex items-center" to={p.to}>{p.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">Resources</h3>
            <ul className="space-y-1">
              {resources.map((r) => (
                <li key={r.to}>
                  <NavLink className="block py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px] flex items-center" to={r.to}>{r.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-[var(--color-text)]">Nieuwsbrief</h3>
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={(e) => { e.preventDefault(); /* handoff */ }}
              noValidate
            >
              <input
                type="email"
                inputMode="email"
                placeholder="Jouw e-mail"
                className="flex-1 rounded-lg border border-[var(--color-border)] px-3 sm:px-4 min-h-[44px] text-sm focus:outline-none focus:shadow-[var(--shadow-ring)]"
                aria-label="E-mailadres"
              />
              <button
                type="submit"
                className="px-4 sm:px-5 min-h-[44px] inline-flex items-center justify-center rounded-lg text-white font-medium text-sm whitespace-nowrap"
                style={{ background: "var(--ff-color-primary-700)" }}
              >
                Aanmelden
              </button>
            </form>

            <div className="flex gap-2 pt-2">
              <a href="mailto:hello@fitfi.ai" aria-label="Mail" className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors"><Mail size={18} /></a>
              <a href="https://instagram.com" aria-label="Instagram" className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors"><Instagram size={18} /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors"><Linkedin size={18} /></a>
              <a href="https://twitter.com" aria-label="Twitter" className="inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] transition-colors"><Twitter size={18} /></a>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 border-t border-[var(--color-border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--color-muted)]">
          <div>© {new Date().getFullYear()} FitFi — Alle rechten voorbehouden.</div>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <NavLink to="/privacy" className="py-2 hover:text-[var(--color-text)] transition-colors">Privacy</NavLink>
            <NavLink to="/terms" className="py-2 hover:text-[var(--color-text)] transition-colors">Voorwaarden</NavLink>
            <NavLink to="/disclosure" className="py-2 hover:text-[var(--color-text)] transition-colors">Disclosure</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}