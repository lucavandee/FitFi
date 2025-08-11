import { Product, Outfit, Season, ProductCategory, Weather, CategoryRatio } from './types';
import { getDutchSeasonName, getDutchWeatherDescription } from './helpers';
import { UserProfile } from '../context/UserContext';

/**
 * Enhanced explanation result with confidence score
 */
interface OutfitExplanationResult {
  text: string;
  confidencePercent: number;
  reasoning: {
    seasonFit: number;
    colorHarmony: number;
    bodyFit: number;
    styleMatch: number;
  };
}

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
  return generateEnhancedOutfitExplanation(outfit, archetype, occasion, userName).text;
}

/**
 * Generates enhanced explanation with confidence scoring
 */
function generateEnhancedOutfitExplanation(
  outfit: Outfit,
  archetype: string,
  occasion: string,
  userName?: string,
  bodyProfile?: any
): OutfitExplanationResult {
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

  // Calculate confidence based on outfit scores
  const seasonFit = outfit.season ? 0.9 : 0.7;
  const colorHarmony = products.length > 0 ? 0.8 : 0.6;
  const bodyFit = bodyProfile ? 0.85 : 0.7;
  const styleMatch = outfit.matchPercentage ? outfit.matchPercentage / 100 : 0.8;
  
  const overallConfidence = (seasonFit + colorHarmony + bodyFit + styleMatch) / 4;
  const confidencePercent = Math.round(overallConfidence * 100);
  
  return {
    text: explanation,
    confidencePercent,
    reasoning: {
      seasonFit,
      colorHarmony,
      bodyFit,
      styleMatch
    }
  };
}

/**
 * Generate Nova's AI explanation for why this outfit was recommended
 * 
 * @param outfitId - The outfit ID to explain
 * @param user - User profile for personalization
 * @param outfit - The outfit object (optional, will fetch if not provided)
 * @returns Nova's explanation string
 */
export async function generateNovaExplanation(
  outfitId: string, 
  user: UserProfile, 
  outfit?: Outfit
): Promise<string> {
  try {
    // If outfit not provided, we'd fetch it (for now use provided)
    if (!outfit) {
      console.warn('Outfit not provided for explanation');
      return 'Nova kon geen uitleg genereren voor deze outfit.';
    }

    const userName = user.name?.split(' ')[0] || 'daar';
    
    // Nova's personality-driven explanations
    const novaIntros = [
      `Hoi ${userName}! Nova hier. `,
      `${userName}, ik heb iets leuks voor je gevonden! `,
      `Perfect timing, ${userName}! `,
      `${userName}, dit wordt jouw nieuwe favoriet: `
    ];
    
    const novaReasonings = {
      'klassiek': [
        'Deze outfit straalt de tijdloze elegantie uit die perfect bij jouw persoonlijkheid past.',
        'De verfijnde details en klassieke snit complementeren jouw natuurlijke stijlgevoel.',
        'Deze combinatie toont jouw voorkeur voor kwaliteit en sophistication.'
      ],
      'casual_chic': [
        'Deze moeiteloze look past perfect bij jouw relaxte maar stijlvolle uitstraling.',
        'De balans tussen comfort en elegantie is precies wat jij zoekt.',
        'Deze outfit laat zien dat stijl niet ingewikkeld hoeft te zijn.'
      ],
      'urban': [
        'Deze functionele look is gemaakt voor jouw dynamische lifestyle.',
        'De praktische details en moderne snit passen bij jouw stadse energie.',
        'Deze outfit combineert stijl met de functionaliteit die jij waardeert.'
      ],
      'streetstyle': [
        'Deze expressieve look laat jouw authentieke persoonlijkheid zien.',
        'De gedurfde elementen en unieke details passen bij jouw creatieve geest.',
        'Deze outfit toont dat jij niet bang bent om op te vallen.'
      ],
      'retro': [
        'Deze vintage-geïnspireerde look past bij jouw unieke smaak.',
        'De nostalgische elementen met moderne twist zijn typisch jouw stijl.',
        'Deze outfit toont jouw waardering voor tijdloze mode met een persoonlijke draai.'
      ],
      'luxury': [
        'Deze exclusieve look past bij jouw verfijnde smaak.',
        'De hoogwaardige materialen en perfecte afwerking zijn wat jij verdient.',
        'Deze outfit straalt de kwaliteit en elegantie uit die jij waardeert.'
      ]
    };
    
    const novaClosings = [
      ' Wat denk je ervan?',
      ' Ik ben benieuwd naar je reactie!',
      ' Laat me weten of dit klopt!',
      ' Dit wordt vast een favoriet van je!'
    ];
    
    // Build Nova's explanation
    const intro = novaIntros[Math.floor(Math.random() * novaIntros.length)];
    const reasoning = novaReasonings[outfit.archetype] || novaReasonings['casual_chic'];
    const mainReason = reasoning[Math.floor(Math.random() * reasoning.length)];
    const closing = novaClosings[Math.floor(Math.random() * novaClosings.length)];
    
    // Add specific details about the outfit
    let specificDetails = '';
    if (outfit.products && outfit.products.length > 0) {
      const keyProduct = outfit.products[0];
      specificDetails = ` De ${keyProduct.name?.toLowerCase() || 'items'} ${outfit.products.length > 1 ? 'en bijpassende stukken ' : ''}zijn zorgvuldig geselecteerd om jouw ${outfit.archetype.replace('_', ' ')} stijl te versterken.`;
    }
    
    // Add seasonal context
    let seasonalContext = '';
    if (outfit.season) {
      seasonalContext = ` Perfect voor het ${getDutchSeasonName(outfit.season).toLowerCase()}seizoen!`;
    }
    
    return `${intro}${mainReason}${specificDetails}${seasonalContext}${closing}`;
    
  } catch (error) {
    console.error('Error generating Nova explanation:', error);
    return `Nova kon geen uitleg genereren voor deze outfit. Probeer het later opnieuw.`;
  }
}

