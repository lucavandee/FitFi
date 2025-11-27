/**
 * Nova Proactive Triggers
 * Determines when Nova should proactively reach out during onboarding
 * This is what makes Nova feel intelligent and helpful (not just reactive)
 */

interface ProactiveTrigger {
  shouldTrigger: boolean;
  message?: string;
  reason?: string;
}

export function checkProactiveTriggers(
  currentStep: number,
  answers: Record<string, any>,
  phase: string
): ProactiveTrigger {
  // 1. CONFLICTING STYLE PREFERENCES
  if (answers.stylePreferences && Array.isArray(answers.stylePreferences)) {
    const styles = answers.stylePreferences;

    // Detect conflicting styles
    const hasMinimal = styles.includes('minimal') || styles.includes('modern');
    const hasMaximal = styles.includes('bohemian') || styles.includes('vintage');

    if (hasMinimal && hasMaximal && styles.length > 3) {
      return {
        shouldTrigger: true,
        message: 'Je hebt zowel minimalistische als expressieve stijlen gekozen. Wil je eclectisch zijn of zoek je één hoofdstijl?',
        reason: 'conflicting_styles'
      };
    }
  }

  // 2. BUDGET TOO LOW FOR STYLE
  if (answers.budgetRange && answers.stylePreferences) {
    const budget = answers.budgetRange;
    const styles = answers.stylePreferences;

    // Luxury styles with low budget
    const hasLuxuryStyle = styles.some((s: string) =>
      ['classic', 'sophisticated', 'elegant'].includes(s)
    );

    if (hasLuxuryStyle && budget < 100) {
      return {
        shouldTrigger: true,
        message: 'Je stijlkeuzes zijn vaak premium. Ik kan je helpen om die look te bereiken binnen jouw budget - wil je tips?',
        reason: 'budget_style_mismatch'
      };
    }
  }

  // 3. NO OCCASIONS SELECTED
  if (currentStep > 4 && (!answers.occasions || answers.occasions.length === 0)) {
    return {
      shouldTrigger: true,
      message: 'Ik zie dat je nog geen gelegenheden hebt gekozen. Dat helpt me enorm om de perfecte outfits te vinden. Twijfel je?',
      reason: 'missing_occasions'
    };
  }

  // 4. ABANDONED PHOTO UPLOAD
  if (currentStep > 3 && !answers.photoUrl && phase === 'questions') {
    const photoUploadStep = 2; // Assuming photo is early
    if (currentStep > photoUploadStep + 2) {
      return {
        shouldTrigger: true,
        message: 'Een foto uploaden helpt me je kleurtype bepalen - dat maakt je outfits 3x persoonlijker. Wil je het proberen?',
        reason: 'abandoned_photo'
      };
    }
  }

  // 5. STUCK ON CURRENT QUESTION (time-based would be ideal but we track step changes)
  // This would require tracking how long user is on current step
  // For now, we can trigger if user went back multiple times

  // 6. TOO MANY STYLE PREFERENCES
  if (answers.stylePreferences && answers.stylePreferences.length > 5) {
    return {
      shouldTrigger: true,
      message: 'Wow, je houdt van veel stijlen! Dat is cool, maar ik krijg scherpere aanbevelingen als je top 3 kiest. Hulp nodig?',
      reason: 'too_many_styles'
    };
  }

  // 7. SWIPE PHASE - NO SWIPES YET
  if (phase === 'swipes' && currentStep === 0) {
    // Check if user has been on swipe step for "a while" (we'd need timing here)
    // For now, just show helpful message
    return {
      shouldTrigger: false, // Don't trigger immediately, wait a bit
      message: '',
      reason: 'swipe_help_standby'
    };
  }

  // 8. ADVANCED: Similar users pattern detection
  // If user has similar answers to a common cluster, suggest common path
  // Example: Male + Minimal + Casual → Most users also select "Work" occasion
  if (answers.gender === 'male' &&
      answers.stylePreferences?.includes('minimal') &&
      !answers.occasions?.includes('work')) {
    return {
      shouldTrigger: true,
      message: '95% van users met jouw stijl voegt "Werk" toe als gelegenheid. Vergeten te selecteren of niet relevant?',
      reason: 'pattern_suggestion'
    };
  }

  return {
    shouldTrigger: false
  };
}

/**
 * Track Nova interactions for analytics
 */
export function trackNovaInteraction(
  event: string,
  data: Record<string, any>
) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', `nova_${event}`, {
      ...data,
      timestamp: Date.now()
    });
  }

  // Store in localStorage for later analysis
  const interactions = JSON.parse(localStorage.getItem('ff_nova_interactions') || '[]');
  interactions.push({
    event,
    data,
    timestamp: Date.now()
  });

  // Keep last 50 interactions
  if (interactions.length > 50) {
    interactions.shift();
  }

  localStorage.setItem('ff_nova_interactions', JSON.stringify(interactions));
}

/**
 * Get Nova interaction metrics for investor demo
 */
export function getNovaMetrics() {
  const interactions = JSON.parse(localStorage.getItem('ff_nova_interactions') || '[]');

  return {
    totalInteractions: interactions.length,
    proactiveTriggers: interactions.filter((i: any) => i.event === 'proactive_trigger').length,
    questionsAsked: interactions.filter((i: any) => i.event === 'question_asked').length,
    chatOpened: interactions.filter((i: any) => i.event === 'chat_opened').length,
    avgResponseTime: calculateAvgResponseTime(interactions),
    engagementRate: interactions.length > 0 ? (interactions.filter((i: any) => i.event === 'chat_opened').length / interactions.filter((i: any) => i.event === 'proactive_trigger').length) * 100 : 0
  };
}

function calculateAvgResponseTime(interactions: any[]) {
  // Calculate average time between proactive trigger and chat opened
  const triggers = interactions.filter(i => i.event === 'proactive_trigger');
  const opens = interactions.filter(i => i.event === 'chat_opened');

  if (triggers.length === 0 || opens.length === 0) return 0;

  let totalTime = 0;
  let count = 0;

  triggers.forEach(trigger => {
    const nextOpen = opens.find(o => o.timestamp > trigger.timestamp);
    if (nextOpen) {
      totalTime += (nextOpen.timestamp - trigger.timestamp);
      count++;
    }
  });

  return count > 0 ? Math.round(totalTime / count / 1000) : 0; // seconds
}
