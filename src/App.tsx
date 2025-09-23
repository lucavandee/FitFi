// Robuuste lazy helper (géén duplicaten elders in het bestand!)
function lazyAny<T extends { default: React.ComponentType<any> }>(
  factory: () => Promise<T>
) {
  return React.lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      console.error("Lazy import failed:", err);
      // Simpele fallback-component ipv witte pagina:
      return {
        default: () => (
          <main className="ff-section">
            <div className="ff-container">
              <h1>Kon pagina niet laden</h1>
              <p className="muted">Probeer te verversen of kom later terug.</p>
            </div>
          </main>
        ),
      } as unknown as T;
    }
  });
}

// ÉÉN declaratie per page (en niet nog eens verderop):
const HomePage = lazyAny(() => import('@/pages/HomePage'));
const QuizPage = lazyAny(() => import('@/pages/QuizPage'));
const ResultsPage = lazyAny(() => import('@/pages/ResultsPage'));
const EnhancedResultsPage = lazyAny(() => import('@/pages/EnhancedResultsPage'));
const BlogPage = lazyAny(() => import('@/pages/BlogPage'));
const PricingPage = lazyAny(() => import('@/pages/PricingPage'));
const HowItWorksPage = lazyAny(() => import('@/pages/HowItWorksPage'));
const FAQPage = lazyAny(() => import('@/pages/FAQPage'));
const AboutPage = lazyAny(() => import('@/pages/AboutPage'));
const ContactPage = lazyAny(() => import('@/pages/ContactPage'));
const LegalPage = lazyAny(() => import('@/pages/LegalPage'));
const PrivacyPage = lazyAny(() => import('@/pages/PrivacyPage'));
const TermsPage = lazyAny(() => import('@/pages/TermsPage'));
const CookiesPage = lazyAny(() => import('@/pages/CookiesPage'));
const NotFoundPage = lazyAny(() => import('@/pages/NotFoundPage'));
const HealthPage = lazyAny(() => import('@/pages/HealthPage'));
const EnhancedResults    = lazy(() => import("@/pages/EnhancedResultsPage"));

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* HEADER — één keer, bovenaan */}
      <Navbar />

      {/* MAIN CONTENT */}
      <ErrorBoundary>
        <Suspense fallback={<div />}>
          <main id="main" className="flex-1">
            <Routes>
              {/* Home / Landing */}
              <Route index element={<LandingPage />} />

              {/* Hoe het werkt */}
              <Route path="/hoe-het-werkt" element={<HowItWorksPage />} />

              {/* Prijzen */}
              <Route path="/prijzen" element={<PricingPage />} />

              {/* Blog */}
              <Route path="/blog" element={<BlogPage />} />

              {/* Over ons */}
              <Route path="/over-ons" element={<AboutPage />} />

              {/* FAQ: live slug is /veelgestelde-vragen. We ondersteunen beide. */}
              <Route path="/veelgestelde-vragen" element={<FAQPage />} />
              <Route path="/faq" element={<Navigate to="/veelgestelde-vragen" replace />} />

              {/* Results */}
              <Route path="/results" element={<EnhancedResults />} />

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </Suspense>
      </ErrorBoundary>

      {/* FOOTER — één keer, onderaan */}
      <Footer />

      {/* Globale modals/banners die overal mogen verschijnen */}
      <CookieBanner />
    </div>
  );
}