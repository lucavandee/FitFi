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
  "text-sm text-[#4A4A4A] hover:text-[#1A1A1A] transition-colors duration-200";

export default function Footer() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <footer className="bg-[#F5F0EB]">

      {/* Links */}
      <div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

            {/* Kolom 1: Merk */}
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4">
                <Logo size="sm" variant="default" />
              </div>
              <p className="text-sm text-[#8A8A8A] leading-relaxed max-w-xs">
                Stijladvies afgestemd op jou. Op basis van je kleuren, voorkeuren en levensstijl.
              </p>
            </div>

            {/* Kolom 2: Product */}
            <div>
              <p className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wide mb-4">Product</p>
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
              <p className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wide mb-4">Bedrijf</p>
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
              <p className="text-xs font-semibold text-[#8A8A8A] uppercase tracking-wide mb-4">Juridisch</p>
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
      </div>

      {/* Copyright + socials */}
      <div className="border-t border-[#E5E5E5]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#8A8A8A]">
            © {new Date().getFullYear()} FitFi B.V. · KVK 97225665 · Keizersgracht 520 H, Amsterdam
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/fitfi.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Volg FitFi op Instagram"
              className="w-9 h-9 rounded-full bg-white hover:bg-[#E5E5E5] flex items-center justify-center transition-colors duration-200"
            >
              <Instagram className="w-4 h-4 text-[#4A4A4A]" strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href="https://linkedin.com/company/fitfi-ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Volg FitFi op LinkedIn"
              className="w-9 h-9 rounded-full bg-white hover:bg-[#E5E5E5] flex items-center justify-center transition-colors duration-200"
            >
              <Linkedin className="w-4 h-4 text-[#4A4A4A]" strokeWidth={2} aria-hidden="true" />
            </a>
            <span className="text-xs text-[#8A8A8A] ml-2">Made in Amsterdam</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
