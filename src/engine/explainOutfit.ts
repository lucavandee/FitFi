import { Product, Outfit, Season, ProductCategory, Weather, CategoryRatio } from './types';
import { getDutchSeasonName, getDutchWeatherDescription } from './helpers';

/**
 * Generates a personalized explanation for why an outfit fits the user's style and occasion
 * 
 * @param outfit - The outfit to explain
 * @param archetype - The user's primary style archetype
 * @param occasion - The occasion the outfit is designed for
 * @param userName - Optional user's first name for personalization
 * @returns A personalized explanation string
 */
export function generateOutfitExplanation(
  outfit: Outfit,
  archetype: string,
  occasion: string,
  userName?: string
): string {
  // Get key elements from the outfit
  const products = outfit.products || [];
  const tags = outfit.tags || [];
  const secondaryArchetype = outfit.secondaryArchetype;
  const mixFactor = outfit.mixFactor || 0;
  const season = outfit.season as Season | undefined;
  const structure = outfit.structure || [];
  const weather = outfit.weather;
  const categoryRatio = outfit.categoryRatio;
  const completeness = outfit.completeness || 0;

  // Archetype-specific style elements
  const archetypeElements: Record<string, string[]> = {
    'klassiek': ['strakke lijnen', 'tijdloze kleuren', 'verfijnde details', 'elegante silhouetten'],
    'casual_chic': ['comfortabele pasvorm', 'zachte stoffen', 'subtiele details', 'moeiteloze combinaties'],
    'urban': ['functionele details', 'praktische stoffen', 'moderne silhouetten', 'veelzijdige items'],
    'streetstyle': ['gedurfde kleuren', 'opvallende prints', 'unieke details', 'statement stukken'],
    'retro': ['vintage-geïnspireerde details', 'nostalgische kleuren', 'klassieke silhouetten', 'tijdloze patronen'],
    'luxury': ['hoogwaardige materialen', 'perfecte afwerking', 'subtiele luxe details', 'exclusieve ontwerpen']
  };

  // Occasion-specific benefits
  const occasionBenefits: Record<string, string[]> = {
    'Werk': ['professionele uitstraling', 'comfort tijdens lange dagen', 'veelzijdigheid voor verschillende werksituaties'],
    'Formeel': ['elegante presentatie', 'verfijnde uitstraling', 'gepaste formaliteit'],
    'Casual': ['dagelijks comfort', 'moeiteloze stijl', 'praktische veelzijdigheid'],
    'Weekend': ['ontspannen comfort', 'stijl zonder moeite', 'veelzijdigheid voor verschillende activiteiten'],
    'Lunch': ['verzorgde casual look', 'comfortabele elegantie', 'veelzijdige stijl'],
    'Stad': ['urban functionaliteit', 'stijlvolle mobiliteit', 'comfort voor stadse avonturen'],
    'Actief': ['bewegingsvrijheid', 'functionele details', 'comfort tijdens activiteiten'],
    'Uitgaan': ['opvallende stijl', 'comfort voor de hele avond', 'unieke uitstraling'],
    'Festival': ['weerbestendige elementen', 'comfort voor lange dagen', 'opvallende details'],
    'Creatief': ['expressieve elementen', 'unieke combinaties', 'persoonlijke uitstraling'],
    'Gala': ['formele elegantie', 'luxueuze details', 'memorabele presentatie'],
    'Speciale gelegenheid': ['bijzondere details', 'memorabele uitstraling', 'gepaste feestelijkheid'],
    'Zakelijk diner': ['professionele elegantie', 'verfijnde details', 'gepaste formaliteit']
  };

  // Season-specific elements
  const seasonElements: Record<Season, string[]> = {
    'spring': ['lichte stoffen', 'frisse kleuren', 'veelzijdige laagjes'],
    'summer': ['ademende materialen', 'lichte kleuren', 'zonbestendige items'],
    'autumn': ['warme tinten', 'comfortabele laagjes', 'veelzijdige overgangsstukken'],
    'winter': ['warme materialen', 'slimme laagjes', 'seizoensgebonden texturen']
  };

  // Weather-specific elements
  const weatherElements: Record<string, string[]> = {
    'cold': ['isolerende lagen', 'warmte-vasthoudende materialen', 'beschermende items'],
    'mild': ['aanpasbare lagen', 'veelzijdige stukken', 'comfortabele materialen'],
    'warm': ['luchtige stoffen', 'lichte kleuren', 'ademende materialen'],
    'hot': ['minimale lagen', 'ultra-lichte stoffen', 'zonbestendige items'],
    'rainy': ['waterafstotende items', 'praktische lagen', 'beschermende accessoires'],
    'snowy': ['waterdichte items', 'isolerende lagen', 'grip-biedende schoenen'],
    'windy': ['windbestendige items', 'goed aansluitende stukken', 'beschermende lagen']
  };

  // Structure-specific descriptions
  const structureDescriptions: Record<string, string> = {
    [ProductCategory.TOP]: 'bovenstuk',
    [ProductCategory.BOTTOM]: 'onderstuk',
    [ProductCategory.FOOTWEAR]: 'schoenen',
    [ProductCategory.ACCESSORY]: 'accessoire',
    [ProductCategory.OUTERWEAR]: 'jas of vest',
    [ProductCategory.DRESS]: 'jurk',
    [ProductCategory.JUMPSUIT]: 'jumpsuit',
    [ProductCategory.OTHER]: 'item'
  };

  // Completeness descriptions
  const completenessDescriptions: Record<string, string> = {
    'high': 'perfect gebalanceerde',
    'medium': 'goed samengestelde',
    'low': 'basis'
  };

  // Get completeness level
  const completenessLevel = completeness >= 90 ? 'high' : completeness >= 70 ? 'medium' : 'low';
  const completenessDescription = completenessDescriptions[completenessLevel];

  // Select elements based on primary archetype
  const primaryElements = archetypeElements[archetype] || ['stijlvolle elementen'];
  const primaryElement = primaryElements[Math.floor(Math.random() * primaryElements.length)];

  // Start building the explanation
  let explanation = '';

  // Add personalization if name is provided
  if (userName) {
    explanation += `${userName}, `;
  }

  // Basic explanation structure
  explanation += `deze ${completenessDescription} outfit is speciaal samengesteld om te passen bij jouw ${getArchetypeAdjective(archetype)} stijlvoorkeur. `;

  // Add hybrid style explanation if applicable
  if (secondaryArchetype && secondaryArchetype !== archetype && mixFactor >= 0.2) {
    const secondaryElements = archetypeElements[secondaryArchetype] || ['stijlvolle elementen'];
    const secondaryElement = secondaryElements[Math.floor(Math.random() * secondaryElements.length)];
    
    explanation += `De combinatie van ${primaryElement} met ${secondaryElement} creëert een unieke look die jouw ${getArchetypeAdjective(archetype)} basis verrijkt met ${getArchetypeAdjective(secondaryArchetype)} invloeden. `;
  } else {
    explanation += `De ${primaryElement} in deze look benadrukken jouw persoonlijke stijl. `;
  }

  // Add structure-specific explanation
  if (structure && structure.length > 0) {
    const structureDescription = structure
      .map(category => structureDescriptions[category] || 'item')
      .join(', ');
    
    explanation += `De combinatie van ${structureDescription} volgt een klassieke ${getArchetypeAdjective(archetype)} structuur. `;
  }

  // Add category ratio explanation if available
  if (categoryRatio) {
    // Find the dominant category
    let dominantCategory: keyof CategoryRatio | null = null;
    let dominantRatio = 0;
    
    Object.entries(categoryRatio).forEach(([category, ratio]) => {
      if (ratio > dominantRatio && ratio > 0) {
        dominantCategory = category as keyof CategoryRatio;
        dominantRatio = ratio;
      }
    });
    
    if (dominantCategory && dominantRatio > 30) {
      explanation += `Met nadruk op ${structureDescriptions[dominantCategory] || dominantCategory} (${dominantRatio}%) creëert deze outfit een ${getBalanceDescription(categoryRatio)} balans. `;
    }
  }

  // Add occasion-specific explanation
  const occasionBenefitList = occasionBenefits[occasion] || ['veelzijdigheid', 'stijl', 'comfort'];
  const occasionBenefit = occasionBenefitList[Math.floor(Math.random() * occasionBenefitList.length)];
  
  explanation += `Voor ${occasion.toLowerCase()} biedt deze combinatie ${occasionBenefit} `;

  // Add season-specific explanation if available
  if (season && seasonElements[season]) {
    const seasonElementList = seasonElements[season] || [];
    const seasonElement = seasonElementList[Math.floor(Math.random() * seasonElementList.length)];
    
    explanation += `met ${seasonElement} die perfect zijn voor het ${getDutchSeasonName(season).toLowerCase()}seizoen. `;
  } else {
    explanation += `met een tijdloze uitstraling die het hele jaar door gedragen kan worden. `;
  }

  // Add weather-specific explanation if available
  if (weather && weatherElements[weather]) {
    const weatherElementList = weatherElements[weather] || [];
    const weatherElement = weatherElementList[Math.floor(Math.random() * weatherElementList.length)];
    
    explanation += `De ${weatherElement} zijn ideaal voor ${getDutchWeatherDescription(weather)} omstandigheden. `;
  }

  // Add product-specific highlights if available
  if (products.length > 0) {
    const keyProduct = products[0]; // Highlight the first product
    explanation += `De ${keyProduct.name?.toLowerCase() || 'items'} ${products.length > 1 ? 'en bijpassende items ' : ''}`;
    
    // Add brand mention if available
    if (keyProduct.brand) {
      explanation += `van ${keyProduct.brand} `;
    }
    
    explanation += `zijn zorgvuldig geselecteerd om jouw persoonlijke stijl te complementeren.`;
  } else {
    explanation += `Alle items zijn zorgvuldig geselecteerd om jouw persoonlijke stijl te complementeren.`;
  }

  return explanation;
}

/**
 * Gets a descriptive adjective for an archetype
 */
function getArchetypeAdjective(archetype: string): string {
  const adjectiveMap: Record<string, string> = {
    'klassiek': 'klassieke',
    'casual_chic': 'casual chic',
    'urban': 'urban',
    'streetstyle': 'streetstyle',
    'retro': 'retro',
    'luxury': 'luxe'
  };
  
  return adjectiveMap[archetype] || archetype;
}

/**
 * Gets a description of the outfit balance based on category ratio
 */
function getBalanceDescription(ratio: CategoryRatio): string {
  // Check if the outfit is top-heavy, bottom-heavy, or balanced
  const topRatio = ratio.top + (ratio.outerwear / 2);
  const bottomRatio = ratio.bottom;
  const accessoryRatio = ratio.accessory;
  
  if (topRatio > bottomRatio * 1.5) {
    return 'top-heavy';
  } else if (bottomRatio > topRatio * 1.5) {
    return 'bottom-heavy';
  } else if (accessoryRatio > 30) {
    return 'accessory-focused';
  } else {
    return 'evenwichtige';
  }
}

export default generateOutfitExplanation;