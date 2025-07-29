import { Achievement } from '../types/achievements';

export const achievements: Achievement[] = [
  {
    id: 'style_explorer',
    title: 'Stijl Ontdekker',
    description: 'Eerste quiz voltooid en stijlprofiel ontdekt',
    icon: '🔍',
    type: 'style_explorer',
    rarity: 'common',
    condition: (answers) => !!answers && Object.keys(answers).length >= 5
  },
  {
    id: 'color_master',
    title: 'Kleur Meester',
    description: 'Perfect kleurpalet gekozen voor jouw huidtoon',
    icon: '🎨',
    type: 'color_master',
    rarity: 'rare',
    condition: (answers) => answers?.baseColors && ['neutral', 'jewel'].includes(answers.baseColors)
  },
  {
    id: 'speed_demon',
    title: 'Snelle Beslisser',
    description: 'Quiz voltooid in minder dan 2 minuten',
    icon: '⚡',
    type: 'completion_speed',
    rarity: 'epic',
    condition: (answers, metadata) => metadata?.completionTime && metadata.completionTime < 120000
  },
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Alle vragen beantwoord met maximale zorgvuldigheid',
    icon: '💎',
    type: 'perfectionist',
    rarity: 'legendary',
    condition: (answers) => {
      return answers?.stylePreferences?.length >= 3 && 
             answers?.occasions?.length >= 4 &&
             answers?.budgetRange >= 100;
    }
  },
  {
    id: 'social_butterfly',
    title: 'Social Butterfly',
    description: 'Stijlprofiel gedeeld op social media',
    icon: '🦋',
    type: 'social_sharer',
    rarity: 'rare',
    condition: (answers, metadata) => metadata?.shared === true
  },
  {
    id: 'trendsetter',
    title: 'Trendsetter',
    description: 'Unieke stijlcombinatie ontdekt',
    icon: '✨',
    type: 'style_explorer',
    rarity: 'epic',
    condition: (answers) => {
      const styles = answers?.stylePreferences || [];
      return styles.includes('edgy') && styles.includes('romantic');
    }
  }
];

export const getEarnedAchievements = (answers: any, metadata: any = {}): Achievement[] => {
  return achievements.filter(achievement => achievement.condition(answers, metadata));
};

export const getAchievementById = (id: string): Achievement | undefined => {
  return achievements.find(achievement => achievement.id === id);
};