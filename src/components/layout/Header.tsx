import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { NAV_MAIN, NAV_CTA } from '@/constants/nav';
import { lockBodyScroll, unlockBodyScroll } from '@/utils/scroll';
import HeaderGuard from './HeaderGuard';

function cx(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function HeaderInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useUser();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
    
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  // Filter navigation items - exclude login for authenticated users
  const filteredNavItems = NAV_MAIN.filter(item => {
    // Hide login link if user is authenticated
    if (item.href === '/inloggen' && user) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Header */}
      <header 
        className={cx(
          'sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b transition-all duration-300',
          isScrolled ? 'border-slate-200 shadow-sm' : 'border-transparent'
        )}
        role="banner"
        aria-label="Hoofdnavigatie"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 group"
              aria-label="FitFi homepage"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#89CFF0] to-blue-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="font-bold text-xl text-[#0D1B2A] group-hover:text-[#89CFF0] transition-colors">
                FitFi
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8" aria-label="Hoofdmenu">
              {filteredNavItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => cx(
                    'px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg',
                    isActive
                      ? 'text-[#89CFF0] font-semibold bg-[#89CFF0]/10'
                      : 'text-slate-700 hover:text-[#89CFF0] hover:bg-slate-50'
                  )}
                  aria-current={isActiveLink(item.href) ? 'page' : undefined}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-slate-700 hover:text-[#89CFF0] transition-colors"
                  >
                    <User size={18} />
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                    aria-label="Uitloggen"
                  >
                    <LogOut size={16} />
                    <span>Uitloggen</span>
                  </button>
                </div>
              ) : (
                <Link
                  to={NAV_CTA.href}
                  className="inline-flex items-center justify-center px-6 py-2 text-sm font-semibold text-white bg-[#89CFF0] hover:bg-[#89CFF0]/90 rounded-2xl shadow-[0_8px_30px_rgba(137,207,240,0.35)] hover:shadow-[0_12px_40px_rgba(137,207,240,0.45)] transition-all transform hover:scale-105"
                  data-analytics="header_cta"
                >
                  {NAV_CTA.label}
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-[#89CFF0] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] transition-colors"
              aria-expanded={isOpen}
              aria-label="Open menu"
              aria-controls="mobile-menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={cx(
          'md:hidden fixed inset-0 z-50 transition-all duration-300',
          isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
        aria-hidden={!isOpen}
        id="mobile-menu"
      >
        {/* Backdrop */}
        <div
          className={cx(
            'absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
            isOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
        
        {/* Drawer */}
        <div
          className={cx(
            'absolute right-0 top-0 h-full w-[85%] max-w-[380px] bg-white shadow-2xl transition-transform duration-300 ease-out',
            isOpen ? 'translate-x-0' : 'translate-x-full'
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#89CFF0] to-blue-500 flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <span id="mobile-menu-title" className="font-bold text-xl text-[#0D1B2A]">
                  FitFi
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-700 hover:text-[#89CFF0] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] transition-colors"
                aria-label="Sluit menu"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-6" role="navigation">
              <div className="space-y-2">
                {filteredNavItems.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => cx(
                      'flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-colors',
                      isActive
                        ? 'bg-[#89CFF0]/10 text-[#89CFF0] font-semibold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#89CFF0]'
                    )}
                  >
                    {item.icon && <item.icon size={20} />}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Auth Section */}
            <div className="p-6 border-t border-slate-200">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#89CFF0]/10">
                    <div className="w-10 h-10 rounded-full bg-[#89CFF0] flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-[#0D1B2A]">{user.name}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  </div>
                  
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-[#89CFF0] hover:bg-[#89CFF0]/10 rounded-xl transition-colors"
                  >
                    Dashboard
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={16} className="mr-2" />
                    Uitloggen
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/inloggen"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors border border-slate-200"
                  >
                    Inloggen
                  </Link>
                  <Link
                    to={NAV_CTA.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-[#89CFF0] hover:bg-[#89CFF0]/90 rounded-xl shadow-[0_8px_30px_rgba(137,207,240,0.35)] transition-all"
                    data-analytics="header_cta_mobile"
                  >
                    {NAV_CTA.label}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Header() {
  return (
    <HeaderGuard>
      <HeaderInner />
    </HeaderGuard>
  );
}