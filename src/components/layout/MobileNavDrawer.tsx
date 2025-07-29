import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { NAV_LINKS } from '../../constants/navigation';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  // Debug logging
  console.log('[MOBILE NAV] Rendering drawer with items:', NAV_LINKS.length);
  
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <aside 
        className="fixed inset-y-0 right-0 z-50 w-[85vw] max-w-xs bg-white dark:bg-gray-900 shadow-lg flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        {/* Header */}
        <header className="px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
          <h2 id="mobile-menu-title" className="text-xl font-semibold text-gray-900 dark:text-white">
            Menu
          </h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Sluit menu"
          >
            <X size={20} />
          </button>
        </header>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  to={href}
                  onClick={onClose}
                  className="block px-6 py-4 text-lg font-medium text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-white/10 transition-colors min-h-[44px] flex items-center"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}