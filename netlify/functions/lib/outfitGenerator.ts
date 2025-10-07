interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image_url: string;
  category: string;
  type: string;
  gender: string;
  colors: string[];
  sizes: string[];
  tags: string[];
  seasons?: string[];
  retailer: string;
  affiliate_url: string;
  description: string;
  in_stock: boolean;
  rating?: number;
  review_count?: number;
}

interface UserContext {
  archetype?: string;
  undertone?: "warm" | "cool" | "neutral";
  sizes?: { tops: string; bottoms: string; shoes: string };
  budget?: { min: number; max: number };
}

interface OutfitProduct {
  id: string;
  retailer: string;
  retailer_sku?: string;
  title: string;
  image: string;
  url: string;
  price: { current: number; original?: number };
  currency: string;
  availability: string;
  sizes: string[];
  color: string;
  badges?: string[];
  reason: string;
}

const PRODUCT_FEED: Product[] = [
  {
    id: "feed_001",
    name: "Oversized Wool Coat",
    brand: "COS",
    price: 189.95,
    image_url: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    category: "outerwear",
    type: "coat",
    gender: "female",
    colors: ["beige", "black", "navy"],
    sizes: ["XS", "S", "M", "L", "XL"],
    tags: ["minimalist", "winter", "elegant", "oversized"],
    seasons: ["autumn", "winter"],
    retailer: "Zalando",
    affiliate_url: "https://www.zalando.nl/cos-coat",
    description: "Luxurious oversized wool coat perfect for cold weather",
    in_stock: true,
    rating: 4.5,
    review_count: 127,
  },
  {
    id: "feed_002",
    name: "High-Waist Mom Jeans",
    brand: "Weekday",
    price: 69.99,
    image_url: "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    category: "bottom",
    type: "jeans",
    gender: "female",
    colors: ["blue", "black", "white"],
    sizes: ["24", "25", "26", "27", "28", "29", "30"],
    tags: ["casual", "vintage", "high-waist", "denim"],
    seasons: ["spring", "summer", "autumn", "winter"],
    retailer: "ASOS",
    affiliate_url: "https://www.asos.com/weekday-jeans",
    description: "Vintage-inspired high-waist mom jeans",
    in_stock: true,
    rating: 4.3,
    review_count: 203,
  },
  {
    id: "feed_003",
    name: "Silk Blouse",
    brand: "Massimo Dutti",
    price: 89.95,
    image_url: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    category: "top",
    type: "blouse",
    gender: "female",
    colors: ["white", "cream", "black", "navy"],
    sizes: ["XS", "S", "M", "L"],
    tags: ["elegant", "formal", "silk", "classic"],
    seasons: ["spring", "summer", "autumn"],
    retailer: "Zalando",
    affiliate_url: "https://www.zalando.nl/massimo-dutti-blouse",
    description: "Elegant silk blouse for professional occasions",
    in_stock: true,
    rating: 4.7,
    review_count: 89,
  },
  {
    id: "feed_004",
    name: "Minimalist Sneakers",
    brand: "Veja",
    price: 120.0,
    image_url: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    category: "footwear",
    type: "sneakers",
    gender: "female",
    colors: ["white", "black", "grey"],
    sizes: ["36", "37", "38", "39", "40", "41"],
    tags: ["minimalist", "casual", "sustainable", "white"],
    seasons: ["spring", "summer", "autumn"],
    retailer: "Wehkamp",
    affiliate_url: "https://www.wehkamp.nl/veja-sneakers",
    description: "Sustainable minimalist sneakers",
    in_stock: true,
    rating: 4.6,
    review_count: 156,
  },
  {
    id: "feed_005",
    name: "Leather Crossbody Bag",
    brand: "Mansur Gavriel",
    price: 295.0,
    image_url: "https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2",
    category: "accessory",
    type: "bag",
    gender: "female",
    colors: ["tan", "black", "burgundy"],
    sizes: ["One Size"],
    tags: ["luxury", "leather", "minimalist", "crossbody"],
    seasons: ["spring", "summer", "autumn", "winter"],
    retailer: "Net-A-Porter",
    affiliate_url: "https://www.net-a-porter.com/mansur-gavriel-bag",
    description: "Premium leather crossbody bag",
    in_stock: true,
    rating: 4.8,
    review_count: 67,
  },
];

function getColorScore(productColors: string[], undertone: string): number {
  const WARM_COLORS = ["beige", "cream", "tan", "camel", "rust", "terracotta", "olive"];
  const COOL_COLORS = ["navy", "charcoal", "ice blue", "silver", "burgundy", "emerald"];
  const NEUTRAL_COLORS = ["black", "white", "grey", "gray"];

  let score = 0;

  for (const color of productColors) {
    const lowerColor = color.toLowerCase();

    if (undertone === "warm" && WARM_COLORS.some((c) => lowerColor.includes(c))) {
      score += 2;
    } else if (undertone === "cool" && COOL_COLORS.some((c) => lowerColor.includes(c))) {
      score += 2;
    } else if (NEUTRAL_COLORS.some((c) => lowerColor.includes(c))) {
      score += 1;
    }
  }

  return score;
}

