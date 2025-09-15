import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Hoe het werkt', href: '/hoe-het-werkt' },
      { name: 'Prijzen', href: '/prijzen' },
      { name: 'Nova AI', href: '/nova' },
      { name: 'Blog', href: '/blog' },
    ],
    company: [
      { name: 'Over ons', href: '/over-ons' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
      { name: 'Pers', href: '/pers' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Support', href: '/support' },
      { name: 'Status', href: '/status' },
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Voorwaarden', href: '/voorwaarden' },
      { name: 'Cookies', href: '/cookies' },
      { name: 'Disclaimer', href: '/disclaimer' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com/fitfi', icon: Facebook },
    { name: 'Twitter', href: 'https://twitter.com/fitfi', icon: Twitter },
    { name: 'Instagram', href: 'https://instagram.com/fitfi', icon: Instagram },
    { name: 'LinkedIn', href: 'https://linkedin.com/company/fitfi', icon: Linkedin },
  ];

  return (
    <footer className="bg-[color:var(--color-bg)] border-t border-[color:var(--color-border)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo />
            </div>
            <p className="text-[color:var(--color-muted)] text-sm leading-relaxed max-w-md">
              FitFi helpt je ontdekken wat jouw unieke stijl over je zegt. Met AI-powered styling krijg je gepersonaliseerde outfit aanbevelingen die perfect bij je passen.
            </p>
            
            {/* Contact info */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)]">
                <Mail size={16} />
                <a href="mailto:hello@fitfi.ai" className="hover:text-[color:var(--color-primary)] transition-colors">
                  hello@fitfi.ai
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)]">
                <Phone size={16} />
                <a href="tel:+31202345678" className="hover:text-[color:var(--color-primary)] transition-colors">
                  +31 20 234 5678
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-[color:var(--color-muted)]">
                <MapPin size={16} />
                <span>Amsterdam, Nederland</span>
              </div>
            </div>
          </div>

          {/* Links sections */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-3 lg:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--color-text)] mb-4">Product</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[color:var(--color-text)] mb-4">Bedrijf</h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[color:var(--color-text)] mb-4">Support</h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[color:var(--color-text)] mb-4">Juridisch</h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-12 border-t border-[color:var(--color-border)] pt-8">
          <div className="bg-[color:var(--color-surface)] rounded-[var(--radius-lg)] border border-[color:var(--color-border)] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[color:var(--color-text)] mb-1">
                  Blijf op de hoogte
                </h3>
                <p className="text-sm text-[color:var(--color-muted)]">
                  Ontvang styling tips en nieuwe features als eerste
                </p>
              </div>
              <div className="flex gap-2 sm:min-w-80">
                <input
                  type="email"
                  placeholder="je@email.com"
                  className="flex-1 px-3 py-2 text-sm border border-[color:var(--color-border)] rounded-lg bg-[color:var(--color-surface)] text-[color:var(--color-text)] placeholder:text-[color:var(--color-muted)] focus-visible:ring-2 ring-[color:var(--color-primary)] ring-offset-2 ring-offset-[color:var(--color-surface)] transition-colors"
                />
                <button className="px-4 py-2 text-sm font-medium bg-[color:var(--ff-color-primary-700)] text-white rounded-lg hover:bg-[color:var(--ff-color-primary-600)] transition-colors">
                  Aanmelden
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-8 border-t border-[color:var(--color-border)] pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-[color:var(--color-muted)]">
              © {currentYear} FitFi. Alle rechten voorbehouden.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)] transition-colors"
                    aria-label={`Volg ons op ${social.name}`}
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;