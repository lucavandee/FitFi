import {
  event as gaEvent,
  pageview as gaPageview,
  exception as gaException,
} from "@/utils/analytics";

type Params = Record<string, any>;

export class AdvancedAnalytics {
  private enabled: boolean;
  private userId: string | null = null;
  private context: Params = {};
  private queue: Array<{ name: string; params: Params }> = [];
  private flushTimer: number | null = null;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  /** Zet tracking aan (no-op als al aan) */
  startTracking() {
    this.enabled = true;
  }

  /** Zet tracking uit (events worden genegeerd) */
  stopTracking() {
    this.enabled = false;
  }

  /** Koppel een (anonieme) gebruiker voor consistente payloads */
  identify(userId?: string | null) {
    this.userId = userId ?? null;
  }

  /** Voeg globale context toe (samengevoegd met event-params) */
  setContext(ctx: Params) {
    this.context = { /* placeholder removed */this.context, /* placeholder removed */ctx };
  }

  /** Track een custom event (stuurt naar gtag als beschikbaar) */
  track(name: string, params: Params = {}) {
    if (!this.enabled) return;
    const payload = {
      user_id: this.userId ?? "guest",
      /* placeholder removed */this.context,
      /* placeholder removed */params,
    };
    try {
      gaEvent(name, payload);
    } catch {
      // queue voor eventuele future server-side sync (nu niet gebruikt)
      this.queue.push({ name, params: payload });
    }
  }

  /** Alias voor track */
  trackEvent(name: string, params: Params = {}) {
    this.track(name, params);
  }

  /** Pageview helper */
  page(path: string, params: Params = {}) {
    if (!this.enabled) return;
    try {
      gaPageview(path, { user_id: this.userId ?? "guest", /* placeholder removed */params });
    } catch {
      /* no-op */
    }
  }

  /** Error helper */
  error(description: string, fatal = false) {
    if (!this.enabled) return;
    try {
      gaException(description, fatal);
    } catch {
      /* no-op */
    }
  }

  /** (Voor later) verstuur gebufferde events naar backend */
  flush() {
    this.queue = [];
    if (this.flushTimer) {
      // @ts-ignore
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  // Predictive analytics
  async predictChurnRisk(userId: string): Promise<number> {
    const userBehavior = await this.getUserBehavior(userId);
    // Simple churn prediction based on engagement
    const daysSinceLastActivity = (Date.now() - userBehavior.lastActivity) / (1000 * 60 * 60 * 24);
    return Math.min(daysSinceLastActivity / 30, 1); // 0-1 scale
  }

  async predictPurchaseIntent(userId: string): Promise<number> {
    const behavior = await this.getUserBehavior(userId);
    // Simple purchase intent based on outfit saves and views
    const intentScore = (behavior.outfitSaves * 0.4) + (behavior.outfitViews * 0.1);
    return Math.min(intentScore / 10, 1); // Normalize to 0-1
  }

  private generateInsight(metric: string, value: number, trend: 'up' | 'down' | 'stable'): string {
    const trendEmoji = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
    return `${trendEmoji} ${metric}: ${value} (${trend})`;
  }
}

// Feature-flag (optioneel): zet uit met VITE_ADVANCED_ANALYTICS=false
const ADV_ENABLED =
  (import.meta.env.VITE_ADVANCED_ANALYTICS ?? "true")
    .toString()
    .toLowerCase() !== "false";

/** ▶ Named export die elders verwacht wordt */
export const advancedAnalytics = new AdvancedAnalytics(ADV_ENABLED);

/** ▶ Default export tbv. `import analytics from /* placeholder removed */` */
export default advancedAnalytics;