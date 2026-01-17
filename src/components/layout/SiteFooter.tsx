import React from "react";
import Container from "./Container";
import NewsletterSignup from "@/components/marketing/NewsletterSignup";
import { Instagram, Linkedin, Twitter, Mail } from "lucide-react";

export default function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 sm:mt-20 bg-gradient-to-b from-white to-[var(--ff-color-primary-25)] border-t border-[var(--color-border)]">
      {/* Newsletter section - More compact */}
      <Container className="py-12 sm:py-14 border-b border-[var(--color-border)]">
        <div className="max-w-xl mx-auto">
          <NewsletterSignup variant="light" />
        </div>
      </Container>

      {/* Main footer content - Tighter spacing */}
      <Container className="py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
          {/* Brand column - Takes more space on large screens */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[var(--ff-color-primary-500)] to-[var(--ff-color-primary-600)] shadow-sm" />
              <strong className="text-[var(--color-text)] text-lg sm:text-xl font-bold tracking-tight">FitFi</strong>
            </div>

            {/* Tagline */}
            <p className="text-sm sm:text-base text-[var(--color-text)]/70 leading-relaxed mb-4 sm:mb-5 max-w-xs">
              Wij vertalen je smaak naar outfits voor jou — met uitleg, combinaties en shopbare items.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/fitfi.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]/60 hover:text-[var(--ff-color-primary-700)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)] transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/fitfi"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]/60 hover:text-[var(--ff-color-primary-700)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)] transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/fitfi_ai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]/60 hover:text-[var(--ff-color-primary-700)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)] transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="/contact"
                className="w-9 h-9 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)]/60 hover:text-[var(--ff-color-primary-700)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)] transition-all"
                aria-label="Contact"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h3 className="text-[var(--color-text)] font-semibold text-sm sm:text-base mb-0.5">Product</h3>
            <a href="/hoe-het-werkt" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">Hoe het werkt</a>
            <a href="/prijzen" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">Prijzen</a>
            <a href="/results" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">Resultaten</a>
            <a href="/veelgestelde-vragen" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">FAQ</a>
          </div>

          {/* Bedrijf */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h3 className="text-[var(--color-text)] font-semibold text-sm sm:text-base mb-0.5">Bedrijf</h3>
            <a href="/over-ons" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">Over ons</a>
            <a href="/blog" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">Blog</a>
            <a href="/contact" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">Contact</a>
          </div>

          {/* Juridisch */}
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <h3 className="text-[var(--color-text)] font-semibold text-sm sm:text-base mb-0.5">Juridisch</h3>
            <a href="/privacy" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">Privacy</a>
            <a href="/algemene-voorwaarden" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">Voorwaarden</a>
            <a href="/cookies" className="text-xs sm:text-sm text-[var(--color-text)]/70 hover:text-[var(--ff-color-primary-700)] transition-colors">Cookies</a>
          </div>
        </div>
      </Container>

      {/* Bottom bar - More compact */}
      <div className="border-t border-[var(--color-border)] bg-[var(--ff-color-primary-50)]/50">
        <Container className="py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-[var(--color-text)]/60">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium">© {currentYear} FitFi</span>
              <span className="hidden sm:inline">·</span>
              <span>KVK 97225665 · BTW NL005258495B15</span>
            </div>
            <span className="whitespace-nowrap">Keizersgracht 520 H, 1017 EK Amsterdam</span>
          </div>
        </Container>
      </div>
    </footer>
  );
}