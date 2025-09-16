import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, BarChart3 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/ui/Logo";
import { NAV_ITEMS } from "@/constants/nav";
import MobileNavDrawer from "@/components/layout/MobileNavDrawer";
import { track } from "@/utils/analytics";

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
    // Track page views
    track("page:view", {
      path: location.pathname,
      user_authenticated: !!user,
      timestamp: Date.now()
    });
  }, [location.pathname, user]);

  const isActiveLink = (href: string) =>
    location.pathname === href || (href !== "/" && location.pathname.startsWith(href));

  const handleNavClick = (item: { href: string; label: string }) => {
    track("nav:click", {
      link_text: item.label,
      link_href: item.href,
      user_authenticated: !!user,
      is_active: isActiveLink(item.href),
      timestamp: Date.now()
    });
  };

  const handleCTAClick = (action: string) => {
    track("nav:cta", {
      action,
      user_authenticated: !!user,
      current_path: location.pathname,
      timestamp: Date.now()
    });
  };

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    track("nav:mobile_menu", {
      action: newState ? "open" : "close",
      user_authenticated: !!user,
      timestamp: Date.now()
    });
  };

  const handleLogout = async () => {
    track("nav:logout", {
      current_path: location.pathname,
      timestamp: Date.now()
    });
    
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav
      data-fitfi="navbar"
      role="navigation"
      aria-label="Hoofdnavigatie"
      className={`header-glass transition-all duration-300 ${isScrolled ? "shadow-lg" : ""}`}
    >
      <div className="container">
        <div className="flex items-center justify-between py-3">
          {/* Left: brand */}
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              aria-label="Ga naar home" 
              className="inline-flex items-center group"
              onClick={() => handleCTAClick("logo_click")}
            >
              <Logo className="h-6 w-auto transition-transform duration-200 group-hover:scale-105" />
            </Link>
          </div>

          {/* Center: Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActiveLink(item.href);
              const baseClasses = `nav-link text-sm font-medium transition-all duration-200 hover:scale-105 ${active ? "is-active" : ""}`;
              
              if (item.href.startsWith("#")) {
                return (
                  <a 
                    key={item.href} 
                    href={item.href}
                    className={baseClasses}
                    onClick={() => handleNavClick(item)}
                  >
                    {item.label}
                  </a>
                );
              }
              return (
                <Link 
                  key={item.href} 
                  to={item.href}
                  className={baseClasses}
                  onClick={() => handleNavClick(item)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right: CTA section */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <Link 
                to="/registreren" 
                className="btn btn-primary group" 
                aria-label="Start gratis"
                onClick={() => handleCTAClick("register")}
              >
                <User className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                Start gratis
              </Link>
            ) : (
              <>
                <Link 
                  to="/dashboard" 
                  className="btn btn-ghost group" 
                  aria-label="Naar dashboard"
                  onClick={() => handleCTAClick("dashboard")}
                >
                  <BarChart3 className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  Dashboard
                </Link>
                <button 
                  className="btn btn-ghost group" 
                  onClick={handleLogout} 
                  aria-label="Uitloggen"
                >
                  <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
                  Uitloggen
                </button>
              </>
            )}
          </div>

          {/* Mobile: menu button */}
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] transition-all duration-200 hover:scale-105 hover:border-[color:var(--color-primary)] focus:border-[color:var(--color-primary)]"
            aria-label={isMobileMenuOpen ? "Sluit menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            onClick={handleMobileMenuToggle}
          >
            <div className="relative">
              <Menu 
                className={`h-5 w-5 transition-all duration-200 ${isMobileMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}`} 
              />
              <X 
                className={`h-5 w-5 absolute inset-0 transition-all duration-200 ${isMobileMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`} 
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileNavDrawer 
        open={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </nav>
  );
};

export default Navbar;