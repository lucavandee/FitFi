import { describe, it, expect } from 'vitest';
import { NAV_ITEMS } from '../../src/constants/nav';

describe('Navigation Items', () => {
  it('should have at least 8 navigation items', () => {
    expect(NAV_ITEMS.length).toBeGreaterThanOrEqual(8);
  });

  it('should have required navigation items', () => {
    const requiredItems = [
      'Home',
      'Waarom FitFi',
      'Hoe het werkt', 
      'Prijzen',
      'Aanbevelingen',
      'Outfits',
      'Blog',
      'Inloggen'
    ];

    const itemLabels = NAV_ITEMS.map(item => item.label);
    
    requiredItems.forEach(required => {
      expect(itemLabels).toContain(required);
    });
  });

  it('should have valid href paths', () => {
    NAV_ITEMS.forEach(item => {
      expect(item.href).toMatch(/^\/[a-z-]*$/);
      expect(item.label).toBeTruthy();
    });
  });

  it('should export NAV_ITEMS as default', () => {
    expect(NAV_ITEMS).toBeDefined();
    expect(Array.isArray(NAV_ITEMS)).toBe(true);
  });
});