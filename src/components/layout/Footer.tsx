import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Linkedin } from 'lucide-react';
import Logo from '../ui/Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Logo className="h-10 w-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              FitFi helpt je er op je best uit te zien met gepersonaliseerd kleding- en lifestyle-advies, aangedreven door AI.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
                <Linkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Hoe het werkt
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Prijzen
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Succesverhalen
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Mode blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-4">
              Ondersteuning
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Helpcentrum
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Veelgestelde vragen
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-4">
              Juridisch
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Privacybeleid
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Algemene voorwaarden
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  Cookiebeleid
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors text-sm">
                  AVG Compliance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            &copy; {new Date().getFullYear()} FitFi. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;