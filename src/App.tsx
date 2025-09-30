import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

const LandingPage        = lazy(() => import("@/pages/LandingPage"));
const HowItWorksPage     = lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage        = lazy(() => import("@/pages/PricingPage"));
const AboutPage          = lazy(() => import("@/pages/AboutPage"));
const BlogPage           = lazy(() => import("@/pages/BlogPage"));
const BlogPostPage       = lazy(() => import("@/pages/BlogPostPage")); // ⟵ NIEUW: detailroute
const FAQPage            = lazy(() => import("@/pages/FAQPage"));
const EnhancedResults    = lazy(() => import("@/pages/EnhancedResultsPage"));
const NotFoundPage       = lazy(() => import("@/pages/NotFoundPage"));

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <ErrorBoundary>
        <Navbar />
        <Suspense fallback={<div className="ff-container py-10">Laden…</div>}>
          <main id="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
              <Route path="/prijzen" element={<PricingPage />} />
              <Route path="/over-ons" element={<AboutPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} /> {/* ⟵ WERKENDE BLOGDETAILS */}
              <Route path="/veelgestelde-vragen" element={<FAQPage />} />
              <Route path="/results" element={<EnhancedResults />} />
              {/* Alias */}
              <Route path="/faq" element={<Navigate to="/veelgestelde-vragen" replace />} />
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </Suspense>
        <Footer />
      </ErrorBoundary>
    </div>
  );
}