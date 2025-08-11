import { Product, Season } from './types';
import { getDutchSeasonName } from './helpers';

/**
 * Generates dynamic outfit titles based on archetypes, occasion, and products
 * 
 * @param primaryArchetype - Primary style archetype
 * @param occasion - Outfit occasion
 * @param products - Products in the outfit
 * @param secondaryArchetype - Optional secondary archetype for hybrid matching
 * @param mixFactor - How much influence the secondary archetype has (0-1)
 * @returns Generated title
 */
export function generateOutfitTitle(
  primaryArchetype: string, 
  occasion: string, 
  products: Product[],
  secondaryArchetype?: string,
  mixFactor: number = 0.3
): string {
  const archetypeTitles: Record<string, string[]> = {
    'klassiek': ['Tijdloze Elegantie', 'Klassieke Verfijning', 'Stijlvolle Eenvoud', 'Sophisticated Ensemble'],
    'casual_chic': ['Moeiteloze Chic', 'Casual Sophistication', 'Relaxte Elegantie', 'Effortless Style'],
    'urban': ['Urban Edge', 'Stadse Stijl', 'Moderne Functionaliteit', 'City Essentials'],
    'streetstyle': ['Street Statement', 'Urban Expression', 'Bold Streetwear', 'Authentic Street Look'],
    'retro': ['Vintage Revival', 'Retro Charme', 'Nostalgische Flair', 'Timeless Throwback'],
    'luxury': ['Luxe Allure', 'Premium Ensemble', 'Exclusieve Elegantie', 'Refined Luxury']
  };
  
  const occasionAdditions: Record<string, string[]> = {
    'Werk': ['voor op Kantoor', 'voor Professionals', 'voor Werkdagen', 'voor Business Casual'],
    'Formeel': ['voor Speciale Gelegenheden', 'voor Formele Events', 'voor Gala\'s', 'voor Avondgelegenheden'],
    'Casual': ['voor Alledaags', 'voor Casual Dagen', 'voor Ontspannen Momenten', 'voor Dagelijks Comfort'],
    'Weekend': ['voor het Weekend', 'voor Vrije Dagen', 'voor Ontspanning', 'voor Weekendavonturen'],
    'Lunch': ['voor Lunch Afspraken', 'voor Casual Meetings', 'voor Daytime Events', 'voor Middagafspraken'],
    'Stad': ['voor Stadse Avonturen', 'voor City Life', 'voor Urban Explorers', 'voor Stadse Dagen'],
    'Actief': ['voor Actieve Dagen', 'voor On-the-Go', 'voor Drukke Dagen', 'voor Dynamische Momenten'],
    'Uitgaan': ['voor Avonden Uit', 'voor Nightlife', 'voor After Hours', 'voor Avondgelegenheden'],
    'Festival': ['voor Festivals', 'voor Outdoor Events', 'voor Muziekliefhebbers', 'voor Festivalseizoen'],
    'Creatief': ['voor Creatieve Zielen', 'voor Artistieke Types', 'voor Expressieve Dagen', 'voor Creatieve Geesten'],
    'Gala': ['voor Gala Avonden', 'voor Formele Gelegenheden', 'voor Luxe Events', 'voor Exclusieve Avonden'],
    'Speciale gelegenheid': ['voor Bijzondere Momenten', 'voor Memorabele Events', 'voor Speciale Dagen', 'voor Belangrijke Gelegenheden'],
    'Zakelijk diner': ['voor Business Diners', 'voor Zakelijke Events', 'voor Professionele Avonden', 'voor Zakelijke Ontmoetingen']
  };
  
  // Select a title based on primary archetype
  const primaryTitles = archetypeTitles[primaryArchetype] || ['Stijlvolle Look'];
  const randomPrimaryTitle = primaryTitles[Math.floor(Math.random() * primaryTitles.length)];
  
  // If we have a secondary archetype with significant influence, incorporate it into the title
  let title = randomPrimaryTitle;
  if (secondaryArchetype && secondaryArchetype !== primaryArchetype && mixFactor >= 0.2) {
    const secondaryTitles = archetypeTitles[secondaryArchetype] || ['Stijlvolle Look'];
    const secondaryTitle = secondaryTitles[Math.floor(Math.random() * secondaryTitles.length)];
    
    // Extract key words from secondary title
    const secondaryWords = secondaryTitle.split(' ');
    const secondaryKeyword = secondaryWords[secondaryWords.length > 1 ? 1 : 0];
    
    // Create a hybrid title
    title = `${randomPrimaryTitle} met ${secondaryKeyword} Twist`;
  }
  
  // Add occasion
  const additions = occasionAdditions[occasion] || ['voor Elke Dag'];
  const randomAddition = additions[Math.floor(Math.random() * additions.length)];
  
  // Get season information from the first product that has it
  const productWithSeason = products.find(p => p.season && p.season.length > 0);
  const seasonAddition = productWithSeason?.season?.[0] 
    ? ` (${getDutchSeasonName(productWithSeason.season[0] as Season)})` 
    : '';
  
  return `${title} ${randomAddition}${seasonAddition}`;
}

