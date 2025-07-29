import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import { motion, AnimatePresence } from 'framer-motion';
import NAV_LINKS from '../../constants/navigation';
import { scrollToHash } from '../../utils/scrollUtils';

const Navbar: React.FC = () => {
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
    document.body.style.overflow = 'unset';
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

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    scrollToHash(href);
  };

  // Debug log for production
  console.log('NAV_LINKS length:', NAV_LINKS.length);

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
                {NAV_LINKS.map((link) => (
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
                aria-controls="mobile-menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/20 z-[50] md:hidden"
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
              />
              
              {/* Mobile Menu Drawer */}
              <motion.aside
                id="mobile-menu"
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="fixed inset-y-0 right-0 z-[60] w-[85vw] max-w-xs bg-white dark:bg-[#1E1B2E] flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.06)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="mobile-menu-title"
              >
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
                  <h2 id="mobile-menu-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                    Menu
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                    aria-label="Sluit menu"
                  >
                    <X size={20} />
                  </button>
                </header>
                
                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto">
                  <ul className="divide-y divide-gray-100 dark:divide-white/10" role="list">
                    {NAV_LINKS.map((link) => {
                      const IconComponent = link.icon;
                      return (
                        <li key={link.href}>
                          <Link
                            to={link.href}
                            onClick={() => handleNavClick(link.href)}
                            className={`flex items-center px-6 py-4 text-lg font-medium transition-colors min-h-[44px] ${
                              isActiveLink(link.href)
                                ? 'text-[#6E2EB7] bg-[#F4F0FB] dark:bg-[#6E2EB7]/20'
                                : 'text-gray-900 dark:text-white hover:bg-[#F4F0FB] dark:hover:bg-white/5 hover:text-[#6E2EB7]'
                            }`}
                            aria-current={isActiveLink(link.href) ? 'page' : undefined}
                          >
                            <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                            <span>{link.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Auth Section */}
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-white/10">
                  {user ? (
                    <div className="space-y-2 pt-6">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-[#6E2EB7] hover:bg-[#F4F0FB] dark:hover:bg-white/5 rounded-xl transition-colors min-h-[44px]"
                      >
                        <User size={20} className="mr-3" />
                        <span>{user.name}</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-4 py-3 text-base font-medium text-gray-900 dark:text-white hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors w-full text-left min-h-[44px]"
                      >
                        <LogOut size={20} className="mr-3" />
                        <span>Uitloggen</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-6">
                      <Button
                        as={Link}
                        to="/inloggen"
                        variant="ghost"
                        fullWidth
                        className="justify-start min-h-[44px]"
                        onClick={() => setIsOpen(false)}
                      >
                        Inloggen
                      </Button>
                      <Button
                        as={Link}
                        to="/registreren"
                        variant="primary"
                        fullWidth
                        className="min-h-[44px]"
                        onClick={() => setIsOpen(false)}
                      >
                        Gratis starten
                      </Button>
                    </div>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-18" aria-hidden="true" />
    </>
  );
};

export default Navbar;