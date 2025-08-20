import { FOOTER_COLUMNS, FOOTER_CTA, SOCIALS, BRAND } from '@/constants/footer';
import { openCookieSettings } from '@/utils/cookies';
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2, Instagram, Linkedin, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import FooterGuard from '@/components/layout/FooterGuard';

const year = new Date().getFullYear();

function ContactBlock() {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3 text-gray-300">
        <Mail size={16} />
        <a 
          href={`mailto:${BRAND.email}`} 
          className="hover:text-[#89CFF0] transition-colors"
        >
          {BRAND.email}
        </a>
      </div>
      <div className="flex items-center space-x-3 text-gray-300">
        <Phone size={16} />
        <a 
          href={`tel:${BRAND.phone.replace(/\s+/g,'')}`} 
          className="hover:text-[#89CFF0] transition-colors"
        >
          {BRAND.phone}
        </a>
      </div>
      <div className="flex items-start space-x-3 text-gray-300">
        <MapPin size={16} className="mt-0.5 flex-shrink-0" />
        <span>
          {BRAND.addressLines.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </span>
      </div>
    </div>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) { 
      setState('error'); 
      return; 
    }

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      
      if (response.ok) {
        setState('success');
        setEmail('');
      } else {
        throw new Error('Subscribe failed');
      }
    } catch {
      // Fallback: mailto – altijd functioneel
      window.location.href = `mailto:${BRAND.email}?subject=Aanmelden%20nieuwsbrief&body=${encodeURIComponent(email)}`;
      setState('success');
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3">
        <label className="sr-only" htmlFor="newsletter-email">E-mailadres voor nieuwsbrief</label>
        <input
          id="newsletter-email"
          type="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="je@email.com"
          className="flex-1 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
          aria-label="E-mailadres voor nieuwsbrief"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-[#89CFF0] text-[#0D1B2A] rounded-lg font-medium hover:bg-[#89CFF0]/90 focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:ring-offset-2 focus:ring-offset-[#0D1B2A] transition-colors"
        >
          Aanmelden
        </button>
      </form>
      
      {state === 'success' && (
        <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
          <CheckCircle2 className="w-4 h-4" />
          Ingeschreven — bedankt!
        </p>
      )}
      {state === 'error' && (
        <p className="mt-2 text-sm text-red-400">
          Ongeldig e-mailadres. Probeer opnieuw.
        </p>
      )}
    </div>
  );
}

function SocialLinks() {
  const visibleSocials = SOCIALS.filter(social => social.url);
  
  if (visibleSocials.length === 0) {
    return null;
  }

  const socialIcons = {
    LinkedIn: <Linkedin size={20} />,
    Instagram: <Instagram size={20} />,
    TikTok: <div className="w-5 h-5 text-center font-bold">T</div>,
    X: <Twitter size={20} />
  };

  return (
    <div className="flex items-center space-x-6">
      <span className="text-gray-300 text-sm font-medium">Volg ons:</span>
      {visibleSocials.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-[#89CFF0] transition-colors"
          aria-label={`Volg ons op ${social.name}`}
        >
          {socialIcons[social.name]}
        </a>
      ))}
    </div>
  );
}

function PremiumFooterInner() {
  const enhancedColumns = useMemo(() => {
    const columns = [...FOOTER_COLUMNS];
    
    // Add Cookie-instellingen to Legal section if not already present
    const legalColumn = columns.find(col => col.title === 'Juridisch');
    if (legalColumn && !legalColumn.links.some(link => link.label === 'Cookie-instellingen')) {
      legalColumn.links.push({
        label: 'Cookie-instellingen',
        href: '#',
        onClick: openCookieSettings
      });
    }
    
    return columns;
  }, []);

  return (
    <footer 
      data-testid="app-footer" 
      className={`bg-[#0D1B2A] text-white${import.meta.env.VITE_DEBUG_FOOTER === 'true' ? ' outline outline-1 outline-rose-400' : ''}`} 
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-[#89CFF0] flex items-center justify-center">
                <span className="text-[#0D1B2A] font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-white">{BRAND.name}</span>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {BRAND.tagline}
            </p>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              FitFi helpt je ontdekken wat jouw stijl over je zegt en hoe je dit kunt gebruiken 
              om jouw doelen te bereiken.
            </p>
            
            {/* Contact Info */}
            <ContactBlock />
          </div>

          {/* Footer Sections */}
          {enhancedColumns.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-medium text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.onClick ? (
                      <button
                        onClick={link.onClick}
                        className="text-gray-300 hover:text-[#89CFF0] transition-colors underline"
                      >
                        {link.label}
                      </button>
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
            <SocialLinks />

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-gray-300 text-sm">
                © {year} {BRAND.name}. Alle rechten voorbehouden.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Powered by Nova AI • Jouw persoonlijke stijlassistent
              </p>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="text-center">
            <h3 className="text-lg font-medium text-white mb-2">
              Blijf op de hoogte
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Ontvang de nieuwste styling tips en trends direct in je inbox.
            </p>
            <Newsletter />
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function PremiumFooter() {
  return (
    <FooterGuard>
      <PremiumFooterInner />
    </FooterGuard>
  );
}