/**
 * Generates dynamic outfit descriptions based on archetypes, occasion, and products
 * 
 * @param primaryArchetype - Primary style archetype
 * @param occasion - Outfit occasion
 * @param products - Products in the outfit
 * @param secondaryArchetype - Optional secondary archetype for hybrid matching
 * @param mixFactor - How much influence the secondary archetype has (0-1)
 * @returns Generated description
 */
export function generateOutfitDescription(
  primaryArchetype: string, 
  _occasion: string, 
  products: Product[],
  secondaryArchetype?: string,
  mixFactor: number = 0.3
): string {
  // Defensive defaults
  const safeDescription = '';
  
  // Get product types for the description
  const productTypes = products.map(p => p.type).filter(Boolean);
  
  // Create a readable list of product types
  let productList = '';
  if (productTypes.length === 1) {
    productList = productTypes[0] || 'Item';
  } else if (productTypes.length === 2) {
    productList = `${productTypes[0]} en ${productTypes[1]}`;
  } else {
    const lastType = productTypes.pop();
    productList = `${productTypes.join(', ')} en ${lastType}`;
  }
  
  // Get current season from the first product that has it
  const productWithSeason = products.find(p => p.season && p.season.length > 0);
  const currentSeason = productWithSeason?.season?.[0] as Season | undefined;
  
  // Generate description based on primary archetype, occasion, and season
  const archetypeDescriptions: Record<string, string[]> = {
    'klassiek': [
      `Een tijdloze combinatie van ${productList} voor een verfijnde uitstraling.`,
      `Elegante ${productList} in een klassieke stijl die nooit uit de mode raakt.`,
      `Stijlvolle ${productList} voor een sophisticated look.`
    ],
    'casual_chic': [
      `Moeiteloze combinatie van ${productList} voor een relaxte maar chique look.`,
      `Comfortabele ${productList} met een elegante twist.`,
      `Casual ${productList} die stijl en comfort perfect combineren.`
    ],
    'urban': [
      `Functionele ${productList} perfect voor het stadsleven.`,
      `Praktische ${productList} met een moderne, urban uitstraling.`,
      `Stoere ${productList} voor een eigentijdse city look.`
    ],
    'streetstyle': [
      `Opvallende ${productList} voor een authentieke streetwear look.`,
      `Expressieve ${productList} die jouw persoonlijkheid laten zien.`,
      `Trendy ${productList} voor een statement streetstyle.`
    ],
    'retro': [
      `Vintage-geïnspireerde ${productList} met een moderne twist.`,
      `Nostalgische ${productList} die een eerbetoon zijn aan het verleden.`,
      `Unieke ${productList} met retro charme en hedendaagse functionaliteit.`
    ],
    'luxury': [
      `Premium ${productList} van topkwaliteit voor een luxe uitstraling.`,
      `Exclusieve ${productList} die verfijning en kwaliteit uitstralen.`,
      `Hoogwaardige ${productList} voor een sophisticated, luxe look.`
    ]
  };
  
  // Season-specific additions
  const seasonAdditions: Record<Season, string[]> = {
    'spring': [
      ' Perfect voor de frisse lentedagen.',
      ' Ideaal voor het veranderlijke lenteweer.',
      ' Licht genoeg voor de lente, maar met voldoende warmte voor koelere dagen.'
    ],
    'summer': [
      ' Ideaal voor warme zomerdagen.',
      ' Licht en luchtig voor het zomerseizoen.',
      ' Perfect voor zonnige dagen en warme avonden.'
    ],
    'autumn': [
      ' Warm genoeg voor de koelere herfstdagen.',
      ' Met de perfecte laagjes voor het veranderlijke herfstweer.',
      ' Ideaal voor de kleurrijke herfstperiode.'
    ],
    'winter': [
      ' Warm en comfortabel voor de koude winterdagen.',
      ' Met de juiste laagjes om je warm te houden in de winter.',
      ' Perfect voor het koude winterseizoen.'
    ]
  };
  
  // Select a random description from primary archetype
  const primaryDescriptions = archetypeDescriptions[primaryArchetype] || [`Stijlvolle combinatie van ${productList}.`];
  let description = primaryDescriptions[Math.floor(Math.random() * primaryDescriptions.length)];
  
  // If we have a secondary archetype with significant influence, incorporate it
  if (secondaryArchetype && secondaryArchetype !== primaryArchetype && mixFactor >= 0.2) {
    const secondaryDescriptions = archetypeDescriptions[secondaryArchetype] || [];
    
    if (secondaryDescriptions.length > 0) {
      // Extract style adjectives from secondary description
      const secondaryDescription = secondaryDescriptions[Math.floor(Math.random() * secondaryDescriptions.length)];
      const secondaryWords = secondaryDescription.split(' ').filter(word => 
        word.length > 4 && !productList.includes(word) && !description.includes(word)
      );
      
      if (secondaryWords.length > 0) {
        const safeSecondaryDescription = secondaryDescription ?? '';
        const secondaryWords = safeSecondaryDescription.split(' ').filter(word => 
          word.length > 4 && !productList.includes(word) && !safeDescription.includes(word)
        );
        const secondaryWord = secondaryWords[Math.floor(Math.random() * secondaryWords.length)];
        
        if (secondaryWord) {
          let desc = description;
          desc = desc.replace('.', `, met een ${secondaryWord.toLowerCase()} twist.`);
          description = desc;
        }
        description = description.replace('.', `, met een ${secondaryWord.toLowerCase()} twist.`);
      }
    }
  }
  
  // Add season-specific addition if available
  if (currentSeason && seasonAdditions[currentSeason]) {
    const additions = seasonAdditions[currentSeason];
    const randomAddition = additions[Math.floor(Math.random() * additions.length)];
    
    // Only add if not already mentioned
    if (!description.includes(currentSeason) && !description.includes(getDutchSeasonName(currentSeason).toLowerCase())) {
      description += randomAddition;
    }
  }
  
  return description;
}

