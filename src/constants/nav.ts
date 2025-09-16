import { Home, Info, HelpCircle, DollarSign, ShoppingBag, BookOpen, User } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: any;
}

/**
 * Let op:
 * - Géén "Inloggen" hier, zodat we geen dubbele login-link krijgen.
 * - Auth-CTA staat rechts in de Navbar en wordt daar conditioneel getoond.
 */
export const NAV_ITEMS: NavLink[] = [
  { href: '/hoe-het-werkt', label: 'Hoe het werkt', icon: HelpCircle },
  { href: '/prijzen', label: 'Prijzen', icon: DollarSign },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/veelgestelde-vragen', label: 'FAQ', icon: HelpCircle },
];