import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserCircle, Menu, X, Sun, Moon } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../ui/Logo';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0" onClick={closeMenu}>
              <Logo className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-orange-500 ${isActive('/') ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Home
            </Link>
            <Link
              to="/onboarding"
              className={`text-sm font-medium transition-colors hover:text-orange-500 ${isActive('/onboarding') ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}
            >
              Get Started
            </Link>
            <Link
              to="#"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-orange-500"
            >
              How It Works
            </Link>
            <Link
              to="#"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-orange-500"
            >
              Pricing
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/dashboard" className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors">
                  <UserCircle size={24} />
                  <span className="font-medium">{user.name.split(' ')[0]}</span>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => logout()}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="space-x-3">
                <Button 
                  as={Link} 
                  to="/onboarding" 
                  variant="outline"
                  size="sm"
                >
                  Log In
                </Button>
                <Button 
                  as={Link} 
                  to="/onboarding?signup=true" 
                  variant="primary"
                  size="sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/') ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-500'}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/onboarding"
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive('/onboarding') ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300 hover:text-orange-500'}`}
              onClick={closeMenu}
            >
              Get Started
            </Link>
            <Link
              to="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
              onClick={closeMenu}
            >
              How It Works
            </Link>
            <Link
              to="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
              onClick={closeMenu}
            >
              Pricing
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between px-5">
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 px-3">
                  <Button 
                    as={Link}
                    to="/onboarding" 
                    variant="outline" 
                    fullWidth
                    onClick={closeMenu}
                  >
                    Log In
                  </Button>
                  <Button 
                    as={Link}
                    to="/onboarding?signup=true" 
                    variant="primary" 
                    fullWidth
                    onClick={closeMenu}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;