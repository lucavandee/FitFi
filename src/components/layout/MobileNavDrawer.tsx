import React, { Fragment, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { NAV_ITEMS } from '../../constants/nav';
import { useUser } from '../../context/UserContext';

interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
}

const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({ open, onClose }) => {
  const { user, logout } = useUser();

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
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
    
    // Scroll to top
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

  // Filter navigation items based on auth state
  const getNavigationItems = () => {
    if (user) {
      return NAV_ITEMS.filter(item => item.href !== '/inloggen').concat([
        { href: '/dashboard', label: 'Dashboard' }
      ]);
    } else {
      return NAV_ITEMS.filter(item => !item.href.includes('/dashboard'));
    }
  };

  const navigationItems = getNavigationItems();

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
          enter="transition-opacity duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div 
            className="absolute inset-0 bg-navy/80 backdrop-blur-sm" 
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
          <Dialog.Panel className="absolute inset-y-0 right-0 w-[85vw] max-w-xs bg-white dark:bg-navy flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.06)] dark:shadow-[0_0_40px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/10">
              <Dialog.Title 
                id="mobile-menu-title"
                className="text-xl font-bold text-navy dark:text-white"
              >
                Menu
              </Dialog.Title>
              <button
                onClick={onClose}
                aria-label="Sluit menu"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brandPurple/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-brandPurple focus:ring-offset-2"
              >
                <X size={20} className="text-navy dark:text-white" />
              </button>
            </header>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto" role="navigation">
              <ul className="divide-y divide-slate-100 dark:divide-white/10" role="list">
                {navigationItems.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      to={href}
                      onClick={() => handleNavClick(href)}
                      className="flex items-center px-6 py-4 min-h-[44px] text-lg font-medium text-navy dark:text-white hover:bg-brandPurple/10 dark:hover:bg-white/10 hover:text-brandPurple dark:hover:text-brandPink transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brandPurple focus:ring-inset"
                      role="menuitem"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Auth Section */}
            {user && (
              <div className="px-6 pb-6 border-t border-slate-100 dark:border-white/10">
                <div className="pt-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-brandPurple/20 flex items-center justify-center">
                      <span className="text-brandPurple font-medium text-sm">
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
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default MobileNavDrawer;