# Changelog

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