/**
 * Navigation Service - Route helpers en navigatie utilities
 */

export interface NavigationState {
  currentPath: string;
  previousPath: string | null;
  isLoading: boolean;
}

export class NavigationService {
  private static instance: NavigationService;
  private state: NavigationState = {
    currentPath: '/',
    previousPath: null,
    isLoading: false
  };

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  updateState(updates: Partial<NavigationState>): void {
    this.state = { ...this.state, ...updates };
  }

  getState(): NavigationState {
    return { ...this.state };
  }

  getCurrentPath(): string {
    return this.state.currentPath;
  }

  getPreviousPath(): string | null {
    return this.state.previousPath;
  }

  setCurrentPath(path: string): void {
    this.updateState({
      previousPath: this.state.currentPath,
      currentPath: path
    });
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  isLoading(): boolean {
    return this.state.isLoading;
  }

  // Route helpers
  static routes = {
    home: '/',
    landing: '/landing',
    onboarding: '/onboarding',
    results: '/results',
    enhancedResults: '/enhanced-results',
    nova: '/nova',
    dashboard: '/dashboard',
    feed: '/feed',
    tribes: '/tribes',
    pricing: '/pricing',
    blog: '/blog',
    privacy: '/privacy',
    terms: '/terms',
    cookies: '/cookies',
    health: '/__health'
  } as const;

  static buildTribeUrl(slug: string): string {
    return `/tribes/${slug}`;
  }

  static buildBlogUrl(slug: string): string {
    return `/blog/${slug}`;
  }
}

export default NavigationService;