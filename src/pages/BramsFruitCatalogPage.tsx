import { useEffect, useState } from 'react';
import { getBramsFruitProductGroups, getBramsFruitCategories } from '@/services/bramsFruit/productService';
import { BramsFruitProductGroup } from '@/services/bramsFruit/types';
import { ProductImage } from '@/components/ui/ProductImage';
import { supabase } from '@/lib/supabase';

export default function BramsFruitCatalogPage() {
  const [groups, setGroups] = useState<BramsFruitProductGroup[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    try {
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
      <div className="min-h-screen bg-[var(--color-bg)] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-[var(--color-text-secondary)]">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            Brams Fruit Collectie
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
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
                  ? 'bg-[var(--ff-color-primary-700)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]'
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
              className="bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-[var(--color-bg)] relative">
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
                <p className="text-xs text-[var(--color-text-secondary)] mb-1">
                  {group.category} · {group.sub_category}
                </p>
                <h3 className="font-semibold text-[var(--color-text)] mb-2 line-clamp-2">
                  {group.product_name}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {group.colors.length} {group.colors.length === 1 ? 'kleur' : 'kleuren'}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {group.sizes.length} maten
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-[var(--color-text)]">
                    €{group.price_range.min.toFixed(2)}
                  </span>
                  {group.price_range.min !== group.price_range.max && (
                    <span className="text-sm text-[var(--color-text-secondary)]">
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
            <p className="text-[var(--color-text-secondary)]">
              Geen producten gevonden in deze categorie.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
