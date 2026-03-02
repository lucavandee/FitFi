import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Sparkles, LayoutDashboard, User, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  authRequired?: boolean;
  guestOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    icon: Home,
    label: 'Home',
    path: '/',
  },
  {
    icon: Sparkles,
    label: 'Quiz',
    path: '/onboarding',
  },
  {
    icon: Tag,
    label: 'Prijzen',
    path: '/prijzen',
    guestOnly: true,
  },
  {
    icon: LayoutDashboard,
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
    if (item.authRequired && !user) return false;
    if (item.guestOnly && user) return false;
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
      <div className="h-[58px] md:hidden" aria-hidden="true" />

      {/* Mobile Bottom Navigation */}
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        {/* Backdrop blur container */}
        <div
          className="bg-[var(--color-surface)]/96 backdrop-blur-xl border-t border-[var(--color-border)]"
          style={{ boxShadow: "0 -4px 24px rgba(30,35,51,0.08)" }}
        >
          {/* safe area spacer for notched phones */}
          <div className="max-w-screen-sm mx-auto px-1" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <div className="flex items-stretch justify-around h-[58px]">
              {visibleItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={handleVibrate}
                    className="flex flex-col items-center justify-center flex-1 rounded-xl transition-all duration-150 group relative"
                  >
                    {({ isActive: active }) => (
                      <>
                        {active && (
                          <motion.div
                            layoutId="bottomNavIndicator"
                            className="absolute inset-1 rounded-xl"
                            style={{ backgroundColor: "var(--ff-color-primary-50)" }}
                            initial={false}
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}

                        <div className="relative z-10 flex flex-col items-center gap-[3px]">
                          <Icon
                            className={`w-[22px] h-[22px] transition-colors ${
                              active
                                ? 'text-[var(--ff-color-primary-700)]'
                                : 'text-[var(--color-text)]/50 group-hover:text-[var(--color-text)]/80'
                            }`}
                            strokeWidth={active ? 2.5 : 1.8}
                          />
                          <span
                            className={`text-[10px] font-semibold leading-none transition-colors ${
                              active
                                ? 'text-[var(--ff-color-primary-700)]'
                                : 'text-[var(--color-text)]/50 group-hover:text-[var(--color-text)]/80'
                            }`}
                          >
                            {item.label}
                          </span>
                        </div>
                      </>
                    )}
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