/**
 * Generates an explanation for why this outfit works for the user
 * 
 * @param primaryArchetype - Primary style archetype
 * @param occasion - Outfit occasion
 * @param products - Products in the outfit
 * @param secondaryArchetype - Optional secondary archetype for hybrid matching
 * @param mixFactor - How much influence the secondary archetype has (0-1)
 * @returns Generated explanation
 */
function generateExplanation(
  primaryArchetype: string, 
  occasion: string, 
  products: Product[],
  secondaryArchetype?: string,
  mixFactor: number = 0.3
): string {
  const archetypeExplanations: Record<string, string[]> = {
    'klassiek': [
      'Deze outfit combineert tijdloze stukken die perfect bij je klassieke stijlvoorkeur passen. De neutrale kleuren en verfijnde details zorgen voor een elegante uitstraling die nooit uit de mode raakt.',
      'De klassieke snit en hoogwaardige materialen in deze look passen perfect bij jouw voorkeur voor tijdloze elegantie. Deze items zijn veelzijdig en kunnen voor verschillende gelegenheden gedragen worden.'
    ],
    'casual_chic': [
      'Deze moeiteloze combinatie balanceert comfort en stijl - precies wat past bij jouw casual chic voorkeur. De relaxte pasvorm met verfijnde details creëert een look die zowel comfortabel als stijlvol is.',
      'De casual maar verzorgde uitstraling van deze outfit past perfect bij jouw stijl. De items zijn veelzijdig te combineren en geschikt voor verschillende momenten in je dag.'
    ],
    'urban': [
      'Deze functionele outfit is ontworpen voor het moderne stadsleven en past perfect bij jouw urban stijl. Praktische details en een stoere uitstraling maken deze look ideaal voor jouw actieve levensstijl.',
      'De combinatie van comfort en functionaliteit in deze outfit sluit naadloos aan bij je urban stijlvoorkeur. De items zijn duurzaam en veelzijdig voor het dynamische stadsleven.'
    ],
    'streetstyle': [
      'Deze expressieve combinatie laat je persoonlijkheid zien en past perfect bij jouw streetstyle voorkeur. De opvallende details en unieke elementen zorgen voor een authentieke look.',
      'De gedurfde keuzes en trendy elementen in deze outfit weerspiegelen jouw streetstyle esthetiek. Deze look laat zien dat je niet bang bent om op te vallen en je eigen pad te kiezen.'
    ],
    'retro': [
      'Deze vintage-geïnspireerde look brengt een eerbetoon aan het verleden met een moderne twist - perfect voor jouw retro stijl. De nostalgische elementen creëren een unieke en tijdloze uitstraling.',
      'De retro invloeden in deze outfit passen perfect bij jouw voorkeur voor vintage stijlen. De combinatie van klassieke elementen met hedendaagse details zorgt voor een frisse maar nostalgische look.'
    ],
    'luxury': [
      'Deze hoogwaardige combinatie straalt luxe en verfijning uit, wat perfect aansluit bij jouw voorkeur voor premium stijl. De kwaliteitsmaterialen en aandacht voor detail zorgen voor een sophisticated uitstraling.',
      'De exclusieve uitstraling van deze outfit past perfect bij jouw luxe stijlvoorkeur. De items zijn gemaakt van hoogwaardige materialen en hebben een tijdloze elegantie die nooit uit de mode raakt.'
    ]
  };
  
  // Add occasion-specific explanation
  const occasionExplanations: Record<string, string> = {
    'Werk': ' Deze look is professioneel genoeg voor de werkplek, maar behoudt je persoonlijke stijl.',
    'Formeel': ' Deze outfit is perfect voor formele gelegenheden waar je een sterke, stijlvolle indruk wilt maken.',
    'Casual': ' Deze combinatie is ideaal voor casual gelegenheden waar comfort en stijl hand in hand gaan.',
    'Weekend': ' Perfect voor weekendactiviteiten waar je er goed uit wilt zien zonder te veel moeite.',
    'Lunch': ' Ideaal voor lunch afspraken waar je er verzorgd maar niet overdressed uit wilt zien.',
    'Stad': ' Deze look is perfect voor een dag in de stad, met items die zowel stijlvol als praktisch zijn.',
    'Actief': ' De functionaliteit van deze outfit maakt hem perfect voor jouw actieve levensstijl.',
    'Uitgaan': ' Deze outfit zal zeker opvallen tijdens het uitgaan, terwijl hij comfortabel genoeg blijft om de hele avond te dragen.',
    'Festival': ' Ideaal voor festivals waar stijl, comfort en praktische details belangrijk zijn.',
    'Creatief': ' Deze look laat je creatieve persoonlijkheid zien terwijl hij praktisch blijft voor dagelijks gebruik.',
    'Gala': ' Deze outfit heeft de elegantie en allure die nodig is voor gala-evenementen.',
    'Speciale gelegenheid': ' Perfect voor die speciale momenten waar je wilt schitteren met een memorabele look.',
    'Zakelijk diner': ' Deze combinatie straalt professionaliteit en stijl uit, ideaal voor zakelijke diners.'
  };
  
  // Get current season from the first product that has it
  const productWithSeason = products.find(p => p.season && p.season.length > 0);
  const currentSeason = productWithSeason?.season?.[0] as Season | undefined;
  
  // Season-specific explanations
  const seasonExplanations: Record<Season, string> = {
    'spring': ' De lichte materialen en frisse kleuren maken deze outfit perfect voor het lenteseizoen.',
    'summer': ' De luchtige stoffen en lichte kleuren houden je koel tijdens warme zomerdagen.',
    'autumn': ' De warmere materialen en laagjes maken deze outfit ideaal voor het herfstweer.',
    'winter': ' De warme materialen en slimme laagjes houden je comfortabel tijdens koude winterdagen.'
  };
  
  // Select a random primary archetype explanation
  const primaryExplanations = archetypeExplanations[primaryArchetype] || ['Deze outfit past perfect bij jouw stijlvoorkeuren.'];
  let explanation = primaryExplanations[Math.floor(Math.random() * primaryExplanations.length)];
  
  // If we have a secondary archetype with significant influence, incorporate it
  if (secondaryArchetype && secondaryArchetype !== primaryArchetype && mixFactor >= 0.2) {
    const secondaryExplanations = archetypeExplanations[secondaryArchetype] || [];
    
    if (secondaryExplanations.length > 0) {
      // Get a secondary explanation
      const secondaryExplanation = secondaryExplanations[Math.floor(Math.random() * secondaryExplanations.length)];
      
      // Extract a key phrase from the secondary explanation
      const secondaryPhrases = secondaryExplanation.split('. ');
      const secondaryPhrase = secondaryPhrases[Math.floor(Math.random() * secondaryPhrases.length)];
      
      // Create a hybrid explanation
      explanation += ` Deze look combineert jouw ${getArchetypeAdjective(primaryArchetype)} voorkeur met een subtiele ${getArchetypeAdjective(secondaryArchetype)} edge.`;
    }
  }
  
  // Add occasion explanation if available
  const occasionExplanation = occasionExplanations[occasion] || '';
  
  // Add season explanation if available
  const seasonExplanation = currentSeason && seasonExplanations[currentSeason] ? seasonExplanations[currentSeason] : '';
  
  return explanation + occasionExplanation + seasonExplanation;
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

