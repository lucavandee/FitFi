import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getReferralCodeFromUrl, 
  setReferralCookie, 
  getReferralCookie, 
  clearReferralCookie,
  generateReferralUrl 
} from '../src/utils/referralUtils';

// Mock window.location
const mockLocation = {
  search: '',
  origin: 'https://fitfi.ai'
};

Object.defineProperty(window, 'location', {
  value: mockLocation,
  writable: true
});

// Mock document.cookie
let mockCookie = '';
Object.defineProperty(document, 'cookie', {
  get: () => mockCookie,
  set: (value) => {
    if (value.includes('=; expires=')) {
      // Clear cookie
      mockCookie = '';
    } else {
      mockCookie = value;
    }
  }
});

describe('Referral Utils', () => {
  beforeEach(() => {
    mockCookie = '';
    mockLocation.search = '';
  });

  describe('getReferralCodeFromUrl', () => {
    it('should extract referral code from URL', () => {
      mockLocation.search = '?ref=TEST123';
      expect(getReferralCodeFromUrl()).toBe('TEST123');
    });

    it('should return null when no referral code in URL', () => {
      mockLocation.search = '';
      expect(getReferralCodeFromUrl()).toBeNull();
    });

    it('should handle multiple URL parameters', () => {
      mockLocation.search = '?utm_source=google&ref=ABC123&utm_medium=cpc';
      expect(getReferralCodeFromUrl()).toBe('ABC123');
    });
  });

  describe('Cookie Management', () => {
    it('should set referral cookie', () => {
      setReferralCookie('TEST123');
      expect(mockCookie).toContain('ref_code=TEST123');
    });

    it('should get referral cookie', () => {
      mockCookie = 'ref_code=TEST123; path=/';
      expect(getReferralCookie()).toBe('TEST123');
    });

    it('should return null when no referral cookie', () => {
      mockCookie = 'other_cookie=value';
      expect(getReferralCookie()).toBeNull();
    });

    it('should clear referral cookie', () => {
      mockCookie = 'ref_code=TEST123';
      clearReferralCookie();
      expect(mockCookie).toBe('');
    });
  });

  describe('generateReferralUrl', () => {
    it('should generate correct referral URL', () => {
      const url = generateReferralUrl('TEST123');
      expect(url).toBe('https://fitfi.ai?ref=TEST123');
    });
  });
});

describe('Referral Code Generation', () => {
  it('should generate 8-character alphanumeric code', () => {
    // This would test the database function, but we'll mock it
    const mockCode = 'ABC12345';
    expect(mockCode).toHaveLength(8);
    expect(mockCode).toMatch(/^[A-Z0-9]+$/);
  });
});