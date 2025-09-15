import React from "react";
import { Link } from "react-router-dom";
import Logo from "../ui/Logo";
import Button from "../ui/Button";
import { Instagram, Youtube, Twitter, Linkedin } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[color:var(--color-bg)] border-t border-[color:var(--color-border)] mt-16" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center" aria-label="FitFi home">
              <Logo className="h-7 w-auto" />
            </Link>
            <p className="text-[color:var(--color-muted)] mt-3 max-w-xs">
              Wij helpen je met stijl — met AI, uitleg en outfits die bij je silhouet passen.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <a href="https://www.instagram.com/" aria-label="Instagram" className="text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.youtube.com/" aria-label="YouTube" className="text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)]">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/" aria-label="Twitter" className="text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)]">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.linkedin.com/" aria-label="LinkedIn" className="text-[color:var(--color-muted)] hover:text-[color:var(--color-primary)]">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Snel naar */}
          <div>
            <h3 className="ff-heading text-[color:var(--color-text)] text-lg font-semibold">Snel naar</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/hoe-het-werkt" className="text-[color:var(--color-text)] hover:underline">Hoe het werkt</Link></li>
              <li><Link to="/prijzen" className="text-[color:var(--color-text)] hover:underline">Prijzen</Link></li>
              <li><Link to="/feed" className="text-[color:var(--color-text)] hover:underline">Feed</Link></li>
              <li><Link to="/blog" className="text-[color:var(--color-text)] hover:underline">Blog</Link></li>
            </ul>
          </div>

          {/* Juridisch */}
          <div>
            <h3 className="ff-heading text-[color:var(--color-text)] text-lg font-semibold">Juridisch</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/privacy" className="text-[color:var(--color-text)] hover:underline">Privacy</Link></li>
              <li><Link to="/cookies" className="text-[color:var(--color-text)] hover:underline">Cookies</Link></li>
              <li><Link to="/voorwaarden" className="text-[color:var(--color-text)] hover:underline">Algemene voorwaarden</Link></li>
              <li><Link to="/affiliate-disclosure" className="text-[color:var(--color-text)] hover:underline">Affiliate Disclosure</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="ff-heading text-[color:var(--color-text)] text-lg font-semibold">Contact</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/contact" className="text-[color:var(--color-text)] hover:underline">Contactformulier</Link></li>
              <li><a href="mailto:hi@fitfi.ai" className="text-[color:var(--color-text)] hover:underline">hi@fitfi.ai</a></li>
            </ul>
            <div className="mt-4">
              <Button as={Link} to="/onboarding" variant="primary" size="md">
                Start gratis
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[color:var(--color-border)] pt-6 text-sm text-[color:var(--color-muted)] flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FitFi. Alle rechten voorbehouden.</p>
          <p>
            Transparantie: sommige links op deze site zijn <strong>affiliate links</strong>.
            Als je via deze links shopt, kan FitFi een commissie ontvangen — zonder extra kosten voor jou.
            Meer info in onze <Link to="/affiliate-disclosure" className="hover:underline">Affiliate Disclosure</Link>.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;