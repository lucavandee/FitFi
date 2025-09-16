import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { useUser } from "../../context/UserContext";
import Logo from "../ui/Logo";
import { NAV_ITEMS } from "../../constants/nav";
import MobileNavDrawer from "./MobileNavDrawer";
import { cn } from "../../utils/cn";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useUser();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
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

  return (
    <nav
      data-fitfi="navbar"
      role="navigation"
      aria-label="Hoofdnavigatie"
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        isScrolled 
          ? "navbar-glass border-b border-[color:var(--color-border)]" 
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: brand */}
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Ga naar home" className="inline-flex items-center">
            <Logo className="h-6 w-auto" />
          </Link>
        </div>

        {/* Center: Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActiveLink(item.href);
            if (item.href.startsWith("#")) {
              return (
                <a key={item.href} href={item.href}
                   className={cn(
                     "nav-link text-sm font-medium transition-colors",
                     active && "nav-link--active"
                   )}>
                  {item.label}
                </a>
              );
            }
            return (
              <Link key={item.href} to={item.href}
                    className={cn(
                      "nav-link text-sm font-medium transition-colors",
                      active && "nav-link--active"
                    )}>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Auth actions — exact één CTA */}
        <div className="auth-cta hidden items-center gap-3 md:flex">
          {!user && (
            <Link to="/inloggen" className="btn btn-primary btn-md inline-flex items-center gap-2" aria-label="Inloggen" data-variant="primary">
              <Sparkles className="w-4 h-4" />
              Inloggen
            </Link>
          )}
          {user && (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-md" aria-label="Naar dashboard" data-variant="ghost">
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="btn btn-ghost btn-md"
                aria-label="Uitloggen"
                data-variant="ghost"
              >
                Uitloggen
              </button>
            </>
          )}
        </div>

        {/* Mobile: menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-[var(--radius-lg)] border border-ui p-2 transition-colors md:hidden"
          aria-label={isMobileMenuOpen ? "Sluit menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsMobileMenuOpen((s) => !s)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <MobileNavDrawer open={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </nav>
  );
};

export default Navbar;