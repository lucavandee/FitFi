      </Helmet>
      <Navbar />
      <ErrorBoundary>
        <main id="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/blog" element={<BlogPage />} />
            
            {/* Over ons */}
            <Route path="/over-ons" element={<AboutPage />} />
            
            {/* Legal pages */}
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            
            {/* Health check */}
            <Route path="/__health" element={<HealthPage />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </ErrorBoundary>
      <Footer />
    </>
      <Helmet>
        <title>FitFi - AI Styling Platform</title>
      <a href="#main-content" className="skip-link">Naar hoofdinhoud</a>
        <meta name="description" content="Premium AI styling platform voor Nederland en Europa" />
    <>