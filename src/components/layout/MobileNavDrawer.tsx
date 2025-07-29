import React, { Fragment, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
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

  const handleNavClick = async (href: string) => {
    // Close drawer first
    onClose();
    
    // Scroll to top with smooth behavior
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        { href: '/dashboard', label: 'Dashboard', icon: NAV_ITEMS.find(item => item.href === '/dashboard')?.icon || NAV_ITEMS[0].icon }
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
            className="absolute inset-y-0 right-0 w-[80vw] max-w-[320px] bg-white dark:bg-navy flex flex-col shadow-menu rounded-l-2xl"
          >
            {/* Header with Brand Gradient */}
            <header className="flex items-center justify-between p-6 bg-gradient-to-r from-brandPurple to-brandPink text-white rounded-tl-2xl">
              <Dialog.Title 
                id="mobile-menu-title"
                className="text-xl font-bold"
              >
                Menu
              </Dialog.Title>
              <button
                onClick={onClose}
                aria-label="Sluit menu"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brandPurple"
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
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-brandPurple to-brandPink" />
                      )}
                      
                      <Link
                        to={href}
                        onClick={() => handleNavClick(href)}
                        className={`flex items-center gap-4 px-6 py-4 min-h-[44px] text-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brandPurple focus:ring-inset ${
                          isActive 
                            ? 'bg-brandPurple/10 dark:bg-brandPink/10 text-brandPurple dark:text-brandPink font-semibold' 
                            : 'text-navy dark:text-white hover:bg-brandPurple/5 dark:hover:bg-white/5 hover:text-brandPurple dark:hover:text-brandPink'
                        }`}
                        role="menuitem"
                      >
                        <IconComponent 
                          className={`h-5 w-5 transition-all duration-200 group-hover:scale-110 ${
                            isActive 
                              ? 'text-brandPurple dark:text-brandPink' 
                              : 'text-brandPurple group-hover:text-brandPink'
                          }`} 
                        />
                        <span className="flex-1">{label}</span>
                        
                        {/* Hover Indicator */}
                        <span className={`h-2 w-2 rounded-full bg-gradient-to-r from-brandPurple to-brandPink transition-opacity duration-200 ${
                          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`} />
                      </Link>
                      
                      {/* Divider */}
                      {index < navigationItems.length - 1 && (
                        <div className="h-[1px] bg-black/5 dark:bg-white/10 mx-6" />
                      )}
                    </motion.li>
                  );
                })}
              </motion.ul>
            </nav>

            {/* Auth Section */}
            {user && (
              <div className="px-6 pb-6 border-t border-slate-100 dark:border-white/10">
                <div className="pt-4">
                  <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-gradient-to-r from-brandPurple/5 to-brandPink/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-brandPurple to-brandPink flex items-center justify-center">
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