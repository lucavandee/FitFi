export type AchievementType =
  | 'quiz_started'
  | 'gender_selected'
  | 'style_defined'
  | 'colors_chosen'
  | 'body_mapped'
  | 'occasions_set'
  | 'visual_prefs_started'
  | 'visual_prefs_complete'
  | 'calibration_started'
  | 'calibration_complete'
  | 'quiz_complete';

export interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export interface QuizMilestone {
  step: number;
  phase: 'questions' | 'swipes' | 'calibration';
  achievement: AchievementType;
  reward: {
    type: 'insight' | 'preview' | 'unlock';
    message: string;
    subMessage?: string;
  };
}

export const QUIZ_MILESTONES: QuizMilestone[] = [
  {
    step: 0,
    phase: 'questions',
    achievement: 'quiz_started',
    reward: {
      type: 'insight',
      message: 'Welkom! 🎉',
      subMessage: 'Je eerste stap naar je perfecte stijl'
    }
  },
  {
    step: 0,
    phase: 'questions',
    achievement: 'gender_selected',
    reward: {
      type: 'unlock',
      message: 'Geslacht geselecteerd',
      subMessage: 'We filteren nu op jouw voorkeuren'
    }
  },
  {
    step: 1,
    phase: 'questions',
    achievement: 'style_defined',
    reward: {
      type: 'preview',
      message: '🎨 Stijl Ontgrendeld',
      subMessage: 'We hebben al 150+ outfits die bij je passen'
    }
  },
  {
    step: 2,
    phase: 'questions',
    achievement: 'colors_chosen',
    reward: {
      type: 'insight',
      message: '🌈 Kleurenpalet Gevonden',
      subMessage: 'Deze kleuren gaan je fantastisch staan'
    }
  },
  {
    step: 3,
    phase: 'questions',
    achievement: 'body_mapped',
    reward: {
      type: 'unlock',
      message: '✨ Pasvorm Geoptimaliseerd',
      subMessage: 'Outfits worden nu op jouw lichaam afgestemd'
    }
  },
  {
    step: 4,
    phase: 'questions',
    achievement: 'occasions_set',
    reward: {
      type: 'preview',
      message: '🎯 Gelegenheden Klaar',
      subMessage: 'Nog 2 minuten tot je perfecte outfits!'
    }
  },
  {
    step: 0,
    phase: 'swipes',
    achievement: 'visual_prefs_started',
    reward: {
      type: 'insight',
      message: '👀 Visuele Voorkeuren',
      subMessage: 'Swipe om je unieke smaak te verfijnen'
    }
  },
  {
    step: 10,
    phase: 'swipes',
    achievement: 'visual_prefs_complete',
    reward: {
      type: 'unlock',
      message: '🎨 Smaak Geperfectioneerd',
      subMessage: 'Je Style DNA wordt nu gegenereerd...'
    }
  },
  {
    step: 0,
    phase: 'calibration',
    achievement: 'calibration_started',
    reward: {
      type: 'preview',
      message: '🎯 Finale Tuning',
      subMessage: 'Laat ons zien wat je mooi vindt'
    }
  },
  {
    step: 3,
    phase: 'calibration',
    achievement: 'calibration_complete',
    reward: {
      type: 'unlock',
      message: '✅ Calibratie Compleet',
      subMessage: 'Je outfits worden nu gegenereerd!'
    }
  }
];

export interface CuriosityTrigger {
  step: number;
  phase: 'questions' | 'swipes' | 'calibration';
  message: string;
  type: 'tease' | 'progress' | 'anticipation';
}

export const CURIOSITY_TRIGGERS: CuriosityTrigger[] = [
  {
    step: 1,
    phase: 'questions',
    message: 'Je profiel komt overeen met Minimalist stijl... 🤔',
    type: 'tease'
  },
  {
    step: 2,
    phase: 'questions',
    message: '47 outfits gevonden die perfect bij je passen... ✨',
    type: 'progress'
  },
  {
    step: 3,
    phase: 'questions',
    message: 'Bijna klaar! Je Style DNA is 80% compleet... 🎨',
    type: 'progress'
  },
  {
    step: 4,
    phase: 'questions',
    message: 'Laatste stap! Je outfits wachten op je... 🎉',
    type: 'anticipation'
  },
  {
    step: 5,
    phase: 'swipes',
    message: '50% door de swipes! Je smaak wordt duidelijker... 👀',
    type: 'progress'
  },
  {
    step: 1,
    phase: 'calibration',
    message: 'Je outfits worden on-the-fly gegenereerd... ⚡',
    type: 'anticipation'
  }
];
