import React, { useEffect } from "react";
import { w as track } from "@/utils";
import { useUser } from "@/context/UserContext";
import { w } from "@/utils/analytics";
import { w as track } from "@/utils/analytics";
interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const getNavIcon = (href: string) => {
  if (href === "/" || href === "#home") return Home;
  if (href === "/over-ons" || href === "/profiel") return User;
  if (href === "/blog") return BookOpen;
  if (href === "/tribes") return Users;
  if (href === "/pricing") return CreditCard;
  if (href === "/help") return HelpCircle;
  return null;
};

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ open, onClose }) => {
  const { user, logout } = useUser();
  const location = useLocation();

  // Track drawer open/close
  useEffect(() => {
    if (open) {
      w('mobile_nav_opened', { 
        page: location.pathname,
        timestamp: Date.now()
      });
    }
  }, [open, location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const handleNavClick = (href: string, label: string) => {
    w('mobile_nav_click', {
      nav_item: label,
      href,
      page: location.pathname,
      timestamp: Date.now()
    });
    onClose();
  };

  const handleAuthAction = (action: string) => {
    w('mobile_nav_auth', {
      action,
      page: location.pathname,
      timestamp: Date.now()
    });
    
    if (action === 'logout') {
      logout();
    }
    onClose();
  };

  const handleClose = () => {
    w('mobile_nav_closed', {
      page: location.pathname,
      timestamp: Date.now()
    });
    onClose();
  };

  const isActiveLink = (href: string) =>
    location.pathname === href || (href !== "/" && location.pathname.startsWith(href));

  if (!open) return null;

  return (
    <>
      {/* Animated scrim */}
      <div 
        className="mobile-drawer__scrim animate-fadeIn" 
        onClick={handleClose} 
        aria-hidden="true" 
      />
      
      {/* Drawer */}
      <aside 
        className="mobile-drawer animate-slideInLeft" 
        role="dialog" 
        aria-modal="true" 
        aria-label="Mobiel menu"
      >
        {/* Header */}
        <div className="mobile-drawer__head">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gradient-to-r from-[color:var(--color-primary)] to-[color:var(--color-accent)] rounded-full animate-pulse"></div>
            <span className="font-semibold text-[color:var(--color-text)]">Menu</span>
          </div>
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--color-border)] hover:bg-[color:var(--overlay-accent-08a)] transition-colors duration-200"
            onClick={handleClose} 
            aria-label="Sluit menu"
          >
            <X className="h-5 w-5 text-[color:var(--color-text)]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto" aria-label="Mobiele navigatie">
          <ul className="mobile-drawer__list">
            {NAV_ITEMS.map((item) => {
              const Icon = getNavIcon(item.href);
              const isActive = isActiveLink(item.href);
              
              return (
                <li key={item.href} className="mobile-drawer__item">
                  {item.href.startsWith("#") ? (
                    <a 
                      href={item.href}
                      onClick={() => handleNavClick(item.href, item.label)}
                      className={`flex items-center gap-3 px-4 py-3 text-[color:var(--color-text)] hover:bg-[color:var(--overlay-accent-08a)] transition-all duration-200 ${
                        isActive ? 'bg-[color:var(--overlay-primary-12a)] border-r-2 border-[color:var(--color-primary)]' : ''
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5 text-[color:var(--color-muted)]" />}
                      <span className={isActive ? 'font-medium text-[color:var(--color-primary)]' : ''}>{item.label}</span>
                    </a>
                  ) : (
                    <Link 
                      to={item.href}
                      onClick={() => handleNavClick(item.href, item.label)}
                      className={`flex items-center gap-3 px-4 py-3 text-[color:var(--color-text)] hover:bg-[color:var(--overlay-accent-08a)] transition-all duration-200 ${
                        isActive ? 'bg-[color:var(--overlay-primary-12a)] border-r-2 border-[color:var(--color-primary)]' : ''
                      }`}
                    >
                      {Icon && <Icon className="h-5 w-5 text-[color:var(--color-muted)]" />}
                      <span className={isActive ? 'font-medium text-[color:var(--color-primary)]' : ''}>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Auth Actions */}
        <div className="p-4 border-t border-[color:var(--color-border)] bg-[color:var(--overlay-accent-08a)]">
          {!user ? (
            <>
              <Link 
                to="/inloggen" 
                className="btn btn-ghost btn-full mb-3 hover:scale-105 transition-transform duration-200" 
                onClick={() => handleAuthAction('login')}
              >
                <User className="h-4 w-4" />
                Inloggen
              </Link>
              <Link 
                to="/registreren" 
                className="btn btn-primary btn-full hover:scale-105 transition-transform duration-200" 
                onClick={() => handleAuthAction('register')}
              >
                Start gratis
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/dashboard" 
                className="btn btn-primary btn-full mb-3 hover:scale-105 transition-transform duration-200" 
                onClick={() => handleAuthAction('dashboard')}
              >
                <User className="h-4 w-4" />
                Dashboard
              </Link>
              <button 
                className="btn btn-ghost btn-full hover:scale-105 transition-transform duration-200" 
                onClick={() => handleAuthAction('logout')}
              >
                Uitloggen
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  );
};

export default MobileNavDrawer;