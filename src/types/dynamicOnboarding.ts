/**
 * Dynamic Onboarding Types
 * Advanced types for realtime adaptive onboarding system
 */

export interface DynamicQuestion {
  id: string;
  type: 'style_preference' | 'color_analysis' | 'lifestyle' | 'body_confidence' | 'occasion_priority' | 'budget_comfort';
  title: string;
  description: string;
  options: DynamicOption[];
  adaptiveLogic: AdaptiveLogic;
  visualFeedback: VisualFeedbackConfig;
  priority: number; // 1-10, higher = more important
  dependencies?: string[]; // Question IDs this depends on
  skipConditions?: SkipCondition[];
}

export interface DynamicOption {
  id: string;
  label: string;
  description?: string;
  visualPreview?: string; // Image URL for visual options
  psychologicalWeight: Record<string, number>; // Impact on personality traits
  styleImpact: Record<string, number>; // Impact on style preferences
  confidenceBoost?: number; // How much this choice boosts user confidence
}

export interface AdaptiveLogic {
  showIf: (answers: Record<string, any>, behavior: UserBehaviorData) => boolean;
  adaptOptions: (answers: Record<string, any>, behavior: UserBehaviorData) => DynamicOption[];
  calculateRelevance: (answers: Record<string, any>, behavior: UserBehaviorData) => number;
}

export interface VisualFeedbackConfig {
  showOutfitPreview: boolean;
  previewStyle: 'minimal' | 'detailed' | 'comparison';
  animationType: 'fade' | 'slide' | 'morph';
  updateTrigger: 'immediate' | 'delayed' | 'on_complete';
}

export interface UserBehaviorData {
  scrollVelocity: number;
  clickPatterns: string[];
  hoverDuration: number[];
  hesitationTime: number;
  interactionConfidence: number; // 0-1 based on behavior patterns
  deviceType: 'mobile' | 'tablet' | 'desktop';
  timeSpent: number;
  backtrackCount: number;
  focusEvents: number;
}

export interface RealtimeProfile {
  userId: string;
  confidence: number; // 0-1 confidence in profile accuracy
  styleArchetype: string;
  secondaryArchetype?: string;
  predictedPreferences: Record<string, number>;
  personalityTraits: Record<string, number>;
  answers: Record<string, any>;
  behaviorData: UserBehaviorData;
  generatedOutfits: any[];
  lastUpdated: number;
}

export interface SkipCondition {
  if: (answers: Record<string, any>, behavior: UserBehaviorData) => boolean;
  reason: string;
}

export interface OnboardingAnalytics {
  sessionId: string;
  userId?: string;
  startTime: number;
  currentStep: number;
  totalSteps: number;
  answers: Record<string, any>;
  behaviorMetrics: UserBehaviorData;
  dropOffPoints: string[];
  conversionEvents: string[];
  aiRecommendationAccuracy: number;
}

export interface OutfitPreview {
  id: string;
  title: string;
  confidence: number;
  imageUrl: string;
  products: PreviewProduct[];
  reasoning: string[];
  matchPercentage: number;
}

export interface PreviewProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  category: string;
}