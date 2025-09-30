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

const company = [
  { to: "/privacy", label: "Privacy" },
  { to: "/cookies", label: "Cookies" },
  { to: "/juridisch", label: "Juridisch" },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="ff-container py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="font-heading text-lg">FitFi</div>
            <p className="mt-2 text-sm text-[var(--color-muted)]">AI Style Report — helder, persoonlijk en privacy-first.</p>
            <div className="mt-3 flex gap-3">
              {[
                { Icon: Mail, href: "mailto:support@fitfi.ai", label: "E-mail" },
                { Icon: Instagram, href: "https://instagram.com/fitfi.ai", label: "Instagram" },
                { Icon: Twitter, href: "https://x.com/fitfi_ai", label: "Twitter" },
                { Icon: Linkedin, href: "https://linkedin.com/company/fitfi-ai", label: "LinkedIn" }
              ].map(({ Icon, href, label }) => (
                <a key={href} href={href} aria-label={label} className="inline-flex items-center justify-center h-9 w-9 rounded-lg border border-[var(--color-border)]">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="font-semibold mb-3">Product</div>
            <ul className="space-y-2">
              {product.map((l) => (
                <li key={l.to}><NavLink to={l.to} className="underline-offset-4 hover:underline">{l.label}</NavLink></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-3">Resources</div>
            <ul className="space-y-2">
              {resources.map((l) => (
                <li key={l.to}><NavLink to={l.to} className="underline-offset-4 hover:underline">{l.label}</NavLink></li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-3">Company</div>
            <ul className="space-y-2">
              {company.map((l) => (
                <li key={l.to}><NavLink to={l.to} className="underline-offset-4 hover:underline">{l.label}</NavLink></li>
              ))}
            </ul>
            <form className="mt-4 flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="ff-news-email" className="sr-only">E-mail</label>
              <input
                id="ff-news-email"
                type="email"
                inputMode="email"
                placeholder="Jouw e-mail"
                className="w-full rounded-lg border border-[var(--color-border)] px-3 h-9 text-sm focus:outline-none"
                style={{ boxShadow: "var(--shadow-ring)" }}
              />
              <button type="submit" className="px-3 h-9 inline-flex items-center rounded-lg text-white" style={{ background: "var(--ff-color-primary-700)" }}>
                Aanmelden
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-sm text-[var(--color-muted)] flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} FitFi — Alle rechten voorbehouden.</div>
          <div className="flex gap-4">
            <NavLink to="/privacy" className="underline">Privacy</NavLink>
            <NavLink to="/cookies" className="underline">Cookies</NavLink>
            <NavLink to="/juridisch" className="underline">Juridisch</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}