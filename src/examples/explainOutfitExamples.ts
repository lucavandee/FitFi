import { generateOutfitExplanation } from '../engine/explainOutfit';
import { Outfit, ProductCategory } from '../engine/types';

/**
 * Example 1: Classic business outfit for a male user
 */
const classicBusinessOutfit: Outfit = {
  id: 'outfit-001',
  title: 'Klassieke Business Look',
  description: 'Een tijdloze zakelijke outfit voor formele gelegenheden',
  archetype: 'klassiek',
  occasion: 'Werk',
  products: [
    {
      id: 'product-001',
      name: 'Wollen Blazer',
      brand: 'Hugo Boss',
      price: 299.95,
      type: 'blazer',
      category: 'outerwear',
      styleTags: ['formal', 'classic', 'business']
    },
    {
      id: 'product-002',
      name: 'Katoenen Overhemd',
      brand: 'Tommy Hilfiger',
      price: 89.95,
      type: 'shirt',
      category: 'top',
      styleTags: ['formal', 'classic', 'business']
    },
    {
      id: 'product-003',
      name: 'Wollen Pantalon',
      brand: 'Hugo Boss',
      price: 149.95,
      type: 'trousers',
      category: 'bottom',
      styleTags: ['formal', 'classic', 'business']
    },
    {
      id: 'product-004',
      name: 'Leren Oxford Schoenen',
      brand: 'Lloyd',
      price: 179.95,
      type: 'shoes',
      category: 'footwear',
      styleTags: ['formal', 'classic', 'business']
    }
  ],
  imageUrl: 'https://example.com/outfit-001.jpg',
  tags: ['formal', 'business', 'classic', 'timeless'],
  matchPercentage: 95,
  explanation: '', // This will be filled by the function
  season: 'autumn',
  structure: [
    ProductCategory.OUTERWEAR,
    ProductCategory.TOP,
    ProductCategory.BOTTOM,
    ProductCategory.FOOTWEAR
  ],
  weather: 'mild',
  categoryRatio: {
    top: 25,
    bottom: 25,
    footwear: 25,
    outerwear: 25,
    accessory: 0,
    dress: 0,
    jumpsuit: 0,
    other: 0
  },
  completeness: 100
};

/**
 * Example 2: Casual chic outfit with secondary streetstyle influence for a female user
 */
const casualChicOutfit: Outfit = {
  id: 'outfit-002',
  title: 'Casual Chic met Streetstyle Twist',
  description: 'Een moeiteloze casual look met een stoere streetstyle invloed',
  archetype: 'casual_chic',
  secondaryArchetype: 'streetstyle',
  mixFactor: 0.3, // 30% streetstyle influence
  occasion: 'Weekend',
  products: [
    {
      id: 'product-005',
      name: 'Oversized Trui',
      brand: 'COS',
      price: 89.95,
      type: 'sweater',
      category: 'top',
      styleTags: ['casual', 'oversized', 'comfortable']
    },
    {
      id: 'product-006',
      name: 'Slim Fit Jeans',
      brand: 'Levi\'s',
      price: 119.95,
      type: 'jeans',
      category: 'bottom',
      styleTags: ['casual', 'versatile', 'denim']
    },
    {
      id: 'product-007',
      name: 'Chunky Sneakers',
      brand: 'Nike',
      price: 129.95,
      type: 'sneakers',
      category: 'footwear',
      styleTags: ['streetstyle', 'statement', 'sporty']
    }
  ],
  imageUrl: 'https://example.com/outfit-002.jpg',
  tags: ['casual', 'comfortable', 'streetstyle', 'weekend'],
  matchPercentage: 92,
  explanation: '', // This will be filled by the function
  season: 'winter',
  structure: [
    ProductCategory.TOP,
    ProductCategory.BOTTOM,
    ProductCategory.FOOTWEAR
  ],
  weather: 'cold',
  categoryRatio: {
    top: 33,
    bottom: 33,
    footwear: 33,
    outerwear: 0,
    accessory: 0,
    dress: 0,
    jumpsuit: 0,
    other: 0
  },
  completeness: 85
};

/**
 * Example 3: Summer outfit with dress for a female user
 */
