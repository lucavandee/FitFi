import React, { useEffect, useState } from "react";
import Container from "./Container";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all ${
        scrolled ? "backdrop-blur-md bg-[rgba(11,16,32,.65)] border-b border-white/10" : "bg-transparent"
      }`}
    >
      <Container className="flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-3">
          <div
            aria-hidden
            className="w-8 h-8 rounded-xl ff-grad ff-float"
            style={{ boxShadow: "0 10px 30px rgba(43,106,243,.35)" }}
          />
          <span className="text-white font-semibold tracking-wide">FitFi</span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm text-[var(--fitfi-muted)]">
          <a href="/#how-it-works" className="hover:text-white">Hoe het werkt</a>
          <a href="/#previews" className="hover:text-white">Voorbeelden</a>
          <a href="/#faq" className="hover:text-white">FAQ</a>
          <a href="/privacy" className="hover:text-white">Privacy</a>
        </nav>

        <div className="flex items-center gap-2">
          <a href="/quiz" className="ff-cta">Doe de stijlscan</a>
        </div>
      </Container>
    </header>
  );
}