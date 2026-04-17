import { Outfit, UserProfile } from './types';
import { calculateMatchScore } from '@/services/outfits/matchScoreCalculator';

/**
 * Generates a human-readable explanation for why an outfit matches a user's style
 * 
 * @param outfit - The outfit to explain
 * @param archetype - User's primary style archetype
 * @param occasion - The occasion this outfit is for
 * @returns A detailed explanation string
 */
export interface ExplainContext {
  fit?: string;
  goals?: string[];
  prints?: string;
  neutrals?: string;
  lightness?: string;
  contrast?: string;
  budgetMax?: number;
  materials?: string[];
}

export function generateOutfitExplanation(
  outfit: Outfit,
  archetype: string,
  occasion: string,
  ctx?: ExplainContext
): string {
  const archetypeExplanations: Record<string, string> = {
    'klassiek': 'tijdloze elegantie en verfijnde details',
    'CLASSIC': 'tijdloze elegantie en verfijnde details',
    'casual_chic': 'moeiteloze elegantie en moderne touches',
    'SMART_CASUAL': 'moeiteloze elegantie en moderne touches',
    'urban': 'expressieve streetwear-elementen en een stoere stadslook',
    'streetstyle': 'authentieke streetwear met statement-stukken en creatieve expressie',
    'STREETWEAR': 'expressieve streetwear met oversized silhouetten en urban invloeden',
    'minimalist': 'clean lijnen en doordachte eenvoud',
    'MINIMALIST': 'clean lijnen en doordachte eenvoud',
    'retro': 'vintage-geïnspireerde stukken en nostalgische details',
    'luxury': 'exclusieve stukken en premium kwaliteit',
    'ATHLETIC': 'functionele sportswear met nadruk op performance en comfort',
    'athletic': 'functionele sportswear met nadruk op performance en comfort',
    'avant_garde': 'conceptuele mode met onverwachte proporties en texturen',
    'AVANT_GARDE': 'conceptuele mode met onverwachte proporties en texturen',
    'business': 'getailleerde looks voor kantoor en formele momenten',
    'BUSINESS': 'getailleerde looks voor kantoor en formele momenten',
  };

  const occasionLabels: Record<string, string> = {
    'Werk': 'voor een professionele werkdag',
    'Smart Casual': 'voor een smart-casual gelegenheid',
    'Dagelijks': 'voor alledaags gebruik',
    'Weekend': 'voor een ontspannen weekend',
    'Avond uit': 'voor een avond uit',
    'Actief': 'voor een actieve dag',
    'Date': 'voor een date',
    'Relaxed': 'voor een relaxte dag',
    'Casual': 'voor alledaags gebruik',
    'Uitgaan': 'voor een avond uit',
  };

  const fitLabels: Record<string, string> = {
    slim: 'nauwsluitende silhouetten',
    regular: 'klassieke pasvorm',
    relaxed: 'relaxte silhouetten',
    oversized: 'oversized proportties',
    straight: 'rechte snit',
    oversizedTop_slimBottom: 'contrast in proporties',
  };

  const goalLabels: Record<string, string> = {
    timeless: 'tijdloze stukken',
    trendy: 'trendy items',
    minimal: 'minimale looks',
    express: 'zelfexpressie',
    professional: 'professionele uitstraling',
    comfort: 'maximaal comfort',
  };

  const archetypeDesc = archetypeExplanations[archetype] || 'jouw unieke stijl';
  const occasionLabel = occasionLabels[occasion] || `voor ${occasion.toLowerCase()}`;

  let base = `Samengesteld op basis van ${archetypeDesc} — ${occasionLabel}.`;

  if (ctx?.fit && fitLabels[ctx.fit]) {
    base += ` Geselecteerd op ${fitLabels[ctx.fit]}.`;
  }

  if (ctx?.goals && ctx.goals.length > 0) {
    const topGoals = ctx.goals.slice(0, 2).map(g => goalLabels[g] ?? g);
    base += ` Stijldoel: ${topGoals.join(' en ')}.`;
  }

  const colorExplainParts: string[] = [];
  if (ctx?.neutrals) {
    const tempMap: Record<string, string> = {
      warm: 'warme kleurtemperatuur',
      koel: 'koele kleurtemperatuur',
      neutraal: 'neutrale kleurtemperatuur',
    };
    if (tempMap[ctx.neutrals]) colorExplainParts.push(tempMap[ctx.neutrals]);
  }
  if (ctx?.lightness) {
    const valMap: Record<string, string> = {
      licht: 'lichte tinten',
      medium: 'middentonen',
      donker: 'diepe tinten',
    };
    if (valMap[ctx.lightness]) colorExplainParts.push(valMap[ctx.lightness]);
  }
  if (ctx?.contrast) {
    const conMap: Record<string, string> = {
      laag: 'laag contrast (tonal)',
      medium: 'gemiddeld contrast',
      hoog: 'hoog contrast',
    };
    if (conMap[ctx.contrast]) colorExplainParts.push(conMap[ctx.contrast]);
  }
  if (colorExplainParts.length > 0) {
    base += ` Kleuren afgestemd op jouw ${colorExplainParts.join(', ')}.`;
  }

  if (ctx?.prints === 'effen' || ctx?.prints === 'geen') {
    base += ' Bewust clean gehouden — geen prints.';
  } else if (ctx?.prints === 'statement') {
    base += ' Bevat een statement-print passend bij jouw voorkeur.';
  } else if (ctx?.prints === 'subtiel' || ctx?.prints === 'subtle') {
    base += ' Subtiele prints voor een verfijnde look.';
  }

  if (ctx?.materials && ctx.materials.length > 0) {
    const materialLabels: Record<string, string> = {
      denim: 'denim', leer: 'leer', katoen: 'katoen', linnen: 'linnen',
      wol: 'wol', kasjmier: 'kasjmier', tech: 'technische stoffen',
      fleece: 'fleece', canvas: 'canvas', zijde: 'zijde', coated: 'gecoate stoffen',
      ribstof: 'ribstof', stretch: 'stretchmateriaal', mesh: 'mesh',
    };
    const labels = ctx.materials
      .map(m => materialLabels[m] || m)
      .filter(Boolean)
      .slice(0, 3);
    if (labels.length > 0) {
      base += ` Materiaalvoorkeur verwerkt: ${labels.join(', ')}.`;
    }
  }

  if (ctx?.budgetMax && ctx.budgetMax > 0) {
    base += ` Geselecteerd binnen jouw budget van \u20AC${ctx.budgetMax} per stuk.`;
  }

  if (outfit.season) {
    const seasonMap: Record<string, string> = {
      spring: 'Frisse lentekleuren en lichte materialen.',
      summer: 'Luchtige stoffen voor warme dagen.',
      autumn: 'Warme lagen voor het herfstseizoen.',
      winter: 'Isolerende materialen voor koude dagen.',
    };
    const s = typeof outfit.season === 'string' ? outfit.season : outfit.season[0];
    if (s && seasonMap[s]) base += ` ${seasonMap[s]}`;
  }

  return base;
}

