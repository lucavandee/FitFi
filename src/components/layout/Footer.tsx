import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Twitter, Linkedin, Youtube } from 'lucide-react';
import Logo from '../ui/Logo';

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections: FooterSection[] = [
    {
      title: 'Navigatie',
      links: [
        { label: 'Home', href: '/' },
        { label: 'Waarom FitFi', href: '/over-ons' },
        { label: 'Hoe het werkt', href: '/hoe-het-werkt' },
        { label: 'Prijzen', href: '/prijzen' },
        { label: 'Blog', href: '/blog' },
        { label: 'Contact', href: '/contact' }
      ]
    },
    {
      title: 'Juridisch',
      links: [
        { label: 'Privacybeleid', href: '/privacy-policy' },
        { label: 'Algemene voorwaarden', href: '/algemene-voorwaarden' },
        { label: 'Cookiebeleid', href: '/juridisch' },
        { label: 'Veelgestelde vragen', href: '/veelgestelde-vragen' },
        { label: 'Ondersteuning', href: '/ondersteuning' }
      ]
    },
    {
      title: 'Account',
      links: [
        { label: 'Inloggen', href: '/inloggen' },
        { label: 'Registreren', href: '/registreren' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Profiel', href: '/profile' }
      ]
    }
  ];

  const socialLinks = [
    { 
      label: 'Instagram', 
      href: 'https://instagram.com/fitfi', 
      icon: <Instagram size={20} />,
      external: true 
    },
    { 
      label: 'Twitter', 
      href: 'https://twitter.com/fitfi', 
      icon: <Twitter size={20} />,
      external: true 
    },
    { 
      label: 'LinkedIn', 
      href: 'https://linkedin.com/company/fitfi', 
      icon: <Linkedin size={20} />,
      external: true 
    },
    { 
      label: 'YouTube', 
      href: 'https://youtube.com/@fitfi', 
      icon: <Youtube size={20} />,
      external: true 
    }
  ];

  return (
    <footer className="bg-[#0D1B2A] text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Logo className="h-8 w-auto mb-4" textColor="text-white" />
            <p className="text-gray-300 mb-6 leading-relaxed">
              FitFi helpt je ontdekken wat jouw stijl over je zegt en hoe je dit kunt gebruiken 
              om jouw doelen te bereiken.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-300">
                <Mail size={16} />
                <a 
                  href="mailto:info@fitfi.nl" 
                  className="hover:text-[#89CFF0] transition-colors"
                >
                  info@fitfi.nl
                </a>
              </div>
              <div className="flex items-center space-x-3 text-gray-300">
                <Phone size={16} />
                <a 
                  href="tel:+31201234567" 
                  className="hover:text-[#89CFF0] transition-colors"
                >
                  +31 20 123 4567
                </a>
              </div>
              <div className="flex items-start space-x-3 text-gray-300">
                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                <span>
                  Herengracht 123<br />
                  1015 BG Amsterdam<br />
                  Nederland
                </span>
              </div>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-medium text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-[#89CFF0] transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-[#89CFF0] transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Bottom Section */}
        <div className="pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Social Links */}
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <span className="text-gray-300 text-sm font-medium">Volg ons:</span>
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-[#89CFF0] transition-colors"
                  aria-label={`Volg ons op ${social.label}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-sm">
                © {currentYear} FitFi. Alle rechten voorbehouden.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Powered by Nova AI • Jouw persoonlijke stijlassistent
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-medium text-white mb-2">
              Blijf op de hoogte
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Ontvang de nieuwste styling tips en trends direct in je inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Je e-mailadres"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
                aria-label="E-mailadres voor nieuwsbrief"
              />
              <button className="px-6 py-2 bg-[#89CFF0] text-[#0D1B2A] rounded-lg font-medium hover:bg-[#89CFF0]/90 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:ring-offset-2 focus:ring-offset-[#0D1B2A] transition-colors">
                Aanmelden
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;