function getArchetypeScore(productTags: string[], archetype: string): number {
  const lower = archetype.toLowerCase();
  let score = 0;

  if (lower.includes("minimal") && productTags.includes("minimalist")) score += 3;
  if (lower.includes("klassiek") && productTags.includes("classic")) score += 3;
  if (lower.includes("elegant") && productTags.includes("elegant")) score += 3;
  if (lower.includes("casual") && productTags.includes("casual")) score += 2;

  return score;
}

function filterAndRankProducts(
  products: Product[],
  context: UserContext,
  category?: string
): Product[] {
  let filtered = products.filter((p) => p.in_stock);

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (context.budget) {
    filtered = filtered.filter(
      (p) => p.price >= context.budget!.min && p.price <= context.budget!.max
    );
  }

  const ranked = filtered.map((p) => {
    let score = 0;

    if (context.undertone) {
      score += getColorScore(p.colors, context.undertone);
    }

    if (context.archetype) {
      score += getArchetypeScore(p.tags, context.archetype);
    }

    if (p.rating) {
      score += p.rating * 0.5;
    }

    return { product: p, score };
  });

  ranked.sort((a, b) => b.score - a.score);

  return ranked.map((r) => r.product);
}

function convertToOutfitProduct(product: Product, reason: string): OutfitProduct {
  return {
    id: product.id,
    retailer: product.retailer,
    title: `${product.brand} — ${product.name}`,
    image: product.image_url,
    url: product.affiliate_url,
    price: { current: product.price },
    currency: "EUR",
    availability: product.in_stock ? "in_stock" : "out_of_stock",
    sizes: product.sizes,
    color: product.colors[0] || "neutral",
    badges: product.rating && product.rating >= 4.5 ? ["Aanrader"] : undefined,
    reason,
  };
}

export async function generateOutfit(
  userMessage: string,
  context: UserContext,
  supabase?: any
): Promise<{ explanation: string; products: OutfitProduct[] }> {
  const lowerMsg = userMessage.toLowerCase();
  let occasion = "casual";
  let categories = ["top", "bottom", "footwear"];

  if (lowerMsg.includes("werk") || lowerMsg.includes("work") || lowerMsg.includes("kantoor")) {
    occasion = "work";
    categories = ["top", "bottom", "footwear", "accessory"];
  } else if (
    lowerMsg.includes("bruiloft") ||
    lowerMsg.includes("formal") ||
    lowerMsg.includes("gala")
  ) {
    occasion = "formal";
    categories = ["top", "bottom", "footwear", "accessory"];
  } else if (lowerMsg.includes("winter") || lowerMsg.includes("koud")) {
    categories = ["outerwear", "top", "bottom", "footwear"];
  }

  let productPool = PRODUCT_FEED;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("in_stock", true);

      if (!error && data && data.length > 0) {
        productPool = data;
      }
    } catch (e) {
      console.warn("Supabase query failed, using fallback feed:", e);
    }
  }

  const outfit: OutfitProduct[] = [];

  for (const category of categories) {
    const ranked = filterAndRankProducts(productPool, context, category);
    if (ranked.length > 0) {
      const product = ranked[0];
      const reason = buildReason(product, context, occasion);
      outfit.push(convertToOutfitProduct(product, reason));
    }
  }

  let explanation = `Ik heb een ${occasion} outfit samengesteld voor jouw ${context.archetype || "casual"} stijl`;

  if (context.undertone) {
    explanation += ` met ${context.undertone} undertone`;
  }

  explanation += `. `;

  if (outfit.length > 0) {
    explanation += `Deze ${outfit.length} items werken perfect samen door hun gebalanceerde kleuren en stijl.`;
  }

  return { explanation, products: outfit };
}

function buildReason(product: Product, context: UserContext, occasion: string): string {
  const reasons: string[] = [];

  if (context.undertone && getColorScore(product.colors, context.undertone) > 0) {
    reasons.push(`Past bij jouw ${context.undertone} undertone`);
  }

  if (context.archetype && getArchetypeScore(product.tags, context.archetype) > 0) {
    reasons.push(`Sluit aan bij je ${context.archetype} stijl`);
  }

  if (product.rating && product.rating >= 4.5) {
    reasons.push(`Hoge rating (${product.rating}/5)`);
  }

  if (reasons.length === 0) {
    reasons.push(`Veelzijdig item voor ${occasion} gelegenheden`);
  }

  return reasons.slice(0, 2).join(" • ");
}

export function detectOutfitIntent(message: string): boolean {
  const outfitKeywords = [
    "outfit",
    "samenstel",
    "look",
    "combinatie",
    "items",
    "kleding",
    "aanbevel",
    "werk",
    "bruiloft",
    "date",
    "casual",
    "formal",
    "winter",
    "zomer",
  ];

  const lower = message.toLowerCase();
  return outfitKeywords.some((kw) => lower.includes(kw));
}