/**
 * Generate detailed explanation for why an outfit was recommended
 */
async function generateDetailedExplanation(
  outfitId: string, 
  user: UserProfile, 
  outfit?: Outfit,
  context?: {
    userFeedback?: UserFeedback[];
    currentSeason?: Season;
    occasion?: string;
  }
): Promise<{
  summary: string;
  details: {
    styleMatch: string;
    seasonalFit: string;
    occasionSuitability: string;
    personalityAlignment: string;
  };
  novaInsight: string;
}> {
  if (!outfit) {
    return {
      summary: 'Nova kon geen uitleg genereren voor deze outfit.',
      details: {
        styleMatch: '',
        seasonalFit: '',
        occasionSuitability: '',
        personalityAlignment: ''
      },
      novaInsight: ''
    };
  }

  const userName = user.name?.split(' ')[0] || 'daar';
  
  // Generate detailed explanations
  const styleMatch = `Deze ${outfit.archetype.replace('_', ' ')} outfit past ${outfit.matchPercentage}% bij jouw stijlvoorkeuren. De ${outfit.products.map(p => p.type).join(', ')} zijn geselecteerd op basis van jouw voorkeur voor ${Object.entries(user.stylePreferences || {}).filter(([_, value]) => value > 3).map(([key]) => key).join(', ')}.`;
  
  const seasonalFit = outfit.season 
    ? `Perfect geschikt voor het ${getDutchSeasonName(outfit.season).toLowerCase()}seizoen met ${outfit.weather ? getDutchWeatherDescription(outfit.weather) : 'mild'} weer.`
    : 'Tijdloos ontwerp dat het hele jaar door gedragen kan worden.';
  
  const occasionSuitability = `Ideaal voor ${outfit.occasion.toLowerCase()} met ${outfit.completeness}% outfit-volledigheid. De ${outfit.structure?.join(', ') || 'items'} zorgen voor de juiste balans.`;
  
  const personalityAlignment = `Deze outfit reflecteert jouw ${user.gender === 'male' ? 'mannelijke' : 'vrouwelijke'} stijl en past bij jouw persoonlijkheid. ${outfit.secondaryArchetype ? `De mix van ${outfit.archetype} en ${outfit.secondaryArchetype} elementen (${Math.round((outfit.mixFactor || 0) * 100)}% invloed) creëert een unieke look.` : ''}`;
  
  const novaInsight = await generateNovaExplanation(outfitId, user, outfit);
  
  return {
    summary: `${userName}, deze outfit is ${outfit.matchPercentage}% geschikt voor jouw ${outfit.archetype.replace('_', ' ')} stijl en ${outfit.occasion.toLowerCase()} gelegenheden.`,
    details: {
      styleMatch,
      seasonalFit,
      occasionSuitability,
      personalityAlignment
    },
    novaInsight
  };
}

/**
 * Generate quick style tips from Nova
 */
export function generateNovaStyleTips(user: UserProfile, context: string = 'general'): string[] {
  const tips: Record<string, string[]> = {
    'onboarding': [
      'Tip van Nova: Wees eerlijk over je voorkeuren - ik leer van elke keuze die je maakt!',
      'Nova\'s geheim: De beste outfits voelen als een tweede huid.',
      'Wist je dat? Nova analyseert niet alleen wat je leuk vindt, maar ook waarom je het leuk vindt.',
      'Pro-tip: Experimenteren is oké! Ik help je ontdekken wat werkt en wat niet.'
    ],
    'results': [
      'Nova\'s advies: Probeer één nieuwe stijl per week om je comfort zone uit te breiden.',
      'Geheim van stijl: Confidence is het beste accessoire dat je kunt dragen.',
      'Nova\'s observatie: De beste outfits vertellen jouw verhaal zonder woorden.',
      'Style hack: Mix één onverwacht element in een klassieke outfit voor instant upgrade.'
    ],
    'general': [
      'Nova\'s wijsheid: Stijl is niet wat je draagt, maar hoe je het draagt.',
      'Fashion fact: Kleuren kunnen je humeur beïnvloeden - kies bewust!',
      'Nova\'s tip: Investeer in basics die je 100x kunt dragen.',
      'Style secret: De perfecte pasvorm is belangrijker dan het merk.'
    ]
  };
  
  const contextTips = tips[context] || tips['general'];
  return contextTips;
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

