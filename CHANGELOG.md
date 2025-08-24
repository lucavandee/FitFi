# Changelog

## [1.7.0] - 2025-01-28

### Tribes Upgrade - Level 1000

- Complete Tribes functionality with Supabase + local JSON fallback
- Added enterprise-grade data service layer for tribes
- Implemented useTribes, useTribeBySlug, useTribePosts hooks
- Enhanced UI/UX to Apple-meets-Lululemon design standards
- Added comprehensive tribe filtering (archetype, featured, search)
- Implemented mock post creation, liking, and commenting
- Added real-time data source indicators for development
- Zero-error guarantee: tribes load from local JSON when Supabase unavailable
- Mobile-first responsive design with smooth animations
- Ready for AI-challenges, rankings, and tribe insights

### Technical Improvements

- Extended dataConfig with tribes tables and endpoints
- Added comprehensive Tribe, TribePost, TribeMember types
- Implemented fallback chain: Supabase → Local JSON → Empty state
- Enhanced error handling with graceful degradation
- Added caching layer for optimal performance
- Maintained existing project structure and @/ path aliases

## [1.6.1] - 2025-01-28

### Data Service Layer (no scrapers)

- Added config-driven data layer with Supabase priority and local JSON fallback
- Introduced Affiliate Link Builder with UTM support for all product links
- Added typed hooks: useProducts, useOutfits, useFitFiUser for unified data access
- Non-breaking refactor: components now consume unified hooks with same data format
- Enhanced error handling with graceful degradation to local JSON files
- Added comprehensive caching layer with TTL and automatic cleanup
- Implemented source tracking (Supabase/local/fallback) for debugging
- Added health monitoring and cache statistics for production observability

### Configuration

- Added VITE_USE_SUPABASE environment variable (defaults to false)
- Enhanced .env.example with data service configuration options
- Zero-error guarantee: app loads with local JSON when Supabase unavailable

## [1.6.0] - 2025-01-28

### Added

- Complete affiliate partnership collateral package
- Media kit in English and Dutch with audience personas and traffic projections
- 10-slide pitch deck covering problem, solution, market size, and business model
- Comprehensive API documentation for /api/v1/products endpoint
- Demo video production guide with 30-second script and compliance requirements
- Partnership-ready materials for Awin, Zalando & Bijenkorf applications

### Documentation

- Added /docs/affiliate-pack/ directory with all partnership materials

## [1.5.2] - 2025-01-28

### Fixed

- FOUC (Flash of Unstyled Content) door CSS preload en early loading
- Service Worker runtime errors door complete SW removal
- Reduced bundle size door cleanup van unused PWA dependencies

### Removed

- Service Worker registration en gerelateerde bestanden
- vite-plugin-pwa en workbox-window dependencies
- Problematic SW code uit main.tsx

### Added

- Route testing script (`npm run test:routes`)
- CI integration voor route validation

## [1.2.1] - 2025-01-28

### Fixed

- Fix PostCSS error – main.css cleanup
- Removed all custom CSS causing PostCSS compilation failures
- Added stylelint guard to prevent future main.css bloat
- Ensured main.css contains exactly 4 essential lines only

### Added

- Stylelint configuration to enforce max 4 lines in main.css
- Build verification to catch PostCSS errors early

## [1.2.4] - 2025-01-28

### Fixed

- Fixed Netlify build by removing Python dependencies from frontend build
- Separated Python backend completely from frontend deployment
- Updated .gitignore to exclude Python files from frontend builds
- Simplified requirements.txt to only essential scraping dependencies

### Changed

- Python backend now completely separate from frontend deployment
- Netlify builds only frontend assets, no Python compilation needed
- Cleaner separation of concerns between frontend and backend

## [1.2.4] - 2025-01-28

### Fixed

- Fixed Netlify build by removing Python dependencies from frontend build
- Separated Python backend completely from frontend deployment
- Updated .gitignore to exclude Python files from frontend builds
- Simplified requirements.txt to only essential scraping dependencies

### Changed

- Python backend now completely separate from frontend deployment
- Netlify builds only frontend assets, no Python compilation needed
- Cleaner separation of concerns between frontend and backend

## [1.2.3] - 2025-01-28

### Fixed

- Fixed Python build errors caused by Cython version conflicts
- Updated scikit-learn to >=1.4.0 for better Cython 3.x compatibility
- Added proper build dependencies (build-essential, python3-dev)
- Upgraded TensorFlow and PyTorch to latest compatible versions
- Added comprehensive Python build CI pipeline

### Added

- Dockerfile for Python backend with proper build environment
- Installation script (backend/install.sh) for local development
- GitHub Actions workflow for Python dependency testing
- Security scanning with safety for Python dependencies
- Multi-Python version testing (3.9, 3.10, 3.11)

## [1.2.2] - 2025-01-28

### Added

- Axe-core accessibility testing with Playwright
- WCAG-AA compliance validation for home page
- Automated a11y testing in CI pipeline
- npm run test:a11y script for local testing

## [1.2.1] - 2025-01-28

### Fixed

- Fix PostCSS error – main.css cleanup
- Removed all custom CSS causing PostCSS compilation failures
- Added stylelint guard to prevent future main.css bloat
- Ensured main.css contains exactly 4 essential lines only

### Added

- Stylelint configuration to enforce max 4 lines in main.css
- Build verification to catch PostCSS errors early

## [1.2.0] - 2025-01-28

### Fixed

- Cleaned up main.css to use proper Tailwind imports with Google Fonts
- Moved all Python scraper files from src/ to backend/scrapers/ for proper separation
- Updated tsconfig.json and vite.config.ts to exclude backend directory from frontend build
- Resolved build errors caused by Python files in frontend source directory

### Added

- CSS custom properties for FitFi color palette consistency
- Backend/scrapers directory structure with README
- Proper font loading with Inter and Space Grotesk from Google Fonts

### Changed

- Improved build configuration to prevent Python files from interfering with frontend build
- Enhanced file system restrictions in Vite config for better security

## [1.1.0] - 2025-06-26

### Fixed

- Fixed broken image issues by adding proper placeholder images for gender selection and general fallbacks
- Added proper icon-144x144.png for PWA manifest
- Updated ImageWithFallback component to handle relative URLs correctly
- Fixed Supabase integration issues with proper UUID validation and error handling
- Added missing seasonal_event_progress column to user_gamification table
- Improved error handling in GamificationContext to prevent infinite loading
- Enhanced image validation in imageUtils.ts to properly handle relative paths

### Added

- Added comprehensive error handling for all Supabase operations
- Added fallback mechanisms for when Supabase is unavailable
- Added proper validation for all user IDs before database operations
- Added retry logic for failed API requests

### Changed

- Updated supabaseService.ts to use executeWithRetry for all database operations
- Improved GamificationContext to handle missing database fields
- Enhanced image components to provide better fallbacks and error states
- Updated all gender image files with proper content
