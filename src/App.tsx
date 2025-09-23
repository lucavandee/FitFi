import React, { Suspense, lazy } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieBanner from "@/components/legal/CookieBanner";
import ErrorBoundary from "@/components/ErrorBoundary";
import NavigationServiceInitializer from "@/components/NavigationServiceInitializer";

import { Routes, Route } from "react-router-dom";

/** Context providers */
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { GamificationProvider } from "@/context/GamificationContext";

/** Pages (lazy) */
const HomePage = lazy(() => import("@/pages/HomePage"));
const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const BlogPage = lazy(() => import("@/pages/BlogPage"));
const ResultsPage = lazy(() => import("@/pages/ResultsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

export default function App() {
  return (
    <ErrorBoundary>
      {/* ALLE app-state providers moeten HIER staan,
          zodat elke pagina (HomePage, etc.) de contexten ziet. */}
      <ThemeProvider>
        <UserProvider>
          <OnboardingProvider>
            <GamificationProvider>
              {/* NavigationServiceInitializer gebruikt useLocation() -> MOET binnen Router (main.tsx) staan */}
              <NavigationServiceInitializer />

              <div className="app-shell">
                <Navbar />
                <main id="main" role="main">
                  <Suspense fallback={<div className="ff-loading">Laden…</div>}>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
                      <Route path="/prijzen" element={<PricingPage />} />
                      <Route path="/over-ons" element={<AboutPage />} />
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="/blog" element={<BlogPage />} />
                      <Route path="/results" element={<ResultsPage />} />
                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
                <CookieBanner />
              </div>
            </GamificationProvider>
          </OnboardingProvider>
        </UserProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}