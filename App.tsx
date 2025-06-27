import React, { Suspense } from 'react';
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
import LoadingFallback from './components/ui/LoadingFallback';

// Lazy load the dashboard page to improve initial load time
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <GamificationProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <ErrorBoundary>
                <Navbar />
              </ErrorBoundary>
              
              <main className="flex-grow">
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/onboarding" element={<OnboardingPage />} />
                    <Route path="/gender" element={<GenderSelectPage />} />
                    <Route path="/quiz/:step" element={<QuizPage />} />
                    <Route path="/results" element={<EnhancedResultsPage />} />
                    <Route path="/dashboard/*" element={
                      <Suspense fallback={<LoadingFallback message="Dashboard laden..." fullScreen />}>
                        <DashboardPage />
                      </Suspense>
                    } />
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
              
              <ErrorBoundary>
                <Footer />
              </ErrorBoundary>
              
              <Toaster 
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--toast-bg, rgba(13, 27, 42, 0.95))',
                    color: 'var(--toast-color, #fff)',
                    borderRadius: '0.75rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid var(--toast-border, rgba(255,255,255,0.1))'
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