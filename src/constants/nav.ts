import { Home, Info, HelpCircle, DollarSign, ShoppingBag, BookOpen, LogIn, User } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: any;
}

export const NAV_ITEMS: NavLink[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/over-ons', label: 'Over ons', icon: Info },
  { href: '/hoe-het-werkt', label: 'Hoe het werkt', icon: HelpCircle },
  { href: '/prijzen', label: 'Prijzen', icon: DollarSign },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/contact', label: 'Contact', icon: User },
  { href: '/veelgestelde-vragen', label: 'FAQ', icon: HelpCircle },
  { href: '/feed', label: 'Feed', icon: ShoppingBag },
  { href: '/inloggen', label: 'Inloggen', icon: LogIn }
];