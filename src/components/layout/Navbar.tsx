import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useUser } from "../../context/UserContext";
import Button from "../ui/Button";
import Logo from "../ui/Logo";
import { NAV_ITEMS } from "../../constants/nav";
import MobileNavDrawer from "./MobileNavDrawer";
import { scrollToHash } from "../../utils/scrollUtils";
import { cn } from '@/utils/cn';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useUser();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActiveLink = (href: string) => {
    if (href === "/") return location.pathname === "/";
    if (href.startsWith("#")) return false;
    return location.pathname.startsWith(href);
  };

  const navLinkClass = (path: string) => cn(
    'px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
    'focus-ring',
    isActiveLink(path) 
      ? 'bg-[var(--ff-color-primary-50)] text-[var(--color-text)] border border-[var(--ff-color-primary-200)]'
      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-primary)]'
  );

  return (
    <nav
      data-fitfi="navbar"
      role="navigation"
      aria-label="Hoofdnavigatie"
      className={`sticky top-0 z-40 bg-[var(--color-surface)] backdrop-blur transition-all duration-300 ${
        isScrolled ? "is-scrolled" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Home">
            <Logo className="h-7 w-auto" />
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item) => {
            const active = isActiveLink(item.href);
            if (item.href.startsWith("#")) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHash(item.href);
                  }}
                  className={navLinkClass(item.href)}
                >
                  {item.label}
                </a>
              );
            }
            return (
              <Link
                key={item.href}
                to={item.href}
                className={navLinkClass(item.href)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Auth / CTA (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm opacity-90 hover:opacity-100 flex items-center gap-2"
              >
                <User className="w-4 h-4" aria-hidden="true" />
                Dashboard
              </Link>
              <Button variant="ghost" onClick={logout} aria-label="Uitloggen">
                <LogOut className="w-4 h-4" aria-hidden="true" />
                Uitloggen
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] text-sm font-medium focus-ring rounded-md px-2 py-1"
              >
                Inloggen
              </Link>
              <Link to="/get-started" className="bg-[var(--ff-color-primary-700)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--ff-color-primary-600)] transition-colors focus-ring">
                Gratis starten
              </Link>
            </>
          )}
        </div>

        {/* Mobile: menu button */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center p-2 rounded-lg border border-border transition-colors"
          aria-label={isMobileMenuOpen ? "Sluit menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMobileMenuOpen((s) => !s)}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Menu className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <MobileNavDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </nav>
  );
};

export default Navbar;