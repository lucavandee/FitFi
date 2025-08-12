// Centraliseert alle dashboard-routes en deep links
export type NavTarget =
  | "results" | "outfits" | "quiz"
  | "challenge"
  | "tribe"
  | "feedCompose"
  | "referral";

type ChallengeRoute = { tribeId?: string; challengeId?: string };

export function routeTo(target: NavTarget, payload?: any): string {
  switch (target) {
    case "results": return "/results";            // pas aan indien anders
    case "outfits": return "/outfits";            // bestaand pad
    case "quiz":    return "/quiz";
    case "feedCompose": return "/feed?compose=1";
    case "referral": return "/dashboard?ref=1";
    case "tribe":     return payload?.tribeId ? `/tribes/${payload.tribeId}` : "/tribes";
    case "challenge": {
      const p = (payload ?? {}) as ChallengeRoute;
      if (p.tribeId && p.challengeId) return `/tribes/${p.tribeId}?challengeId=${p.challengeId}`;
      if (p.challengeId) return `/tribes?challengeId=${p.challengeId}`;
      return "/tribes?filter=open"; // graceful fallback
    }
    default: return "/";
  }
}

/**
 * Enhanced NavigationService with analytics and loading states
 */
export class NavigationService {
  private static instance: NavigationService;
  
  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  /**
   * Navigate with analytics tracking
   */
  navigateWithTracking(
    target: NavTarget, 
    payload?: any,
    analytics?: {
      source: string;
      context?: Record<string, any>;
    }
  ): void {
    const route = routeTo(target, payload);
    
    // Track navigation event
    if (analytics && typeof window.gtag === 'function') {
      window.gtag('event', 'dashboard_navigation', {
        event_category: 'navigation',
        event_label: target,
        source: analytics.source,
        target_route: route,
        ...analytics.context
      });
    }
    
    // Perform navigation
    window.location.href = route;
  }

  /**
   * Get route for target without navigating
   */
  getRoute(target: NavTarget, payload?: any): string {
    return routeTo(target, payload);
  }

  /**
   * Check if current route matches target
   */
  isCurrentRoute(target: NavTarget, payload?: any): boolean {
    const targetRoute = routeTo(target, payload);
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentFull = currentPath + currentSearch;
    
    return currentFull === targetRoute || currentPath === targetRoute;
  }

  /**
   * Navigate to NBA action with context
   */
  executeNBAAction(
    actionId: string,
    target: NavTarget,
    payload?: any,
    context?: Record<string, any>
  ): void {
    this.navigateWithTracking(target, payload, {
      source: 'nba_quick_actions',
      context: {
        action_id: actionId,
        ...context
      }
    });
  }
}

// Export singleton instance
export const navigationService = NavigationService.getInstance();

/**
 * React hook for navigation service
 */
export const useNavigationService = () => {
  return navigationService;
};

/**
 * Route validation helpers
 */
export const RouteValidators = {
  isValidTribeId: (id: string): boolean => {
    return typeof id === 'string' && id.length > 0 && id.startsWith('tribe-');
  },
  
  isValidChallengeId: (id: string): boolean => {
    return typeof id === 'string' && id.length > 0 && id.startsWith('challenge-');
  },
  
  isValidUserId: (id: string): boolean => {
    return typeof id === 'string' && id.length > 0;
  }
};

/**
 * Deep link builders for specific use cases
 */
export const DeepLinks = {
  /**
   * Build challenge participation link
   */
  challengeParticipation: (tribeId: string, challengeId: string): string => {
    return routeTo('challenge', { tribeId, challengeId });
  },
  
  /**
   * Build tribe join link with referral tracking
   */
  tribeJoin: (tribeId: string, referralCode?: string): string => {
    const baseRoute = routeTo('tribe', { tribeId });
    return referralCode ? `${baseRoute}?ref=${referralCode}` : baseRoute;
  },
  
  /**
   * Build feed compose link with pre-filled content
   */
  feedCompose: (prefilledText?: string): string => {
    const baseRoute = routeTo('feedCompose');
    return prefilledText ? `${baseRoute}&text=${encodeURIComponent(prefilledText)}` : baseRoute;
  },
  
  /**
   * Build referral sharing link
   */
  referralShare: (userId: string, campaign?: string): string => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    params.set('ref', userId);
    if (campaign) params.set('campaign', campaign);
    return `${baseUrl}/?${params.toString()}`;
  }
};

/**
 * Route constants for consistency
 */
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  RESULTS: '/results',
  OUTFITS: '/outfits',
  QUIZ: '/quiz',
  TRIBES: '/tribes',
  FEED: '/feed',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP: '/help'
} as const;

/**
 * Navigation breadcrumbs helper
 */
export const getBreadcrumbs = (currentPath: string): Array<{ label: string; href: string }> => {
  const segments = currentPath.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Dashboard', href: ROUTES.DASHBOARD }];
  
  let currentHref = '';
  segments.forEach((segment, index) => {
    currentHref += `/${segment}`;
    
    // Skip the first segment if it's already dashboard
    if (segment === 'dashboard') return;
    
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    breadcrumbs.push({ label, href: currentHref });
  });
  
  return breadcrumbs;
};