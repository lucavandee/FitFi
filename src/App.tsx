import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import CookieBanner from "@/components/legal/CookieBanner";

// Lazy pages (enkel 1x declareren)
const LandingPage       = lazy(() => import("@/pages/LandingPage"));
const HomePage          = lazy(() => import("@/pages/HomePage"));
const HowItWorksPage    = lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage       = lazy(() => import("@/pages/PricingPage"));
const AboutPage         = lazy(() => import("@/pages/AboutPage"));
const FAQPage           = lazy(() => import("@/pages/FAQPage"));
const EnhancedResults   = lazy(() => import("@/pages/EnhancedResultsPage"));
const NotFoundPage      = lazy(() => import("@/pages/NotFoundPage"));

export default function App() {
  return (
    <div className="ff-app flex min-h-screen flex-col bg-[var(--color-bg)]">
      {/* Header - exact 1x in de app */}
      <Navbar className="ff-navbar sticky top-0 z-[60]" />

      {/* Main content */}
      <ErrorBoundary>
        <Suspense fallback={null}>
          <main id="main" className="ff-main flex-1">
            <Routes>
              <Route index element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
              <Route path="/prijzen" element={<PricingPage />} />
              <Route path="/over-ons" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/results" element={<EnhancedResults />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </Suspense>
      </ErrorBoundary>

      {/* Footer - exact 1x in de app */}
      <Footer />

      {/* Cookie banner ook 1x op root-niveau */}
      <CookieBanner />
    </div>
  );
}