/**
 * Dynamic Onboarding Engine
 * Realtime adaptive quiz system with AI-powered personalization
 */

import { DynamicQuestion, UserBehaviorData, RealtimeProfile, OnboardingAnalytics, DynamicOption, OutfitPreview } from '../types/dynamicOnboarding';
import { generateRecommendations } from '../engine/recommendationEngine';
import { analyzeUserProfile } from '../engine/profile-mapping';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../utils/analytics';
import { UserProfile } from '../context/UserContext';

export class DynamicOnboardingEngine {
  private behaviorTracker: BehaviorTracker;
  private questionEngine: QuestionEngine;
  private profileBuilder: ProfileBuilder;
  private analytics: OnboardingAnalytics;

  constructor(userId?: string) {
    this.behaviorTracker = new BehaviorTracker();
    this.questionEngine = new QuestionEngine();
    this.profileBuilder = new ProfileBuilder(userId);
    this.analytics = {
      sessionId: this.generateSessionId(),
      userId,
      startTime: Date.now(),
      currentStep: 0,
      totalSteps: 0,
      answers: {},
      behaviorMetrics: this.behaviorTracker.getMetrics(),
      dropOffPoints: [],
      conversionEvents: [],
      aiRecommendationAccuracy: 0
    };

    this.initializeTracking();
  }

