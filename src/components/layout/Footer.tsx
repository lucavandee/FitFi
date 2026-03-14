import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Instagram, Linkedin, Twitter, ArrowRight, Shield, Lock, MapPin } from "lucide-react";
import { useUser } from "@/context/UserContext";
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

export default function Footer() {
  const { pathname } = useLocation();
  const { user } = useUser();
  const isAuthed = !!user;

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <footer className="bg-[#F5F0EB] relative overflow-hidden">

      {/* CTA strip — alleen voor uitgelogde bezoekers */}
      {!isAuthed && (
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-28 md:pt-36">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl p-12 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-24 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:border-[#C2654A]">
            <div>
              <p className="font-serif italic text-[28px] text-[#1A1A1A] leading-[1.15] mb-1.5">
                Ontdek jouw stijl
              </p>
              <p className="text-sm text-[#8A8A8A]">
                Gratis. Twee minuten. Persoonlijk resultaat.
              </p>
            </div>
            <a
              href="/registreren"
              className="bg-[#C2654A] hover:bg-[#A8513A] text-white font-semibold text-sm py-3.5 px-8 rounded-full inline-flex items-center gap-2 flex-shrink-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(194,101,74,0.2)]"
            >
              Begin gratis
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      )}

      {/* Footer grid */}
      <div className={`max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2.5fr_1fr_1fr_1fr] gap-10 lg:gap-16 ${isAuthed ? "pt-20" : ""}`}>

        {/* Kolom 1: Merk */}
        <div>
          <div className="mb-5">
            <Logo size="sm" variant="default" className="text-[26px]" />
          </div>
          <p className="text-sm text-[#8A8A8A] leading-[1.8] max-w-[280px]">
            Stijladvies afgestemd op jou. Op basis van je kleuren, voorkeuren en levensstijl.
          </p>
          <div className="flex gap-2 mt-7">
            <a
              href="https://instagram.com/fitfi.ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Volg FitFi op Instagram"
              className="group w-[42px] h-[42px] rounded-[14px] bg-white border border-[#E5E5E5]/60 flex items-center justify-center transition-all duration-250 cursor-pointer hover:bg-[#C2654A] hover:border-[#C2654A] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(194,101,74,0.2)]"
            >
              <Instagram className="w-4 h-4 text-[#4A4A4A] group-hover:text-white transition-colors duration-250" strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href="https://linkedin.com/company/fitfi-ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Volg FitFi op LinkedIn"
              className="group w-[42px] h-[42px] rounded-[14px] bg-white border border-[#E5E5E5]/60 flex items-center justify-center transition-all duration-250 cursor-pointer hover:bg-[#C2654A] hover:border-[#C2654A] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(194,101,74,0.2)]"
            >
              <Linkedin className="w-4 h-4 text-[#4A4A4A] group-hover:text-white transition-colors duration-250" strokeWidth={2} aria-hidden="true" />
            </a>
            <a
              href="https://x.com/fitfi_ai"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Volg FitFi op X"
              className="group w-[42px] h-[42px] rounded-[14px] bg-white border border-[#E5E5E5]/60 flex items-center justify-center transition-all duration-250 cursor-pointer hover:bg-[#C2654A] hover:border-[#C2654A] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(194,101,74,0.2)]"
            >
              <Twitter className="w-4 h-4 text-[#4A4A4A] group-hover:text-white transition-colors duration-250" strokeWidth={2} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Kolom 2: Product */}
        <div>
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#C2654A] mb-6 flex items-center gap-3">
            Product
            <span className="flex-1 h-px bg-[#E5E5E5]/50" aria-hidden="true" />
          </p>
          <nav aria-label="Product navigatie">
            <ul className="space-y-0 list-none p-0 m-0">
              {NAV_PRODUCT.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="group block text-sm text-[#4A4A4A] py-[7px] transition-all duration-200 relative hover:text-[#C2654A]"
                  >
                    {link.label}
                    <span className="absolute bottom-1 left-0 w-0 h-px bg-[#C2654A] transition-[width] duration-250 group-hover:w-full" aria-hidden="true" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Kolom 3: Bedrijf */}
        <div>
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#C2654A] mb-6 flex items-center gap-3">
            Bedrijf
            <span className="flex-1 h-px bg-[#E5E5E5]/50" aria-hidden="true" />
          </p>
          <nav aria-label="Bedrijf navigatie">
            <ul className="space-y-0 list-none p-0 m-0">
              {NAV_COMPANY.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="group block text-sm text-[#4A4A4A] py-[7px] transition-all duration-200 relative hover:text-[#C2654A]"
                  >
                    {link.label}
                    <span className="absolute bottom-1 left-0 w-0 h-px bg-[#C2654A] transition-[width] duration-250 group-hover:w-full" aria-hidden="true" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Kolom 4: Juridisch */}
        <div>
          <p className="text-[11px] font-bold tracking-[2px] uppercase text-[#C2654A] mb-6 flex items-center gap-3">
            Juridisch
            <span className="flex-1 h-px bg-[#E5E5E5]/50" aria-hidden="true" />
          </p>
          <nav aria-label="Juridische links">
            <ul className="space-y-0 list-none p-0 m-0">
              {NAV_LEGAL.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className="group block text-sm text-[#4A4A4A] py-[7px] transition-all duration-200 relative hover:text-[#C2654A]"
                  >
                    {link.label}
                    <span className="absolute bottom-1 left-0 w-0 h-px bg-[#C2654A] transition-[width] duration-250 group-hover:w-full" aria-hidden="true" />
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>

      </div>

      {/* Gradient divider */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-16">
        <div className="h-px" style={{ background: 'linear-gradient(to right, transparent 0%, #E5E5E5 20%, #E5E5E5 80%, transparent 100%)' }} aria-hidden="true" />
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-6 pb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#8A8A8A]">
          © {new Date().getFullYear()} FitFi B.V. · KVK 97225665 · Keizersgracht 520 H, Amsterdam
        </p>
        <div className="flex items-center gap-5">
          {/* Trust badges */}
          <div className="flex gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#8A8A8A] px-3 py-1 rounded-full bg-white border border-[#E5E5E5]/50">
              <Shield className="w-3 h-3 text-[#C2654A]" aria-hidden="true" />
              GDPR
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#8A8A8A] px-3 py-1 rounded-full bg-white border border-[#E5E5E5]/50">
              <Lock className="w-3 h-3 text-[#C2654A]" aria-hidden="true" />
              SSL
            </span>
          </div>
          {/* Made in Amsterdam */}
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#8A8A8A]">
            <MapPin className="w-3.5 h-3.5 text-[#C2654A]" aria-hidden="true" />
            Made in Amsterdam
          </span>
        </div>
      </div>

      {/* "Fi" watermark */}
      <span className="hidden lg:block absolute bottom-[-40px] right-12 font-serif italic text-[240px] leading-none text-[#E5E5E5]/25 pointer-events-none select-none tracking-[-8px]" aria-hidden="true">
        Fi
      </span>

    </footer>
  );
}
