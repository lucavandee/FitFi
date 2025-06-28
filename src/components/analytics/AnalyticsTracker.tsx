import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Event types for analytics
export enum EventType {
  QUIZ_START = 'quiz_start',
  QUIZ_STEP_COMPLETE = 'quiz_step_complete',
  QUIZ_COMPLETE = 'quiz_complete',
  OUTFIT_VIEWED = 'outfit_viewed',
  EXPLANATION_SHOWN = 'explanation_shown',
  CTA_CLICK = 'cta_click'
}

// Analytics tracker component
const AnalyticsTracker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  
  // Track page views
  useEffect(() => {
    // Track page view in analytics
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title
      });
    }
  }, [location]);
  
  // Expose tracking functions to window for global access
  useEffect(() => {
    // Track quiz start
    window.trackQuizStart = (quizType: string) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', EventType.QUIZ_START, {
          event_category: 'questionnaire',
          event_label: quizType,
          referrer: document.referrer,
          timestamp: new Date().toISOString()
        });
      }
      console.log(`📊 Tracked quiz start: ${quizType}`);
    };
    
    // Track quiz step completion
    window.trackQuizProgress = (currentStep: number, totalSteps: number, category: string) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', EventType.QUIZ_STEP_COMPLETE, {
          event_category: 'questionnaire',
          event_label: `step_${currentStep}`,
          step_number: currentStep,
          total_steps: totalSteps,
          step_category: category,
          completion_percentage: Math.round((currentStep / totalSteps) * 100)
        });
      }
      console.log(`📊 Tracked quiz progress: Step ${currentStep}/${totalSteps} (${category})`);
    };
    
    // Track quiz completion
    window.trackQuizComplete = (timeInSeconds: number, totalSteps: number, userSegment: string) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', EventType.QUIZ_COMPLETE, {
          event_category: 'questionnaire',
          event_label: 'complete',
          time_spent: timeInSeconds,
          total_steps: totalSteps,
          user_segment: userSegment
        });
      }
      console.log(`📊 Tracked quiz completion: ${timeInSeconds}s, ${totalSteps} steps, ${userSegment}`);
    };
    
    // Track style preference
    window.trackStylePreference = (preferenceType: string, rating: number) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'style_preference', {
          event_category: 'questionnaire',
          event_label: preferenceType,
          preference_type: preferenceType,
          rating: rating
        });
      }
      console.log(`📊 Tracked style preference: ${preferenceType} (${rating})`);
    };
    
    // Track photo upload
    window.trackPhotoUpload = (purpose: string) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'photo_upload', {
          event_category: 'questionnaire',
          event_label: purpose,
          purpose: purpose
        });
      }
      console.log(`📊 Tracked photo upload: ${purpose}`);
    };
    
    // Track lead capture
    window.trackLeadCapture = (source: string, type: string) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'lead_capture', {
          event_category: 'conversion',
          event_label: source,
          lead_source: source,
          lead_type: type
        });
      }
      console.log(`📊 Tracked lead capture: ${source} (${type})`);
    };
    
    // Track user registration
    window.trackUserRegistration = (method: string, userType: string) => {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'user_registration', {
          event_category: 'conversion',
          event_label: method,
          registration_method: method,
          user_type: userType
        });
      }
      console.log(`📊 Tracked user registration: ${method} (${userType})`);
    };
    
    return () => {
      // Clean up
      delete window.trackQuizStart;
      delete window.trackQuizProgress;
      delete window.trackQuizComplete;
      delete window.trackStylePreference;
      delete window.trackPhotoUpload;
      delete window.trackLeadCapture;
      delete window.trackUserRegistration;
    };
  }, []);
  
  return <>{children}</>;
};

export default AnalyticsTracker;