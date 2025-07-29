import React, { Fragment, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { X, Home, Info, HelpCircle, DollarSign, ShoppingBag, BookOpen, LogIn, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '../../constants/nav';
import { useUser } from '../../context/UserContext';

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ open, onClose }) => {
  const { user, logout } = useUser();
  const location = useLocation();

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('mobile-menu-open');
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('mobile-menu-open');
    };
  }, [open]);

  // ESC key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  const handleNavClick = (href: string) => {
    // Close drawer - ScrollToTop component handles the scrolling
    onClose();
    
    // Track analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'mobile_nav_click', {
        event_category: 'navigation',
        event_label: href,
        page_location: window.location.href
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  // Filter navigation items based on auth state
  const getNavigationItems = () => {
    if (user) {
      return NAV_ITEMS.filter(item => item.href !== '/inloggen').concat([
        { href: '/dashboard', label: 'Dashboard', icon: User }
      ]);
    } else {
      return NAV_ITEMS.filter(item => !item.href.includes('/dashboard'));
    }
  };

  const navigationItems = getNavigationItems();

  const containerVariants = {
    hidden: { x: '100%', opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.24,
        ease: "easeOut",
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    },
    exit: { 
      x: '100%', 
      opacity: 0,
      transition: {
        duration: 0.24,
        ease: "easeIn"
      }
    }
  };

  const itemVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog 
        onClose={onClose} 
        className="fixed inset-0 z-50 md:hidden"
        aria-labelledby="mobile-menu-title"
        aria-modal="true"
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-240 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-240 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="absolute inset-0 bg-navy/80 backdrop-blur-md" 
            onClick={onClose}
            aria-hidden="true"
          />
        </Transition.Child>

        {/* Drawer Panel */}
        <Transition.Child
          as={Fragment}
          enter="transition-transform duration-240 ease-out"
          enterFrom="translate-x-full opacity-0"
          enterTo="translate-x-0 opacity-100"
          leave="transition-transform duration-240 ease-in"
          leaveFrom="translate-x-0 opacity-100"
          leaveTo="translate-x-full opacity-0"
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 z-50 w-[80vw] max-w-[320px] bg-white dark:bg-[#14172B] rounded-l-2xl shadow-menu flex flex-col"
          >
            {/* Header */}
            <header className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/10">
              <Dialog.Title 
                id="mobile-menu-title"
                className="text-xl font-bold text-brandPurple dark:text-white"
              >
                Menu
              </Dialog.Title>
              <button
                onClick={onClose}
                aria-label="Sluit menu"
                className="w-8 h-8 flex items-center justify-center rounded-full text-brandPurple hover:bg-brandPurpleLight dark:text-white dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brandPurple focus:ring-offset-2"
              >
                <X size={20} />
              </button>
            </header>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto" role="navigation">
              <motion.ul 
                className="py-2"
                role="list"
                variants={containerVariants}
              >
                {navigationItems.map(({ href, label, icon: IconComponent }, index) => {
                  const isActive = isActiveLink(href);
                  
                  return (
                    <motion.li 
                      key={href} 
                      className="group relative"
                      variants={itemVariants}
                    >
                      {/* Active Route Indicator */}
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brandPurple" />
                      )}
                      
                      <Link
                        to={href}
                        onClick={() => handleNavClick(href)}
                        className={`flex items-center gap-4 px-6 py-4 min-h-[44px] text-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brandPurple focus:ring-inset ${
                          isActive 
                            ? 'bg-brandPurpleLight dark:bg-white/5 text-brandPurple dark:text-white font-semibold' 
                            : 'text-navy dark:text-white hover:bg-brandPurpleLight dark:hover:bg-white/5'
                        }`}
                        role="menuitem"
                      >
                        <IconComponent 
                          className={`h-5 w-5 transition-all duration-200 group-hover:scale-105 ${
                            isActive 
                              ? 'text-brandPurple dark:text-white' 
                              : 'text-brandPurple opacity-70 group-hover:opacity-100'
                          }`} 
                        />
                        <span className="flex-1">{label}</span>
                      </Link>
                      
                      {/* Divider */}
                      {index < navigationItems.length - 1 && (
                        <div className="border-b border-black/5 dark:border-white/10 mx-6" />
                      )}
                    </motion.li>
                  );
                })}
              </motion.ul>
            </nav>

            {/* Auth Section */}
            {user && (
              <div className="px-6 pb-6 border-t border-black/5 dark:border-white/10">
                <div className="pt-4">
                  <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-brandPurpleLight dark:bg-white/5">
                    <div className="w-10 h-10 rounded-full bg-brandPurple flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-navy dark:text-white">{user.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 min-h-[44px] text-left font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Uitloggen
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default MobileNavDrawer;