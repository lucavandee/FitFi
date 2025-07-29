import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';
import Logo from '../ui/Logo';

interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useUser();
  const location = useLocation();

  const navLinks: NavLink[] = [
    { label: 'Home', href: '/' },
    { label: 'Waarom FitFi', href: '/over-ons' },
    { label: 'Hoe het werkt', href: '/hoe-het-werkt' },
    { label: 'Prijzen', href: '/prijzen' },
    { label: 'Aanbevelingen', href: '/outfits' },
    { label: 'Outfits', href: '/outfits' },
    { label: 'Blog', href: '/blog' }
  ];

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

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
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
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
                      isActiveLink(link.href)
                        ? 'text-[#89CFF0] font-semibold border-b-2 border-[#89CFF0]/30'
                        : 'text-gray-700 hover:text-[#89CFF0] hover:bg-gray-50'
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
                    className="flex items-center space-x-2 text-gray-700 hover:text-[#89CFF0] transition-colors"
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
                    to="/inloggen"
                    variant="ghost"
                    size="sm"
                  >
                    Inloggen
                  </Button>
                  <Button
                    as={Link}
                    to="/registreren"
                    variant="primary"
                    size="sm"
                  >
                    Gratis starten
                  </Button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-[#89CFF0] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] transition-colors"
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Sluit menu' : 'Open menu'}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen 
              ? 'max-h-screen opacity-100' 
              : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <div className="bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 pt-4 pb-6 space-y-3">
              {/* Mobile Navigation Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-4 py-3 text-base font-medium rounded-xl transition-colors ${
                    isActiveLink(link.href)
                      ? 'text-[#89CFF0] bg-[#89CFF0]/10'
                      : 'text-gray-700 hover:text-[#89CFF0] hover:bg-gray-50'
                  }`}
                  aria-current={isActiveLink(link.href) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-3">
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-[#89CFF0] hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <User size={20} />
                      <span>{user.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-3 text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full text-left"
                    >
                      <LogOut size={20} />
                      <span>Uitloggen</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      as={Link}
                      to="/inloggen"
                      variant="ghost"
                      fullWidth
                      className="justify-start"
                    >
                      Inloggen
                    </Button>
                    <Button
                      as={Link}
                      to="/registreren"
                      variant="primary"
                      fullWidth
                    >
                      Gratis starten
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Spacer for fixed navbar */}
      <div className="h-18" aria-hidden="true" />
    </>
  );
};

export default Navbar;