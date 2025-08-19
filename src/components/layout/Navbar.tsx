import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import { NAV_MAIN, NAV_CTA } from '../../constants/nav';
import MobileNavDrawer from './MobileNavDrawer';
import { scrollToHash } from '../../utils/scrollUtils';

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleNavClick = (href: string) => {
    scrollToHash(href);
  };

  // Filter desktop navigation items - exclude login for authenticated users
  const desktopNavItems = NAV_MAIN.filter(item => {
    // Hide login link if user is authenticated
    if (item.href === '/inloggen' && user) {
      return false;
    }
    return true;
  });

  return (
    <>
      {/* Navbar */}
      <nav 
        className={`sticky top-0 z-40 bg-white/70 backdrop-blur transition-all duration-300 ${
          isScrolled 
            ? 'shadow-sm' 
            : ''
        }`}
        role="navigation"
        aria-label="Hoofdnavigatie"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link 
                to="/" 
                className="flex items-center space-x-2 group"
                aria-label="FitFi homepage"
              >
                <Logo className="h-8 w-auto" textColor="text-[#0D1B2A]" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {desktopNavItems.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => handleNavClick(link.href)}
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                      isActiveLink(link.href)
                        ? 'text-brandPurple font-semibold border-b-2 border-brandPurple/30'
                        : 'text-gray-700 hover:text-brandPurple hover:bg-gray-50'
                    }`}
                    aria-current={isActiveLink(link.href) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 text-gray-700 hover:text-brandPurple transition-colors"
                  >
                    <User size={18} />
                    <span className="text-sm font-medium">{user.name}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    icon={<LogOut size={16} />}
                    iconPosition="left"
                    aria-label="Uitloggen"
                  >
                    Uitloggen
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    as={Link}
                    to={NAV_CTA.href}
                    variant="primary"
                    size="sm"
                  >
                    {NAV_CTA.label}
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-brandPurple hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brandPurple transition-colors"
                aria-expanded={isMobileMenuOpen}
                aria-label="Open menu"
                aria-controls="mobile-menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer 
        open={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Spacer for sticky navbar */}
      <div className="h-18" aria-hidden="true" />
    </>
  );
};

export default Navbar;