import React from "react";
import { Link } from "react-router-dom";

export default function PremiumFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0F1E]/80 backdrop-blur-sm">
      <div className="ff-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg">FitFi</span>
            </div>
            <p className="text-sm opacity-80">
              Persoonlijke outfits zonder ruis. Privacy-first & nuchter.
            </p>
          </div>

          <nav className="space-y-2">
            <p className="font-medium">Product</p>
            <ul className="space-y-1 text-sm opacity-80">
              <li><Link to="/hoe-het-werkt" className="hover:opacity-100">Hoe het werkt</Link></li>
              <li><Link to="/prijzen" className="hover:opacity-100">Prijzen</Link></li>
              <li><Link to="/over-ons" className="hover:opacity-100">Over ons</Link></li>
              <li><Link to="/veelgestelde-vragen" className="hover:opacity-100">FAQ</Link></li>
            </ul>
          </nav>

          <nav className="space-y-2">
            <p className="font-medium">Resources</p>
            <ul className="space-y-1 text-sm opacity-80">
              <li><a href="/blog" className="hover:opacity-100">Blog</a></li>
              <li><a href="/privacy" className="hover:opacity-100">Privacy</a></li>
              <li><a href="/terms" className="hover:opacity-100">Voorwaarden</a></li>
            </ul>
          </nav>

          <div className="space-y-2">
            <p className="font-medium">Start</p>
            <div className="flex gap-2">
              <Link to="/hoe-het-werkt" className="ff-btn ff-btn-secondary h-10">Meer info</Link>
              <Link to="/prijzen" className="ff-btn ff-btn-primary h-10">Start gratis</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-xs opacity-70">
          © {new Date().getFullYear()} FitFi. Alle rechten voorbehouden.
        </div>
      </div>
    </footer>
  );
}