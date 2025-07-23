import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings, Moon, Sun } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../ui/Button';
import Logo from '../ui/Logo';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Over ons', href: '/over-ons' },
    { name: 'Hoe het werkt', href: '/hoe-het-werkt' },
    { name: 'Prijzen', href: '/prijzen' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ];

  const isActivePage = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-primary border-b border-primary-light">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                    isActivePage(item.href)
                      ? 'text-secondary'
                      : 'text-body hover:text-secondary'
                  }`}
                >
                  {item.name}
                  {isActivePage(item.href) && (
                    <div className="absolute -bottom-1 left-0 w-full h-1.5 bg-secondary rounded" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded hover:bg-primary-light transition-colors text-body"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-body hover:text-secondary transition-colors"
                >
                  <User size={16} />
                  <span>{user.name}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut size={16} />}
                  iconPosition="left"
                  className="text-body border border-primary-light hover:bg-primary-light hover:text-secondary"
                >
                  Uitloggen
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button
                  as={Link}
                  to="/login"
                  variant="ghost"
                  size="sm"
                  className="text-body border border-primary-light hover:bg-primary-light hover:text-secondary"
                >
                  Inloggen
                </Button>
                <Button
                  as={Link}
                  to="/onboarding"
                  variant="primary"
                  size="sm"
                  className="bg-secondary text-primary hover:bg-secondary/90"
                >
                  Start Quiz
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-body hover:text-secondary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-light">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActivePage(item.href)
                    ? 'text-secondary bg-primary'
                    : 'text-body hover:text-secondary hover:bg-primary'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-primary pt-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-body hover:text-secondary hover:bg-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={16} />
                    <span>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-body hover:text-secondary hover:bg-primary transition-colors w-full text-left"
                  >
                    <LogOut size={16} />
                    <span>Uitloggen</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-body hover:text-secondary hover:bg-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inloggen
                  </Link>
                  <Link
                    to="/onboarding"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-secondary text-primary hover:bg-secondary/90 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Start Quiz
                  </Link>
                </div>
              )}
              
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-body hover:text-secondary hover:bg-primary transition-colors w-full text-left mt-2"
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;