module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4173',
        'http://localhost:4173/home',
        'http://localhost:4173/prijzen',
        'http://localhost:4173/over-ons',
        'http://localhost:4173/contact'
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop'
      }
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.90 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // Best practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'warn',
        
        // SEO
        'document-title': 'error',
        'meta-description': 'error',
        'robots-txt': 'warn',
        'canonical': 'warn'
      }
    },
    upload: {
      target: 'temporary-public-storage',
      reportFilenamePattern: 'lighthouse-report-%%PATHNAME%%-%%DATETIME%%.json'
    },
    server: {
      port: 4173,
      host: 'localhost'
    }
  }
};