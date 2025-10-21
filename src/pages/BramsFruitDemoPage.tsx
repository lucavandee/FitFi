import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ProductImage } from '@/components/ui/ProductImage';
import { getBramsFruitProductGroups } from '@/services/bramsFruit/productService';
import type { BramsFruitProductGroup } from '@/services/bramsFruit/types';

export default function BramsFruitDemoPage() {
  const [products, setProducts] = useState<BramsFruitProductGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getBramsFruitProductGroups();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <main className="bg-[var(--color-bg)] min-h-screen">
      <Helmet>
        <title>Bram's Fruit Smart Fallback Demo – FitFi</title>
      </Helmet>

      <div className="ff-container py-12">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Smart Image Fallback Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bram's Fruit producten met color-matched gradients en category icons
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="aspect-[3/4] bg-gray-200" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-sm font-medium">
                    ℹ️ Demo Features:
                  </div>
                  <ul className="text-sm text-blue-900 space-y-1">
                    <li>• <strong>Color-matched gradients</strong>: Navy → Blue, Green → Green, Black → Dark</li>
                    <li>• <strong>Category icons</strong>: Jacket/Shirt/Pants SVG icons</li>
                    <li>• <strong>Smooth animations</strong>: Gradient shift (8s) + Icon pulse (3s)</li>
                    <li>• <strong>Lazy loading</strong>: Images load only when visible</li>
                    <li>• <strong>Hover effect</strong>: "Brams Fruit" badge appears</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.style_code}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <ProductImage
                      src={product.image_url}
                      alt={product.product_name}
                      productName={product.product_name}
                      brand="Brams Fruit"
                      color={product.variants[0]?.color}
                      category={product.category}
                      aspectRatio="3/4"
                      className="w-full"
                    />

                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">Brams Fruit</p>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.product_name}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-gray-600">
                          {product.category} • {product.sub_category}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-lg font-bold text-gray-900">
                          €{product.price_range.min.toFixed(0)}
                          {product.price_range.min !== product.price_range.max &&
                            ` - €${product.price_range.max.toFixed(0)}`}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {product.colors.slice(0, 3).map((color, i) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700"
                          >
                            {color}
                          </span>
                        ))}
                        {product.colors.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-700">
                            +{product.colors.length - 3}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        {product.sizes.length} sizes • {product.variants.length} variants
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    Geen producten gevonden. Voeg producten toe via de admin panel.
                  </p>
                </div>
              )}
            </>
          )}

          <div className="mt-12 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Waarom dit cool is</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Zonder Smart Fallback</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>❌ Lege placeholders (beige blok)</li>
                  <li>❌ Geen kleur indicatie</li>
                  <li>❌ Geen category context</li>
                  <li>❌ Low-quality uitstraling</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Met Smart Fallback</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ Color-matched gradient</li>
                  <li>✅ Category icon (jacket/shirt/pants)</li>
                  <li>✅ Smooth animaties</li>
                  <li>✅ Premium uitstraling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
