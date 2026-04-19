import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { getBramsFruitProductGroups, getBramsFruitCategories } from '@/services/bramsFruit/productService';
import { BramsFruitProductGroup } from '@/services/bramsFruit/types';
import { ProductImage } from '@/components/ui/ProductImage';
import { supabase } from '@/lib/supabase';

export default function BramsFruitCatalogPage() {
  const [groups, setGroups] = useState<BramsFruitProductGroup[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[BramsFruit] Component mounted');
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[BramsFruit] Fetching products...');
      const [productsData, categoriesData] = await Promise.all([
        getBramsFruitProductGroups(),
        getBramsFruitCategories(),
      ]);

      console.log('[BramsFruit] Loaded products:', productsData.length);
      console.log('[BramsFruit] Categories:', categoriesData.categories);

      setGroups(productsData);
      setCategories(['all', ...categoriesData.categories]);
    } catch (err) {
      console.error('[BramsFruit] Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups =
    selectedCategory === 'all'
      ? groups
      : groups.filter(g => g.category === selectedCategory);

  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return '/images/fallbacks/default.jpg';

    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }

    const { data } = supabase.storage
      .from('brams-fruit-images')
      .getPublicUrl(imageUrl);

    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto" />
            <p className="mt-4 text-[#8A8A8A]">Producten laden...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">Fout bij het laden van producten</div>
            <p className="text-[#8A8A8A] mb-6">{error}</p>
            <button
              onClick={() => loadData()}
              className="px-4 py-2 bg-[#A8513A] text-white rounded-xl hover:bg-[#C2654A] transition-colors"
            >
              Opnieuw proberen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Brams Fruit Collectie
          </h1>
          <p className="mt-2 text-[#8A8A8A]">
            Premium menswear met een rustige uitstraling
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-[#A8513A] text-white'
                  : 'bg-[#FFFFFF] text-[#1A1A1A] border border-[#E5E5E5] hover:bg-[#FAFAF8]'
              }`}
            >
              {category === 'all' ? 'Alles' : category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGroups.map(group => (
            <div
              key={group.style_code}
              className="bg-[#FFFFFF] rounded-lg border border-[#E5E5E5] overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-[#FAFAF8] relative">
                <ProductImage
                  src={getImageUrl(group.image_url)}
                  alt={group.product_name}
                  productName={group.product_name}
                  brand="Brams Fruit"
                  color={group.colors[0]}
                  category={group.category}
                  aspectRatio="1/1"
                  className="w-full h-full"
                />
              </div>

              <div className="p-4">
                <p className="text-xs text-[#8A8A8A] mb-1">
                  {group.category} · {group.sub_category}
                </p>
                <h3 className="font-semibold text-[#1A1A1A] mb-2 line-clamp-2">
                  {group.product_name}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#8A8A8A]">
                    {group.colors.length} {group.colors.length === 1 ? 'kleur' : 'kleuren'}
                  </span>
                  <span className="text-sm text-[#8A8A8A]">
                    {group.sizes.length} maten
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-[#1A1A1A]">
                    €{group.price_range.min.toFixed(2)}
                  </span>
                  {group.price_range.min !== group.price_range.max && (
                    <span className="text-sm text-[#8A8A8A]">
                      - €{group.price_range.max.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#8A8A8A]">
              Geen producten gevonden in deze categorie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
