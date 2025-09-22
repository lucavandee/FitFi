import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { lazyAny } from '@/utils/lazyPage';
import { Helmet } from 'react-helmet-async';
import NavigationServiceInitializer from '@/components/NavigationServiceInitializer';
import Navbar from '@/components/layout/Navbar';
import NavigationServiceInitializer from '@/components/NavigationServiceInitializer';
import ScrollToTop from '@/components/ScrollToTop';
import ErrorBoundary from '@/components/ErrorBoundary';
import NavigationServiceInitializer from '@/components/NavigationServiceInitializer';

// Lazy loaded components - ONE declaration each
const CookieBanner = lazyAny(() => import('@/components/legal/CookieBanner'));
const AboutPage = lazyAny(() => import('@/pages/AboutPage'));
const AnalyticsPage = lazyAny(() => import('@/pages/AnalyticsPage'));
const BlogDetailPage = lazyAny(() => import('@/pages/BlogDetailPage'));
const BlogIndexPage = lazyAny(() => import('@/pages/BlogIndexPage'));
const BlogPage = lazyAny(() => import('@/pages/BlogPage'));
const BlogPostPage = lazyAny(() => import('@/pages/BlogPostPage'));
const BrandSafetyPage = lazyAny(() => import('@/pages/BrandSafetyPage'));
const ContactPage = lazyAny(() => import('@/pages/ContactPage'));
const CookiesPage = lazyAny(() => import('@/pages/CookiesPage'));
const DashboardPage = lazyAny(() => import('@/pages/DashboardPage'));
const DisclosurePage = lazyAny(() => import('@/pages/DisclosurePage'));
const DynamicOnboardingPage = lazyAny(() => import('@/pages/DynamicOnboardingPage'));
const DynamicResultsPage = lazyAny(() => import('@/pages/DynamicResultsPage'));
const EnhancedResultsPage = lazyAny(() => import('@/pages/EnhancedResultsPage'));
const FaqPage = lazyAny(() => import('@/pages/FaqPage'));
const FeedPage = lazyAny(() => import('@/pages/FeedPage'));
const FeedbackPage = lazyAny(() => import('@/pages/FeedbackPage'));
const ForgotPasswordPage = lazyAny(() => import('@/pages/ForgotPasswordPage'));
const GamificationPage = lazyAny(() => import('@/pages/GamificationPage'));
const GenderSelectPage = lazyAny(() => import('@/pages/GenderSelectPage'));
const HealthCheckPage = lazyAny(() => import('@/pages/HealthCheckPage'));
const HealthPage = lazyAny(() => import('@/pages/HealthPage'));
const HelpCenterPage = lazyAny(() => import('@/pages/HelpCenterPage'));
const HomePage = lazyAny(() => import('@/pages/HomePage'));
const HowItWorksPage = lazyAny(() => import('@/pages/HowItWorksPage'));
const LandingPage = lazyAny(() => import('@/pages/LandingPage'));
const LegalPage = lazyAny(() => import('@/pages/LegalPage'));
const OnboardingPage = lazyAny(() => import('@/pages/OnboardingPage'));
const OutfitsPage = lazyAny(() => import('@/pages/OutfitsPage'));
const PressPage = lazyAny(() => import('@/pages/PressPage'));
const PricingPage = lazyAny(() => import('@/pages/PricingPage'));
const PrivacyPage = lazyAny(() => import('@/pages/PrivacyPage'));
const PrivacyPolicyPage = lazyAny(() => import('@/pages/PrivacyPolicyPage'));
const ProductPage = lazyAny(() => import('@/pages/ProductPage'));
const ProfilePage = lazyAny(() => import('@/pages/ProfilePage'));
const QuizPage = lazyAny(() => import('@/pages/QuizPage'));
const RegisterPage = lazyAny(() => import('@/pages/RegisterPage'));
const ResetPasswordPage = lazyAny(() => import('@/pages/ResetPasswordPage'));
const ShopRedirect = lazyAny(() => import('@/pages/ShopRedirect'));
const SuccessStoriesPage = lazyAny(() => import('@/pages/SuccessStoriesPage'));
const SupportPage = lazyAny(() => import('@/pages/SupportPage'));
const TermsPage = lazyAny(() => import('@/pages/TermsPage'));
const ThankYouPage = lazyAny(() => import('@/pages/ThankYouPage'));
const TribeDetailPage = lazyAny(() => import('@/pages/TribeDetailPage'));
const TribesPage = lazyAny(() => import('@/pages/TribesPage'));

// 404 fallback
const NotFoundPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-4">Pagina niet gevonden</p>
      <a href="/" className="btn btn--primary">Terug naar home</a>
    </div>
  </div>
);

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationServiceInitializer />
      <ScrollToTop />
      
      <Helmet>
        <title>FitFi - AI Styling Platform</title>
        <meta name="description" content="Premium AI styling platform voor Nederland en Europa" />
      </Helmet>

      <div className="app-layout">
        <NavigationServiceInitializer />
        <Navbar />
        
        <main className="main-content">
          <Suspense fallback={<div className="loading-fallback">Loading...</div>}>
            <Routes>
              {/* Landing & Home */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<HomePage />} />
              
              {/* Onboarding & Quiz */}
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dynamic-onboarding" element={<DynamicOnboardingPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/gender-select" element={<GenderSelectPage />} />
              
              {/* Results - NEW ENHANCED PAGE */}
              <Route path="/results" element={<EnhancedResultsPage />} />
              <Route path="/dynamic-results" element={<DynamicResultsPage />} />
              <Route path="/outfits" element={<OutfitsPage />} />
              
              {/* User & Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              
              {/* Content */}
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog-index" element={<BlogIndexPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/blog-detail/:id" element={<BlogDetailPage />} />
              
              {/* Community */}
              <Route path="/tribes" element={<TribesPage />} />
              <Route path="/tribes/:id" element={<TribeDetailPage />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/gamification" element={<GamificationPage />} />
              
              {/* Info Pages */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/success-stories" element={<SuccessStoriesPage />} />
              <Route path="/press" element={<PressPage />} />
              
              {/* Support */}
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/help" element={<HelpCenterPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              
              {/* Legal */}
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/cookies" element={<CookiesPage />} />
              <Route path="/disclosure" element={<DisclosurePage />} />
              <Route path="/brand-safety" element={<BrandSafetyPage />} />
              
              {/* Utility */}
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="/shop-redirect" element={<ShopRedirect />} />
              <Route path="/product/:id" element={<ProductPage />} />
              
              {/* Health & Analytics */}
              <Route path="/__health" element={<HealthPage />} />
              <Route path="/health-check" element={<HealthCheckPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        
        <Footer />
      </div>
      <CookieBanner />
    </ErrorBoundary>
  );
}