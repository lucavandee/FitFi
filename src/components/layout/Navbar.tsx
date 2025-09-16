import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Logo from "@/components/ui/Logo";
import { NAV_ITEMS } from "@/constants/nav";
import MobileNavDrawer from "./MobileNavDrawer";
import { track } from "@/utils/analytics";

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useUser();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };
    
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => {
    if (href === "/" && location.pathname === "/") return true;
    if (href !== "/" && location.pathname.startsWith(href)) return true;
    return false;
  };

  const handleCTAClick = () => {
    track("nav:cta-click", {
      cta_type: user ? "dashboard" : "register",
      user_authenticated: !!user
    });
  };

  const handleNavClick = (item: { href: string; label: string }) => {
    track("nav:link-click", {
      nav_item: item.label,
      nav_href: item.href,
      is_active: isActive(item.href)
    });
  };

  const handleMobileToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    track("nav:mobile-toggle", {
      action: newOpen ? "open" : "close"
    });
  };

  return (
    <>
      <nav 
        className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} 
        aria-label="Hoofdnavigatie"
      >
        <div className="container nav-inner">
          {/* Left: Brand */}
          <div className="flex items-center">
            <Link 
              to="/" 
              aria-label="FitFi Home" 
              className="inline-flex items-center transition-opacity duration-200 hover:opacity-80"
              onClick={() => track("nav:logo-click")}
            >
              <Logo className="h-7 w-auto" />
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              
              return item.href.startsWith("#") ? (
                <a 
                  key={item.href} 
                  href={item.href}
                  className={`nav-link ${active ? "is-active" : ""}`}
                  onClick={() => handleNavClick(item)}
                >
                  {item.label}
                </a>
              ) : (
                <Link 
                  key={item.href} 
                  to={item.href}
                  className={`nav-link ${active ? "is-active" : ""}`}
                  onClick={() => handleNavClick(item)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right: CTA */}
          <div className="hidden md:flex items-center">
            {!user ? (
              <Link 
                to="/registreren" 
                className="btn btn-primary"
                onClick={handleCTAClick}
              >
                Start gratis
              </Link>
            ) : (
              <Link 
                to="/dashboard" 
                className="btn btn-primary"
                onClick={handleCTAClick}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] transition-colors duration-200 hover:bg-[color:var(--color-accent)]"
            aria-label={open ? "Sluit navigatie" : "Open navigatie"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={handleMobileToggle}
          >
            {open ? (
              <X className="h-5 w-5 text-[color:var(--color-text)]" />
            ) : (
              <Menu className="h-5 w-5 text-[color:var(--color-text)]" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer 
        open={open} 
        onClose={() => setOpen(false)} 
      />
    </>
  );
};

export default Navbar;