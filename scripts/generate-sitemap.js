#!/usr/bin/env node

/**
 * Generate sitemap.xml for FitFi
 * Includes all public routes with proper priority and changefreq
 */

const fs = require('fs');
const path = require('path');

// Define all public routes with metadata
const routes = [
  { url: '/', priority: '1.0', changefreq: 'weekly' },
  { url: '/home', priority: '0.9', changefreq: 'weekly' },
  { url: '/over-ons', priority: '0.8', changefreq: 'monthly' },
  { url: '/hoe-het-werkt', priority: '0.9', changefreq: 'monthly' },
  { url: '/prijzen', priority: '0.9', changefreq: 'weekly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  { url: '/contact', priority: '0.7', changefreq: 'monthly' },
  { url: '/veelgestelde-vragen', priority: '0.7', changefreq: 'monthly' },
  { url: '/faq', priority: '0.7', changefreq: 'monthly' },
  { url: '/juridisch', priority: '0.6', changefreq: 'yearly' },
  { url: '/privacy-policy', priority: '0.6', changefreq: 'yearly' },
  { url: '/algemene-voorwaarden', priority: '0.6', changefreq: 'yearly' },
  { url: '/ondersteuning', priority: '0.7', changefreq: 'monthly' },
  { url: '/help', priority: '0.7', changefreq: 'monthly' },
  { url: '/feedback', priority: '0.6', changefreq: 'monthly' },
  { url: '/succesverhalen', priority: '0.7', changefreq: 'weekly' },
  { url: '/inloggen', priority: '0.5', changefreq: 'yearly' },
  { url: '/registreren', priority: '0.8', changefreq: 'yearly' },
  { url: '/wachtwoord-vergeten', priority: '0.3', changefreq: 'yearly' },
  
  // Blog posts (example - in real app these would be dynamic)
  { url: '/blog/psychologie-achter-kledingkeuzes', priority: '0.6', changefreq: 'monthly' },
  { url: '/blog/stijlregels-breken-2025', priority: '0.6', changefreq: 'monthly' },
  { url: '/blog/capsule-wardrobe-gids', priority: '0.6', changefreq: 'monthly' },
  { url: '/blog/kleuranalyse-perfecte-palet', priority: '0.6', changefreq: 'monthly' },
  { url: '/blog/duurzame-mode-gids', priority: '0.6', changefreq: 'monthly' },
  { url: '/blog/body-positivity-stijl', priority: '0.6', changefreq: 'monthly' }
];

const baseUrl = 'https://fitfi.ai';
const currentDate = new Date().toISOString().split('T')[0];

// Generate XML sitemap
const generateSitemap = () => {
  const urlElements = routes.map(route => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  return sitemap;
};

// Write sitemap to public directory
const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml');
const sitemapContent = generateSitemap();

fs.writeFileSync(outputPath, sitemapContent, 'utf8');

console.log(`✅ Sitemap generated with ${routes.length} URLs`);
console.log(`📍 Written to: ${outputPath}`);
console.log(`🔗 Validate at: https://www.xml-sitemaps.com/validate-xml-sitemap.html`);

// Validate sitemap structure
const urlCount = (sitemapContent.match(/<url>/g) || []).length;
if (urlCount !== routes.length) {
  console.error(`❌ URL count mismatch: expected ${routes.length}, got ${urlCount}`);
  process.exit(1);
}

console.log(`✅ Sitemap validation passed: ${urlCount} URLs`);