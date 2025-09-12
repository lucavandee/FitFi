import React from "react";
import Container from "./Container";

export default function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-white/10">
      <Container className="py-10 grid md:grid-cols-3 gap-10 text-[14px] text-[var(--fitfi-muted)]">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-6 h-6 rounded-lg ff-grad" />
            <strong className="text-white">FitFi</strong>
          </div>
          <p>Wij vertalen je smaak naar outfits die kloppen — met uitleg, combinaties en shopbare items.</p>
        </div>
        <div className="grid gap-2">
          <strong className="text-white/90">Product</strong>
          <a href="/#how-it-works" className="hover:text-white">Hoe het werkt</a>
          <a href="/#previews" className="hover:text-white">Voorbeelden</a>
          <a href="/#pricing" className="hover:text-white">Prijzen</a>
        </div>
        <div className="grid gap-2">
          <strong className="text-white/90">Juridisch</strong>
          <a href="/privacy" className="hover:text-white">Privacy</a>
          <a href="/terms" className="hover:text-white">Voorwaarden</a>
        </div>
      </Container>
      <Container className="py-6 border-t border-white/10 text-xs text-[var(--fitfi-muted)]">
        © {new Date().getFullYear()} FitFi · Alle rechten voorbehouden.
      </Container>
    </footer>
  );
}