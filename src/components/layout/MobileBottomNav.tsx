import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  authRequired?: boolean;
}

const navItems: NavItem[] = [
  {
    icon: Home,
    label: 'Home',
    path: '/',
  },
  {
    icon: Search,
    label: 'Quiz',
    path: '/onboarding',
  },
  {
    icon: Heart,
    label: 'Dashboard',
    path: '/dashboard',
    authRequired: true,
  },
  {
    icon: User,
    label: 'Profiel',
    path: '/profile',
    authRequired: true,
  },
];

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useUser();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Hide on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Hide on specific pages where it would interfere
  const hideOnPaths = ['/inloggen', '/registreren', '/onboarding'];
  if (hideOnPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  const visibleItems = navItems.filter(item => {
    if (item.authRequired && !user) {
      return false;
    }
    return true;
  });

  // Haptic feedback on supported devices
  const handleVibrate = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div className="h-20 md:hidden" />

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        {/* Backdrop blur container */}
        <div className="bg-[var(--color-surface)]/95 backdrop-blur-lg border-t border-[var(--color-border)] shadow-2xl">
          <div className="max-w-screen-sm mx-auto px-2 py-2">
            <div className="flex items-center justify-around">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={handleVibrate}
                    className="flex flex-col items-center justify-center min-w-[64px] py-2 px-3 rounded-xl transition-all duration-200 group relative"
                  >
                    {({ isActive: active }) => {
                      const activeState = active || isActive;
                      return (
                        <>
                          {/* Active indicator */}
                          {activeState && (
                            <motion.div
                              layoutId="bottomNavIndicator"
                              className="absolute inset-0 bg-[var(--ff-color-primary-50)] rounded-xl"
                              initial={false}
                              transition={{
                                type: 'spring',
                                stiffness: 380,
                                damping: 30,
                              }}
                            />
                          )}

                          {/* Icon */}
                          <div className="relative z-10">
                            <Icon
                              className={`w-6 h-6 transition-colors ${
                                activeState
                                  ? 'text-[var(--ff-color-primary-700)]'
                                  : 'text-[var(--color-text)]/60 group-hover:text-[var(--color-text)]'
                              }`}
                              strokeWidth={activeState ? 2.5 : 2}
                            />
                          </div>

                          {/* Label */}
                          <span
                            className={`relative z-10 text-xs font-medium mt-1 transition-colors ${
                              activeState
                                ? 'text-[var(--ff-color-primary-700)]'
                                : 'text-[var(--color-text)]/60 group-hover:text-[var(--color-text)]'
                            }`}
                          >
                            {item.label}
                          </span>
                        </>
                      );
                    }}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default MobileBottomNav;
