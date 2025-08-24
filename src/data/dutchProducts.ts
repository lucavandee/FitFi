const dutchProducts = [
  {
    id: "p001",
    name: "Slim Fit Jeans",
    imageUrl: "https://images.pexels.com/photos/1541099649105-f69ad21f3246",
    type: "Broek",
    category: "bottom",
    styleTags: ["casual", "minimalist"],
    brand: "Levi's",
    price: 89.95,
    season: ["spring", "summer", "autumn", "winter"], // All-season item
  },
  {
    id: "p002",
    name: "Witte Oversized T-shirt",
    imageUrl: "https://images.pexels.com/photos/1520975917447-1d8c8db4d6df",
    type: "Shirt",
    category: "top",
    styleTags: ["casual", "sporty", "minimalist"],
    brand: "H&M",
    price: 19.99,
    season: ["spring", "summer"], // Spring/summer item
  },
  {
    id: "p003",
    name: "Zwarte Coltrui",
    imageUrl: "https://images.pexels.com/photos/3593032457867-23e219c9b0c7",
    type: "Trui",
    category: "top",
    styleTags: ["formal", "minimalist"],
    brand: "COS",
    price: 59.95,
    season: ["autumn", "winter"], // Autumn/winter item
  },
  {
    id: "p004",
    name: "Vintage Spijkerjack",
    imageUrl: "https://images.pexels.com/photos/5864388408-8e55707f3e44",
    type: "Jas",
    category: "outerwear",
    styleTags: ["vintage", "casual"],
    brand: "Weekday",
    price: 79.95,
    season: ["spring", "autumn"], // Spring/autumn item
  },
  {
    id: "p005",
    name: "Sportief Trainingspak",
    imageUrl: "https://images.pexels.com/photos/5542068829-1115f7259450",
    type: "Trainingspak",
    category: "top",
    styleTags: ["sporty"],
    brand: "Nike",
    price: 99.95,
    season: ["autumn", "winter"], // Autumn/winter item
  },
  {
    id: "p006",
    name: "Beige Chino",
    imageUrl: "https://images.pexels.com/photos/5562157873-818bc0726f7b",
    type: "Broek",
    category: "bottom",
    styleTags: ["formal", "minimalist"],
    brand: "Zara",
    price: 49.95,
    season: ["spring", "summer", "autumn"], // Spring/summer/autumn item
  },
  {
    id: "p007",
    name: "Retro Zonnebril",
    imageUrl: "https://images.pexels.com/photos/1600180758890-1bba1fbcdf66",
    type: "Accessoire",
    category: "accessory",
    styleTags: ["vintage"],
    brand: "Ray-Ban",
    price: 149.95,
    season: ["spring", "summer"], // Spring/summer item
  },
  {
    id: "p008",
    name: "Strak Zwart Blazerjasje",
    imageUrl: "https://images.pexels.com/photos/1602810311458-ae0b6e6262f5",
    type: "Jasje",
    category: "outerwear",
    styleTags: ["formal", "minimalist"],
    brand: "Hugo Boss",
    price: 249.95,
    season: ["autumn", "winter", "spring"], // Autumn/winter/spring item
  },
  {
    id: "p009",
    name: "Casual Sneakers",
    imageUrl: "https://images.pexels.com/photos/1585386959984-a4155223f3ef",
    type: "Schoenen",
    category: "footwear",
    styleTags: ["casual", "sporty"],
    brand: "Adidas",
    price: 89.95,
    season: ["spring", "summer", "autumn"], // Spring/summer/autumn item
  },
  {
    id: "p010",
    name: "Basic Hoodie",
    imageUrl: "https://images.pexels.com/photos/1618354691317-42407cdd062f",
    type: "Trui",
    category: "top",
    styleTags: ["casual", "sporty"],
    brand: "Champion",
    price: 59.95,
    season: ["autumn", "winter"], // Autumn/winter item
  },
  {
    id: "p011",
    name: "Elegante Blouse",
    imageUrl:
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
    type: "Blouse",
    category: "top",
    styleTags: ["formal", "minimalist"],
    brand: "Massimo Dutti",
    price: 79.95,
    season: ["spring", "summer", "autumn"], // Spring/summer/autumn item
  },
  {
    id: "p012",
    name: "Leren Rok",
    imageUrl:
      "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg",
    type: "Rok",
    category: "bottom",
    styleTags: ["formal", "vintage"],
    brand: "Mango",
    price: 69.95,
    season: ["autumn", "winter"], // Autumn/winter item
  },
  {
    id: "p013",
    name: "Zomerjurk met Print",
    imageUrl:
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg",
    type: "Jurk",
    category: "dress",
    styleTags: ["casual", "vintage"],
    brand: "& Other Stories",
    price: 89.95,
    season: ["summer"], // Summer only item
  },
  {
    id: "p014",
    name: "Klassieke Pumps",
    imageUrl:
      "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg",
    type: "Schoenen",
    category: "footwear",
    styleTags: ["formal"],
    brand: "Jimmy Choo",
    price: 299.95,
    season: ["spring", "summer", "autumn", "winter"], // All-season item
  },
  {
    id: "p015",
    name: "Leren Handtas",
    imageUrl:
      "https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg",
    type: "Tas",
    category: "accessory",
    styleTags: ["formal", "minimalist"],
    brand: "Michael Kors",
    price: 199.95,
    season: ["spring", "summer", "autumn", "winter"], // All-season item
  },
  {
    id: "p016",
    name: "Denim Jumpsuit",
    imageUrl:
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    type: "Jumpsuit",
    category: "jumpsuit",
    styleTags: ["casual", "vintage"],
    brand: "Levi's",
    price: 119.95,
    season: ["spring", "summer"], // Spring/summer item
  },
  {
    id: "p017",
    name: "Wollen Winterjas",
    imageUrl:
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
    type: "Jas",
    category: "outerwear",
    styleTags: ["formal", "minimalist"],
    brand: "Max Mara",
    price: 349.95,
    season: ["autumn", "winter"], // Autumn/winter item
  },
  {
    id: "p018",
    name: "Leren Laarzen",
    imageUrl:
      "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg",
    type: "Schoenen",
    category: "footwear",
    styleTags: ["formal", "vintage"],
    brand: "Dr. Martens",
    price: 169.95,
    season: ["autumn", "winter"], // Autumn/winter item
  },
  {
    id: "p019",
    name: "Zijden Sjaal",
    imageUrl:
      "https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg",
    type: "Accessoire",
    category: "accessory",
    styleTags: ["formal", "luxury"],
    brand: "Hermès",
    price: 299.95,
    season: ["spring", "summer", "autumn", "winter"], // All-season item
  },
  {
    id: "p020",
    name: "Linnen Zomerbroek",
    imageUrl:
      "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg",
    type: "Broek",
    category: "bottom",
    styleTags: ["casual", "minimalist"],
    brand: "Arket",
    price: 79.95,
    season: ["spring", "summer"], // Spring/summer item
  },
  // Adding more seasonal items
  {
    id: "p021",
    name: "Lichte Regenjas",
    imageUrl:
      "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg",
    type: "Jas",
    category: "outerwear",
    styleTags: ["casual", "practical"],
    brand: "Rains",
    price: 89.95,
    season: ["spring", "autumn"], // Spring/autumn item for rainy weather
  },
  {
    id: "p022",
    name: "Wollen Sjaal",
    imageUrl: "https://images.pexels.com/photos/45055/pexels-photo-45055.jpeg",
    type: "Accessoire",
    category: "accessory",
    styleTags: ["casual", "warm"],
    brand: "Acne Studios",
    price: 129.95,
    season: ["autumn", "winter"], // Autumn/winter item for cold weather
  },
  {
    id: "p023",
    name: "Korte Broek",
    imageUrl:
      "https://images.pexels.com/photos/52518/jeans-pants-blue-shop-52518.jpeg",
    type: "Broek",
    category: "bottom",
    styleTags: ["casual", "sporty"],
    brand: "Tommy Hilfiger",
    price: 59.95,
    season: ["summer"], // Summer only item for hot weather
  },
  {
    id: "p024",
    name: "Thermische Ondershirt",
    imageUrl:
      "https://images.pexels.com/photos/6311387/pexels-photo-6311387.jpeg",
    type: "Shirt",
    category: "top",
    styleTags: ["practical", "minimalist"],
    brand: "Uniqlo",
    price: 29.95,
    season: ["winter"], // Winter only item for cold weather
  },
];

// Helper function to get products by category
const getProductsByCategory = (category: string) => {
  return dutchProducts.filter(
    (product) => product.category === category || product.type === category,
  );
};

// Helper function to get products by style tags
const getProductsByStyle = (style: string) => {
  return dutchProducts.filter(
    (product) => product.styleTags && product.styleTags.includes(style),
  );
};

// Helper function to get products by season
const getProductsBySeason = (season: string) => {
  return dutchProducts.filter(
    (product) => product.season && product.season.includes(season),
  );
};

// Helper function to get products suitable for weather
const getProductsByWeather = (weather: string) => {
  // Map weather conditions to seasons
  const weatherToSeasons: Record<string, string[]> = {
    cold: ["winter", "autumn"],
    mild: ["spring", "autumn"],
    warm: ["spring", "summer"],
    hot: ["summer"],
    rainy: ["spring", "autumn"],
    snowy: ["winter"],
    windy: ["autumn", "winter", "spring"],
  };

  const seasons = weatherToSeasons[weather] || [];

  if (seasons.length === 0) {
    return dutchProducts; // Return all products if no mapping
  }

  return dutchProducts.filter(
    (product) =>
      product.season && product.season.some((s) => seasons.includes(s)),
  );
};

export default dutchProducts;
