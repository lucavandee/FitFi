import React from "react";
import { NavLink } from "react-router-dom";

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
    <footer role="contentinfo" className="bg-bg text-text border-t border-border mt-12">
      <div className="ff-container py-10 ff-stack">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="max-w-sm ff-stack">
            <NavLink to="/" className="font-heading text-lg tracking-wide">FitFi</NavLink>
            <p className="text-text/80">Rust in je garderobe. Outfits die kloppen — elke dag.</p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-text/80">Product</h3>
              <ul className="mt-2 ff-stack-sm">{productLinks.map((l) => <li key={l.to}><NavLink className="ff-navlink" to={l.to}>{l.label}</NavLink></li>)}</ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text/80">Resources</h3>
              <ul className="mt-2 ff-stack-sm">
                <li><NavLink className="ff-navlink" to="/veelgestelde-vragen">Veelgestelde vragen</NavLink></li>
                <li><NavLink className="ff-navlink" to="/blog">Blog</NavLink></li>
                <li><a className="ff-navlink" href="mailto:support@fitfi.ai">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text/80">Juridisch</h3>
              <ul className="mt-2 ff-stack-sm">{legalLinks.map((l) => <li key={l.to}><NavLink className="ff-navlink" to={l.to}>{l.label}</NavLink></li>)}</ul>
            </div>
          </nav>
        </div>

        <div className="ff-divider mt-6 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-sm text-text/70">© {year} FitFi — Alle rechten voorbehouden</p>
          <div className="flex gap-2">
            <NavLink to="/privacy" className="ff-navlink">Privacy</NavLink>
            <NavLink to="/voorwaarden" className="ff-navlink">Voorwaarden</NavLink>
            <NavLink to="/cookies" className="ff-navlink">Cookies</NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
}