import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Instagram, Linkedin, MapPin } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/ui/Logo";
import { track } from "@/utils/analytics";

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

/*
 * X heeft geen eigen Lucide-icoon; het Twitter-vogeltje hoort bij een merk dat
 * niet meer bestaat (beeldkritiek fase 4). Daarom de letter X, in de vorm van
 * de andere twee.
 */
const SOCIAL: Array<{ href: string; label: string; Icon?: typeof Instagram; letter?: string }> = [
  { href: "https://instagram.com/fitfi.ai", label: "Volg FitFi op Instagram", Icon: Instagram },
  { href: "https://linkedin.com/company/fitfi-ai", label: "Volg FitFi op LinkedIn", Icon: Linkedin },
  { href: "https://x.com/fitfi_ai", label: "Volg FitFi op X", letter: "X" },
];

/**
 * Pagina's die zelf al eindigen met een knop naar de quiz. Daar stond de
 * CTA-strook er als tweede "Begin gratis" direct onder (21 oktober 2026: op
 * /prijzen, /hoe-het-werkt, /veelgestelde-vragen en /results/preview twee
 * afsluiters na elkaar). Eén afsluiter per pagina.
 */
const EIGEN_AFSLUITER = new Set(["/", "/prijzen", "/hoe-het-werkt", "/veelgestelde-vragen", "/results/preview"]);

/** De container uit CLAUDE.md deel 3, zodat de footer niet naast de pagina uitlijnt. */
const CONTAINER = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/**
 * Footer (plan fase 2, 4.6 en F1 tot F3).
 *
 * - De CTA-strook staat niet op pagina's die zelf afsluiten met een knop
 *   naar de quiz (EIGEN_AFSLUITER). Elders opent "Begin gratis" de quiz (/onboarding), niet het
 *   registratiescherm, onder een kop in de sans in plaats van de serif.
 * - Geen serif-watermerk, geen kolomkoppen in terracotta kapitalen, geen
 *   pillen "GDPR" en "SSL".
 * - Dezelfde container als de rest van de pagina.
 * - Mobiel staan de links in twee kolommen. De juridische links gaan naar een
 *   kolom zodra twee kolommen van 7rem niet passen: bij gewone tekst nooit,
 *   bij 150 procent tekst op 390 breed wel. Een vaste grens van 420 px maakte
 *   de footer op / van 320 tot 412 breed 762 px hoog, en F3 staat hoogstens
 *   760 toe.
 * - Geen slogan onder het logo. Daar stond "Stijladvies afgestemd op jou. Op
 *   basis van je kleuren, voorkeuren en levensstijl." In fase 4 was dat de
 *   enige zin onder de hero die als algemene marketing las.
 * - Bij 200 procent tekst liep de footer over: op 360 en 390 breed het woord
 *   'Voorwaarden' in de juridische kolom, op 1024 de kolom Juridisch tot
 *   1142 px (fase 4, WCAG 1.4.4). Daarom min-w-0 op de kolommen, minmax(0,...)
 *   in het desktopraster en lange woorden die mogen breken.
 * - Staat de cookiebanner open, dan groeit de onderkant met --banner-h mee,
 *   zodat de laatste links boven de banner kunnen scrollen (WCAG 2.4.11).
 * - Op de homepage (de kleurkamer, 22 oktober 2026) op inkt, in de vormtaal van
 *   die pagina: rechte randen, haarlijnen, papierwitte tekst. Zelfde links en
 *   volgorde; de andere pagina's houden deze footer zoals hij was.
 */
