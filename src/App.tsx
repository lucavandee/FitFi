import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/ui/LoadingFallback';

// Lazy load components
const LazyWelcomeStep = React.lazy(() => 
  import('./pages/onboarding/WelcomeStep').catch(err => {
    console.error('Failed to load WelcomeStep:', err);
    return { default: () => <div>Error loading component</div> };
  })
);
const LazyGenderNameStep = React.lazy(() => 
  import('./pages/onboarding/GenderNameStep').catch(err => {
    console.error('Failed to load GenderNameStep:', err);
    return { default: () => <div>Error loading component</div> };
  })
);
const LazyArchetypeStep = React.lazy(() => 
  import('./pages/onboarding/ArchetypeStep').catch(err => {
    console.error('Failed to load ArchetypeStep:', err);
    return { default: () => <div>Error loading component</div> };
  })
);
const LazySeasonStep = React.lazy(() => 
  import('./pages/onboarding/SeasonStep').catch(err => {
    console.error('Failed to load SeasonStep:', err);
    return { default: () => <div>Error loading component</div> };
  })
);
const LazyOccasionStep = React.lazy(() => 
  import('./pages/onboarding/OccasionStep').catch(err => {
    console.error('Failed to load OccasionStep:', err);
    return { default: () => <div>Error loading component</div> };
  })
);
const DashboardPage = React.lazy(() => 
  import('./pages/DashboardPage').catch(err => {
    console.error('Failed to load DashboardPage:', err);
    return { default: () => <div>Error loading component</div> };
  })
);

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { GamificationProvider } from './context/GamificationContext';
import { OnboardingProvider } from './context/OnboardingContext';
import NavigationProgress from './components/ui/NavigationProgress';
import NavigationServiceInitializer from './components/NavigationServiceInitializer';
import OnboardingLayout from './components/layout/OnboardingLayout';

// Import regular components
import HomePage from './pages/HomePage';
import GenderSelectPage from './pages/GenderSelectPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import EnhancedResultsPage from './pages/EnhancedResultsPage';
import AboutPage from './pages/AboutPage';
import ProductPage from './pages/ProductPage';
import HowItWorksPage from './pages/HowItWorksPage';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import BlogPage from './pages/BlogPage';
import SupportPage from './pages/SupportPage';
import HelpCenterPage from './pages/HelpCenterPage';
import ContactPage from './pages/ContactPage';
import FAQPage from './pages/FAQPage';
import FeedbackPage from './pages/FeedbackPage';
import LegalPage from './pages/LegalPage';

// Lazy load the dashboard page to improve initial load time
function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <GamificationProvider>
          <Router>
              <NavigationServiceInitializer />
              <NavigationProgress />
              <div className="min-h-screen flex flex-col">
                <ErrorBoundary>
                  <Navbar />
                </ErrorBoundary>
                
                <main className="flex-grow">
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      
                      {/* Onboarding Flow */}
                      <Route path="onboarding" element={<OnboardingLayout />}>
                        <Route index element={
                          <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback message="Laden..." />}>
                              <LazyWelcomeStep />
                            </Suspense>
                          </ErrorBoundary>
                        } />
                        <Route path="gender-name" element={
                          <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback message="Laden..." />}>
                              <LazyGenderNameStep />
                            </Suspense>
                          </ErrorBoundary>
                        } />
                        <Route path="archetype" element={
                          <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback message="Laden..." />}>
                              <LazyArchetypeStep />
                            </Suspense>
                          </ErrorBoundary>
                        } />
                        <Route path="season" element={
                          <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback message="Laden..." />}>
                              <LazySeasonStep />
                            </Suspense>
                          </ErrorBoundary>
                        } />
                        <Route path="occasion" element={
                          <ErrorBoundary>
                            <Suspense fallback={<LoadingFallback message="Laden..." />}>
                              <LazyOccasionStep />
                            </Suspense>
                          </ErrorBoundary>
                        } />
                        <Route path="*" element={<Navigate to="/onboarding" replace />} />
                      </Route>
                      
                      {/* Catch-all route for 404 */}
                      <Route path="*" element={
                        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                          <div className="text-center">
                            <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">404</h1>
                            <p className="mb-6 text-gray-600 dark:text-gray-400">Pagina niet gevonden</p>
                            <Link to="/" className="text-orange-500 hover:text-orange-600">Terug naar home</Link>
                          </div>
                        </div>
                      } />
                      
                      {/* Legacy Routes */}
                      <Route path="/gender" element={<GenderSelectPage />} />
                      <Route path="/quiz/:step" element={<QuizPage />} />
                      
                      {/* Results Pages */}
                      <Route path="/results" element={<EnhancedResultsPage />} />
                      <Route path="/results/legacy" element={<ResultsPage />} />
                      
                      <Route path="/landing" element={<LandingPage />} />
                      
                      <Route path="/dashboard/*" element={
                        <ErrorBoundary>
                          <Suspense fallback={<LoadingFallback fullScreen message="Dashboard laden..." />}>
                            <DashboardPage />
                          </Suspense>
                        </ErrorBoundary>
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