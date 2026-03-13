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
  "text-sm text-white/70 hover:text-white transition-colors duration-200";

export default function Footer() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <footer className="bg-[#1A1A1A]">

      {/* Bovenste deel: CTA-band */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h3 className="text-xl md:text-2xl font-bold text-white">
            Klaar om je stijl te ontdekken?
          </h3>
          <p className="text-sm text-white/60 mt-2 max-w-md mx-auto">
            Beantwoord een paar vragen en ontvang je persoonlijke stijlrapport. Gratis, in 2 minuten.
          </p>
          <a
            href="/onboarding"
            className="inline-block mt-6 bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-sm py-3 px-8 rounded-xl transition-colors duration-200"
          >
            Begin gratis
          </a>
        </div>
      </div>

      {/* Middelste deel: Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Kolom 1: Merk */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <Logo size="sm" variant="dark" />
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Stijladvies afgestemd op jou. Op basis van je kleuren, voorkeuren en levensstijl.
            </p>
          </div>

          {/* Kolom 2: Product */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-4">Product</p>
            <nav aria-label="Product navigatie">
              <ul className="space-y-3 list-none p-0 m-0">
                {NAV_PRODUCT.map((link) => (
                  <li key={link.to}>
                    <NavLink to={link.to} className={linkClass}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Kolom 3: Bedrijf */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-4">Bedrijf</p>
            <nav aria-label="Bedrijf navigatie">
              <ul className="space-y-3 list-none p-0 m-0">
                {NAV_COMPANY.map((link) => (
                  <li key={link.to}>
                    <NavLink to={link.to} className={linkClass}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Kolom 4: Juridisch */}
          <div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-4">Juridisch</p>
            <nav aria-label="Juridische links">
              <ul className="space-y-3 list-none p-0 m-0">
                {NAV_LEGAL.map((link) => (
                  <li key={link.to}>
                    <NavLink to={link.to} className={linkClass}>{link.label}</NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

        </div>
      </div>

      {/* Onderste deel: Copyright + socials */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} FitFi B.V. · KVK 97225665 · Keizersgracht 520 H, Amsterdam
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/fitfi.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Volg FitFi op Instagram"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
            >
              <Instagram className="w-4 h-4 text-white/70" strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href="https://linkedin.com/company/fitfi-ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Volg FitFi op LinkedIn"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors duration-200"
            >
              <Linkedin className="w-4 h-4 text-white/70" strokeWidth={2} aria-hidden="true" />
            </a>
            <span className="text-xs text-white/30 ml-2">Made in Amsterdam</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
