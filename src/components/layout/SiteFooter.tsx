import React from "react";
import Container from "./Container";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <Container className="py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 text-[14px] text-[var(--fitfi-muted)]">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-lg ff-grad" />
            <strong className="text-white">FitFi</strong>
          </div>
          <p className="leading-relaxed">Wij vertalen je smaak naar outfits die kloppen — met uitleg, combinaties en shopbare items.</p>
        </div>
        <div className="grid gap-2">
          <strong className="text-white/90">Product</strong>
          <a href="/hoe-het-werkt" className="hover:text-white transition-colors">Hoe het werkt</a>
          <a href="/prijzen" className="hover:text-white transition-colors">Prijzen</a>
          <a href="/results" className="hover:text-white transition-colors">Voorbeeld resultaten</a>
          <a href="/veelgestelde-vragen" className="hover:text-white transition-colors">Veelgestelde vragen</a>
        </div>
        <div className="grid gap-2">
          <strong className="text-white/90">Bedrijf</strong>
          <a href="/over-ons" className="hover:text-white transition-colors">Over ons</a>
          <a href="/blog" className="hover:text-white transition-colors">Blog</a>
          <a href="/contact" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="grid gap-2">
          <strong className="text-white/90">Juridisch</strong>
          <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
          <a href="/algemene-voorwaarden" className="hover:text-white transition-colors">Voorwaarden</a>
          <a href="/cookies" className="hover:text-white transition-colors">Cookies</a>
        </div>
      </Container>
      <Container className="py-6 border-t border-white/10 text-xs text-[var(--fitfi-muted)]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <p>© {new Date().getFullYear()} FitFi · Alle rechten voorbehouden.</p>
          <p>Keizersgracht 520 H · 1017 EK Amsterdam</p>
        </div>
      </Container>
    </footer>
  );
}