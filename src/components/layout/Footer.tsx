import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Instagram, Linkedin, ArrowRight, Sparkles } from "lucide-react";

/**
 * Modern Premium Footer
 *
 * Mobile-first design:
 * - Compact 2-column grid
 * - Prominent CTA
 * - Grouped sections
 * - Premium aesthetic
 */

const navigation = {
  product: [
    { to: "/hoe-het-werkt", label: "Hoe het werkt" },
    { to: "/prijzen", label: "Prijzen" },
    { to: "/veelgestelde-vragen", label: "FAQ" },
  ],
  company: [
    { to: "/blog", label: "Blog" },
    { to: "/over-ons", label: "Over ons" },
    { to: "/contact", label: "Contact" },
  ],
  legal: [
    { to: "/privacy", label: "Privacy" },
    { to: "/algemene-voorwaarden", label: "Voorwaarden" },
    { to: "/cookies", label: "Cookies" },
  ]
};

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gradient-to-b from-[var(--color-bg)] to-[var(--ff-color-primary-25)] border-t border-[var(--color-border)]">
      <div className="ff-container">

        {/* Premium CTA - Mobile optimized */}
        <div className="py-12 sm:py-16 border-b border-[var(--color-border)]">
          <div className="max-w-3xl mx-auto text-center px-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[var(--ff-color-primary-700)]" />
              <span className="text-xs font-medium text-[var(--ff-color-primary-800)]">
                Ontdek je stijl in 5 minuten
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-3">
              Klaar om te beginnen?
            </h2>
            <p className="text-[var(--color-muted)] text-sm sm:text-base mb-6">
              Start gratis. Geen creditcard vereist.
            </p>

            <button
              onClick={() => navigate('/onboarding')}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-600)] text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:from-[var(--ff-color-primary-600)] hover:to-[var(--ff-color-primary-500)] transition-all shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] active:scale-[0.98]"
            >
              Start gratis quiz
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Footer Content - Compact Grid */}
        <div className="py-10 sm:py-12">

          {/* Brand + Description */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] shadow-sm" />
              <span className="text-xl font-bold text-[var(--color-text)]">FitFi</span>
            </div>
            <p className="text-sm text-[var(--color-muted)] max-w-xs leading-relaxed">
              Persoonlijk stijladvies, powered by AI
            </p>
          </div>

          {/* Navigation Grid - 2 columns on mobile, 3 on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 mb-8">

            {/* Product */}
            <nav>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-3 sm:mb-4">
                Product
              </h3>
              <ul className="space-y-2.5">
                {navigation.product.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors inline-block"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Company */}
            <nav>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-3 sm:mb-4">
                Bedrijf
              </h3>
              <ul className="space-y-2.5">
                {navigation.company.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors inline-block"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal */}
            <nav>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)] mb-3 sm:mb-4">
                Juridisch
              </h3>
              <ul className="space-y-2.5">
                {navigation.legal.map((link) => (
                  <li key={link.to}>
                    <NavLink
                      to={link.to}
                      className="text-sm text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors inline-block"
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Social Links - Subtle */}
          <div className="flex gap-3 mb-8">
            <a
              href="https://instagram.com/fitfi.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] hover:bg-[var(--ff-color-primary-50)] flex items-center justify-center transition-all"
            >
              <Instagram className="w-4 h-4 text-[var(--color-muted)]" />
            </a>
            <a
              href="https://linkedin.com/company/fitfi-ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--ff-color-primary-500)] hover:bg-[var(--ff-color-primary-50)] flex items-center justify-center transition-all"
            >
              <Linkedin className="w-4 h-4 text-[var(--color-muted)]" />
            </a>
          </div>
        </div>

        {/* Bottom Bar - Clean & Compact */}
        <div className="border-t border-[var(--color-border)] py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[var(--color-muted)]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span>© {new Date().getFullYear()} FitFi B.V.</span>
              <span className="hidden sm:inline">•</span>
              <span>KVK 97225665</span>
            </div>
            <span className="text-[var(--color-muted)]/70">
              Keizersgracht 520 H · Amsterdam
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
