import { Home, Info, HelpCircle, DollarSign, BookOpen, ShoppingBag, User, LogIn } from 'lucide-react';

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isSection?: boolean;
  sectionId?: string;
}

export const NAV_ITEMS: NavLink[] = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Waarom FitFi', href: '/over-ons', icon: Info },
  { label: 'Hoe het werkt', href: '/hoe-het-werkt', icon: HelpCircle },
  { label: 'Prijzen', href: '/prijzen', icon: DollarSign },
  { label: 'Aanbevelingen', href: '/results', icon: ShoppingBag },
  { label: 'Outfits', href: '/outfits', icon: ShoppingBag },
  { label: 'Blog', href: '/blog', icon: BookOpen },
  { label: 'Inloggen', href: '/inloggen', icon: LogIn },
  { label: 'Dashboard', href: '/dashboard', icon: User }
];

// Development guard against duplicate navigation items
if (import.meta.env.DEV) {
  const labels = NAV_ITEMS.map(i => i.label);
  const dupes = labels.filter((l, i) => labels.indexOf(l) !== i);
  if (dupes.length) {
    throw new Error(`Duplicate nav items: ${dupes.join(', ')}`);
  }
}

export default NAV_ITEMS;