import { supabase } from '@/lib/supabase';

export interface AnalyticsEvent {
  user_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  session_id?: string;
  page_url?: string;
}

export interface FunnelStep {
  funnel_id: string;
  user_id?: string;
  session_id: string;
  step_id: string;
  step_name: string;
  completed: boolean;
  timestamp: number;
  time_spent?: number;
  exit_point?: boolean;
  conversion_value?: number;
  metadata?: Record<string, any>;
}

export interface HeatmapData {
  page_url: string;
  element_selector: string;
  click_count?: number;
  hover_count?: number;
  scroll_depth?: number;
  viewport_size?: string;
  device_type?: 'mobile' | 'tablet' | 'desktop';
  timestamp: number;
  user_id?: string;
  session_id: string;
}

export class AdvancedAnalytics {
  private sessionId: string;
  private userId?: string;

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId();
    this.userId = userId;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackEvent(event: Omit<AnalyticsEvent, 'session_id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          ...event,
          session_id: this.sessionId,
          user_id: this.userId || event.user_id
        });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  async trackFunnelStep(step: Omit<FunnelStep, 'session_id' | 'user_id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('funnel_analytics')
        .insert({
          ...step,
          session_id: this.sessionId,
          user_id: this.userId
        });

      if (error) {
        console.error('Funnel tracking error:', error);
      }
    } catch (error) {
      console.error('Failed to track funnel step:', error);
    }
  }

  async trackHeatmapData(data: Omit<HeatmapData, 'session_id' | 'user_id'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('heatmap_data')
        .insert({
          ...data,
          session_id: this.sessionId,
          user_id: this.userId
        });

      if (error) {
        console.error('Heatmap tracking error:', error);
      }
    } catch (error) {
      console.error('Failed to track heatmap data:', error);
    }
  }

  async getAnalyticsSummary(timeRange: 'day' | 'week' | 'month' = 'week') {
    try {
      const startDate = new Date();
      switch (timeRange) {
        case 'day':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
      }

      const { data, error } = await supabase
        .from('analytics_events')
        .select('event_type, event_data, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Analytics summary error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get analytics summary:', error);
      return null;
    }
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

export const analytics = new AdvancedAnalytics();