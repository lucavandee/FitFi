import { products } from './productData';

/**
 * Outfit type definition
 */
export type Outfit = {
  id: string;
  name: string;
  gender: "male" | "female";
  archetype: string;
  season: "summer" | "fall" | "winter" | "spring";
  products: string[]; // IDs of products from productData.ts
  imageUrl: string;
  explanation: string;
};

/**
 * Array of outfit combinations for the FitFi platform
 * Each outfit combines 2-5 products from productData.ts based on style and season
 */
export const outfits: Outfit[] = [
  {
    id: "outfit-001",
    name: "Minimalist Business Casual",
    gender: "male",
    archetype: "smart casual",
    season: "fall",
    products: ["p001", "p012", "p003"], // T-shirt, Chinos, Sneakers
    imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    explanation: "Deze combinatie van een slim fit T-shirt, chino broek en minimalistische sneakers creëert een verfijnde casual look die perfect is voor kantoor of een zakelijke lunch. De neutrale kleuren zorgen voor een tijdloze uitstraling."
  },
  {
    id: "outfit-002",
    name: "Urban Winter Essentials",
    gender: "male",
    archetype: "urban",
    season: "winter",
    products: ["p013", "p002", "p003", "p004"], // Turtleneck, Jeans, Sneakers, Coat
    imageUrl: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    explanation: "Een warme coltrui gecombineerd met comfortabele jeans, sneakers en een elegante wollen jas. Deze outfit biedt de perfecte balans tussen warmte, comfort en stijl voor koude winterdagen in de stad."
  },
  {
    id: "outfit-003",
    name: "Weekend Casual",
    gender: "male",
    archetype: "casual",
    season: "spring",
    products: ["p016", "p002", "p003", "p005"], // Linen Shirt, Jeans, Sneakers, Bag
    imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    explanation: "Een luchtig linnen overhemd met comfortabele jeans en sneakers, aangevuld met een praktische tas. Deze outfit is perfect voor een ontspannen weekenddag in de lente, met voldoende ademend vermogen voor warmere dagen."
  },
  {
    id: "outfit-004",
    name: "Elegant Office Attire",
    gender: "female",
    archetype: "classic",
    season: "fall",
    products: ["p006", "p014", "p008", "p010"], // Silk Blouse, Pleated Skirt, Ankle Boots, Tote Bag
    imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    explanation: "Een tijdloze combinatie van een zijden blouse met een geplooide midi-rok, afgemaakt met enkellaarsjes en een gestructureerde tas. Deze outfit straalt professionaliteit en elegantie uit, perfect voor kantoor of zakelijke afspraken."
  },
  {
    id: "outfit-005",
    name: "Casual Chic Everyday",
    gender: "female",
    archetype: "casual chic",
    season: "spring",
    products: ["p011", "p007", "p008"], // Knit Sweater, Skinny Jeans, Ankle Boots
    imageUrl: "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    explanation: "Een comfortabele maar stijlvolle combinatie van een oversized gebreide trui met skinny jeans en enkellaarsjes. Deze outfit biedt een perfecte balans tussen comfort en stijl voor dagelijks gebruik in de lente."
  },
  {
    id: "outfit-006",
    name: "Edgy Statement Look",
    gender: "female",
    archetype: "edgy",
    season: "fall",
    products: ["p015", "p007", "p008", "p010"], // Leather Jacket, Skinny Jeans, Ankle Boots, Tote Bag
    imageUrl: "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    explanation: "Een stoere combinatie met een leren bikerjack als statement piece, gedragen over een zwarte skinny jeans met enkellaarsjes en een praktische tas. Deze outfit straalt zelfvertrouwen uit en is perfect voor een avond uit of een casual werkdag."
  },
  {
    id: "outfit-007",
    name: "Winter Layering",
    gender: "female",
    archetype: "cozy minimal",
    season: "winter",
    products: ["p011", "p007", "p008", "p009"], // Knit Sweater, Skinny Jeans, Ankle Boots, Wool Coat
    imageUrl: "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    explanation: "Een warme gelaagde winteroutfit met een gebreide trui onder een elegante wollen jas, gecombineerd met skinny jeans en enkellaarsjes. Deze combinatie houdt je warm tijdens koude dagen zonder in te leveren op stijl."
  },
  {
    id: "outfit-008",
    name: "Business Professional",
    gender: "male",
    archetype: "formal",
    season: "winter",
    products: ["p013", "p012", "p004"], // Turtleneck, Chinos, Wool Coat
    imageUrl: "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800&h=1200&dpr=2",
    explanation: "Een professionele look met een zwarte coltrui onder een elegante wollen jas, gecombineerd met chino broek. Deze outfit is perfect voor formele zakelijke gelegenheden in de winter, met een moderne twist door de coltrui in plaats van een overhemd."
  }
];

export default outfits;