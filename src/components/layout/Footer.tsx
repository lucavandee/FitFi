import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="ff-container footer-grid">
        {/* Brand + mission */}
        <div className="footer-brand">
          <a href="/" className="footer-logo" aria-label="Ga naar home">FitFi</a>
          <p className="footer-mission">
            AI-gestuurde styling zonder ruis. Rustige keuzes, outfits die kloppen met silhouet,
            materialen en kleurtemperatuur — privacy-first.
          </p>
        </div>

        {/* Product */}
        <nav aria-label="Product" className="footer-col">
          <h2 className="footer-heading">Product</h2>
          <ul className="footer-list">
            <li><a href="/hoe-het-werkt">Hoe het werkt</a></li>
            <li><a href="/prijzen">Prijzen</a></li>
            <li><a href="/onboarding">Start gratis</a></li>
            <li><a href="/results">Voorbeeldrapport</a></li>
          </ul>
        </nav>

        {/* Company */}
        <nav aria-label="Company" className="footer-col">
          <h2 className="footer-heading">Company</h2>
          <ul className="footer-list">
            <li><a href="/over-ons">Over ons</a></li>
            <li><a href="/blog">Blog</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>

        {/* Support */}
        <nav aria-label="Support" className="footer-col">
          <h2 className="footer-heading">Support</h2>
          <ul className="footer-list">
            <li><a href="/faq">FAQ</a></li>
            <li><a href="/cookies">Cookies</a></li>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Voorwaarden</a></li>
          </ul>
        </nav>
      </div>

      {/* Legal row */}
      <div className="footer-legal">
        <div className="ff-container footer-legal-row">
          <p className="footer-copy">© {new Date().getFullYear()} FitFi. Alle rechten voorbehouden.</p>
          <ul className="footer-legal-links">
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Voorwaarden</a></li>
            <li><a href="/cookies">Cookies</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;