import {
  Home,
  Info,
  HelpCircle,
  DollarSign,
  BookOpen,
  Mail,
  MessageSquare,
  Rss,
  LogIn,
} from "lucide-react";

export interface NavLink {
  href: string;
  label: string;
  icon?: any;
}

export const NAV_MAIN: NavLink[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/over-ons", label: "Over ons", icon: Info },
  { href: "/hoe-het-werkt", label: "Hoe het werkt", icon: HelpCircle },
  { href: "/prijzen", label: "Prijzen", icon: DollarSign },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/faq", label: "FAQ", icon: MessageSquare },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/inloggen", label: "Inloggen", icon: LogIn },
];

export const NAV_CTA = {
  href: "/registreren",
  label: "Gratis starten",
};

// Legacy export for backward compatibility
export const NAV_ITEMS = NAV_MAIN;
