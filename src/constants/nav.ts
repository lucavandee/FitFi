import { Home, HelpCircle, LogIn, BookOpen, Users, MessageSquare } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: any;
}

export const NAV_ITEMS: NavLink[] = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/hoe-het-werkt', label: 'Hoe het werkt', icon: HelpCircle },
  { href: '/succesverhalen', label: 'Stories', icon: Users },
  { href: '/blog', label: 'Blog', icon: BookOpen },
  { href: '/help', label: 'Help', icon: MessageSquare },
  { href: '/veelgestelde-vragen', label: 'FAQ', icon: HelpCircle },
  { href: '/inloggen', label: 'Inloggen', icon: LogIn }
];