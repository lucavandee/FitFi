import { useState, useEffect } from 'react';
import { Link, useLocation, useInRouterContext } from 'react-router-dom';
import { ReactNode } from 'react';
import { Menu, X, User, LogOut, Settings, Crown } from 'lucide-react';
// ✅ enkel vanuit context/AuthContext
import { useAuth } from '@/context/AuthContext';
import { useGamification } from '@/context/GamificationContext';
import Logo from '@/components/ui/Logo';
import { cn, toArray, joinClasses } from '@/utils/cn';

function SmartLink({ to, href, children, className }: { to?: string; href?: string; children: ReactNode; className?: string; }) {
  const inRouter = useInRouterContext();
  if (to && inRouter) return <Link to={to} className={className}>{children}</Link>;
  return <a href={to || href || "#"} className={className}>{children}</a>;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  // ✅ één destructure, inclusief logout
  const { user, tier, logout } = useAuth();
  const { userStats } = useGamification();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Stijltest', href: '/onboarding' },
    { name: 'Tribes', href: '/tribes' },
    { name: 'Blog', href: '/blog' },
    { name: 'Pricing', href: '/pricing' },
  ];

  const userNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: User },
    { name: 'Profiel', href: '/profile', icon: Settings },
    { name: 'Uitloggen', href: '#', icon: LogOut, onClick: logout },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <SmartLink to="/" className="flex items-center">
              <Logo className="h-8 w-auto" />
            </SmartLink>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {toArray(navigation).map((item) => (
              <SmartLink
                key={item.name}
                to={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors duration-200",
                  isActivePath(item.href)
                    ? "text-primary-600 border-b-2 border-primary-600"
                    : "text-gray-700 hover:text-primary-600"
                )}
              >
                {item.name}
              </SmartLink>
            ))}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative group">
                <button className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg",
                  "text-sm font-medium text-gray-700 hover:bg-gray-100",
                  "transition-colors duration-200"
                )}>
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="hidden lg:block">
                    {user.email?.split('@')[0]}
                  </span>
                  {userStats?.level && (
                    <div className="flex items-center space-x-1">
                      <Crown className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs text-gray-500">
                        Lvl {userStats.level}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                <div className={cn(
                  "absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg",
                  "border border-gray-200 py-1 opacity-0 invisible",
                  "group-hover:opacity-100 group-hover:visible",
                  "transition-all duration-200 transform group-hover:translate-y-0 translate-y-1"
                )}>
                  {toArray(userNavigation).map((item) => (
                    <SmartLink
                      key={item.name}
                      to={item.href}
                      onClick={item.onClick}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm text-gray-700",
                        "hover:bg-gray-50 transition-colors duration-150"
                      )}
                    >
                      <item.icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </SmartLink>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <SmartLink
                  to="/login"
                  className={cn(
                    "px-4 py-2 text-sm font-medium text-gray-700",
                    "hover:text-primary-600 transition-colors duration-200"
                  )}
                >
                  Inloggen
                </SmartLink>
                <SmartLink
                  to="/register"
                  className={cn(
                    "px-4 py-2 text-sm font-medium text-white",
                    "bg-primary-600 hover:bg-primary-700 rounded-lg",
                    "transition-colors duration-200"
                  )}
                >
                  Registreren
                </SmartLink>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "p-2 rounded-lg text-gray-700 hover:bg-gray-100",
                "transition-colors duration-200"
              )}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={cn(
            "md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md",
            "absolute left-0 right-0 top-16 shadow-lg"
          )}>
            <div className="px-4 py-4 space-y-2">
              {toArray(navigation).map((item) => (
                <SmartLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 text-base font-medium rounded-lg",
                    "transition-colors duration-200",
                    isActivePath(item.href)
                      ? "text-primary-600 bg-primary-50"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {item.name}
                </SmartLink>
              ))}

              {/* Mobile User Menu */}
              {user ? (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  {toArray(userNavigation).map((item) => (
                    <SmartLink
                      key={item.name}
                      to={item.href}
                      onClick={(e) => {
                        if (item.onClick) {
                          e.preventDefault();
                          item.onClick();
                        }
                        setIsMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center px-3 py-2 text-base font-medium",
                        "text-gray-700 hover:bg-gray-50 rounded-lg",
                        "transition-colors duration-200"
                      )}
                    >
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </SmartLink>
                  ))}
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <SmartLink
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 text-base font-medium text-gray-700",
                      "hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    )}
                  >
                    Inloggen
                  </SmartLink>
                  <SmartLink
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2 text-base font-medium text-white",
                      "bg-primary-600 hover:bg-primary-700 rounded-lg",
                      "transition-colors duration-200"
                    )}
                  >
                    Registreren
                  </SmartLink>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}