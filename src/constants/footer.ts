export type FooterLink = { label: string; href: string };
export type FooterColumn = { title: string; links: FooterLink[] };

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Stijlquiz', href: '/quiz' },
      { label: 'AI Style Report', href: '/hoe-het-werkt' },
      { label: 'Outfits', href: '/succesverhalen' },
      { label: 'Prijzen', href: '/prijzen' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Stories', href: '/succesverhalen' },
      { label: 'Blog', href: '/blog' },
      { label: 'Help', href: '/help' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Bedrijf',
    links: [
      { label: 'Over ons', href: '/over-ons' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacybeleid', href: '/privacybeleid' },
      { label: 'Voorwaarden', href: '/voorwaarden' },
      { label: 'Cookies', href: '/cookies' },
    ],
  },
];

export const FOOTER_CTA = { href: '/registreren', label: 'Gratis starten' };

// Socials: vul alleen echte profielen; lege urls worden niet gerenderd.
export const SOCIALS: { name: 'LinkedIn'|'Instagram'|'TikTok'|'X'; url?: string }[] = [
  { name: 'LinkedIn' },
  { name: 'Instagram' },
  { name: 'TikTok' },
  { name: 'X' },
];

export const BRAND = {
  name: 'FitFi',
  tagline: 'Persoonlijke stijl. Aangedreven door AI.',
  email: 'team@fitfi.ai',
};