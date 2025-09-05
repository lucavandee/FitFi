// Fallback lokale bron zodat UI niet crasht als Supabase keys ontbreken.
export async function fetchProducts(): Promise<Product[]> {
  return [
    { id: "p1", title: "Witte Oxford Shirt", brand: "FitFi", type: "shirt", color: "white", gender: "unisex", price: 59 },
    { id: "p2", title: "Donkere Jeans", brand: "FitFi", type: "jeans", color: "indigo", gender: "unisex", price: 89 },
  ];
}

export async function fetchOutfits(): Promise<Outfit[]> {
  return [
    { id: "o1", name: "Smart Casual Basis", items: await fetchProducts(), score: 82, explanation: "Neutraal, clean, makkelijk te combineren." },
  ];
}

const LocalSource = { fetchProducts, fetchOutfits };
export default LocalSource;