export default function Footer() {
  const { pathname } = useLocation();
  const { user } = useUser();
  const isAuthed = !!user;

  if (pathname.startsWith("/onboarding")) return null;

  const toonCta = !isAuthed && !EIGEN_AFSLUITER.has(pathname);
  const opHome = pathname === "/";
  /** Op de homepage dezelfde linkerrand als de rest van de pagina (--rand). */
  const rij = opHome ? "px-[var(--rand)]" : CONTAINER;

  return (
    <footer className={opHome ? "bg-[#1A1A1A] text-[#FAFAF8]" : "bg-[#F5F0EB]"}>

      {/* CTA-strook: alleen voor uitgelogde bezoekers, en niet waar de pagina zelf afsluit */}
      {toonCta && (
        <div className={`${CONTAINER} py-40`}>
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-14 md:p-20 flex flex-col items-center text-center gap-3 transition-shadow duration-200 hover:shadow-md">
            {/* Een kop, geen p met kopopmaak: zo staat hij in de kopstructuur
                (axe p-as-heading op /prijzen en /hoe-het-werkt, fase 4). */}
            <h2 className="text-2xl md:text-3xl font-bold leading-snug text-[#1A1A1A]">
              Ontdek jouw stijl
            </h2>
            <p className="text-base text-[#4A4A4A] max-w-prose">
              De quiz is gratis. Voor je rapport maak je een gratis account.
            </p>
            <NavLink
              to="/onboarding"
              onClick={() => {
                track("cta_click", { page: pathname, position: "footer" });
                track("quiz_start", { page: pathname, position: "footer" });
              }}
              className="mt-6 inline-flex items-center justify-center min-h-[48px] bg-[#A85740] hover:bg-[#9A503B] text-white text-base font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Begin gratis
            </NavLink>
          </div>
        </div>
      )}

      {/* Merk en links */}
      <div className={`${rij} grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 ${toonCta ? "" : "pt-16"}`}>

        {/* Mobiel staan logo en sociale knoppen naast elkaar; vanaf lg onder
            elkaar in de volgorde van de DOM. */}
        <div className="col-span-2 lg:col-span-1 min-w-0 flex flex-wrap items-center justify-between gap-y-4 lg:block">
          <div className="lg:mb-5">
            <Logo size={opHome ? "md" : "sm"} variant={opHome ? "light" : "default"} className="text-[26px]" />
          </div>
          <div className="flex gap-2 lg:mt-7">
            {SOCIAL.map(({ href, label, Icon, letter }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={
                  opHome
                    ? "group w-11 h-11 border border-[rgba(250,250,248,0.3)] flex items-center justify-center transition-colors duration-200 hover:border-[#FAFAF8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FAFAF8]"
                    : "group w-11 h-11 rounded-xl bg-white border border-[#E5E5E5] flex items-center justify-center transition-colors duration-200 hover:border-[#1A1A1A]"
                }
              >
                {Icon ? (
                  <Icon
                    className={`w-4 h-4 transition-colors duration-200 ${opHome ? "text-[#FAFAF8]" : "text-[#4A4A4A] group-hover:text-[#1A1A1A]"}`}
                    strokeWidth={opHome ? 1.5 : 2}
                    aria-hidden="true"
                  />
                ) : (
                  <span
                    className={`text-sm font-semibold leading-none transition-colors duration-200 ${opHome ? "text-[#FAFAF8]" : "text-[#4A4A4A] group-hover:text-[#1A1A1A]"}`}
                    aria-hidden="true"
                  >
                    {letter}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>

        <FooterLinks titel="Product" label="Product navigatie" links={NAV_PRODUCT} donker={opHome} />
        <FooterLinks titel="Bedrijf" label="Bedrijf navigatie" links={NAV_COMPANY} donker={opHome} />
        {/* Mobiel over de volle breedte met de links in twee kolommen; vanaf lg
            een gewone kolom. Zo blijft de volgorde in de DOM gelijk aan wat je
            ziet, en wordt de footer op 390 breed niet hoger dan nodig. */}
        <FooterLinks titel="Juridisch" label="Juridische links" links={NAV_LEGAL} breed donker={opHome} />

      </div>

      {/* Scheidingslijn */}
      <div className={`${rij} mt-10 md:mt-16`}>
        <div
          className="h-px"
          style={{
            background: opHome
              ? "rgba(250,250,248,0.3)"
              : "linear-gradient(to right, transparent 0%, #E5E5E5 20%, #E5E5E5 80%, transparent 100%)",
          }}
          aria-hidden="true"
        />
      </div>

      {/* Onderbalk. De extra ruimte onderin is er alleen zolang de cookiebanner
          open staat (--banner-h, gezet door CookieBanner). */}
      <div
        className={`${rij} pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between`}
        style={{ paddingBottom: "calc(2rem + var(--banner-h, 0px))" }}
      >
        <p className={`text-sm ${opHome ? "text-[rgba(250,250,248,0.82)]" : "text-[#6E6E6E]"}`}>
          © {new Date().getFullYear()} FitFi B.V. · KVK 97225665 · Keizersgracht 520{"\u00A0"}H, Amsterdam
        </p>
        <span className={`flex items-center gap-1.5 text-sm font-medium ${opHome ? "text-[rgba(250,250,248,0.82)]" : "text-[#6E6E6E]"}`}>
          <MapPin className={`w-3.5 h-3.5 ${opHome ? "text-[rgba(250,250,248,0.82)]" : "text-[#6E6E6E]"}`} aria-hidden="true" />
          Made in Amsterdam
        </span>
      </div>

    </footer>
  );
}

function FooterLinks({
  titel,
  label,
  links,
  breed = false,
  donker = false,
}: {
  titel: string;
  label: string;
  links: Array<{ to: string; label: string }>;
  breed?: boolean;
  /** op inkt (de homepage): papierwitte tekst */
  donker?: boolean;
}) {
  return (
    <div className={breed ? "col-span-2 lg:col-span-1 min-w-0" : "min-w-0"}>
      <p className={`text-sm font-semibold mb-2 ${donker ? "text-[#FAFAF8]" : "text-[#1A1A1A]"}`}>{titel}</p>
      <nav aria-label={label}>
        <ul className={`list-none p-0 m-0 ${breed ? "grid grid-cols-[repeat(auto-fit,minmax(min(100%,max(7rem,calc(50%-0.75rem))),1fr))] gap-x-6 lg:grid-cols-1" : ""}`}>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={`block py-3 text-sm [overflow-wrap:anywhere] hyphens-auto hover:underline underline-offset-2 transition-colors duration-200 ${
                  donker ? "text-[rgba(250,250,248,0.82)] hover:text-[#FAFAF8]" : "text-[#4A4A4A] hover:text-[#1A1A1A]"
                }`}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
