/**
 * Advanced Analytics Service
 * Comprehensive analytics with funnel tracking, heatmaps, and predictive AI
 */

import { supabase } from '../lib/supabase';
import { trackEvent } from '../utils/analytics';
import { 
  FunnelStep, 
  FunnelAnalytics, 
  HeatmapData, 
  SessionRecording, 
  SessionEvent,
  PredictiveModel,
  ConversionOptimization,
  AnalyticsDashboardData,
  DeviceInfo
} from '../types/analytics';

class AdvancedAnalytics {
  private sessionId: string;
  private userId?: string;
  private sessionStartTime: number;
  private currentPage: string;
  private sessionEvents: SessionEvent[] = [];
  private heatmapData: Map<string, HeatmapData> = new Map();
  private isTracking: boolean = false;
  private predictiveModel?: PredictiveModel;

  // Funnel definitions
  private funnels = {
    onboarding: [
      { id: 'landing', name: 'Landing Page', page: '/', event: 'page_view', required: true, order: 1 },
      { id: 'signup', name: 'Sign Up', page: '/registreren', event: 'sign_up', required: true, order: 2 },
      { id: 'quiz_start', name: 'Quiz Start', page: '/quiz', event: 'quiz_start', required: true, order: 3 },
      { id: 'quiz_complete', name: 'Quiz Complete', page: '/quiz', event: 'quiz_complete', required: true, order: 4 },
      { id: 'results_view', name: 'Results View', page: '/results', event: 'results_view', required: true, order: 5 }
    ],
    purchase: [
      { id: 'results_view', name: 'Results View', page: '/results', event: 'results_view', required: true, order: 1 },
      { id: 'product_click', name: 'Product Click', page: '/results', event: 'product_click', required: true, order: 2 },
      { id: 'external_redirect', name: 'External Redirect', page: '/results', event: 'external_redirect', required: true, order: 3 },
      { id: 'purchase_intent', name: 'Purchase Intent', page: 'external', event: 'purchase_intent', required: false, order: 4 }
    ],
    engagement: [
      { id: 'first_visit', name: 'First Visit', page: '/', event: 'page_view', required: true, order: 1 },
      { id: 'content_engagement', name: 'Content Engagement', page: 'any', event: 'scroll_depth_50', required: true, order: 2 },
      { id: 'feature_interaction', name: 'Feature Interaction', page: 'any', event: 'feature_click', required: true, order: 3 },
      { id: 'return_visit', name: 'Return Visit', page: 'any', event: 'return_visit', required: false, order: 4 }
    ]
  };

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId();
    this.userId = userId;
    this.sessionStartTime = Date.now();
    this.currentPage = window.location.pathname;
    
    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    this.isTracking = true;
    this.setupEventListeners();
    this.startSessionRecording();
    this.initializeHeatmapTracking();
    
