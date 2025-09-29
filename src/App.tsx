import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieBanner from "@/components/legal/CookieBanner";

// Laat header/footer intact zoals jullie ze nu hebben.
// We raken alleen de routes aan en vermijden dubbele declaraties.

const LandingPage        = lazy(() => import("@/pages/LandingPage"));
const HowItWorksPage     = lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage        = lazy(() => import("@/pages/PricingPage"));
const AboutPage          = lazy(() => import("@/pages/AboutPage"));
const BlogPage           = lazy(() => import("@/pages/BlogPage"));
const FAQPage            = lazy(() => import("@/pages/FAQPage")); // intern component
const NotFoundPage       = lazy(() => import("@/pages/NotFoundPage"));
const EnhancedResults    = lazy(() => import("@/pages/EnhancedResultsPage"));

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* HEADER — één keer, bovenaan */}
      <Navbar />

      {/* MAIN CONTENT */}
      <ErrorBoundary>
        <Suspense fallback={<div />}>
          <main id="main" className="flex-1">
            <Routes>
              {/* Home / Landing */}
              <Route index element={<LandingPage />} />

              {/* Hoe het werkt */}
              <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />

              {/* Prijzen */}
              <Route path="/prijzen" element={<PricingPage />} />

              {/* Blog */}
              <Route path="/blog" element={<BlogPage />} />

              {/* Over ons */}
              <Route path="/over-ons" element={<AboutPage />} />

              {/* FAQ: live slug is /veelgestelde-vragen. We ondersteunen beide. */}
              <Route path="/veelgestelde-vragen" element={<FAQPage />} />
              <Route path="/faq" element={<Navigate to="/veelgestelde-vragen" replace />} />

              {/* Results */}
              <Route path="/results" element={<EnhancedResults />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </Suspense>
      </ErrorBoundary>

      {/* FOOTER — één keer, onderaan */}
      <Footer />

      {/* Globale modals/banners die overal mogen verschijnen */}
      <CookieBanner />
    </div>
  );
}