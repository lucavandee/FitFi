import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import HomePage from "@/pages/HomePage";               // bestaand
import HowItWorksPage from "@/pages/HowItWorksPage";   // premium
import PricingPage from "@/pages/PricingPage";         // premium
import AboutPage from "@/pages/AboutPage";             // premium
import FAQPage from "@/pages/FAQPage";                 // premium
import BlogPage from "@/pages/BlogPage";               // premium

// (optioneel) policies als routes
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import CookiesPage from "@/pages/CookiesPage";
import ProcessorsPage from "@/pages/ProcessorsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
          <Route path="/prijzen" element={<PricingPage />} />
          <Route path="/over-ons" element={<AboutPage />} />
          <Route path="/veelgestelde-vragen" element={<FAQPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/voorwaarden" element={<TermsPage />} />
          <Route path="/cookies" element={<CookiesPage />} />
          <Route path="/verwerkers" element={<ProcessorsPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}