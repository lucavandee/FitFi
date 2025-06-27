import { Product, Outfit } from './types';
import { calculateMatchScore } from './calculateMatchScore';

/**
 * Generates complete outfits based on archetype and available products
 * 
 * @param archetype - The style archetype to generate outfits for
 * @param products - Array of available products
 * @param count - Number of outfits to generate (default: 3)
 * @returns Array of generated outfits
 */
export function generateOutfits(archetype: string, products: Product[], count: number = 3): Outfit[] {
  if (!products || products.length < 4) {
    console.warn('Not enough products to generate outfits');
    return [];
  }

  // Define occasions based on archetype
  const occasions = getOccasionsForArchetype(archetype);
  
  // Generate one outfit per occasion, up to the requested count
  const outfits: Outfit[] = [];
  
  for (let i = 0; i < Math.min(count, occasions.length); i++) {
    const occasion = occasions[i];
    const outfit = generateOutfitForOccasion(archetype, products, occasion);
    
    if (outfit) {
      outfits.push(outfit);
    }
  }

  return outfits;
}

/**
 * Gets appropriate occasions for a given archetype
 */
function getOccasionsForArchetype(archetype: string): string[] {
  const occasionMap: Record<string, string[]> = {
    'klassiek': ['Werk', 'Formeel', 'Zakelijk diner'],
    'casual_chic': ['Casual', 'Weekend', 'Lunch'],
    'urban': ['Stad', 'Casual', 'Actief'],
    'streetstyle': ['Casual', 'Uitgaan', 'Festival'],
    'retro': ['Casual', 'Creatief', 'Weekend'],
    'luxury': ['Formeel', 'Gala', 'Speciale gelegenheid']
  };

  return occasionMap[archetype] || ['Casual', 'Werk', 'Formeel'];
}

/**
 * Generates a single outfit for a specific occasion
 */
function generateOutfitForOccasion(archetype: string, products: Product[], occasion: string): Outfit | null {
  // Group products by type
  const productsByType = groupProductsByType(products);
  
  // Required product types for a complete outfit
  const requiredTypes = ['Trui', 'Shirt', 'Blouse', 'Top', 'Jasje', 'Jas'];
  const bottomTypes = ['Broek', 'Rok', 'Jurk'];
  const footwearTypes = ['Schoenen'];
  const accessoryTypes = ['Accessoire', 'Tas'];
  
  // Select products for the outfit
  const outfitProducts: Product[] = [];
  
  // Try to select one top
  const topType = requiredTypes.find(type => productsByType[type]?.length > 0);
  if (topType && productsByType[topType].length > 0) {
    outfitProducts.push(selectBestProduct(productsByType[topType], archetype, occasion));
  }
  
  // Try to select one bottom
  const bottomType = bottomTypes.find(type => productsByType[type]?.length > 0);
  if (bottomType && productsByType[bottomType].length > 0) {
    outfitProducts.push(selectBestProduct(productsByType[bottomType], archetype, occasion));
  }
  
  // Try to select footwear
  const footwearType = footwearTypes.find(type => productsByType[type]?.length > 0);
  if (footwearType && productsByType[footwearType].length > 0) {
    outfitProducts.push(selectBestProduct(productsByType[footwearType], archetype, occasion));
  }
  
  // Try to select an accessory
  const accessoryType = accessoryTypes.find(type => productsByType[type]?.length > 0);
  if (accessoryType && productsByType[accessoryType].length > 0) {
    outfitProducts.push(selectBestProduct(productsByType[accessoryType], archetype, occasion));
  }
  
  // If we don't have at least 2 products, return null
  if (outfitProducts.length < 2) {
    return null;
  }
  
  // Calculate average match score
  const totalScore = outfitProducts.reduce((sum, product) => sum + (product.matchScore || 0), 0);
  const averageScore = totalScore / outfitProducts.length;
  const matchPercentage = Math.min(Math.round(averageScore * 20), 100); // Convert to percentage, max 100%
  
  // Generate tags based on archetype and occasion
  const tags = generateTags(archetype, occasion);
  
  // Generate a unique ID
  const outfitId = `outfit-${archetype}-${occasion}-${Date.now().toString(36)}`;
  
  // Generate outfit title
  const title = generateOutfitTitle(archetype, occasion);
  
  // Generate outfit description
  const description = generateOutfitDescription(archetype, occasion, outfitProducts);
  
  // Generate explanation
  const explanation = generateExplanation(archetype, occasion, outfitProducts);
  
  // Use the first product's image as the outfit image
  const imageUrl = outfitProducts[0]?.imageUrl;
  
  return {
    id: outfitId,
    title,
    description,
    archetype,
    occasion,
    products: outfitProducts,
    imageUrl,
    tags,
    matchPercentage,
    explanation
  };
}

/**
 * Groups products by their type
 */
function groupProductsByType(products: Product[]): Record<string, Product[]> {
  const result: Record<string, Product[]> = {};
  
  products.forEach(product => {
    if (product.type) {
      if (!result[product.type]) {
        result[product.type] = [];
      }
      result[product.type].push(product);
    }
  });
  
  return result;
}

/**
 * Selects the best product from a list based on archetype and occasion
 */
function selectBestProduct(products: Product[], archetype: string, occasion: string): Product {
  // Sort products by match score
  const sortedProducts = [...products].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  
  // Return the best matching product
  return sortedProducts[0];
}

/**
 * Generates tags for an outfit based on archetype and occasion
 */
