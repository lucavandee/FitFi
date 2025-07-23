import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Shield, Mail } from 'lucide-react';
import Logo from '../ui/Logo';

interface HomeFooterProps {
  className?: string;
}

const HomeFooter: React.FC<HomeFooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      label: 'FAQ',
      href: '/faq',
      icon: <HelpCircle size={16} />
    },
    {
      label: 'Privacybeleid',
      href: '/juridisch',
      icon: <Shield size={16} />
    },
    {
      label: 'Contact',
      href: '/contact',
      icon: <Mail size={16} />
    }
  ];

  return (
    <footer className={`bg-gray-900 text-white py-12 ${className}`} role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo & Description */}
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <Logo className="h-8 w-auto mb-4 mx-auto md:mx-0" textColor="text-white" />
            <p className="text-gray-400 max-w-md">
              Nova AI helpt je ontdekken wat jouw stijl over je zegt en hoe je dit kunt gebruiken 
              om jouw doelen te bereiken.
            </p>
          </div>
          
          {/* Links */}
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors group"
              >
                <span className="group-hover:scale-110 transition-transform">
                  {link.icon}
                </span>
                <span className="font-medium">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="mb-4 md:mb-0">
            <p>&copy; {currentYear} FitFi. Alle rechten voorbehouden.</p>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/juridisch" className="hover:text-white transition-colors">
              Algemene voorwaarden
            </Link>
            <Link to="/juridisch" className="hover:text-white transition-colors">
              Privacybeleid
            </Link>
            <Link to="/juridisch" className="hover:text-white transition-colors">
              Cookies
            </Link>
          </div>
        </div>
        
        {/* Nova Branding */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500">
            Powered by Nova AI • Jouw persoonlijke stijlassistent
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;