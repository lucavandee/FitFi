import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import AnalyticsLoader from "@/components/analytics/AnalyticsLoader";

// Lazy pages
const LandingPage        = lazy(() => import("@/pages/LandingPage"));
const HowItWorksPage     = lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage        = lazy(() => import("@/pages/PricingPage"));
const AboutPage          = lazy(() => import("@/pages/AboutPage"));
const BlogPage           = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage       = lazy(() => import("@/pages/BlogPostPage"));
const FAQPage            = lazy(() => import("@/pages/FAQPage"));
const ContactPage        = lazy(() => import("@/pages/ContactPage"));
const TermsPage          = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage        = lazy(() => import("@/pages/PrivacyPage"));
const CookiesPage        = lazy(() => import("@/pages/CookiesPage"));
const DisclosurePage     = lazy(() => import("@/pages/DisclosurePage"));
const EnhancedResults    = lazy(() => import("@/pages/EnhancedResultsPage"));
const LoginPage          = lazy(() => import("@/pages/LoginPage"));
const RegisterPage       = lazy(() => import("@/pages/RegisterPage"));
const NotFoundPage       = lazy(() => import("@/pages/NotFoundPage"));

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <ErrorBoundary>
        <Navbar />
        <Suspense fallback={<div className="ff-container py-10">Laden…</div>}>
          <main id="main">
            <Routes>
              {/* Marketing */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
              <Route path="/prijzen" element={<PricingPage />} />
              <Route path="/over-ons" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/veelgestelde-vragen" element={<FAQPage />} />
              <Route path="/faq" element={<Navigate to="/veelgestelde-vragen" replace />} />
              <Route path="/contact" element={<ContactPage />} />

              {/* Juridisch (NL canoniek) */}
              <Route path="/algemene-voorwaarden" element={<TermsPage />} />
              <Route path="/terms" element={<Navigate to="/algemene-voorwaarden" replace />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/disclosure" element={<DisclosurePage />} />

              {/* Auth (NL canoniek) */}
              <Route path="/inloggen" element={<LoginPage />} />
              <Route path="/login" element={<Navigate to="/inloggen" replace />} />
              <Route path="/registreren" element={<RegisterPage />} />
              <Route path="/register" element={<Navigate to="/registreren" replace />} />

              {/* App */}
              <Route path="/results" element={<EnhancedResults />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </Suspense>
        <Footer />
        {/* Consent-aware analytics voor SPA pageviews */}
        <AnalyticsLoader />
      </ErrorBoundary>
    </div>
  );
}