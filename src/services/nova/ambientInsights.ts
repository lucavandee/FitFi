import type { InsightType } from '@/components/Dashboard/NovaInsightCard';

export interface AmbientInsight {
  type: InsightType;
  insight: string;
  action?: string;
  actionLink?: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
}

interface UserContext {
  hasQuizData: boolean;
  outfitCount: number;
  favCount: number;
  archetype?: string;
  colorPalette?: string[];
  lastActive?: Date;
  photoAnalyzed?: boolean;
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

function getDayOfWeek(): 'weekday' | 'weekend' {
  const day = new Date().getDay();
  return (day === 0 || day === 6) ? 'weekend' : 'weekday';
}

export function generateAmbientInsights(context: UserContext): AmbientInsight[] {
  const insights: AmbientInsight[] = [];
  const now = new Date();
  const month = now.getMonth();
  const timeOfDay = getTimeOfDay();
  const dayType = getDayOfWeek();

  if (!context.hasQuizData) {
    insights.push({
      type: 'personal-goal',
      insight: 'Start je stijlreis met onze slimme quiz',
      action: 'Quiz starten',
      actionLink: '/onboarding',
      confidence: 1.0,
      priority: 'high'
    });
    return insights;
  }

  if (!context.photoAnalyzed) {
    insights.push({
      type: 'color-advice',
      insight: 'Upload een foto voor gepersonaliseerd kleuradvies',
      action: 'Foto uploaden',
      actionLink: '/profile',
      confidence: 0.95,
      priority: 'high'
    });
  }

  if (timeOfDay === 'morning' && dayType === 'weekday' && context.outfitCount > 0) {
    insights.push({
      type: 'upcoming-event',
      insight: 'Goede morgen! Start je werkdag met een van je opgeslagen professionele looks',
      action: 'Bekijk work outfits',
      actionLink: '/results?occasion=work',
      confidence: 0.93,
      priority: 'high'
    });
  } else if (timeOfDay === 'morning' && dayType === 'weekend') {
    insights.push({
      type: 'style-tip',
      insight: 'Weekend vibes! Perfect moment om casual looks te ontdekken',
      action: 'Casual outfits',
      actionLink: '/results?occasion=casual',
      confidence: 0.90,
      priority: 'medium'
    });
  } else if (timeOfDay === 'evening' && context.outfitCount > 0) {
    insights.push({
      type: 'personal-goal',
      insight: 'Bereid je voor op morgen - bekijk je outfit opties voor overmorgen',
      action: 'Plan je week',
      actionLink: '/results',
      confidence: 0.85,
      priority: 'medium'
    });
  } else if (timeOfDay === 'afternoon' && context.favCount < 10) {
    insights.push({
      type: 'personal-goal',
      insight: `Nog ${10 - context.favCount} outfits te ontdekken vandaag - blijf je streak gaande!`,
      action: 'Ontdek meer',
      actionLink: '/results',
      confidence: 0.88,
      priority: 'medium'
    });
  }

  if (month >= 10 || month <= 1) {
    insights.push({
      type: 'seasonal',
      insight: 'Winter komt eraan - ontdek warme layering tips voor jouw stijl',
      action: 'Bekijk winter outfits',
      actionLink: '/results?season=winter',
      confidence: 0.88,
      priority: 'medium'
    });
  } else if (month >= 5 && month <= 8) {
    insights.push({
      type: 'seasonal',
      insight: 'Zomer-essentials: lichte stoffen in jouw kleurenpalet',
      action: 'Ontdek zomer looks',
      actionLink: '/results?season=summer',
      confidence: 0.88,
      priority: 'medium'
    });
  }

  if (context.archetype === 'Klassiek' && context.colorPalette) {
    insights.push({
      type: 'style-tip',
      insight: 'Probeer navy met camel voor een tijdloze klassieke look',
      action: 'Toon matches',
      actionLink: '/results?colors=navy,camel',
      confidence: 0.92,
      priority: 'medium'
    });
  }

  if (context.archetype === 'Sportief' && context.outfitCount < 5) {
    insights.push({
      type: 'gap',
      insight: 'Je collectie mist nog athleisure looks voor weekend',
      action: 'Ontdek casual',
      actionLink: '/results?occasion=casual',
      confidence: 0.85,
      priority: 'medium'
    });
  }

  if (context.favCount < 3) {
    insights.push({
      type: 'personal-goal',
      insight: 'Save je eerste 3 outfits om betere aanbevelingen te krijgen',
      action: 'Bekijk outfits',
      actionLink: '/results',
      confidence: 0.90,
      priority: 'medium'
    });
  }

  insights.push({
    type: 'trending',
    insight: 'Oversized blazers zijn trending en passen perfect bij jouw stijl',
    action: 'Bekijk blazers',
    actionLink: '/results?category=blazers',
    confidence: 0.82,
    priority: 'low'
  });

  if (context.colorPalette && context.colorPalette.length > 0) {
    insights.push({
      type: 'color-advice',
      insight: `Je kleurenpalet bevat ${context.colorPalette.length} perfecte kleuren - ontdek nieuwe combinaties`,
      action: 'Kleurcombinaties',
      actionLink: '/results?colorMatch=true',
      confidence: 0.87,
      priority: 'low'
    });
  }

  return insights.sort((a, b) => {
    const priorityScore = { high: 3, medium: 2, low: 1 };
    const aPrio = priorityScore[a.priority];
    const bPrio = priorityScore[b.priority];
    if (aPrio !== bPrio) return bPrio - aPrio;
    return b.confidence - a.confidence;
  });
}
