#!/usr/bin/env node

/**
 * Route Sanity Check
 * Verifies all routes are properly configured and accessible
 */

const fs = require('fs');
const path = require('path');

// Define expected routes
const expectedRoutes = [
  '/',
  '/waarom-fitfi',
  '/hoe-het-werkt', 
  '/prijzen',
  '/blog',
  '/privacy',
  '/faq',
  '/outfits',
  '/inloggen',
  '/registreren',
  '/dashboard',
  '/results'
];

// Define route files that should exist
const expectedPageFiles = [
  'src/pages/LandingPage.tsx',
  'src/pages/WhyFitFiPage.tsx',
  'src/pages/HowItWorksPage.tsx',
  'src/pages/PricingPage.tsx',
  'src/pages/BlogPage.tsx',
  'src/pages/PrivacyPage.tsx',
  'src/pages/FaqPage.tsx',
  'src/pages/OutfitsPage.tsx',
  'src/pages/LoginPage.tsx',
  'src/pages/RegisterPage.tsx',
  'src/pages/DashboardPage.tsx',
  'src/pages/ResultsPage.tsx'
];

console.log('🧪 Running route sanity checks...\n');

let hasErrors = false;

// Check if page files exist
console.log('📄 Checking page files...');
expectedPageFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${filePath}`);
  } else {
    console.log(`❌ Missing: ${filePath}`);
    hasErrors = true;
  }
});

// Check App.tsx for route definitions
console.log('\n🛣️  Checking App.tsx route definitions...');
const appTsxPath = 'src/App.tsx';
if (fs.existsSync(appTsxPath)) {
  const appContent = fs.readFileSync(appTsxPath, 'utf8');
  
  expectedRoutes.forEach(route => {
    // Check for route definition (path="route" or path="/route")
    const routePattern = new RegExp(`path=["']${route}["']`, 'g');
    if (appContent.match(routePattern)) {
      console.log(`✅ Route defined: ${route}`);
    } else {
      console.log(`❌ Route missing: ${route}`);
      hasErrors = true;
    }
  });
} else {
  console.log('❌ App.tsx not found');
  hasErrors = true;
}

// Check Navbar for navigation links
console.log('\n🧭 Checking Navbar links...');
const navbarPath = 'src/components/layout/Navbar.tsx';
if (fs.existsSync(navbarPath)) {
  const navContent = fs.readFileSync(navbarPath, 'utf8');
  
  const navRoutes = ['/waarom-fitfi', '/hoe-het-werkt', '/prijzen', '/blog', '/outfits'];
  navRoutes.forEach(route => {
    if (navContent.includes(route)) {
      console.log(`✅ Nav link: ${route}`);
    } else {
      console.log(`⚠️  Nav link missing: ${route}`);
    }
  });
} else {
  console.log('❌ Navbar.tsx not found');
  hasErrors = true;
}

// Check Footer for links
console.log('\n🦶 Checking Footer links...');
const footerPath = 'src/components/layout/Footer.tsx';
if (fs.existsSync(footerPath)) {
  const footerContent = fs.readFileSync(footerPath, 'utf8');
  
  const footerRoutes = ['/privacy', '/faq'];
  footerRoutes.forEach(route => {
    if (footerContent.includes(route)) {
      console.log(`✅ Footer link: ${route}`);
    } else {
      console.log(`⚠️  Footer link missing: ${route}`);
    }
  });
} else {
  console.log('❌ Footer.tsx not found');
  hasErrors = true;
}

// Summary
console.log('\n📊 Route Sanity Check Summary:');
if (hasErrors) {
  console.log('❌ Some routes or files are missing!');
  process.exit(1);
} else {
  console.log('✅ All routes and navigation links are properly configured!');
  process.exit(0);
}