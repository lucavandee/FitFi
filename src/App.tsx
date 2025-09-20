import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import ErrorBoundary from "@/components/ErrorBoundary";
import ThemeProvider from "@/context/ThemeContext";
import UserProvider from "@/context/UserContext";
import GamificationProvider from "@/context/GamificationContext";
import OnboardingProvider from "@/context/OnboardingContext";
import NovaChatProvider from "@/components/nova/NovaChatProvider"; // onze fail-safe versie
import NovaChatMount from "@/components/nova/NovaChatMount";

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const EnhancedResultsPage = lazy(() => import("@/pages/EnhancedResultsPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <GamificationProvider>
            <OnboardingProvider>
              <ErrorBoundary>
                <NovaChatProvider>
                  <Suspense fallback={null}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
                      <Route path="/over-ons" element={<AboutPage />} />
                      <Route path="/prijzen" element={<PricingPage />} />
                      <Route path="/results" element={<EnhancedResultsPage />} />
                      <Route path="/404" element={<NotFoundPage />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </Suspense>

                  {/* Chat mount blijft binnen de Provider; crasht nooit meer */}
                  <NovaChatMount />
                </NovaChatProvider>
              </ErrorBoundary>
            </OnboardingProvider>
          </GamificationProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}