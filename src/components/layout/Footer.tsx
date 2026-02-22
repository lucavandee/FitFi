import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Instagram, Linkedin, ArrowRight } from "lucide-react";

/**
 * Ultra-compact Premium Footer
 * Rijk, warm, minimale witruimte
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
  const { pathname } = useLocation();

  // Verberg footer tijdens quiz/onboarding voor focus
  if (pathname === '/onboarding' || pathname.startsWith('/onboarding')) {
    return null;
  }

  return (
    <footer className="bg-[var(--ff-color-primary-50)] border-t border-[var(--ff-color-primary-100)]">
      <div className="ff-container">

        {/* Compact CTA */}
        <div className="py-8 border-b border-[var(--ff-color-primary-100)]">
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">
              Klaar om te beginnen?
            </h2>
            <p className="text-sm text-[var(--color-muted)] mb-4">
              Ontdek je stijl in 5 minuten
            </p>
            <button
              onClick={() => navigate('/onboarding')}
              className="inline-flex items-center gap-2 bg-[var(--ff-color-primary-700)] text-white px-6 py-3 min-h-[44px] rounded-xl font-semibold text-sm hover:bg-[var(--ff-color-primary-600)] transition-all shadow-sm hover:shadow-md active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ff-color-primary-400)] focus-visible:ring-offset-2"
            >
              Start gratis quiz
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Content - Super Compact */}
        <div className="py-6">

          {/* Brand - Minimaal */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)]" />
              <span className="text-lg font-bold text-[var(--color-text)]">FitFi</span>
            </div>

            {/* Social - Gevuld & Kleurrijk */}
            <div className="flex gap-2">
              <a
                href="https://instagram.com/fitfi.ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Volg FitFi op Instagram"
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-lg bg-gradient-to-br from-[var(--ff-color-warning-600)] to-[var(--ff-color-primary-700)] flex items-center justify-center hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
              >
                <Instagram className="w-4 h-4 text-white" strokeWidth={2.5} />
              </a>
              <a
                href="https://linkedin.com/company/fitfi-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Volg FitFi op LinkedIn"
                className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-lg bg-[var(--ff-color-primary-600)] flex items-center justify-center hover:scale-105 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
              >
                <Linkedin className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
              </a>
            </div>
          </div>

          {/* Navigation - Ultra Compact 2 Columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6 text-sm">

            {/* Column 1 */}
            <div className="space-y-2">
              {navigation.product.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="py-1 min-h-[36px] flex items-center text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm"
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="pt-1 space-y-2">
                {navigation.company.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className="py-1 min-h-[36px] flex items-center text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm"
                  >
                    {link.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-2">
              {navigation.legal.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className="py-1 min-h-[36px] flex items-center text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm"
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Bottom - Ultra Compact */}
          <div className="pt-4 border-t border-[var(--ff-color-primary-100)] flex flex-col gap-1 text-xs text-[var(--color-muted)]">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} FitFi B.V.</span>
              <span>•</span>
              <span>KVK 97225665</span>
            </div>
            <span>
              Keizersgracht 520 H, Amsterdam
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