function generateTags(archetype: string, occasion: string): string[] {
  const archetypeTags: Record<string, string[]> = {
    'klassiek': ['elegant', 'tijdloos', 'verfijnd', 'klassiek'],
    'casual_chic': ['relaxed', 'comfortable', 'effortless', 'modern'],
    'urban': ['functional', 'practical', 'edgy', 'modern'],
    'streetstyle': ['trendy', 'bold', 'authentic', 'creative'],
    'retro': ['vintage', 'nostalgic', 'unique', 'timeless'],
    'luxury': ['premium', 'exclusive', 'sophisticated', 'quality']
  };
  
  const occasionTags: Record<string, string[]> = {
    'Werk': ['professional', 'office', 'business'],
    'Formeel': ['formal', 'elegant', 'sophisticated'],
    'Casual': ['everyday', 'comfortable', 'relaxed'],
    'Weekend': ['relaxed', 'comfortable', 'versatile'],
    'Lunch': ['smart-casual', 'stylish', 'comfortable'],
    'Stad': ['urban', 'practical', 'stylish'],
    'Actief': ['functional', 'comfortable', 'practical'],
    'Uitgaan': ['statement', 'eye-catching', 'trendy'],
    'Festival': ['bold', 'expressive', 'comfortable'],
    'Creatief': ['unique', 'expressive', 'artistic'],
    'Gala': ['luxurious', 'statement', 'elegant'],
    'Speciale gelegenheid': ['special', 'memorable', 'elegant'],
    'Zakelijk diner': ['smart', 'elegant', 'professional']
  };
  
  // Combine tags from archetype and occasion
  const combinedTags = [
    ...(archetypeTags[archetype] || []),
    ...(occasionTags[occasion] || [])
  ];
  
  // Remove duplicates and return
  return Array.from(new Set(combinedTags));
}

/**
 * Generates a title for an outfit
 */
function generateOutfitTitle(archetype: string, occasion: string): string {
  const archetypeTitles: Record<string, string[]> = {
    'klassiek': ['Tijdloze Elegantie', 'Klassieke Verfijning', 'Stijlvolle Eenvoud'],
    'casual_chic': ['Moeiteloze Chic', 'Casual Sophistication', 'Relaxte Elegantie'],
    'urban': ['Urban Edge', 'Stadse Stijl', 'Moderne Functionaliteit'],
    'streetstyle': ['Street Statement', 'Urban Expression', 'Bold Streetwear'],
    'retro': ['Vintage Revival', 'Retro Charme', 'Nostalgische Flair'],
    'luxury': ['Luxe Allure', 'Premium Ensemble', 'Exclusieve Elegantie']
  };
  
  const occasionAdditions: Record<string, string[]> = {
    'Werk': ['voor op Kantoor', 'voor Professionals', 'voor Werkdagen'],
    'Formeel': ['voor Speciale Gelegenheden', 'voor Formele Events', 'voor Gala\'s'],
    'Casual': ['voor Alledaags', 'voor Casual Dagen', 'voor Ontspannen Momenten'],
    'Weekend': ['voor het Weekend', 'voor Vrije Dagen', 'voor Ontspanning'],
    'Lunch': ['voor Lunch Afspraken', 'voor Casual Meetings', 'voor Daytime Events'],
    'Stad': ['voor Stadse Avonturen', 'voor City Life', 'voor Urban Explorers'],
    'Actief': ['voor Actieve Dagen', 'voor On-the-Go', 'voor Drukke Dagen'],
    'Uitgaan': ['voor Avonden Uit', 'voor Nightlife', 'voor After Hours'],
    'Festival': ['voor Festivals', 'voor Outdoor Events', 'voor Muziekliefhebbers'],
    'Creatief': ['voor Creatieve Zielen', 'voor Artistieke Types', 'voor Expressieve Dagen'],
    'Gala': ['voor Gala Avonden', 'voor Formele Gelegenheden', 'voor Luxe Events'],
    'Speciale gelegenheid': ['voor Bijzondere Momenten', 'voor Memorabele Events', 'voor Speciale Dagen'],
    'Zakelijk diner': ['voor Business Diners', 'voor Zakelijke Events', 'voor Professionele Avonden']
  };
  
  // Select a random title and addition
  const titles = archetypeTitles[archetype] || ['Stijlvolle Look'];
  const additions = occasionAdditions[occasion] || ['voor Elke Dag'];
  
  const randomTitle = titles[Math.floor(Math.random() * titles.length)];
  const randomAddition = additions[Math.floor(Math.random() * additions.length)];
  
  return `${randomTitle} ${randomAddition}`;
}

/**
 * Generates a description for an outfit
 */
function generateOutfitDescription(archetype: string, occasion: string, products: Product[]): string {
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
  
  // Generate description based on archetype and occasion
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
  
  // Select a random description
  const descriptions = archetypeDescriptions[archetype] || [`Stijlvolle combinatie van ${productList}.`];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

/**
 * Generates an explanation for why this outfit works
 */
function generateExplanation(archetype: string, occasion: string, products: Product[]): string {
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
  
  // Select a random archetype explanation
  const archetypeExplanation = archetypeExplanations[archetype] || ['Deze outfit past perfect bij jouw stijlvoorkeuren.'];
  const randomArchetypeExplanation = archetypeExplanation[Math.floor(Math.random() * archetypeExplanation.length)];
  
  // Add occasion explanation if available
  const occasionExplanation = occasionExplanations[occasion] || '';
  
  return randomArchetypeExplanation + occasionExplanation;
}

export default generateOutfits;