import React from 'react';
import { Link } from 'react-router-dom';
import { Home, BarChart3, Heart, HelpCircle, Mail, Shield } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
}

interface LandingFooterProps {
  className?: string;
}

const LandingFooter: React.FC<LandingFooterProps> = ({ className = '' }) => {
  const footerLinks: FooterLink[] = [
    {
      label: 'Home',
      href: '/',
      icon: <Home size={16} />
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: <BarChart3 size={16} />
    },
    {
      label: 'Mijn Rapport',
      href: '/dashboard/preferences',
      icon: <BarChart3 size={16} />
    },
    {
      label: 'Wishlist',
      href: '/dashboard/outfits',
      icon: <Heart size={16} />
    },
    {
      label: 'FAQ',
      href: '/faq',
      icon: <HelpCircle size={16} />
    },
    {
      label: 'Contact',
      href: '/contact',
      icon: <Mail size={16} />
    },
    {
      label: 'Privacy',
      href: '/juridisch',
      icon: <Shield size={16} />
    }
  ];

  return (
    <footer className={`bg-white border-t border-gray-100 ${className}`} role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
          {footerLinks.map((link) => (
            <div key={link.href}>
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#bfae9f] transition-colors group"
                >
                  {link.icon && (
                    <span className="group-hover:scale-110 transition-transform">
                      {link.icon}
                    </span>
                  )}
                  <span className="text-sm font-medium">{link.label}</span>
                </a>
              ) : (
                <Link
                  to={link.href}
                  className="flex items-center space-x-2 text-gray-600 hover:text-[#bfae9f] transition-colors group"
                >
                  {link.icon && (
                    <span className="group-hover:scale-110 transition-transform">
                      {link.icon}
                    </span>
                  )}
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#bfae9f] flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="font-medium text-gray-900">Nova by FitFi</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-500">
            <span>© 2025 FitFi. Alle rechten voorbehouden.</span>
            <div className="flex items-center space-x-4">
              <Link to="/juridisch" className="hover:text-[#bfae9f] transition-colors">
                Algemene voorwaarden
              </Link>
              <Link to="/juridisch" className="hover:text-[#bfae9f] transition-colors">
                Privacybeleid
              </Link>
              <Link to="/juridisch" className="hover:text-[#bfae9f] transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>

        {/* Nova Branding */}
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Powered by Nova AI • Jouw persoonlijke stijlassistent
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;