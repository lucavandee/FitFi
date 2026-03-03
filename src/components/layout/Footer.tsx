import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Instagram, Linkedin } from "lucide-react";
import Logo from "@/components/ui/Logo";

const NAV_PRODUCT = [
  { to: "/hoe-het-werkt", label: "Hoe het werkt" },
  { to: "/prijzen",       label: "Prijzen"        },
  { to: "/veelgestelde-vragen", label: "FAQ"      },
  { to: "/blog",          label: "Blog"           },
];

const NAV_COMPANY = [
  { to: "/over-ons",  label: "Over ons" },
  { to: "/contact",   label: "Contact"  },
];

const NAV_LEGAL = [
  { to: "/privacy",                 label: "Privacy"      },
  { to: "/algemene-voorwaarden",    label: "Voorwaarden"  },
  { to: "/cookies",                 label: "Cookies"      },
  { to: "/affiliate-disclosure",    label: "Disclosure"   },
];

const linkClass =
  "py-1 min-h-[36px] flex items-center text-sm text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm";

export default function Footer() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <footer
      className="border-t border-[var(--color-border)]"
      style={{ background: 'var(--ff-color-primary-50)' }}
    >
      <div className="ff-container py-12 sm:py-14">

        {/* Top row: logo + social */}
        <div className="flex items-start justify-between gap-6 mb-10">
          <div className="flex flex-col gap-3">
            <Logo size="sm" variant="dark" />
            <p className="text-xs text-[var(--color-muted)] leading-relaxed max-w-[220px]">
              Persoonlijk stijladvies op basis van jouw unieke profiel.
            </p>
          </div>

          <div className="flex gap-2 shrink-0">
            <a
              href="https://instagram.com/fitfi.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Volg FitFi op Instagram"
              className="w-9 h-9 min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
              style={{
                background: 'var(--ff-color-primary-100)',
                color: 'var(--ff-color-primary-700)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--ff-color-primary-200)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--ff-color-primary-100)';
              }}
            >
              <Instagram className="w-4 h-4" strokeWidth={2} />
            </a>
            <a
              href="https://linkedin.com/company/fitfi-ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Volg FitFi op LinkedIn"
              className="w-9 h-9 min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] focus-visible:ring-offset-2"
              style={{
                background: 'var(--ff-color-primary-100)',
                color: 'var(--ff-color-primary-700)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--ff-color-primary-200)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'var(--ff-color-primary-100)';
              }}
            >
              <Linkedin className="w-4 h-4" strokeWidth={2} />
            </a>
          </div>
        </div>

        {/* Nav columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-8 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--ff-color-primary-600)' }}>
              Product
            </p>
            <nav aria-label="Product navigatie">
              <ul className="space-y-0.5 list-none p-0 m-0">
                {NAV_PRODUCT.map((link) => (
                  <li key={link.to}>
                    <NavLink to={link.to} className={linkClass}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--ff-color-primary-600)' }}>
              Bedrijf
            </p>
            <nav aria-label="Bedrijf navigatie">
              <ul className="space-y-0.5 list-none p-0 m-0">
                {NAV_COMPANY.map((link) => (
                  <li key={link.to}>
                    <NavLink to={link.to} className={linkClass}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--ff-color-primary-600)' }}>
              Juridisch
            </p>
            <nav aria-label="Juridische links">
              <ul className="space-y-0.5 list-none p-0 m-0">
                {NAV_LEGAL.map((link) => (
                  <li key={link.to}>
                    <NavLink to={link.to} className={linkClass}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[var(--color-muted)]"
          style={{ borderColor: 'var(--ff-color-primary-100)' }}
        >
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© {new Date().getFullYear()} FitFi B.V.</span>
            <span aria-hidden="true">·</span>
            <span>KVK 97225665</span>
            <span aria-hidden="true">·</span>
            <span>Keizersgracht 520 H, Amsterdam</span>
          </div>
          <span>Made in Amsterdam</span>
        </div>

      </div>
    </footer>
  );
}
