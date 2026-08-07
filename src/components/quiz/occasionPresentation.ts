import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Coffee,
  Dumbbell,
  Moon,
  PartyPopper,
  Plane,
  Sparkles,
} from 'lucide-react';

/**
 * Hoe een gelegenheid op de calibratiekaart heet.
 *
 * Deze map hoort elke gelegenheid te kennen die engine v2 kan opleveren
 * (`OccasionKey`: work, casual, formal, date, travel, sport, party). Toen hij
 * nog in `OutfitCalibrationCard` stond met alleen work, casual en evening,
 * viel alles daarbuiten via de fallback terug op "Casual dag uit" — ook een
 * outfit die voor een gala was gecomponeerd. Apart bestand zodat een test kan
 * afdwingen dat er geen gelegenheid ontbreekt.
 *
 * 'smart-casual' en 'evening' staan erbij als alias voor outfits uit het oude
 * adaptieve pad die nog in een sessie-cache kunnen zitten.
 */
export interface OccasionPresentation {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

export const OCCASION_PRESENTATION: Record<string, OccasionPresentation> = {
  work: {
    icon: Briefcase,
    title: 'Kantoor',
    subtitle: 'Zakelijke meeting of werkdag',
  },
  casual: {
    icon: Coffee,
    title: 'Casual dag uit',
    subtitle: 'Lunch, koffie, boodschappen',
  },
  'smart-casual': {
    icon: Coffee,
    title: 'Net casual',
    subtitle: 'Verzorgd zonder pak',
  },
  formal: {
    icon: Sparkles,
    title: 'Formele gelegenheid',
    subtitle: 'Gala, bruiloft of chic diner',
  },
  date: {
    icon: Moon,
    title: 'Date night',
    subtitle: 'Restaurant, borrel of diner',
  },
  evening: {
    icon: Moon,
    title: 'Avondje uit',
    subtitle: 'Restaurant, borrel of diner',
  },
  travel: {
    icon: Plane,
    title: 'Onderweg',
    subtitle: 'Reizen, weekendtrip of pendel',
  },
  sport: {
    icon: Dumbbell,
    title: 'Sport en actief',
    subtitle: 'Gym, hardlopen of wandelen',
  },
  party: {
    icon: PartyPopper,
    title: 'Uitgaan',
    subtitle: 'Feest, festival of stappen',
  },
};

export function presentationForOccasion(occasion?: string): OccasionPresentation {
  const key = occasion?.toLowerCase() ?? 'casual';
  return OCCASION_PRESENTATION[key] ?? OCCASION_PRESENTATION.casual;
}
