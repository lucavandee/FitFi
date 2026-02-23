import React from "react";
import { NavLink } from "react-router-dom";
import Container from "./Container";

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { href: "/hoe-het-werkt", label: "Hoe het werkt" },
      { href: "/prijzen", label: "Prijzen" },
      { href: "/results/preview", label: "Voorbeeld resultaten" },
      { href: "/veelgestelde-vragen", label: "FAQ" },
    ],
  },
  {
    heading: "Bedrijf",
    links: [
      { href: "/over-ons", label: "Over ons" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Juridisch",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/algemene-voorwaarden", label: "Voorwaarden" },
      { href: "/cookies", label: "Cookies" },
    ],
  },
];

const linkClass =
  "text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm py-0.5";

export default function SiteFooter() {
  return (
    <footer className="mt-16 sm:mt-20 bg-[var(--color-surface)] border-t border-[var(--color-border)]" aria-label="Sitenavigatie en juridische informatie">

      {/* ── MAIN LINKS ── */}
      <Container className="py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-sm">

          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <NavLink to="/" className="inline-flex items-center gap-2.5 mb-4 group" aria-label="Naar de homepage van FitFi">
              <div className="w-8 h-8 rounded-lg bg-[var(--ff-color-primary-700)] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold tracking-wider" aria-hidden>FF</span>
              </div>
              <strong className="text-[var(--color-text)] text-lg font-bold group-hover:text-[var(--ff-color-primary-700)] transition-colors">FitFi</strong>
            </NavLink>
            <p className="leading-relaxed text-[var(--color-muted)] text-sm max-w-xs">
              Wij vertalen je smaak naar outfits — met uitleg, combinaties en shopbare items.
            </p>
          </div>

          {/* Link columns */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <p className="font-semibold text-[var(--color-text)] text-sm mb-3">{col.heading}</p>
              <ul className="flex flex-col gap-2" role="list">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      {/* ── BOTTOM BAR ── */}
      <Container className="py-5 border-t border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[var(--color-muted)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            <p>© {new Date().getFullYear()} FitFi · Alle rechten voorbehouden.</p>
            <p className="hidden sm:block text-[var(--color-border)]" aria-hidden>|</p>
            <p>KVK: 97225665 · BTW: NL005258495B15</p>
          </div>
          <p className="sm:text-right">Keizersgracht 520 H · 1017 EK Amsterdam</p>
        </div>
      </Container>
    </footer>
  );
}
