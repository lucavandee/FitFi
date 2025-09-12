import React from "react";
import { Link } from "react-router-dom";

export default function PremiumHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
      <div className="ff-container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2B6AF3] to-[#7AA2FF] flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-xl font-semibold text-white">FitFi</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/nova" className="text-[#AAB0C0] hover:text-white transition-colors">
              Nova AI
            </Link>
            <Link to="/outfits" className="text-[#AAB0C0] hover:text-white transition-colors">
              Outfits
            </Link>
            <Link to="/tribes" className="text-[#AAB0C0] hover:text-white transition-colors">
              Tribes
            </Link>
            <Link to="/pricing" className="text-[#AAB0C0] hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="ff-ghost text-sm">
              Inloggen
            </Link>
            <Link to="/register" className="ff-cta text-sm">
              Start gratis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}