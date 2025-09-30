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
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="ff-container py-10">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="font-heading text-lg text-[var(--color-text)]">FitFi</div>
            <p className="text-[var(--color-muted)] text-sm leading-relaxed">
              AI-gedreven stijladvies. Premium, nuchter en persoonlijk.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">Product</h3>
            <ul className="space-y-2">
              {product.map((p) => (
                <li key={p.to}>
                  <NavLink className="ff-navlink" to={p.to}>{p.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">Resources</h3>
            <ul className="space-y-2">
              {resources.map((r) => (
                <li key={r.to}>
                  <NavLink className="ff-navlink" to={r.to}>{r.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-[var(--color-text)]">Nieuwsbrief</h3>
            <form
              className="flex gap-2"
              onSubmit={(e) => { e.preventDefault(); /* handoff */ }}
              noValidate
            >
              <input
                type="email"
                inputMode="email"
                placeholder="Jouw e-mail"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 h-9 text-sm focus:outline-none"
                style={{ boxShadow: "var(--shadow-ring)" }}
                aria-label="E-mailadres"
              />
              <button
                type="submit"
                className="px-3 h-9 inline-flex items-center justify-center rounded-lg text-white"
                style={{ background: "var(--ff-color-primary-700)" }}
              >
                Aanmelden
              </button>
            </form>

            <div className="flex gap-3 pt-2">
              <a href="mailto:hello@fitfi.ai" aria-label="Mail" className="ff-icon-btn"><Mail size={18} /></a>
              <a href="https://instagram.com" aria-label="Instagram" className="ff-icon-btn"><Instagram size={18} /></a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="ff-icon-btn"><Linkedin size={18} /></a>
              <a href="https://twitter.com" aria-label="Twitter" className="ff-icon-btn"><Twitter size={18} /></a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} FitFi — Alle rechten voorbehouden.</div>
          <div className="flex gap-4">
            <NavLink to="/privacy" className="ff-navlink">Privacy</NavLink>
            <NavLink to="/terms" className="ff-navlink">Voorwaarden</NavLink>
            <NavLink to="/disclosure" className="ff-navlink">Disclosure</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}