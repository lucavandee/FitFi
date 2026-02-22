import React from "react";
import Container from "./Container";
import NewsletterSignup from "@/components/marketing/NewsletterSignup";

export default function SiteFooter() {
  return (
    <footer className="mt-20 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
      {/* Newsletter section */}
      <Container className="py-16 border-b border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto">
          <NewsletterSignup variant="light" />
        </div>
      </Container>

      <Container className="py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 text-sm">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-600)]" />
            <strong className="text-[var(--color-text)] text-lg font-bold">FitFi</strong>
          </div>
          <p className="leading-relaxed text-[var(--color-text)]/70">Wij vertalen je smaak naar outfits voor jou — met uitleg, combinaties en shopbare items.</p>
        </div>
        <div className="grid gap-3">
          <strong className="text-[var(--color-text)] font-semibold text-base mb-1">Product</strong>
          <a href="/hoe-het-werkt" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">Hoe het werkt</a>
          <a href="/prijzen" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">Prijzen</a>
          <a href="/results/preview" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">Voorbeeld resultaten</a>
          <a href="/veelgestelde-vragen" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">FAQ</a>
        </div>
        <div className="grid gap-3">
          <strong className="text-[var(--color-text)] font-semibold text-base mb-1">Bedrijf</strong>
          <a href="/over-ons" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">Over ons</a>
          <a href="/blog" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">Blog</a>
          <a href="/contact" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">Contact</a>
        </div>
        <div className="grid gap-3">
          <strong className="text-[var(--color-text)] font-semibold text-base mb-1">Juridisch</strong>
          <a href="/privacy" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">Privacy</a>
          <a href="/algemene-voorwaarden" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">Voorwaarden</a>
          <a href="/cookies" className="text-[var(--color-muted)] hover:text-[var(--ff-color-primary-700)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ff-color-primary-500)] rounded-sm">Cookies</a>
        </div>
      </Container>
      <Container className="py-6 border-t border-[var(--color-border)] bg-[var(--ff-color-primary-25)]">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 text-xs text-[var(--color-muted)]">
          <div className="flex flex-col gap-1">
            <p>© {new Date().getFullYear()} FitFi · Alle rechten voorbehouden.</p>
            <p>KVK: 97225665 · BTW: NL005258495B15</p>
          </div>
          <p>Keizersgracht 520 H · 1017 EK Amsterdam</p>
        </div>
      </Container>
    </footer>
  );
}