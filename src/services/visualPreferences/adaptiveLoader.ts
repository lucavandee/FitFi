import type { MoodPhoto } from './visualPreferenceService';
import type { SwipePattern } from './swipeAnalyzer';

interface AdaptiveLoadOptions {
  pattern: SwipePattern;
  gender: string;
  excludeIds: number[];
  count: number;
  allPhotos: MoodPhoto[];
}

interface ArchetypeSimilarity {
  [key: string]: string[];
}

const ARCHETYPE_SIMILARITY: ArchetypeSimilarity = {
  minimal: ['classic', 'refined', 'monochrome', 'contemporary'],
  classic: ['minimal', 'refined', 'professional', 'tailored'],
  romantic: ['feminine', 'soft', 'bohemian', 'elegant'],
  bohemian: ['romantic', 'artistic', 'layered', 'breezy'],
  bold: ['statement', 'colorful', 'urban', 'artistic'],
  urban: ['bold', 'street_refined', 'contemporary', 'casual'],
  sporty: ['athleisure', 'comfortable', 'casual', 'relaxed'],
  refined: ['minimal', 'classic', 'sophisticated', 'polished'],
  relaxed: ['casual', 'comfortable', 'sporty', 'breezy'],
  professional: ['classic', 'tailored', 'polished', 'sophisticated']
};

export function loadAdaptivePhotos(options: AdaptiveLoadOptions): MoodPhoto[] {
  const { pattern, excludeIds, count, allPhotos } = options;

  if (!pattern.shouldAdapt || !pattern.topArchetypes || pattern.topArchetypes.length === 0) {
    return loadRandomPhotos(allPhotos, excludeIds, count);
  }

  const availablePhotos = allPhotos.filter(p => !excludeIds.includes(p.id));

  if (availablePhotos.length === 0) {
    return [];
  }

  const selectedPhotos: MoodPhoto[] = [];
  const topArchetype = pattern.topArchetypes[0];
  const similarArchetypes = ARCHETYPE_SIMILARITY[topArchetype] || [];

  const preferredCount = Math.ceil(count * 0.6);
  const discoveryCount = count - preferredCount;

  const preferredPhotos = availablePhotos.filter(photo => {
    if (!photo.archetype_weights) return false;

    const hasTopArchetype = Object.keys(photo.archetype_weights).includes(topArchetype);
    const hasSimilarArchetype = Object.keys(photo.archetype_weights).some(
      arch => similarArchetypes.includes(arch)
    );

    return hasTopArchetype || hasSimilarArchetype;
  });

  const sortedPreferred = preferredPhotos.sort((a, b) => {
    const aWeight = (a.archetype_weights?.[topArchetype] as number) || 0;
    const bWeight = (b.archetype_weights?.[topArchetype] as number) || 0;
    return bWeight - aWeight;
  });

  selectedPhotos.push(...sortedPreferred.slice(0, preferredCount));

  if (selectedPhotos.length < count) {
    const discoveryPhotos = availablePhotos
      .filter(p => !selectedPhotos.includes(p))
      .sort(() => Math.random() - 0.5)
      .slice(0, discoveryCount);

    selectedPhotos.push(...discoveryPhotos);
  }

  return selectedPhotos.slice(0, count);
}

function loadRandomPhotos(allPhotos: MoodPhoto[], excludeIds: number[], count: number): MoodPhoto[] {
  const available = allPhotos.filter(p => !excludeIds.includes(p.id));
  return available
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}

export function generateAdaptationInsight(pattern: SwipePattern): string | null {
  if (!pattern.shouldAdapt || !pattern.topArchetypes || pattern.topArchetypes.length === 0) {
    return null;
  }

  const topArchetype = pattern.topArchetypes[0];

  const archetypeDescriptions: Record<string, string> = {
    minimal: 'minimalistische stukken',
    classic: 'klassieke tijdloze items',
    romantic: 'zachte romantische lijnen',
    bohemian: 'bohemian lagen en prints',
    bold: 'gedurfde statement pieces',
    urban: 'urban streetstyle',
    sporty: 'sportieve comfort looks',
    refined: 'verfijnde details',
    relaxed: 'relaxte casual vibes',
    professional: 'professionele elegantie'
  };

  const description = archetypeDescriptions[topArchetype] || topArchetype;

  const messages = [
    `Ik zie dat je van ${description} houdt! Ik toon je nu meer vergelijkbare stijlen. 🎯`,
    `Je voorkeur voor ${description} is duidelijk. Laten we daar dieper op ingaan! ✨`,
    `Perfect! Ik zie een patroon: ${description}. Meer hiervan komt eraan! 👗`,
    `Je swipes zijn helder — ${description} past bij je. Ik pas de selectie aan! 🔥`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}