    // Track session start
    trackEvent('session_start', 'engagement', 'analytics', 1, {
      session_id: this.sessionId,
      user_id: this.userId,
      page: this.currentPage
    });
  }

  private setupEventListeners = (): void => {
    // Initialize event listeners for tracking
    this.initializeHeatmapTracking();
  };

  /**
   * Funnel Analytics Implementation
   */
  async trackFunnelStep(funnelType: keyof typeof this.funnels, stepId: string, metadata: Record<string, any> = {}): Promise<void> {
    const funnel = this.funnels[funnelType];
    const step = funnel.find(s => s.id === stepId);
    
    if (!step) {
      console.warn(`Unknown funnel step: ${stepId} in ${funnelType}`);
      return;
    }

    const funnelData: FunnelAnalytics = {
      funnel_id: funnelType,
      user_id: this.userId || 'anonymous',
      session_id: this.sessionId,
      step_id: stepId,
      step_name: step.name,
      completed: true,
      timestamp: Date.now(),
      time_spent: Date.now() - this.sessionStartTime,
      metadata
    };

    // Save to Supabase
    try {
      await supabase
        .from('funnel_analytics')
        .insert([funnelData]);
    } catch (error) {
      console.error('Error saving funnel data:', error);
    }

    // Track in Google Analytics
    trackEvent('funnel_step_completed', 'funnel', `${funnelType}_${stepId}`, step.order, {
      funnel_type: funnelType,
      step_name: step.name,
      session_id: this.sessionId,
      ...metadata
    });

    // Check for funnel completion
    await this.checkFunnelCompletion(funnelType);
  }

  private async checkFunnelCompletion(funnelType: keyof typeof this.funnels): Promise<void> {
    const funnel = this.funnels[funnelType];
    const requiredSteps = funnel.filter(s => s.required);

    try {
      const { data: completedSteps } = await supabase
        .from('funnel_analytics')
        .select('step_id')
        .eq('funnel_id', funnelType)
        .eq('session_id', this.sessionId)
        .eq('completed', true);

      const completedStepIds = completedSteps?.map(s => s.step_id) || [];
      const allRequiredCompleted = requiredSteps.every(step => completedStepIds.includes(step.id));

      if (allRequiredCompleted) {
        trackEvent('funnel_completed', 'conversion', funnelType, 1, {
          session_id: this.sessionId,
          completion_time: Date.now() - this.sessionStartTime,
          steps_completed: completedStepIds.length
        });
      }
    } catch (error) {
      console.error('Error checking funnel completion:', error);
    }
  }

  /**
   * Heatmap & Click Tracking
   */
  private initializeHeatmapTracking(): void {
    // Track clicks
    document.addEventListener('click', this.handleClick);
    
    // Track hovers
    document.addEventListener('mouseover', this.handleHover);
    
    // Track scroll depth
    window.addEventListener('scroll', this.handleScroll);
    
    // Track viewport changes
    window.addEventListener('resize', this.handleViewportChange);
  }

  private handleClick = (event: MouseEvent): void => {
    if (!this.isTracking) return;

    const target = event.target as HTMLElement;
    const selector = this.getElementSelector(target);
    const coordinates = { x: event.clientX, y: event.clientY };

    // Update heatmap data
    const key = `${this.currentPage}_${selector}`;
    const existing = this.heatmapData.get(key);
    
    if (existing) {
      existing.click_count++;
    } else {
      this.heatmapData.set(key, {
        id: `heatmap_${Date.now()}`,
        page_url: this.currentPage,
        element_selector: selector,
        click_count: 1,
        hover_count: 0,
        scroll_depth: this.getScrollDepth(),
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        device_type: this.getDeviceType(),
        timestamp: Date.now(),
        user_id: this.userId,
        session_id: this.sessionId
      });
    }

    // Add to session recording
    this.sessionEvents.push({
      type: 'click',
      timestamp: Date.now() - this.sessionStartTime,
      element: selector,
      coordinates,
      metadata: {
        text: target.textContent?.slice(0, 100),
        href: (target as HTMLAnchorElement).href,
        button_type: (target as HTMLButtonElement).type
      }
    });

    // Detect rage clicks (multiple clicks in short time)
    this.detectRageClicks(selector);
  };

  private handleHover = (event: MouseEvent): void => {
    if (!this.isTracking) return;

    const target = event.target as HTMLElement;
    const selector = this.getElementSelector(target);
    const key = `${this.currentPage}_${selector}`;
    const existing = this.heatmapData.get(key);
    
    if (existing) {
      existing.hover_count++;
    }
  };

  private handleScroll = (): void => {
    if (!this.isTracking) return;

    const scrollDepth = this.getScrollDepth();
    
    // Track significant scroll milestones
    if (scrollDepth >= 25 && !this.hasTrackedScrollDepth(25)) {
      this.trackScrollMilestone(25);
    }
    if (scrollDepth >= 50 && !this.hasTrackedScrollDepth(50)) {
      this.trackScrollMilestone(50);
      trackEvent('scroll_depth_50', 'engagement', this.currentPage, 50);
    }
    if (scrollDepth >= 75 && !this.hasTrackedScrollDepth(75)) {
      this.trackScrollMilestone(75);
    }
    if (scrollDepth >= 90 && !this.hasTrackedScrollDepth(90)) {
      this.trackScrollMilestone(90);
    }
  };

  private handleViewportChange = (): void => {
    this.sessionEvents.push({
      type: 'scroll',
      timestamp: Date.now() - this.sessionStartTime,
      element: 'viewport',
      metadata: {
        viewport_size: `${window.innerWidth}x${window.innerHeight}`,
        scroll_depth: this.getScrollDepth()
      }
    });
  };

  /**
   * Session Recording Implementation
   */
  private startSessionRecording(): void {
    // Track page navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = (...args) => {
      this.trackPageNavigation(args[2] as string);
      return originalPushState.apply(history, args);
    };

    history.replaceState = (...args) => {
      this.trackPageNavigation(args[2] as string);
      return originalReplaceState.apply(history, args);
    };

    // Track errors
    window.addEventListener('error', this.handleError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private trackPageNavigation(url: string): void {
    this.currentPage = url;
    
    this.sessionEvents.push({
      type: 'navigation',
      timestamp: Date.now() - this.sessionStartTime,
      element: 'page',
      value: url
    });

    trackEvent('page_navigation', 'navigation', url, 1, {
      session_id: this.sessionId,
      previous_page: this.currentPage
    });
  }

  private handleError = (event: ErrorEvent): void => {
    this.sessionEvents.push({
      type: 'error',
      timestamp: Date.now() - this.sessionStartTime,
      element: 'javascript',
      value: event.message,
      metadata: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
    this.sessionEvents.push({
      type: 'error',
      timestamp: Date.now() - this.sessionStartTime,
      element: 'promise',
      value: event.reason?.toString(),
      metadata: {
        type: 'unhandled_rejection'
      }
    });
  };

  /**
   * Predictive AI Analytics
   */
  async generatePredictiveModel(): Promise<PredictiveModel | null> {
    if (!this.userId) return null;

    try {
      // Get user behavior data
      const { data: behaviorData } = await supabase
        .from('onboarding_behavior_analytics')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: funnelData } = await supabase
        .from('funnel_analytics')
        .select('*')
        .eq('user_id', this.userId)
        .order('timestamp', { ascending: false })
        .limit(100);

      // Calculate predictive scores
      const safeBehaviorData = behaviorData ?? [];
      const safeFunnelData = funnelData ?? [];
      const churnProbability = this.calculateChurnProbability(safeBehaviorData, safeFunnelData);
      const purchaseProbability = this.calculatePurchaseProbability(safeBehaviorData, safeFunnelData);
      const engagementScore = this.calculateEngagementScore(safeBehaviorData);
      const styleConfidence = this.calculateStyleConfidence(safeBehaviorData);
      const predictedLTV = this.calculatePredictedLTV(safeBehaviorData, safeFunnelData);

      const model: PredictiveModel = {
        user_id: this.userId || '',
        churn_probability: churnProbability,
        purchase_probability: purchaseProbability,
        engagement_score: engagementScore,
        style_confidence: styleConfidence,
        predicted_ltv: predictedLTV,
        risk_factors: this.identifyRiskFactors(churnProbability, engagementScore),
        opportunities: this.identifyOpportunities(purchaseProbability, styleConfidence),
        next_best_action: this.determineNextBestAction(churnProbability, purchaseProbability, engagementScore),
        model_version: '1.0',
        calculated_at: Date.now()
      };

      // Save model to Supabase
      await supabase
        .from('predictive_models')
        .upsert([model]);

      this.predictiveModel = model;
      return model;
    } catch (error) {
      console.error('Error generating predictive model:', error);
      return null;
    }
  }

  private calculateChurnProbability(behaviorData: any[], funnelData: any[]): number {
    // Simple churn prediction based on engagement patterns
    let score = 0.5; // Base probability

    // Recent activity factor
    const recentActivity = (behaviorData ?? []).filter(b => 
      Date.now() - new Date(b.created_at).getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );
    
    if (recentActivity.length === 0) {
      score += 0.3; // High churn risk if no recent activity
    } else if (recentActivity.length > 10) {
      score -= 0.2; // Low churn risk if very active
    }

    // Funnel completion factor
    const completedFunnels = (funnelData ?? []).filter(f => f.completed).length;
    const totalFunnelSteps = (funnelData ?? []).length;
    
    if (totalFunnelSteps > 0) {
      const completionRate = completedFunnels / totalFunnelSteps;
      score -= completionRate * 0.3; // Lower churn if high completion rate
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculatePurchaseProbability(behaviorData: any[], funnelData: any[]): number {
    let score = 0.3; // Base probability

    // Product interaction factor
    const productInteractions = (funnelData ?? []).filter(f => 
      f.step_id === 'product_click' || f.step_id === 'external_redirect'
    );
    
    score += Math.min(productInteractions.length * 0.1, 0.4);

    // Quiz completion factor
    const quizCompletions = (funnelData ?? []).filter(f => f.step_id === 'quiz_complete');
    if (quizCompletions.length > 0) {
      score += 0.2;
    }

    // Engagement depth factor
    const safeBehaviorData = behaviorData ?? [];
    const avgSessionTime = safeBehaviorData.length > 0 
      ? safeBehaviorData.reduce((sum, b) => sum + (b.time_spent || 0), 0) / safeBehaviorData.length
      : 0;
    if (avgSessionTime > 300000) { // 5 minutes
      score += 0.15;
    }

    return Math.max(0, Math.min(1, score));
  }

  private calculateEngagementScore(behaviorData: any[]): number {
    const safeBehaviorData = behaviorData ?? [];
    if (safeBehaviorData.length === 0) return 0.3;

    // Calculate based on interaction patterns
    const avgConfidence = safeBehaviorData.reduce((sum, b) => sum + (b.confidence_score || 0.5), 0) / safeBehaviorData.length;
    const avgHesitation = safeBehaviorData.reduce((sum, b) => sum + (b.hesitation_time || 1000), 0) / safeBehaviorData.length;
    
    // Lower hesitation = higher engagement
    const hesitationScore = Math.max(0, 1 - (avgHesitation / 5000)); // Normalize to 0-1
    
    return (avgConfidence * 0.7) + (hesitationScore * 0.3);
  }

  private calculateStyleConfidence(behaviorData: any[]): number {
    // Calculate based on quiz completion and interaction patterns
    const quizInteractions = (behaviorData ?? []).filter(b => b.action_type === 'quiz_interaction');
    
    if (quizInteractions.length === 0) return 0.5;

    const avgConfidence = quizInteractions.reduce((sum, b) => sum + (b.confidence_score || 0.5), 0) / quizInteractions.length;
    return avgConfidence;
  }

  private calculatePredictedLTV(behaviorData: any[], funnelData: any[]): number {
    // Simple LTV prediction based on engagement and completion patterns
    const safeBehaviorData = behaviorData ?? [];
    const safeFunnelData = funnelData ?? [];
    const engagementScore = this.calculateEngagementScore(safeBehaviorData);
    const purchaseProbability = this.calculatePurchaseProbability(safeBehaviorData, safeFunnelData);
    
    // Base LTV calculation
    const baseLTV = 50; // €50 base
    const engagementMultiplier = 1 + (engagementScore * 2); // 1x to 3x
    const purchaseMultiplier = 1 + (purchaseProbability * 1.5); // 1x to 2.5x
    
    return baseLTV * engagementMultiplier * purchaseMultiplier;
  }

  private identifyRiskFactors(churnProbability: number, engagementScore: number): string[] {
    const risks: string[] = [];

    if (churnProbability > 0.7) {
      risks.push('High churn risk - low recent activity');
    }
    if (engagementScore < 0.3) {
      risks.push('Low engagement - short session times');
    }
    if (this.sessionEvents.filter(e => e.type === 'error').length > 2) {
      risks.push('Technical issues - multiple errors detected');
    }

    return risks;
  }

  private identifyOpportunities(purchaseProbability: number, styleConfidence: number): string[] {
    const opportunities: string[] = [];

    if (purchaseProbability > 0.6) {
      opportunities.push('High purchase intent - show targeted offers');
    }
    if (styleConfidence > 0.8) {
      opportunities.push('High style confidence - recommend premium items');
    }
    if (this.sessionEvents.filter(e => e.type === 'click').length > 10) {
      opportunities.push('High interaction - engage with personalized content');
    }

    return opportunities;
  }

  private determineNextBestAction(churnProbability: number, purchaseProbability: number, engagementScore: number): string {
    if (churnProbability > 0.7) {
      return 'retention_campaign';
    }
    if (purchaseProbability > 0.6) {
      return 'purchase_incentive';
    }
    if (engagementScore < 0.3) {
      return 'engagement_boost';
    }
    return 'continue_nurturing';
  }

  /**
   * Conversion Optimization
   */
  async applyConversionOptimization(optimizationType: ConversionOptimization['optimization_type']): Promise<ConversionOptimization | null> {
    if (!this.predictiveModel) {
      await this.generatePredictiveModel();
    }

    if (!this.predictiveModel) return null;

    const optimization: ConversionOptimization = {
      user_id: this.userId || 'anonymous',
      session_id: this.sessionId,
      optimization_type: optimizationType,
      variant: this.selectOptimalVariant(optimizationType),
      confidence: this.predictiveModel.purchase_probability,
      expected_lift: this.calculateExpectedLift(optimizationType),
      applied_at: Date.now()
    };

    try {
      await supabase
        .from('conversion_optimizations')
        .insert([optimization]);

      trackEvent('conversion_optimization_applied', 'optimization', optimizationType, 1, {
        variant: optimization.variant,
        confidence: optimization.confidence,
        expected_lift: optimization.expected_lift
      });

      return optimization;
    } catch (error) {
      console.error('Error applying conversion optimization:', error);
      return null;
    }
  }

  private selectOptimalVariant(optimizationType: ConversionOptimization['optimization_type']): string {
    if (!this.predictiveModel) return 'control';

    switch (optimizationType) {
      case 'cta_placement':
        return this.predictiveModel.engagement_score > 0.7 ? 'prominent' : 'subtle';
      case 'pricing_display':
        return this.predictiveModel.purchase_probability > 0.6 ? 'discount_emphasized' : 'value_emphasized';
      case 'product_order':
        return this.predictiveModel.style_confidence > 0.8 ? 'confidence_based' : 'popularity_based';
      case 'content_personalization':
        return this.predictiveModel.churn_probability > 0.5 ? 'retention_focused' : 'growth_focused';
      default:
        return 'control';
    }
  }

  private calculateExpectedLift(optimizationType: ConversionOptimization['optimization_type']): number {
    // Expected conversion lift based on optimization type
    const liftMap = {
      'cta_placement': 0.15,
      'pricing_display': 0.25,
      'product_order': 0.12,
      'content_personalization': 0.20
    };

    return liftMap[optimizationType] || 0.10;
  }

  /**
   * Real-time Dashboard Data
   */
  async getDashboardData(): Promise<AnalyticsDashboardData> {
    try {
      // Get funnel metrics
      const funnelMetrics = await this.getFunnelMetrics();
      
      // Get heatmap summaries
      const heatmapSummaries = await this.getHeatmapSummaries();
      
      // Get predictive insights
      const predictiveInsights = await this.getPredictiveInsights();
      
      // Get real-time metrics
      const realtimeMetrics = await this.getRealtimeMetrics();

      return {
        funnels: funnelMetrics,
        heatmaps: heatmapSummaries,
        predictions: predictiveInsights,
        realtime: realtimeMetrics
      };
    } catch (error) {
      console.error('Error getting dashboard data:', error);
      throw error;
    }
  }

  private async getFunnelMetrics(): Promise<AnalyticsDashboardData['funnels']> {
    const { data } = await supabase
      .rpc('get_funnel_metrics', { 
        time_range: '7d',
        exclude_test_data: !import.meta.env.DEV
      });

    return data || {
      onboarding: { total_entries: 0, completion_rate: 0, drop_off_points: [], avg_completion_time: 0, conversion_value: 0 },
      purchase: { total_entries: 0, completion_rate: 0, drop_off_points: [], avg_completion_time: 0, conversion_value: 0 },
      engagement: { total_entries: 0, completion_rate: 0, drop_off_points: [], avg_completion_time: 0, conversion_value: 0 }
    };
  }

  private async getHeatmapSummaries(): Promise<AnalyticsDashboardData['heatmaps']> {
    const { data } = await supabase
      .rpc('get_heatmap_summary', { 
        time_range: '7d',
        exclude_test_data: !import.meta.env.DEV
      });

    return data || {
      homepage: { page_url: '/', total_sessions: 0, avg_scroll_depth: 0, top_clicked_elements: [], dead_click_rate: 0, rage_click_rate: 0 },
      quiz: { page_url: '/quiz', total_sessions: 0, avg_scroll_depth: 0, top_clicked_elements: [], dead_click_rate: 0, rage_click_rate: 0 },
      results: { page_url: '/results', total_sessions: 0, avg_scroll_depth: 0, top_clicked_elements: [], dead_click_rate: 0, rage_click_rate: 0 }
    };
  }

  private async getPredictiveInsights(): Promise<AnalyticsDashboardData['predictions']> {
    const { data } = await supabase
      .rpc('get_predictive_insights', { 
        limit_per_type: 10,
        exclude_test_data: !import.meta.env.DEV
      });

    return data || {
      churn_risk: [],
      high_value_users: [],
      conversion_opportunities: []
    };
  }

  private async getRealtimeMetrics(): Promise<AnalyticsDashboardData['realtime']> {
    const { data } = await supabase
      .rpc('get_realtime_metrics', {
        exclude_test_data: !import.meta.env.DEV
      });

    return data || {
      active_users: 0,
      conversion_rate: 0,
      avg_session_duration: 0,
      bounce_rate: 0
    };
  }

  /**
   * Utility Methods
   */
  private getElementSelector(element: HTMLElement): string {
    if (element.id) {
      return `#${element.id}`;
    }
    
    // Prefer classList (DOMTokenList) first - works for both HTML and SVG
    if ('classList' in element && element.classList.length > 0) {
      return `.${element.classList.item(0)}`;
    }
    
    // Fallback to className string handling
    if (typeof element.className === 'string' && element.className.trim()) {
      return `.${element.className.split(/\s+/)[0]}`;
    }
    
    return element.tagName.toLowerCase();
  }

  private getScrollDepth(): number {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (documentHeight <= 0) return 100;
    
    return Math.round((scrollTop / documentHeight) * 100);
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private hasTrackedScrollDepth(depth: number): boolean {
    return this.sessionEvents.some(e => 
      e.type === 'scroll' && e.metadata?.scroll_depth >= depth
    );
  }

  private trackScrollMilestone(depth: number): void {
    this.sessionEvents.push({
      type: 'scroll',
      timestamp: Date.now() - this.sessionStartTime,
      element: 'page',
      metadata: { scroll_depth: depth }
    });
  }

  private detectRageClicks(selector: string): void {
    const recentClicks = this.sessionEvents
      .filter(e => e.type === 'click' && e.element === selector)
      .filter(e => Date.now() - this.sessionStartTime - e.timestamp < 3000); // Last 3 seconds

    if (recentClicks.length >= 3) {
      trackEvent('rage_click_detected', 'ux_issue', selector, recentClicks.length, {
        session_id: this.sessionId,
        element: selector
      });
    }
  }

  /**
   * Save session data to Supabase
   */
  async saveSessionData(): Promise<void> {
    if (!this.isTracking) return;

    try {
      // Save session recording
      const sessionRecording: SessionRecording = {
        id: this.sessionId,
        user_id: this.userId || '',
        session_id: this.sessionId,
        page_url: this.currentPage,
        duration: Date.now() - this.sessionStartTime,
        events: this.sessionEvents,
        device_info: this.getDeviceInfo(),
        conversion_events: this.sessionEvents.filter(e => e.type === 'click' && e.metadata?.conversion).map(e => e.element ?? ''),
        exit_intent: this.detectExitIntent(),
        rage_clicks: this.sessionEvents.filter(e => e.type === 'click').length > 20 ? 1 : 0,
        dead_clicks: this.detectDeadClicks(),
        timestamp: Date.now()
      };

      await supabase
        .from('session_recordings')
        .insert([sessionRecording]);

      // Save heatmap data
      const heatmapArray = Array.from(this.heatmapData.values());
      if (heatmapArray.length > 0) {
        await supabase
          .from('heatmap_data')
          .insert(heatmapArray);
      }

    } catch (error) {
      console.error('Error saving session data:', error);
    }
  }

  private getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      screen: { width: screen.width, height: screen.height },
      deviceType: this.getDeviceType(),
      browser: this.getBrowserName(),
      os: this.getOSName()
    };
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOSName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private detectExitIntent(): boolean {
    // Simple exit intent detection based on rapid upward mouse movement
    return this.sessionEvents.some(e => 
      e.coordinates && e.coordinates.y < 50 && e.type === 'click'
    );
  }

  private detectDeadClicks(): number {
    // Count clicks that didn't result in any action
    return this.sessionEvents.filter(e => 
      e.type === 'click' && !e.metadata?.href && !e.metadata?.button_type
    ).length;
  }

  /**
   * Cleanup and stop tracking
   */
  stopTracking(): void {
    this.isTracking = false;
    this.removeEventListeners();
    this.saveSessionData();
  }

  private removeEventListeners(): void {
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('mouseover', this.handleHover);
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleViewportChange);
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }
}

// Singleton instance
export const advancedAnalytics = new AdvancedAnalytics();

// Hook for React components
const _useAdvancedAnalytics = () => {
  return advancedAnalytics;
};