/**
 * Generates Nova's personalized explanation for an outfit
 * 
 * @param outfit - The outfit to explain
 * @param userProfile - User's style profile
 * @returns Nova's personalized explanation
 */
export function generateNovaExplanation(
  outfit: Outfit,
  userProfile?: UserProfile
): string {
  const userName = userProfile?.name || 'daar';
  
  let explanation = `Hoi ${userName}! `;
  
  // Personalize based on user's style preferences
  if (userProfile?.stylePreferences) {
    const topPreference = Object.entries(userProfile.stylePreferences)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topPreference) {
      const [style, score] = topPreference;
      explanation += `Ik zie dat je van ${style} stijl houdt (score: ${score}/5), `;
    }
  }
  
  explanation += `daarom heb ik deze ${outfit.archetype?.replace('_', ' ')} outfit voor je geselecteerd. `;
  
  // Add specific product insights
  if (outfit.products && outfit.products.length > 0) {
    const keyProduct = outfit.products[0];
    if (keyProduct) {
      explanation += `Het ${keyProduct.name || keyProduct.type} vormt de basis van deze look `;
      
      if (keyProduct.brand) {
        explanation += `van ${keyProduct.brand} `;
      }
      
      explanation += 'en combineert perfect met de andere stukken. ';
    }
  } else {
    // Fallback when no products available
    explanation += `Deze ${outfit.title} combineert perfect met jouw stijlvoorkeuren. `;
  }
  
  // Add styling tip
  explanation += 'Pro tip: ';
  
  // Calculate real match score breakdown
  let scoreBreakdown: { archetype?: number; color?: number; style?: number; season?: number } = {};

  if (userProfile) {
    try {
      const matchResult = calculateMatchScore({
        outfit: {
          style: outfit.archetype,
          colors: outfit.colors || [],
          occasion: outfit.occasion,
          season: outfit.season,
          items: outfit.products || []
        },
        userProfile: {
          archetype: userProfile.archetype,
          colorPalette: userProfile.colorPalette || [],
          preferences: {
            styles: userProfile.stylePreferences ? Object.keys(userProfile.stylePreferences) : [],
            occasions: []
          }
        }
      });
      scoreBreakdown = matchResult.breakdown;
    } catch (e) {
      console.warn('Match score calculation failed:', e);
    }
  }

  // Generate intelligent tip based on score breakdown
  const tips: string[] = [];

  if (scoreBreakdown.archetype && scoreBreakdown.archetype >= 0.9) {
    tips.push('deze stijl past extreem goed bij jouw archetype!');
  }
  if (scoreBreakdown.color && scoreBreakdown.color >= 0.9) {
    tips.push('de kleuren in deze outfit laten je huid perfect stralen.');
  }
  if (scoreBreakdown.season && scoreBreakdown.season >= 0.9) {
    tips.push('perfect getimed voor het huidige seizoen!');
  }

  // Fallback tips if no high scores
  if (tips.length === 0) {
    tips.push(
      'draag dit met zelfvertrouwen - dat maakt het verschil!',
      'voeg een persoonlijk accent toe met je favoriete accessoire.',
      'deze pasvorm flatteert jouw lichaamsbouw optimaal.',
      'perfect voor jouw lifestyle en persoonlijkheid!'
    );
  }

  const selectedTip = tips[0];
  explanation += selectedTip;
  
  // Add match percentage context
  const matchPercentage = outfit.matchPercentage || 75;
  if (matchPercentage >= 90) {
    explanation += ' Deze outfit scoort extreem hoog voor jouw profiel!';
  } else if (matchPercentage >= 80) {
    explanation += ' Een sterke match voor jouw stijl.';
  } else if (matchPercentage >= 70) {
    explanation += ' Een goede basis die je kunt personaliseren.';
  }
  
  return explanation;
}

/**
 * Legacy function for backward compatibility
 */
export function explainOutfit(
  outfit: Outfit,
  archetype: string,
  occasion: string = 'Casual'
): string {
  return generateOutfitExplanation(outfit, archetype, occasion);
}