  private generateSessionId(): string {
    return `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeTracking(): void {
    // Track session start
    trackEvent('onboarding_start', 'engagement', 'dynamic_onboarding', 1, {
      session_id: this.analytics.sessionId,
      user_id: this.analytics.userId
    });

    // Start behavior tracking
    this.behaviorTracker.startTracking();
  }

  /**
   * Get next question based on current answers and behavior
   */
  async getNextQuestion(currentAnswers: Record<string, any>): Promise<DynamicQuestion | null> {
    const behaviorData = this.behaviorTracker.getMetrics();
    const profile = await this.profileBuilder.buildProfile(currentAnswers, behaviorData);
    
    // Update analytics
    this.analytics.behaviorMetrics = behaviorData;
    this.analytics.answers = currentAnswers;
    this.analytics.currentStep++;

    // Get adaptive question
    const question = this.questionEngine.getAdaptiveQuestion(currentAnswers, behaviorData, profile);
    
    if (question) {
      this.analytics.totalSteps = this.questionEngine.getEstimatedTotalSteps(currentAnswers);
      
      // Track question shown
      trackEvent('onboarding_question_shown', 'engagement', question.type, this.analytics.currentStep, {
        question_id: question.id,
        session_id: this.analytics.sessionId,
        confidence: profile.confidence
      });
    }

    return question;
  }

  /**
   * Process answer and generate real-time outfit previews
   */
  async processAnswer(questionId: string, answer: any, currentAnswers: Record<string, any>): Promise<{
    profile: RealtimeProfile;
    outfitPreviews: OutfitPreview[];
    nextQuestion: DynamicQuestion | null;
  }> {
    // Update answers
    const updatedAnswers = { ...currentAnswers, [questionId]: answer };
    
    // Track answer
    const hesitationTime = this.behaviorTracker.getHesitationTime();
    trackEvent('onboarding_answer_given', 'engagement', questionId, 1, {
      answer: typeof answer === 'object' ? JSON.stringify(answer) : answer,
      hesitation_time: hesitationTime,
      session_id: this.analytics.sessionId
    });

    // Build updated profile
    const behaviorData = this.behaviorTracker.getMetrics();
    const profile = await this.profileBuilder.buildProfile(updatedAnswers, behaviorData);

    // Generate outfit previews using AI
    const outfitPreviews = await this.generateOutfitPreviews(profile);

    // Save profile to Supabase
    await this.saveProfileToSupabase(profile);

    // Get next question
    const nextQuestion = await this.getNextQuestion(updatedAnswers);

    // Update analytics
    this.analytics.aiRecommendationAccuracy = this.calculateRecommendationAccuracy(outfitPreviews);

    return {
      profile,
      outfitPreviews,
      nextQuestion
    };
  }

  /**
   * Generate outfit previews using AI engine
   */
  private async generateOutfitPreviews(profile: RealtimeProfile): Promise<OutfitPreview[]> {
    try {
      // Convert profile to UserProfile format
      const userProfile: UserProfile = {
        id: profile.userId,
        name: 'Onboarding User',
        email: 'temp@fitfi.ai',
        gender: profile.answers.gender || 'female',
        stylePreferences: profile.predictedPreferences,
        isPremium: false,
        savedRecommendations: []
      };

      // Generate recommendations
      const recommendations = await generateRecommendations(userProfile, {
        count: 3,
        preferredOccasions: profile.answers.occasions || ['Casual'],
        variationLevel: 'medium'
      });

      // Convert to OutfitPreview format
      const previews: OutfitPreview[] = recommendations.map(outfit => ({
        id: outfit.id,
        title: outfit.title,
        confidence: profile.confidence,
        imageUrl: outfit.imageUrl || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        products: outfit.products.map(product => ({
          id: product.id,
          name: product.name || 'Stijlvol Item',
          brand: product.brand || 'FitFi',
          price: product.price || 49.99,
          imageUrl: product.imageUrl || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
          category: product.category || 'fashion'
        })),
        reasoning: [
          `Past perfect bij jouw ${profile.styleArchetype} stijl`,
          `${Math.round(profile.confidence * 100)}% match met jouw voorkeuren`,
          'Gebaseerd op jouw antwoorden en gedrag'
        ],
        matchPercentage: outfit.matchPercentage || Math.round(profile.confidence * 100)
      }));

      // Track AI generation
      trackEvent('ai_outfit_preview_generated', 'ai_interaction', 'onboarding', previews.length, {
        archetype: profile.styleArchetype,
        confidence: profile.confidence,
        session_id: this.analytics.sessionId
      });

      return previews;
    } catch (error) {
      console.error('Error generating outfit previews:', error);
      return [];
    }
  }

  /**
   * Save profile to Supabase
   */
  private async saveProfileToSupabase(profile: RealtimeProfile): Promise<void> {
    if (!profile.userId) return;

    try {
      const { error } = await supabase
        .from('user_onboarding_profiles')
        .upsert({
          user_id: profile.userId,
          dynamic_answers: profile.answers,
          behavior_data: profile.behaviorData,
          completion_time: Date.now() - this.analytics.startTime,
          confidence_score: profile.confidence,
          style_archetype: profile.styleArchetype,
          generated_recommendations: profile.generatedOutfits,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving profile to Supabase:', error);
      }
    } catch (error) {
      console.error('Supabase save error:', error);
    }
  }

  /**
   * Calculate recommendation accuracy based on user interactions
   */
  private calculateRecommendationAccuracy(outfits: OutfitPreview[]): number {
    // Simple accuracy calculation based on outfit diversity and user behavior
    const behaviorData = this.behaviorTracker.getMetrics();
    const baseAccuracy = 0.85;
    
    // Adjust based on confidence and interaction quality
    const confidenceBonus = behaviorData.interactionConfidence * 0.1;
    const diversityBonus = Math.min(outfits.length / 3, 1) * 0.05;
    
    return Math.min(baseAccuracy + confidenceBonus + diversityBonus, 0.98);
  }

  /**
   * Complete onboarding and get final results
   */
  async completeOnboarding(finalAnswers: Record<string, any>): Promise<{
    profile: RealtimeProfile;
    finalOutfits: OutfitPreview[];
    analytics: OnboardingAnalytics;
  }> {
    const behaviorData = this.behaviorTracker.getMetrics();
    const profile = await this.profileBuilder.buildProfile(finalAnswers, behaviorData);
    
    // Generate final outfit recommendations
    const finalOutfits = await this.generateOutfitPreviews(profile);
    
    // Complete analytics
    this.analytics.answers = finalAnswers;
    this.analytics.behaviorMetrics = behaviorData;
    this.analytics.aiRecommendationAccuracy = this.calculateRecommendationAccuracy(finalOutfits);

    // Track completion
    trackEvent('onboarding_complete', 'conversion', 'dynamic_onboarding', 1, {
      session_id: this.analytics.sessionId,
      completion_time: Date.now() - this.analytics.startTime,
      total_steps: this.analytics.currentStep,
      confidence: profile.confidence,
      archetype: profile.styleArchetype
    });

    // Save final profile
    await this.saveProfileToSupabase(profile);

    // Stop tracking
    this.behaviorTracker.stopTracking();

    return {
      profile,
      finalOutfits,
      analytics: this.analytics
    };
  }

  /**
   * Track drop-off point
   */
  trackDropOff(questionId: string, reason: string): void {
    this.analytics.dropOffPoints.push(`${questionId}:${reason}`);
    
    trackEvent('onboarding_drop_off', 'engagement', questionId, 1, {
      reason,
      step: this.analytics.currentStep,
      session_id: this.analytics.sessionId,
      time_spent: Date.now() - this.analytics.startTime
    });
  }

  /**
   * Get current analytics
   */
  getAnalytics(): OnboardingAnalytics {
    return {
      ...this.analytics,
      behaviorMetrics: this.behaviorTracker.getMetrics()
    };
  }
}

/**
 * Behavior Tracker - Tracks user interactions and behavior patterns
 */
class BehaviorTracker {
  private startTime: number = Date.now();
  private scrollEvents: number[] = [];
  private clickEvents: string[] = [];
  private hoverEvents: { element: string; duration: number }[] = [];
  private hesitationStart: number = 0;
  private isTracking: boolean = false;
  private focusEvents: number = 0;
  private backtrackCount: number = 0;

  startTracking(): void {
    this.isTracking = true;
    this.setupEventListeners();
  }

  stopTracking(): void {
    this.isTracking = false;
    this.removeEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('scroll', this.handleScroll);
    window.addEventListener('click', this.handleClick);
    window.addEventListener('mouseover', this.handleMouseOver);
    window.addEventListener('mouseout', this.handleMouseOut);
    window.addEventListener('focus', this.handleFocus, true);
    window.addEventListener('beforeunload', this.handleBacktrack);
  }

  private removeEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('click', this.handleClick);
    window.removeEventListener('mouseover', this.handleMouseOver);
    window.removeEventListener('mouseout', this.handleMouseOut);
    window.removeEventListener('focus', this.handleFocus, true);
    window.removeEventListener('beforeunload', this.handleBacktrack);
  }

  private handleScroll = (): void => {
    if (!this.isTracking) return;
    this.scrollEvents.push(Date.now());
  };

  private handleClick = (event: MouseEvent): void => {
    if (!this.isTracking) return;
    const target = event.target as HTMLElement;
    this.clickEvents.push(target.tagName + (target.className ? `.${target.className.split(' ')[0]}` : ''));
  };

  private handleMouseOver = (event: MouseEvent): void => {
    if (!this.isTracking) return;
    this.hesitationStart = Date.now();
  };

  private handleMouseOut = (event: MouseEvent): void => {
    if (!this.isTracking || !this.hesitationStart) return;
    const duration = Date.now() - this.hesitationStart;
    const target = event.target as HTMLElement;
    this.hoverEvents.push({
      element: target.tagName,
      duration
    });
    this.hesitationStart = 0;
  };

  private handleFocus = (): void => {
    if (!this.isTracking) return;
    this.focusEvents++;
  };

  private handleBacktrack = (): void => {
    if (!this.isTracking) return;
    this.backtrackCount++;
  };

  getHesitationTime(): number {
    return this.hesitationStart > 0 ? Date.now() - this.hesitationStart : 0;
  }

  getMetrics(): UserBehaviorData {
    const now = Date.now();
    const timeSpent = now - this.startTime;
    
    // Calculate scroll velocity
    const recentScrolls = this.scrollEvents.filter(time => now - time < 5000);
    const scrollVelocity = recentScrolls.length / 5; // events per second

    // Calculate interaction confidence based on behavior patterns
    const avgHoverDuration = this.hoverEvents.length > 0 
      ? this.hoverEvents.reduce((sum, event) => sum + event.duration, 0) / this.hoverEvents.length 
      : 0;
    
    const interactionConfidence = Math.min(
      (avgHoverDuration / 1000) * 0.3 + // Longer hovers = more confident
      (this.clickEvents.length / 10) * 0.3 + // More clicks = more engaged
      (this.focusEvents / 5) * 0.2 + // Focus events = attention
      (1 - this.backtrackCount / 10) * 0.2, // Less backtracking = more confident
      1
    );

    // Detect device type
    const deviceType = window.innerWidth < 768 ? 'mobile' : 
                      window.innerWidth < 1024 ? 'tablet' : 'desktop';

    return {
      scrollVelocity,
      clickPatterns: this.clickEvents,
      hoverDuration: this.hoverEvents.map(e => e.duration),
      hesitationTime: this.getHesitationTime(),
      interactionConfidence: Math.max(interactionConfidence, 0.1),
      deviceType,
      timeSpent,
      backtrackCount: this.backtrackCount,
      focusEvents: this.focusEvents
    };
  }
}

/**
 * Question Engine - Generates adaptive questions based on user data
 */
class QuestionEngine {
  private questionPool: DynamicQuestion[] = [];

  constructor() {
    this.initializeQuestionPool();
  }

  private initializeQuestionPool(): void {
    this.questionPool = [
      {
        id: 'gender_identity',
        type: 'lifestyle',
        title: 'Hoe identificeer je jezelf?',
        description: 'Dit helpt ons de juiste stijladvies voor je te vinden',
        priority: 10,
        options: [
          {
            id: 'male',
            label: 'Man',
            description: 'Mannelijke stijladvies',
            psychologicalWeight: { confidence: 0.8, traditional: 0.7 },
            styleImpact: { formal: 0.6, sporty: 0.8 }
          },
          {
            id: 'female',
            label: 'Vrouw',
            description: 'Vrouwelijke stijladvies',
            psychologicalWeight: { creativity: 0.8, expressiveness: 0.9 },
            styleImpact: { casual: 0.7, vintage: 0.6 }
          },
          {
            id: 'neutral',
            label: 'Gender neutraal',
            description: 'Inclusieve stijladvies',
            psychologicalWeight: { openness: 0.9, individuality: 0.8 },
            styleImpact: { minimalist: 0.8, casual: 0.7 }
          }
        ],
        adaptiveLogic: {
          showIf: () => true, // Always show first
          adaptOptions: (answers, behavior) => this.questionPool[0].options,
          calculateRelevance: () => 1.0
        },
        visualFeedback: {
          showOutfitPreview: false,
          previewStyle: 'minimal',
          animationType: 'fade',
          updateTrigger: 'immediate'
        }
      },
      {
        id: 'style_confidence',
        type: 'body_confidence',
        title: 'Hoe voel je je over je huidige stijl?',
        description: 'Eerlijkheid helpt ons je beter te adviseren',
        priority: 9,
        options: [
          {
            id: 'very_confident',
            label: 'Zeer zelfverzekerd',
            description: 'Ik weet precies wat me staat',
            psychologicalWeight: { confidence: 0.9, leadership: 0.8 },
            styleImpact: { formal: 0.7, luxury: 0.6 },
            confidenceBoost: 0.2
          },
          {
            id: 'somewhat_confident',
            label: 'Redelijk zelfverzekerd',
            description: 'Ik heb een idee, maar kan hulp gebruiken',
            psychologicalWeight: { confidence: 0.6, openness: 0.7 },
            styleImpact: { casual: 0.8, minimalist: 0.6 },
            confidenceBoost: 0.1
          },
          {
            id: 'not_confident',
            label: 'Niet zo zelfverzekerd',
            description: 'Ik wil graag hulp bij het vinden van mijn stijl',
            psychologicalWeight: { openness: 0.9, adaptability: 0.8 },
            styleImpact: { casual: 0.9, minimalist: 0.7 },
            confidenceBoost: 0.3
          }
        ],
        adaptiveLogic: {
          showIf: (answers) => !!answers.gender_identity,
          adaptOptions: (answers, behavior) => {
            // Adapt based on interaction confidence
            if (behavior.interactionConfidence > 0.7) {
              return this.questionPool[1].options.filter(opt => opt.id !== 'not_confident');
            }
            return this.questionPool[1].options;
          },
          calculateRelevance: (answers, behavior) => behavior.interactionConfidence
        },
        visualFeedback: {
          showOutfitPreview: true,
          previewStyle: 'minimal',
          animationType: 'fade',
          updateTrigger: 'immediate'
        }
      },
      {
        id: 'primary_occasions',
        type: 'occasion_priority',
        title: 'Voor welke gelegenheden zoek je vooral stijladvies?',
        description: 'Selecteer je top 3 prioriteiten',
        priority: 8,
        options: [
          {
            id: 'work',
            label: 'Werk & Zakelijk',
            description: 'Kantoor, meetings, professionele events',
            visualPreview: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
            psychologicalWeight: { professionalism: 0.9, ambition: 0.8 },
            styleImpact: { formal: 0.9, minimalist: 0.7 }
          },
          {
            id: 'casual',
            label: 'Dagelijks & Casual',
            description: 'Weekend, vrienden, ontspannen momenten',
            visualPreview: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
            psychologicalWeight: { relaxation: 0.8, authenticity: 0.9 },
            styleImpact: { casual: 0.9, minimalist: 0.6 }
          },
          {
            id: 'social',
            label: 'Uitgaan & Sociaal',
            description: 'Dates, feestjes, sociale events',
            visualPreview: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
            psychologicalWeight: { sociability: 0.9, expressiveness: 0.8 },
            styleImpact: { vintage: 0.7, sporty: 0.5 }
          },
          {
            id: 'creative',
            label: 'Creatief & Expressief',
            description: 'Artistieke events, self-expression',
            visualPreview: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
            psychologicalWeight: { creativity: 0.9, individuality: 0.8 },
            styleImpact: { vintage: 0.8, sporty: 0.6 }
          }
        ],
        adaptiveLogic: {
          showIf: (answers) => !!answers.style_confidence,
          adaptOptions: (answers, behavior) => {
            // Prioritize work options for confident users
            if (answers.style_confidence === 'very_confident') {
              return this.questionPool[2].options.filter(opt => 
                ['work', 'social'].includes(opt.id)
              ).concat(this.questionPool[2].options.filter(opt => 
                !['work', 'social'].includes(opt.id)
              ));
            }
            return this.questionPool[2].options;
          },
          calculateRelevance: () => 0.9
        },
        visualFeedback: {
          showOutfitPreview: true,
          previewStyle: 'detailed',
          animationType: 'slide',
          updateTrigger: 'immediate'
        }
      },
      {
        id: 'style_inspiration',
        type: 'style_preference',
        title: 'Welke stijl spreekt je het meest aan?',
        description: 'Kies wat je hart sneller doet kloppen',
        priority: 7,
        options: [
          {
            id: 'minimalist',
            label: 'Minimalistisch',
            description: 'Clean lijnen, neutrale kleuren, eenvoud',
            visualPreview: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
            psychologicalWeight: { simplicity: 0.9, focus: 0.8 },
            styleImpact: { minimalist: 0.9, formal: 0.6 }
          },
          {
            id: 'classic',
            label: 'Klassiek',
            description: 'Tijdloze elegantie, verfijnde stukken',
            visualPreview: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
            psychologicalWeight: { tradition: 0.8, elegance: 0.9 },
            styleImpact: { formal: 0.9, minimalist: 0.7 }
          },
          {
            id: 'bohemian',
            label: 'Bohemian',
            description: 'Vrije, artistieke stijl met natuurlijke elementen',
            visualPreview: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
            psychologicalWeight: { creativity: 0.9, freedom: 0.8 },
            styleImpact: { vintage: 0.8, casual: 0.7 }
          },
          {
            id: 'streetwear',
            label: 'Streetwear',
            description: 'Urban, trendy, casual met attitude',
            visualPreview: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
            psychologicalWeight: { rebellion: 0.7, authenticity: 0.8 },
            styleImpact: { sporty: 0.9, casual: 0.8 }
          }
        ],
        adaptiveLogic: {
          showIf: (answers) => !!answers.primary_occasions,
          adaptOptions: (answers, behavior) => {
            // Adapt options based on occasions
            if (answers.primary_occasions?.includes('work')) {
              return this.questionPool[3].options.filter(opt => 
                ['minimalist', 'classic'].includes(opt.id)
              ).concat(this.questionPool[3].options.filter(opt => 
                !['minimalist', 'classic'].includes(opt.id)
              ));
            }
            return this.questionPool[3].options;
          },
          calculateRelevance: (answers) => answers.primary_occasions ? 0.9 : 0.7
        },
        visualFeedback: {
          showOutfitPreview: true,
          previewStyle: 'detailed',
          animationType: 'morph',
          updateTrigger: 'immediate'
        }
      }
    ];
  }

  getAdaptiveQuestion(
    answers: Record<string, any>, 
    behavior: UserBehaviorData, 
    profile: RealtimeProfile
  ): DynamicQuestion | null {
    // Find next relevant question
    const availableQuestions = this.questionPool.filter(question => {
      // Check if already answered
      if (answers[question.id]) return false;
      
      // Check dependencies
      if (question.dependencies) {
        const hasAllDependencies = question.dependencies.every(dep => answers[dep]);
        if (!hasAllDependencies) return false;
      }
      
      // Check show conditions
      if (!question.adaptiveLogic.showIf(answers, behavior)) return false;
      
      // Check skip conditions
      if (question.skipConditions) {
        const shouldSkip = question.skipConditions.some(condition => 
          condition.if(answers, behavior)
        );
        if (shouldSkip) return false;
      }
      
      return true;
    });

    if (availableQuestions.length === 0) return null;

    // Sort by priority and relevance
    availableQuestions.sort((a, b) => {
      const relevanceA = a.adaptiveLogic.calculateRelevance(answers, behavior);
      const relevanceB = b.adaptiveLogic.calculateRelevance(answers, behavior);
      const scoreA = a.priority * relevanceA;
      const scoreB = b.priority * relevanceB;
      return scoreB - scoreA;
    });

    const selectedQuestion = availableQuestions[0];
    
    // Adapt options based on context
    const adaptedOptions = selectedQuestion.adaptiveLogic.adaptOptions(answers, behavior);
    
    return {
      ...selectedQuestion,
      options: adaptedOptions
    };
  }

  getEstimatedTotalSteps(answers: Record<string, any>): number {
    // Dynamic estimation based on current answers
    const baseSteps = 4;
    const additionalSteps = Object.keys(answers).length > 2 ? 1 : 2;
    return Math.min(baseSteps + additionalSteps, 6);
  }
}

/**
 * Profile Builder - Builds user profiles in real-time
 */
class ProfileBuilder {
  private userId?: string;

  constructor(userId?: string) {
    this.userId = userId;
  }

  async buildProfile(answers: Record<string, any>, behavior: UserBehaviorData): Promise<RealtimeProfile> {
    // Calculate confidence based on answers completeness and behavior
    const answerCompleteness = Object.keys(answers).length / 4; // Assuming 4 core questions
    const behaviorConfidence = behavior.interactionConfidence;
    const confidence = Math.min((answerCompleteness * 0.7) + (behaviorConfidence * 0.3), 1);

    // Predict style preferences based on answers
    const predictedPreferences = this.predictStylePreferences(answers, behavior);
    
    // Determine style archetype
    const styleArchetype = this.determineStyleArchetype(answers, predictedPreferences);
    
    // Extract personality traits
    const personalityTraits = this.extractPersonalityTraits(answers, behavior);

    return {
      userId: this.userId || 'anonymous',
      confidence,
      styleArchetype,
      predictedPreferences,
      personalityTraits,
      answers,
      behaviorData: behavior,
      generatedOutfits: [],
      lastUpdated: Date.now()
    };
  }

  private predictStylePreferences(answers: Record<string, any>, behavior: UserBehaviorData): Record<string, number> {
    const preferences: Record<string, number> = {
      casual: 3,
      formal: 3,
      sporty: 3,
      vintage: 3,
      minimalist: 3
    };

    // Adjust based on answers
    if (answers.style_inspiration) {
      switch (answers.style_inspiration) {
        case 'minimalist':
          preferences.minimalist = 5;
          preferences.formal = 4;
          break;
        case 'classic':
          preferences.formal = 5;
          preferences.minimalist = 4;
          break;
        case 'bohemian':
          preferences.vintage = 5;
          preferences.casual = 4;
          break;
        case 'streetwear':
          preferences.sporty = 5;
          preferences.casual = 4;
          break;
      }
    }

    if (answers.primary_occasions) {
      if (answers.primary_occasions.includes('work')) {
        preferences.formal += 1;
        preferences.minimalist += 1;
      }
      if (answers.primary_occasions.includes('casual')) {
        preferences.casual += 1;
      }
      if (answers.primary_occasions.includes('social')) {
        preferences.vintage += 1;
      }
    }

    // Adjust based on behavior
    if (behavior.interactionConfidence > 0.7) {
      preferences.formal += 0.5; // Confident users often prefer formal
    }
    
    if (behavior.deviceType === 'mobile') {
      preferences.casual += 0.3; // Mobile users often prefer casual
    }

    // Normalize to 1-5 range
    Object.keys(preferences).forEach(key => {
      preferences[key] = Math.max(1, Math.min(5, preferences[key]));
    });

    return preferences;
  }

  private determineStyleArchetype(answers: Record<string, any>, preferences: Record<string, number>): string {
    // Use existing profile analysis
    try {
      const analysis = analyzeUserProfile(preferences);
      return analysis.dominantArchetype;
    } catch (error) {
      // Fallback logic
      const maxPref = Object.entries(preferences).reduce((max, [key, value]) => 
        value > max.value ? { key, value } : max, { key: 'casual', value: 0 }
      );

      const archetypeMap: Record<string, string> = {
        casual: 'casual_chic',
        formal: 'klassiek',
        sporty: 'streetstyle',
        vintage: 'retro',
        minimalist: 'urban'
      };

      return archetypeMap[maxPref.key] || 'casual_chic';
    }
  }

  private extractPersonalityTraits(answers: Record<string, any>, behavior: UserBehaviorData): Record<string, number> {
    const traits: Record<string, number> = {
      confidence: behavior.interactionConfidence,
      openness: 0.5,
      creativity: 0.5,
      professionalism: 0.5,
      authenticity: 0.5
    };

    // Extract from answers
    if (answers.style_confidence === 'very_confident') {
      traits.confidence = Math.max(traits.confidence, 0.8);
    }

    if (answers.style_inspiration === 'bohemian') {
      traits.creativity = 0.8;
      traits.openness = 0.9;
    }

    if (answers.primary_occasions?.includes('work')) {
      traits.professionalism = 0.8;
    }

    // Extract from behavior
    if (behavior.hoverDuration.length > 5) {
      traits.openness += 0.2; // Curious behavior
    }

    if (behavior.backtrackCount === 0) {
      traits.confidence += 0.1; // Decisive behavior
    }

    return traits;
  }
}

export default DynamicOnboardingEngine;