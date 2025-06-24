import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import Logo from '../ui/Logo';

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  isExternal?: boolean;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, children, isExternal = false }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (isExternal) {
    return (
      <a 
        href={href} 
        className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link 
      to={href} 
      className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
      onClick={scrollToTop}
    >
      {children}
    </Link>
  );
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Social Links */}
          <div className="col-span-1 md:col-span-1">
            <Logo className="h-10 w-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              FitFi helpt je er op je best uit te zien met gepersonaliseerd kleding- en lifestyle-advies, aangedreven door AI.
            </p>
            <div className="flex space-x-4">
              <FooterLink href="https://instagram.com/fitfi.ai" isExternal>
                <Instagram size={20} className="text-gray-500 hover:text-orange-500 transition-colors" />
                <span className="sr-only">Instagram</span>
              </FooterLink>
              <FooterLink href="https://twitter.com/fitfi_ai" isExternal>
                <Twitter size={20} className="text-gray-500 hover:text-orange-500 transition-colors" />
                <span className="sr-only">Twitter</span>
              </FooterLink>
              <FooterLink href="https://facebook.com/fitfi.ai" isExternal>
                <Facebook size={20} className="text-gray-500 hover:text-orange-500 transition-colors" />
                <span className="sr-only">Facebook</span>
              </FooterLink>
              <FooterLink href="https://linkedin.com/company/fitfi-ai" isExternal>
                <Linkedin size={20} className="text-gray-500 hover:text-orange-500 transition-colors" />
                <span className="sr-only">LinkedIn</span>
              </FooterLink>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-4">
              Product
            </h3>
            <nav aria-label="Product navigation">
              <ul className="space-y-3">
                <li>
                  <FooterLink href="/hoe-het-werkt">
                    Hoe het werkt
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/prijzen">
                    Prijzen
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/succesverhalen">
                    Succesverhalen
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/blog">
                    Mode blog
                  </FooterLink>
                </li>
              </ul>
            </nav>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-4">
              Ondersteuning
            </h3>
            <nav aria-label="Support navigation">
              <ul className="space-y-3">
                <li>
                  <FooterLink href="/helpcentrum">
                    Helpcentrum
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/contact">
                    Contact
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/faq">
                    Veelgestelde vragen
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/feedback">
                    Feedback
                  </FooterLink>
                </li>
              </ul>
            </nav>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-4">
              Juridisch
            </h3>
            <nav aria-label="Legal navigation">
              <ul className="space-y-3">
                <li>
                  <FooterLink href="/juridisch">
                    Privacybeleid
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/juridisch">
                    Algemene voorwaarden
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/juridisch">
                    Cookiebeleid
                  </FooterLink>
                </li>
                <li>
                  <FooterLink href="/juridisch">
                    AVG Compliance
                  </FooterLink>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            &copy; {currentYear} FitFi. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;