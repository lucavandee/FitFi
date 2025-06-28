import { Product } from '../types/Product';

/**
 * Product type definition for clothing items
 */
export type ProductType = {
  id: string;
  name: string;
  brand: string;
  category: string;
  gender: "male" | "female";
  imageUrl: string;
  color: string;
  price: number;
  sizeOptions: string[];
  styleTags: string[];
  description?: string;
  material?: string;
  season?: string[];
};

/**
 * Array of clothing products for the FitFi platform
 */
export const products: ProductType[] = [
  {
    id: "p001",
    name: "Slim Fit Cotton T-Shirt",
    brand: "Calvin Klein",
    category: "shirt",
    gender: "male",
    imageUrl: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "white",
    price: 39.99,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    styleTags: ["minimal", "casual", "essential"],
    description: "Klassiek wit T-shirt van premium katoen met een slim fit pasvorm",
    material: "100% katoen",
    season: ["spring", "summer", "fall"]
  },
  {
    id: "p002",
    name: "Slim Fit Stretch Jeans",
    brand: "Levi's",
    category: "jeans",
    gender: "male",
    imageUrl: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "blue",
    price: 89.95,
    sizeOptions: ["30/32", "32/32", "32/34", "34/32", "34/34", "36/32", "36/34"],
    styleTags: ["casual", "denim", "versatile"],
    description: "Klassieke blauwe jeans met lichte stretch voor optimaal comfort",
    material: "98% katoen, 2% elastaan",
    season: ["spring", "summer", "fall", "winter"]
  },
  {
    id: "p003",
    name: "Stan Smith Sneakers",
    brand: "Adidas",
    category: "shoes",
    gender: "male",
    imageUrl: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "white",
    price: 99.95,
    sizeOptions: ["40", "41", "42", "43", "44", "45", "46"],
    styleTags: ["minimal", "casual", "streetwear"],
    description: "Iconische witte sneakers met groene details",
    material: "Leer en rubber",
    season: ["spring", "summer", "fall"]
  },
  {
    id: "p004",
    name: "Wool Blend Overcoat",
    brand: "Hugo Boss",
    category: "coat",
    gender: "male",
    imageUrl: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "navy",
    price: 299.95,
    sizeOptions: ["48", "50", "52", "54", "56"],
    styleTags: ["formal", "winter", "elegant"],
    description: "Elegante marineblauwe overjas van hoogwaardige wolmix",
    material: "80% wol, 20% polyester",
    season: ["fall", "winter"]
  },
  {
    id: "p005",
    name: "Leather Crossbody Bag",
    brand: "Tommy Hilfiger",
    category: "bag",
    gender: "male",
    imageUrl: "https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "brown",
    price: 129.95,
    sizeOptions: ["One Size"],
    styleTags: ["casual", "practical", "versatile"],
    description: "Praktische bruine leren crossbody tas met verstelbare band",
    material: "100% leer",
    season: ["spring", "summer", "fall", "winter"]
  },
  {
    id: "p006",
    name: "Silk Blouse",
    brand: "Massimo Dutti",
    category: "blouse",
    gender: "female",
    imageUrl: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "cream",
    price: 79.95,
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    styleTags: ["elegant", "formal", "feminine"],
    description: "Elegante crèmekleurige zijden blouse met klassieke kraag",
    material: "100% zijde",
    season: ["spring", "summer", "fall", "winter"]
  },
  {
    id: "p007",
    name: "High Waist Skinny Jeans",
    brand: "Zara",
    category: "jeans",
    gender: "female",
    imageUrl: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "black",
    price: 49.95,
    sizeOptions: ["34", "36", "38", "40", "42", "44"],
    styleTags: ["casual", "versatile", "essential"],
    description: "Zwarte high waist jeans met skinny fit",
    material: "92% katoen, 6% polyester, 2% elastaan",
    season: ["spring", "summer", "fall", "winter"]
  },
  {
    id: "p008",
    name: "Leather Ankle Boots",
    brand: "Vagabond",
    category: "shoes",
    gender: "female",
    imageUrl: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "black",
    price: 149.95,
    sizeOptions: ["36", "37", "38", "39", "40", "41"],
    styleTags: ["casual", "autumn", "versatile"],
    description: "Zwarte leren enkellaarsjes met blokhak",
    material: "100% leer, rubberen zool",
    season: ["fall", "winter"]
  },
  {
    id: "p009",
    name: "Wool Blend Coat",
    brand: "COS",
    category: "coat",
    gender: "female",
    imageUrl: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "camel",
    price: 225.00,
    sizeOptions: ["34", "36", "38", "40", "42"],
    styleTags: ["minimal", "winter", "elegant"],
    description: "Elegante camelkleurige jas van luxe wolmix",
    material: "70% wol, 20% polyamide, 10% cashmere",
    season: ["fall", "winter"]
  },
  {
    id: "p010",
    name: "Structured Tote Bag",
    brand: "& Other Stories",
    category: "bag",
    gender: "female",
    imageUrl: "https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "tan",
    price: 89.00,
    sizeOptions: ["One Size"],
    styleTags: ["minimal", "practical", "everyday"],
    description: "Gestructureerde tote bag van premium leer",
    material: "100% leer",
    season: ["spring", "summer", "fall", "winter"]
  },
  {
    id: "p011",
    name: "Oversized Knit Sweater",
    brand: "Weekday",
    category: "sweater",
    gender: "female",
    imageUrl: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "beige",
    price: 59.95,
    sizeOptions: ["XS", "S", "M", "L", "XL"],
    styleTags: ["cozy", "casual", "winter"],
    description: "Beige oversized gebreide trui met ronde hals",
    material: "50% wol, 50% acryl",
    season: ["fall", "winter"]
  },
  {
    id: "p012",
    name: "Slim Fit Chino Trousers",
    brand: "Selected Homme",
    category: "trousers",
    gender: "male",
    imageUrl: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "beige",
    price: 69.95,
    sizeOptions: ["30/32", "32/32", "32/34", "34/32", "34/34", "36/32", "36/34"],
    styleTags: ["smart casual", "versatile", "essential"],
    description: "Beige slim fit chino broek van premium katoen",
    material: "98% katoen, 2% elastaan",
    season: ["spring", "summer", "fall"]
  },
  {
    id: "p013",
    name: "Merino Wool Turtleneck",
    brand: "Uniqlo",
    category: "sweater",
    gender: "male",
    imageUrl: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "black",
    price: 49.90,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    styleTags: ["minimal", "winter", "smart casual"],
    description: "Zwarte coltrui van fijne merinowol",
    material: "100% merinowol",
    season: ["fall", "winter"]
  },
  {
    id: "p014",
    name: "Pleated Midi Skirt",
    brand: "Arket",
    category: "skirt",
    gender: "female",
    imageUrl: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "navy",
    price: 79.00,
    sizeOptions: ["34", "36", "38", "40", "42", "44"],
    styleTags: ["elegant", "feminine", "versatile"],
    description: "Marineblauwe geplooide rok met midi-lengte",
    material: "100% polyester",
    season: ["spring", "summer", "fall"]
  },
  {
    id: "p015",
    name: "Leather Biker Jacket",
    brand: "AllSaints",
    category: "jacket",
    gender: "female",
    imageUrl: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "black",
    price: 349.00,
    sizeOptions: ["34", "36", "38", "40", "42"],
    styleTags: ["edgy", "statement", "versatile"],
    description: "Zwart leren bikerjack met asymmetrische rits",
    material: "100% leer, voering: 100% polyester",
    season: ["spring", "fall"]
  },
  {
    id: "p016",
    name: "Linen Blend Shirt",
    brand: "H&M",
    category: "shirt",
    gender: "male",
    imageUrl: "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    color: "white",
    price: 29.99,
    sizeOptions: ["S", "M", "L", "XL", "XXL"],
    styleTags: ["summer", "casual", "breathable"],
    description: "Wit overhemd van linnen-katoenmix, perfect voor warme dagen",
    material: "55% linnen, 45% katoen",
    season: ["spring", "summer"]
  }
];

export default products;