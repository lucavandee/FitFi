import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { GamificationProvider } from "@/context/GamificationContext";
import "@/styles/polish.css";

/* Pages – voorkom dubbele declaraties, gebruik steeds één lazy per page */
const HomePage        = lazy(() => import("@/pages/HomePage"));
const LandingPage     = lazy(() => import("@/pages/LandingPage"));
const HowItWorksPage  = lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage     = lazy(() => import("@/pages/PricingPage"));
const FAQPage         = lazy(() => import("@/pages/FAQPage"));
const BlogPage        = lazy(() => import("@/pages/BlogPage"));
const BlogArticlePage = lazy(() => import("@/pages/BlogDetailPage"));
const AboutPage       = lazy(() => import("@/pages/AboutPage"));
const ResultsPage     = lazy(() => import("@/pages/EnhancedResultsPage"));
const NotFoundPage    = lazy(() => import("@/pages/NotFoundPage"));

function AppShell() {
  return (
    <>
      <header className="ff-header">
        <div className="ff-container ff-header__in">
          <Navbar />
        </div>
      </header>

      <main>
        <Suspense fallback={<div className="ff-container ff-section">Laden…</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
            <Route path="/prijzen" element={<PricingPage />} />
            <Route path="/veelgestelde-vragen" element={<FAQPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/over-ons" element={<AboutPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </main>

      <footer className="ff-footer">
        <div className="ff-container">
          <Footer />
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <UserProvider>
          <OnboardingProvider>
            <GamificationProvider>
              <ErrorBoundary>
                <BrowserRouter>
                  <AppShell />
                </BrowserRouter>
              </ErrorBoundary>
            </GamificationProvider>
          </OnboardingProvider>
        </UserProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}