const summerDressOutfit: Outfit = {
  id: 'outfit-003',
  title: 'Zomerse Elegantie',
  description: 'Een luchtige zomerjurk met bijpassende accessoires',
  archetype: 'luxury',
  occasion: 'Speciale gelegenheid',
  products: [
    {
      id: 'product-008',
      name: 'Zijden Maxi Jurk',
      brand: 'Massimo Dutti',
      price: 149.95,
      type: 'dress',
      category: 'dress',
      styleTags: ['elegant', 'summer', 'feminine']
    },
    {
      id: 'product-009',
      name: 'Leren Sandalen',
      brand: 'Steve Madden',
      price: 99.95,
      type: 'sandals',
      category: 'footwear',
      styleTags: ['elegant', 'summer', 'feminine']
    },
    {
      id: 'product-010',
      name: 'Straw Tote Bag',
      brand: 'Mango',
      price: 49.95,
      type: 'bag',
      category: 'accessory',
      styleTags: ['summer', 'beach', 'natural']
    }
  ],
  imageUrl: 'https://example.com/outfit-003.jpg',
  tags: ['summer', 'elegant', 'feminine', 'special'],
  matchPercentage: 88,
  explanation: '', // This will be filled by the function
  season: 'summer',
  structure: [
    ProductCategory.DRESS,
    ProductCategory.FOOTWEAR,
    ProductCategory.ACCESSORY
  ],
  weather: 'hot',
  categoryRatio: {
    top: 0,
    bottom: 0,
    footwear: 30,
    outerwear: 0,
    accessory: 20,
    dress: 50,
    jumpsuit: 0,
    other: 0
  },
  completeness: 90
};

// Generate explanations for each example outfit
console.log('Example 1: Classic Business Outfit');
const explanation1 = generateOutfitExplanation(
  classicBusinessOutfit,
  'klassiek',
  'Werk',
  'Thomas'
);
console.log(explanation1);
console.log('\n');

console.log('Example 2: Casual Chic Outfit with Streetstyle Influence');
const explanation2 = generateOutfitExplanation(
  casualChicOutfit,
  'casual_chic',
  'Weekend',
  'Emma'
);
console.log(explanation2);
console.log('\n');

console.log('Example 3: Summer Dress Outfit');
const explanation3 = generateOutfitExplanation(
  summerDressOutfit,
  'luxury',
  'Speciale gelegenheid',
  'Sophie'
);
console.log(explanation3);

/**
 * Expected output:
 * 
 * Example 1: Classic Business Outfit
 * Thomas, deze perfect gebalanceerde outfit is speciaal samengesteld om te passen bij jouw klassieke stijlvoorkeur. De strakke lijnen in deze look benadrukken jouw persoonlijke stijl. De combinatie van jas of vest, bovenstuk, onderstuk en schoenen volgt een klassieke klassieke structuur. Met nadruk op jas of vest (25%) creëert deze outfit een evenwichtige balans. Voor werk biedt deze combinatie professionele uitstraling met warme tinten die perfect zijn voor het herfstseizoen. De aanpasbare lagen zijn ideaal voor mild omstandigheden. De Wollen Blazer en bijpassende items van Hugo Boss zijn zorgvuldig geselecteerd om jouw persoonlijke stijl te complementeren.
 * 
 * Example 2: Casual Chic Outfit with Streetstyle Influence
 * Emma, deze goed samengestelde outfit is speciaal samengesteld om te passen bij jouw casual chic stijlvoorkeur. De combinatie van comfortabele pasvorm met gedurfde kleuren creëert een unieke look die jouw casual chic basis verrijkt met streetstyle invloeden. De combinatie van bovenstuk, onderstuk en schoenen volgt een klassieke casual chic structuur. Voor weekend biedt deze combinatie ontspannen comfort met warme materialen die perfect zijn voor het winterseizoen. De isolerende lagen zijn ideaal voor koud omstandigheden. De Oversized Trui en bijpassende items van COS zijn zorgvuldig geselecteerd om jouw persoonlijke stijl te complementeren.
 * 
 * Example 3: Summer Dress Outfit
 * Sophie, deze perfect gebalanceerde outfit is speciaal samengesteld om te passen bij jouw luxe stijlvoorkeur. De hoogwaardige materialen in deze look benadrukken jouw persoonlijke stijl. De combinatie van jurk, schoenen en accessoire volgt een klassieke luxe structuur. Met nadruk op jurk (50%) creëert deze outfit een top-heavy balans. Voor speciale gelegenheid biedt deze combinatie memorabele presentatie met ademende materialen die perfect zijn voor het zomerseizoen. De minimale lagen zijn ideaal voor heet omstandigheden. De Zijden Maxi Jurk en bijpassende items van Massimo Dutti zijn zorgvuldig geselecteerd om jouw persoonlijke stijl te complementeren.
 */

export default {
  classicBusinessOutfit,
  casualChicOutfit,
  summerDressOutfit
};