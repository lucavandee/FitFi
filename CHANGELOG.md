# Changelog

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