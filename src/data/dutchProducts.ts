const dutchProducts = [
  {
    id: "p001",
    name: "Slim Fit Jeans",
    imageUrl: "https://images.pexels.com/photos/1541099649105-f69ad21f3246",
    type: "Broek",
    styleTags: ["casual", "minimalist"],
    brand: "Levi's"
  },
  {
    id: "p002",
    name: "Witte Oversized T-shirt",
    imageUrl: "https://images.pexels.com/photos/1520975917447-1d8c8db4d6df",
    type: "Shirt",
    styleTags: ["casual", "sporty", "minimalist"],
    brand: "H&M"
  },
  {
    id: "p003",
    name: "Zwarte Coltrui",
    imageUrl: "https://images.pexels.com/photos/3593032457867-23e219c9b0c7",
    type: "Trui",
    styleTags: ["formal", "minimalist"],
    brand: "COS"
  },
  {
    id: "p004",
    name: "Vintage Spijkerjack",
    imageUrl: "https://images.pexels.com/photos/5864388408-8e55707f3e44",
    type: "Jas",
    styleTags: ["vintage", "casual"],
    brand: "Weekday"
  },
  {
    id: "p005",
    name: "Sportief Trainingspak",
    imageUrl: "https://images.pexels.com/photos/5542068829-1115f7259450",
    type: "Trainingspak",
    styleTags: ["sporty"],
    brand: "Nike"
  },
  {
    id: "p006",
    name: "Beige Chino",
    imageUrl: "https://images.pexels.com/photos/5562157873-818bc0726f7b",
    type: "Broek",
    styleTags: ["formal", "minimalist"],
    brand: "Zara"
  },
  {
    id: "p007",
    name: "Retro Zonnebril",
    imageUrl: "https://images.pexels.com/photos/1600180758890-1bba1fbcdf66",
    type: "Accessoire",
    styleTags: ["vintage"],
    brand: "Ray-Ban"
  },
  {
    id: "p008",
    name: "Strak Zwart Blazerjasje",
    imageUrl: "https://images.pexels.com/photos/1602810311458-ae0b6e6262f5",
    type: "Jasje",
    styleTags: ["formal", "minimalist"],
    brand: "Hugo Boss"
  },
  {
    id: "p009",
    name: "Casual Sneakers",
    imageUrl: "https://images.pexels.com/photos/1585386959984-a4155223f3ef",
    type: "Schoenen",
    styleTags: ["casual", "sporty"],
    brand: "Adidas"
  },
  {
    id: "p010",
    name: "Basic Hoodie",
    imageUrl: "https://images.pexels.com/photos/1618354691317-42407cdd062f",
    type: "Trui",
    styleTags: ["casual", "sporty"],
    brand: "Champion"
  },
  {
    id: "p011",
    name: "Elegante Blouse",
    imageUrl: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
    type: "Blouse",
    styleTags: ["formal", "minimalist"],
    brand: "Massimo Dutti"
  },
  {
    id: "p012",
    name: "Leren Rok",
    imageUrl: "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg",
    type: "Rok",
    styleTags: ["formal", "vintage"],
    brand: "Mango"
  },
  {
    id: "p013",
    name: "Zomerjurk met Print",
    imageUrl: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg",
    type: "Jurk",
    styleTags: ["casual", "vintage"],
    brand: "& Other Stories"
  },
  {
    id: "p014",
    name: "Klassieke Pumps",
    imageUrl: "https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg",
    type: "Schoenen",
    styleTags: ["formal"],
    brand: "Jimmy Choo"
  },
  {
    id: "p015",
    name: "Leren Handtas",
    imageUrl: "https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg",
    type: "Tas",
    styleTags: ["formal", "minimalist"],
    brand: "Michael Kors"
  }
];

// Helper function to get products by category
export const getProductsByCategory = (category: string) => {
  return dutchProducts.filter(product => product.type === category);
};

// Helper function to get products by style tags
export const getProductsByStyle = (style: string) => {
  return dutchProducts.filter(product => 
    product.styleTags && product.styleTags.includes(style)
  );
};

export default dutchProducts;