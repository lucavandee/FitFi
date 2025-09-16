import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/ui/Logo";
import { NAV_ITEMS } from "@/constants/nav";
import MobileNavDrawer from "./MobileNavDrawer";
import { w } from "@/utils/analytics";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useUser();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    track('navbar:view', { path: location.pathname });
  }, [location.pathname]);

  const active = (href: string) =>
    location.pathname === href || (href !== "/" && location.pathname.startsWith(href));

  const handleNavClick = (href: string, label: string) => {
    track('navbar:nav-click', { href, label });
  };

  const handleCTAClick = (action: string) => {
    track('navbar:cta-click', { action });
  };

  const handleMobileToggle = () => {
    const newState = !open;
    setOpen(newState);
    track('navbar:mobile-toggle', { open: newState });
  };

  const handleUserMenuToggle = () => {
    const newState = !userMenuOpen;
    setUserMenuOpen(newState);
    track('navbar:user-menu-toggle', { open: newState });
  };

  const handleLogout = () => {
    track('navbar:logout');
    logout();
    setUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (userMenuOpen && !target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      {/* Skip link voor accessibility */}
      <a href="#main" className="skip-link">Spring naar hoofdinhoud</a>

      <div className="container nav-inner">
        {/* Brand */}
        <Link 
          to="/" 
          aria-label="FitFi Home" 
          className="inline-flex items-center gap-2 brand-link"
          onClick={() => handleNavClick('/', 'Home')}
        >
          <Logo className="h-6 w-auto logo-animate" />
          <span className="font-bold text-lg gradient-text hidden sm:inline">FitFi</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Hoofdnavigatie">
          {NAV_ITEMS.map((n) =>
            n.href.startsWith("#") ? (
              <a 
                key={n.href} 
                href={n.href} 
                className={`nav-link text-sm font-medium ${active(n.href) ? "is-active" : ""}`}
                onClick={() => handleNavClick(n.href, n.label)}
              >
                {n.label}
              </a>
            ) : (
              <Link 
                key={n.href} 
                to={n.href} 
                className={`nav-link text-sm font-medium ${active(n.href) ? "is-active" : ""}`}
                onClick={() => handleNavClick(n.href, n.label)}
              >
                {n.label}
              </Link>
            )
          )}
        </nav>

        {/* CTA rechts */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link 
                to="/inloggen" 
                className="nav-link text-sm font-medium"
                onClick={() => handleCTAClick('login')}
              >
                Inloggen
              </Link>
              <Link 
                to="/registreren" 
                className="btn btn-primary btn-animate"
                onClick={() => handleCTAClick('register')}
              >
                Start gratis
              </Link>
            </>
          ) : (
            <div className="user-menu-container relative">
              <button
                className="nav-link inline-flex items-center gap-2 text-sm font-medium"
                onClick={handleUserMenuToggle}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="Gebruikersmenu"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">{user.email?.split('@')[0] || 'Account'}</span>
              </button>

              {userMenuOpen && (
                <div className="user-menu absolute right-0 top-full mt-2 w-48 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] rounded-lg shadow-lg z-50 animate-fadeIn">
                  <div className="p-2">
                    <Link
                      to="/dashboard"
                      className="user-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-[color:var(--overlay-accent-08a)] transition-colors"
                      onClick={() => {
                        handleCTAClick('dashboard');
                        setUserMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profiel"
                      className="user-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-[color:var(--overlay-accent-08a)] transition-colors"
                      onClick={() => {
                        handleCTAClick('profile');
                        setUserMenuOpen(false);
                      }}
                    >
                      <User className="w-4 h-4" />
                      Profiel
                    </Link>
                    <hr className="my-1 border-[color:var(--color-border)]" />
                    <button
                      className="user-menu-item flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-[color:var(--overlay-accent-08a)] transition-colors text-left"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Uitloggen
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--color-border)] mobile-menu-btn"
          aria-label={open ? "Sluit menu" : "Open menu"}
          aria-expanded={open}
          onClick={handleMobileToggle}
        >
          <div className="menu-icon-container">
            {open ? <X className="h-5 w-5 animate-pulse" /> : <Menu className="h-5 w-5" />}
          </div>
        </button>
      </div>

      <MobileNavDrawer open={open} onClose={() => setOpen(false)} />
    </header>
  );
};

export default Navbar;