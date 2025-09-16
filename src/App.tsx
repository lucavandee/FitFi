import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

// ✅ Statische import voor Home (hotfix)
import LandingPage from "@/pages/LandingPage";

// (andere routes mogen lazy blijven)
const AboutPage = React.lazy(() => import("@/pages/AboutPage"));
const HowItWorks = React.lazy(() => import("@/pages/HowItWorksPage"));
const PricingPage = React.lazy(() => import("@/pages/PricingPage"));
const BlogIndex = React.lazy(() => import("@/pages/BlogIndexPage"));
const ContactPage = React.lazy(() => import("@/pages/ContactPage"));
const FAQPage = React.lazy(() => import("@/pages/FAQPage"));
const FeedPage = React.lazy(() => import("@/pages/FeedPage"));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <React.Suspense fallback={<div className="container section">Laden…</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/over-ons" element={<AboutPage />} />
          <Route path="/hoe-het-werkt" element={<HowItWorks />} />
          <Route path="/prijzen" element={<PricingPage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/veelgestelde-vragen" element={<FAQPage />} />
          <Route path="/feed" element={<FeedPage />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default App;