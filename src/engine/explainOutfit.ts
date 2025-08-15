import { getDutchSeasonName } from './helpers';
import type { Season } from './types';
import { formatBlendString } from '@/engine/archetypeFusion';
import type { OutfitExplain } from '@/types/style';
import { DEFAULT_ARCHETYPE_MIX } from '@/config/archetypes';

/**
 * Generates a human-readable explanation for why an outfit matches a user's style
 * 
 * @param outfit - The outfit to explain
 * @param archetype - User's primary style archetype
 * @param occasion - The occasion this outfit is for
 * @returns A detailed explanation string
 */
export function generateOutfitExplanation(
  outfit: Outfit,
  archetype: string,
  occasion: string
): string {
  // Base explanation templates for each archetype
  const archetypeExplanations: Record<string, string> = {
    'klassiek': 'Deze outfit past perfect bij jouw klassieke stijl door de tijdloze elegantie en verfijnde details.',
    'casual_chic': 'Deze combinatie belichaamt jouw casual chic aesthetic met moeiteloze elegantie en moderne touches.',
    'urban': 'Deze look sluit aan bij jouw urban stijl met functionele details en een stoere stadslook.',
    'streetstyle': 'Deze outfit past bij jouw streetstyle door de authentieke streetwear elementen en creatieve expressie.',
    'retro': 'Deze combinatie weerspiegelt jouw retro voorkeuren met vintage-geïnspireerde stukken en nostalgische details.',
    'luxury': 'Deze outfit past bij jouw luxury stijl door de exclusieve stukken en premium kwaliteit.'
  };

  // Occasion-specific explanations
  const occasionExplanations: Record<string, string> = {
    'Werk': 'De professionele uitstraling maakt deze outfit perfect voor zakelijke gelegenheden.',
    'Formeel': 'De elegante details zorgen voor een geschikte look voor formele evenementen.',
    'Casual': 'De relaxte pasvorm en comfortabele materialen maken dit ideaal voor dagelijks gebruik.',
    'Weekend': 'De veelzijdige stukken zijn perfect voor een ontspannen weekend.',
    'Uitgaan': 'De statement pieces zorgen voor een opvallende look voor sociale gelegenheden.',
    'Sport': 'De functionele materialen en pasvorm ondersteunen een actieve lifestyle.'
  };

  // Product-specific insights
  const productInsights: string[] = [];
  
  if (outfit.products && outfit.products.length > 0) {
    const categories = outfit.products.map(p => p.category || p.type).filter(Boolean);
    const uniqueCategories = [...new Set(categories)];
    
    if (uniqueCategories.length >= 3) {
      productInsights.push('De complete outfit zorgt voor een gebalanceerde en doordachte look.');
    }
    
    // Check for color coordination
    const brands = outfit.products.map(p => p.brand).filter(Boolean);
    if (brands.length > 1) {
      productInsights.push('De mix van verschillende merken toont jouw persoonlijke stijl.');
    }
  }

  // Seasonal considerations
  let seasonalNote = '';
  if (outfit.season) {
    const seasonMap: Record<string, string> = {
      'spring': 'De lichte materialen en frisse kleuren passen perfect bij het lenteweer.',
      'summer': 'De ademende stoffen en lichte tinten zijn ideaal voor warme zomerdagen.',
      'autumn': 'De warme lagen en rijke kleuren sluiten aan bij het herfstseizoen.',
      'winter': 'De isolerende materialen en donkere tinten bieden warmte en stijl in de winter.'
    };
    
    if (typeof outfit.season === 'string') {
      seasonalNote = seasonMap[outfit.season] || '';
    } else if (Array.isArray(outfit.season) && outfit.season.length > 0) {
      seasonalNote = seasonMap[outfit.season[0]] || '';
    }
  }

  // Combine all explanations
  const explanationParts = [
    archetypeExplanations[archetype] || 'Deze outfit is zorgvuldig geselecteerd voor jouw unieke stijl.',
    occasionExplanations[occasion] || 'Deze combinatie is geschikt voor verschillende gelegenheden.',
    ...productInsights,
    seasonalNote
  ].filter(Boolean);

  return explanationParts.join(' ');
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
  
  const tips = [
    'draag dit met zelfvertrouwen - dat maakt het verschil!',
    'voeg een persoonlijk accent toe met je favoriete accessoire.',
    'de kleuren in deze outfit laten je huid stralen.',
    'deze pasvorm flatteert jouw lichaamsbouw optimaal.',
    'perfect voor jouw lifestyle en persoonlijkheid!'
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  explanation += randomTip;
  
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

type ExplainOpts = {
  archetypeMix?: Record<string, number>;
  signals?: string[]; // uit _fusion.matchedSignals
};

export function explainOutfit(o: any, opts: ExplainOpts = {}): OutfitExplain {
  const blend = formatBlendString(opts.archetypeMix ?? DEFAULT_ARCHETYPE_MIX);
  const sig = (opts.signals ?? []).slice(0, 6);

  const headline = `Hybride match: ${blend}`;
  const rationale: string[] = [];

  // eenvoudige, menselijke uitleg
  if (sig.length) {
    rationale.push(`Wij herkennen: ${sig.join(', ')}.`);
  }
  if (o?.matchScore != null) {
    if (o.matchScore >= 80) rationale.push('Sterke consistentie met je stijl-DNA; dit voelt meteen "juist".');
    else if (o.matchScore >= 60) rationale.push('Goede basis met ruimte voor nuance (accessoires of kleuraccent).');
    else rationale.push('Experimentele match — interessant voor variatie, maar minder kern-stijl.');
  }

  // voorbeeld nuance
  rationale.push('Tip: combineer één statement item met twee rustige basics voor balans.');

  return {
    headline,
    rationale,
    archetypeBlend: blend,
    signals: sig,
  };
}

// Legacy exports for backward compatibility