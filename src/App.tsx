import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import GenderSelectPage from './pages/GenderSelectPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import EnhancedResultsPage from './pages/EnhancedResultsPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import ProductPage from './pages/ProductPage';
import HowItWorksPage from './pages/HowItWorksPage';
import PricingPage from './pages/PricingPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import BlogPage from './pages/BlogPage';
import SupportPage from './pages/SupportPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import FeedbackPage from './pages/FeedbackPage';
import LegalPage from './pages/LegalPage';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { GamificationProvider } from './context/GamificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/animations.css';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <GamificationProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-gray-900 transition-colors">
              <Navbar />
              <main className="flex-grow">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/gender" element={<GenderSelectPage />} />
                    <Route path="/quiz/:step" element={<QuizPage />} />
                    <Route path="/results" element={<EnhancedResultsPage />} />
                    <Route path="/dashboard/*" element={<DashboardPage />} />
                    <Route path="/over-ons" element={<AboutPage />} />
                    <Route path="/product" element={<ProductPage />} />
                    <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />
                    <Route path="/prijzen" element={<PricingPage />} />
                    <Route path="/succesverhalen" element={<SuccessStoriesPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/ondersteuning" element={<SupportPage />} />
                    <Route path="/helpcentrum" element={<HelpCenterPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/feedback" element={<FeedbackPage />} />
                    <Route path="/juridisch" element={<LegalPage />} />
                  </Routes>
                </ErrorBoundary>
              </main>
              <Footer />
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg)',
                    color: 'var(--toast-color)',
                  },
                }}
              />
            </div>
          </Router>
        </GamificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;