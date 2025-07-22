import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-midnight text-white py-12 border-t border-white/5">
      <div className="container-slim">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Logo className="h-6 w-auto mb-4 text-white" />
            <p className="text-sm text-white/80 max-w-xs">
              FitFi helpt je er op je best uit te zien met gepersonaliseerd stijladvies, aangedreven door AI.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-16">
            <div>
              <h3 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-6">
                Links
              </h3>
              <ul className="space-y-4 text-sm">
                <li>
                  <Link to="/over-ons" className="text-white/80 hover:text-turquoise transition-colors">
                    Over ons
                  </Link>
                </li>
                <li>
                  <Link to="/juridisch" className="text-white/80 hover:text-turquoise transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-white/80 hover:text-turquoise transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-white/10 text-center">
          <p className="text-sm text-white/60">
            &copy; {currentYear} FitFi. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;