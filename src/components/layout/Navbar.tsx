import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserCircle, Menu, X, Sun, Moon, Zap, Crown } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { useTheme } from '../../context/ThemeContext';
import { useGamification } from '../../context/GamificationContext';
import Logo from '../ui/Logo';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useUser();
  const { theme, toggleTheme } = useTheme();
  
  // Safely use gamification context with error handling
  let gamificationData = {
    points: 0,
    currentLevelInfo: null,
    getProgressToNextLevel: () => 0,
    nextLevelInfo: null,
    streak: 0,
    checkIn: async () => {},
    isLoading: false
  };

  try {
    const gamification = useGamification();
    gamificationData = {
      points: gamification.points,
      currentLevelInfo: gamification.currentLevelInfo,
      getProgressToNextLevel: gamification.getProgressToNextLevel,
      nextLevelInfo: gamification.nextLevelInfo,
      streak: gamification.streak,
      checkIn: gamification.checkIn,
      isLoading: gamification.isLoading
    };
  } catch (error) {
    console.warn('Gamification context not available:', error);
  }

  const { 
    points, 
    currentLevelInfo, 
    getProgressToNextLevel, 
    nextLevelInfo,
    streak,
    checkIn,
    isLoading: gamificationLoading
  } = gamificationData;

  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => location.pathname === path;

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    closeMenu();
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleDailyCheckIn = async () => {
    try {
      await checkIn();
      
      // Track check-in from navbar
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'daily_check_in_navbar', {
          event_category: 'gamification',
          event_label: 'navbar_check_in'
        });
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const canCheckInToday = () => {
    const today = new Date().toDateString();
    // This would normally check against the last check-in date from context
    // For now, we'll show the button if streak is 0 or it's a new day
    return true; // Simplified for demo
  };

  return (
    <>
      <header 
        className={`
          fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${isScrolled 
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-800/50' 
            : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm'
          }
        `}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0" onClick={closeMenu}>
                <Logo className="h-10 w-auto" />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className={`
                  text-sm font-medium transition-colors hover:text-orange-500 relative
                  ${isActive('/') ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}
                `}
              >
                Home
                {isActive('/') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 rounded-full"></span>
                )}
              </Link>
              <Link
                to="/onboarding"
                className={`
                  text-sm font-medium transition-colors hover:text-orange-500 relative
                  ${isActive('/onboarding') ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}
                `}
              >
                Aan de slag
                {isActive('/onboarding') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 rounded-full"></span>
                )}
              </Link>
              <Link
                to="#how-it-works"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-orange-500"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById('how-it-works');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Hoe het werkt
              </Link>
              <Link
                to="#pricing"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:text-orange-500"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector('[id*="pricing"]');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Prijzen
              </Link>
              <Link
                to="/over-ons"
                className={`
                  text-sm font-medium transition-colors hover:text-orange-500 relative
                  ${isActive('/over-ons') ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}
                `}
              >
                Over ons
                {isActive('/over-ons') && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-orange-500 rounded-full"></span>
                )}
              </Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Gamification Display */}
              {user && !gamificationLoading && currentLevelInfo && (
                <div className="flex items-center space-x-3">
                  {/* Points and Level */}
                  <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 px-3 py-1 rounded-full">
                    <div className="text-lg">{currentLevelInfo?.icon || '🌱'}</div>
                    <div className="text-sm">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {points.toLocaleString()} pts
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {currentLevelInfo?.name || 'Beginner'}
                      </div>
                    </div>
                  </div>

                  {/* Progress to next level */}
                  {nextLevelInfo && (
                    <div className="w-16">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {Math.round(getProgressToNextLevel())}%
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-orange-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${getProgressToNextLevel()}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Daily Check-in Button */}
                  {canCheckInToday() && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDailyCheckIn}
                      icon={<Zap size={14} />}
                      iconPosition="left"
                      className="text-xs whitespace-nowrap border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
                    >
                      Check in
                    </Button>
                  )}

                  {/* Streak indicator */}
                  {streak > 0 && (
                    <div className="flex items-center space-x-1 text-orange-500">
                      <span className="text-sm">🔥</span>
                      <span className="text-xs font-bold">{streak}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={theme === 'dark' ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/dashboard" 
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
                  >
                    <UserCircle size={24} />
                    <span className="font-medium">{user.name.split(' ')[0]}</span>
                    {user.isPremium && (
                      <Crown className="text-yellow-500" size={16} />
                    )}
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => logout()}
                  >
                    Uitloggen
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
                    Inloggen
                  </Button>
                  <Button 
                    as={Link} 
                    to="/onboarding?signup=true" 
                    variant="primary"
                    size="sm"
                  >
                    Aanmelden
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button and theme toggle */}
            <div className="flex lg:hidden items-center space-x-2">
              {/* Mobile gamification display */}
              {user && !gamificationLoading && currentLevelInfo && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 px-2 py-1 rounded-full">
                  <div className="text-sm">{currentLevelInfo?.icon || '🌱'}</div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white">
                    {points.toLocaleString()}
                  </div>
                  {streak > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">🔥</span>
                      <span className="text-xs font-bold text-orange-500">{streak}</span>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={theme === 'dark' ? 'Schakel naar lichte modus' : 'Schakel naar donkere modus'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Mobile menu */}
      <div 
        className={`
          fixed top-16 right-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out lg:hidden
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Gamification section for mobile */}
          {user && !gamificationLoading && currentLevelInfo && (
            <div className="p-6 border-b dark:border-gray-700 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">{currentLevelInfo?.icon || '🌱'}</div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">
                      {points.toLocaleString()} punten
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {currentLevelInfo?.name || 'Beginner'} niveau
                    </div>
                  </div>
                </div>
                {streak > 0 && (
                  <div className="flex items-center space-x-1 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                    <span className="text-sm">🔥</span>
                    <span className="text-sm font-bold text-orange-500">{streak} dagen streak</span>
                  </div>
                )}
              </div>
              
              {nextLevelInfo && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Voortgang naar {nextLevelInfo.name}</span>
                    <span>{Math.round(getProgressToNextLevel())}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressToNextLevel()}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {canCheckInToday() && (
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={handleDailyCheckIn}
                  icon={<Zap size={14} />}
                  iconPosition="left"
                  className="bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Dagelijkse check-in (+10 pts)
                </Button>
              )}
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 px-6 py-6 space-y-1">
            <Link
              to="/"
              className={`
                block px-4 py-3 rounded-lg text-base font-medium transition-colors
                ${isActive('/') 
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500'}
              `}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/onboarding"
              className={`
                block px-4 py-3 rounded-lg text-base font-medium transition-colors
                ${isActive('/onboarding') 
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500'}
              `}
              onClick={closeMenu}
            >
              Aan de slag
            </Link>
            <button
              className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors"
              onClick={(e) => {
                const element = document.getElementById('how-it-works');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
                closeMenu();
              }}
            >
              Hoe het werkt
            </button>
            <button
              className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500 transition-colors"
              onClick={(e) => {
                const element = document.querySelector('[id*="pricing"]');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
                closeMenu();
              }}
            >
              Prijzen
            </button>
            <Link
              to="/over-ons"
              className={`
                block px-4 py-3 rounded-lg text-base font-medium transition-colors
                ${isActive('/over-ons') 
                  ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500'}
              `}
              onClick={closeMenu}
            >
              Over ons
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className={`
                  block px-4 py-3 rounded-lg text-base font-medium transition-colors
                  ${location.pathname.startsWith('/dashboard') 
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-500'}
                `}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="border-t dark:border-gray-800 p-6">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <UserCircle size={24} className="text-gray-400" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                      <span>{user.name}</span>
                      {user.isPremium && (
                        <Crown className="text-yellow-500" size={16} />
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                >
                  Uitloggen
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Button 
                  as={Link}
                  to="/onboarding" 
                  variant="outline" 
                  fullWidth
                  onClick={closeMenu}
                >
                  Inloggen
                </Button>
                <Button 
                  as={Link}
                  to="/onboarding?signup=true" 
                  variant="primary" 
                  fullWidth
                  onClick={closeMenu}
                >
                  Aanmelden
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;