export const NAV_ITEMS = [
  { href: '/',              label: 'Home' },
  { href: '/over-ons',      label: 'Waarom FitFi' },
  { href: '/hoe-het-werkt', label: 'Hoe het werkt' },
  { href: '/prijzen',       label: 'Prijzen' },
  { href: '/outfits',       label: 'Outfits' },
  { href: '/blog',          label: 'Blog' },
  { href: '/inloggen',      label: 'Inloggen' }
];

// Export as both named and default to prevent any tree-shaking issues
export default NAV_ITEMS;

// Debug helper for production verification
export const getNavItemsCount = () => NAV_ITEMS.length;

// Log for production debugging
console.log('[NAV DEBUG] Static nav items loaded:', NAV_ITEMS.length);