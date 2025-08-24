export type FooterLink = { label: string; href: string; onClick?: () => void };
export type FooterColumn = { title: string; links: FooterLink[] };

export const BRAND = {
  name: "FitFi",
  tagline: "Persoonlijke stijl. Aangedreven door AI.",
  email: "info@fitfi.ai",
  phone: "+31 6 203 709 68",
  addressLines: ["Marktstraat 15D", "7551 DR Hengelo", "Nederland"],
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Navigatie",
    links: [
      { label: "Home", href: "/" },
      { label: "Waarom FitFi", href: "/over-ons" },
      { label: "Hoe het werkt", href: "/hoe-het-werkt" },
      { label: "Prijzen", href: "/prijzen" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Juridisch",
    links: [
      { label: "Privacybeleid", href: "/privacy-policy" },
      { label: "Algemene voorwaarden", href: "/algemene-voorwaarden" },
      { label: "Cookiebeleid", href: "/cookies" },
      { label: "Veelgestelde vragen", href: "/faq" },
      { label: "Ondersteuning", href: "/ondersteuning" },
      { label: "Brand Safety & Editorial", href: "/brand-safety" },
      { label: "Affiliate Disclosure", href: "/disclosure" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Inloggen", href: "/inloggen" },
      { label: "Registreren", href: "/registreren" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Profiel", href: "/profile" },
    ],
  },
];

export const FOOTER_CTA = { href: "/registreren", label: "Gratis starten" };

export const SOCIALS: {
  name: "LinkedIn" | "Instagram" | "TikTok" | "X";
  url?: string;
}[] = [
  { name: "LinkedIn" },
  { name: "Instagram" },
  { name: "TikTok" },
  { name: "X" },
];
