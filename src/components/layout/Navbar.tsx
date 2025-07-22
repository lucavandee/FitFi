import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, User } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => closeMenu(), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-midnight/95 backdrop-blur-md' : 'bg-midnight/80 backdrop-blur-sm'}`}>
        <div className="container-slim">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0" onClick={closeMenu}>
                <Logo className="h-8 w-auto text-card-white" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-10">
              {['/', '/onboarding', '/over-ons'].map((path, idx) => {
                const labels = ['Home', 'Stijlscan', 'Over ons'];
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`text-sm font-medium transition-colors hover:text-turquoise relative ${location.pathname === path ? 'text-card-white' : 'text-card-white/80'}`}
                  >
                    {labels[idx]}
                    {location.pathname === path && (
                      <span className="absolute -bottom-1 left-0 w-full h-1.5 bg-turquoise rounded" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-6">
              <button
                onClick={toggleTheme}
                className="p-2 rounded hover:bg-midnight-800 transition-colors text-card-white"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="flex items-center space-x-2 text-card-white hover:text-turquoise transition-colors">
                    <User size={20} />
                    <span className="font-medium">{user.name?.split(' ')[0] || 'Gebruiker'}</span>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-card-white border border-card-white/30 hover:bg-card-white/10">
                    Uitloggen
                  </Button>
                </div>
              ) : (
                <div className="space-x-4">
                  <Button as={Link} to="/onboarding" variant="ghost" size="sm" className="text-card-white border border-card-white/30 hover:bg-card-white/10">
                    Inloggen
                  </Button>
                  <Button as={Link} to="/onboarding?signup=true" variant="primary" size="sm">
                    Stijlscan starten
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Buttons */}
            <div className="flex lg:hidden items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded hover:bg-midnight-800 transition-colors text-card-white"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded text-card-white hover:bg-midnight-800 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed top-16 right-0 bottom-0 z-50 w-72 max-w-[85vw] bg-midnight shadow-xl lg:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <nav className="flex flex-col h-full">
              <div className="flex-1 px-6 py-8 space-y-2">
                {['/', '/onboarding', '/over-ons'].map((path, idx) => {
                  const labels = ['Home', 'Stijlscan', 'Over ons'];
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={closeMenu}
                      className={`block px-6 py-4 rounded text-base font-medium transition-colors ${
                        location.pathname === path ? 'bg-midnight-800 text-card-white' : 'text-card-white/80 hover:bg-midnight-800 hover:text-card-white'
                      }`}
                    >
                      {labels[idx]}
                    </Link>
                  );
                })}
                {user && (
                  <Link
                    to="/dashboard"
                    onClick={closeMenu}
                    className={`block px-6 py-4 rounded text-base font-medium transition-colors ${
                      location.pathname.startsWith('/dashboard') ? 'bg-midnight-800 text-card-white' : 'text-card-white/80 hover:bg-midnight-800 hover:text-card-white'
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
              </div>

              <div className="border-t border-cardWhite/10 p-6">
                {user ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 px-6 py-3 bg-midnight-800/50 rounded">
                      <User size={24} className="text-card-white/70" />
                      <div className="flex-1">
                        <div className="font-medium text-card-white">{user.name || 'Gebruiker'}</div>
                        <div className="text-sm text-card-white/70">{user.email || 'gebruiker@fitfi.app'}</div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      fullWidth
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="text-card-white border border-card-white/30 hover:bg-card-white/10"
                    >
                      Uitloggen
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button as={Link} to="/onboarding" variant="ghost" fullWidth onClick={closeMenu} className="text-card-white border border-card-white/30 hover:bg-card-white/10">
                      Inloggen
                    </Button>
                    <Button as={Link} to="/onboarding?signup=true" variant="primary" fullWidth onClick={closeMenu}>
                      Stijlscan starten
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-16" />
    </>
  );
};

export default Navbar;