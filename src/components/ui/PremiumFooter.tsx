import React from "react";
import { Link } from "react-router-dom";

export default function PremiumFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0F1E]/80 backdrop-blur-sm">
      <div className="ff-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2B6AF3] to-[#7AA2FF] flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-semibold text-white">FitFi</span>
            </div>
            <p className="text-[#AAB0C0] text-sm leading-relaxed">
              AI-powered styling voor de moderne professional. Ontdek je perfecte look.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Product</h4>
            <div className="space-y-3">
              <Link to="/nova" className="block text-[#AAB0C0] hover:text-white transition-colors text-sm">
                Nova AI
              </Link>
              <Link to="/outfits" className="block text-[#AAB0C0] hover:text-white transition-colors text-sm">
                Outfit Generator
              </Link>
              <Link to="/tribes" className="block text-[#AAB0C0] hover:text-white transition-colors text-sm">
                Style Tribes
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Bedrijf</h4>
            <div className="space-y-3">
              <Link to="/about" className="block text-[#AAB0C0] hover:text-white transition-colors text-sm">
                Over ons
              </Link>
              <Link to="/careers" className="block text-[#AAB0C0] hover:text-white transition-colors text-sm">
                Carrières
              </Link>
              <Link to="/contact" className="block text-[#AAB0C0] hover:text-white transition-colors text-sm">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Legal</h4>
            <div className="space-y-3">
              <Link to="/privacy" className="block text-[#AAB0C0] hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link to="/terms" className="block text-[#AAB0C0] hover:text-white transition-colors text-sm">
                Voorwaarden
              </Link>
              <Link to="/cookies" className="block text-[#AAB0C0] hover:text-white transition-colors text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>

        <div className="ff-divider my-8"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#AAB0C0] text-sm">
            © 2025 FitFi. Alle rechten voorbehouden.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#AAB0C0] hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="#" className="text-[#AAB0C0] hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}