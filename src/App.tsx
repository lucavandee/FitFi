import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

import ErrorBoundary from "@/components/ErrorBoundary";
import Navbar from "@/components/layout/Navbar";
import NovaChatProvider from "@/components/nova/NovaChatProvider";

// Context providers
import { ThemeProvider } from "@/context/ThemeContext";
import { UserProvider } from "@/context/UserContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { OnboardingProvider } from "@/context/OnboardingContext";

// Pages
import LandingPage from "@/pages/LandingPage"; // home: statisch importeren = robuust
const AboutPage       = React.lazy(() => import("@/pages/AboutPage"));
const HowItWorksPage  = React.lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage     = React.lazy(() => import("@/pages/PricingPage"));
const BlogIndexPage   = React.lazy(() => import("@/pages/BlogIndexPage"));
const ContactPage     = React.lazy(() => import("@/pages/ContactPage"));
const FAQPage         = React.lazy(() => import("@/pages/FAQPage"));
const FeedPage        = React.lazy(() => import("@/pages/FeedPage"));

const queryClient = new QueryClient();

const Providers: React.FC<React.PropsWithChildren> = ({ children }) => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <GamificationProvider>
            <OnboardingProvider>
              <NovaChatProvider>
                <ErrorBoundary>{children}</ErrorBoundary>
              </NovaChatProvider>
            </OnboardingProvider>
          </GamificationProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Providers>
        {/* Exact één header: Navbar staat nu BINNEN de providers → useUser werkt */}
        <Navbar />
        <React.Suspense fallback={<div className="container section">Laden…</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/over-ons" element={<AboutPage />} />
            <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
            <Route path="/prijzen" element={<PricingPage />} />
            <Route path="/blog" element={<BlogIndexPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/veelgestelde-vragen" element={<FAQPage />} />
            <Route path="/feed" element={<FeedPage />} />
          </Routes>
        </React.Suspense>
      </Providers>
    </BrowserRouter>
  );
};

export default App;