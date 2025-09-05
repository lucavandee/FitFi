export type NavigationState = {
  path: string;
  params?: Record<string, string>;
  history: string[];
};

type Listener = (state: NavigationState) => void;

export class NavigationService {
  private state: NavigationState = {
    path: typeof window !== "undefined" ? window.location.pathname : "/",
    params: {},
    history: [],
  };

  private listeners = new Set<Listener>();

  subscribe(cb: Listener) {
    this.listeners.add(cb);
    // push huidige state direct naar de subscriber
    cb(this.state);
    return () => this.listeners.delete(cb);
  }

  getState(): NavigationState {
    return this.state;
  }

  /** Programmatic navigation; registreert pad + history + notificeert listeners */
  navigate(path: string, params: Record<string, string> = {}) {
    if (typeof window !== "undefined" && window.history?.pushState) {
      window.history.pushState({}, "", path);
    }
    this.updateState({
      path,
      params,
      history: [/* placeholder removed */this.state.history, path],
    });
  }

  /** Vrije setState met partial updates; merge met bestaande state */
  setState(updates: Partial<NavigationState>) {
    this.updateState(updates);
  }

  /** Interne merge + notify */
  private updateState(updates: Partial<NavigationState>) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const navigationService = new NavigationService();