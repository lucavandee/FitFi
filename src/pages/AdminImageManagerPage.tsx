import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, AlertCircle } from 'lucide-react';
import { BulkImageUploader } from '@/components/admin/BulkImageUploader';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { supabase } from '@/lib/supabase';

export default function AdminImageManagerPage() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();
  const [stats, setStats] = useState<{
    totalProducts: number;
    withImages: number;
    withoutImages: number;
    bramsFruitWithImages: number;
    bramsFruitTotal: number;
  } | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, brand, image_url')
      .eq('brand', 'Brams Fruit');

    if (!allProducts) return;

    const withImages = allProducts.filter(p => p.image_url && !p.image_url.includes('/fallbacks/')).length;
    const withoutImages = allProducts.length - withImages;

    setStats({
      totalProducts: allProducts.length,
      withImages,
      withoutImages,
      bramsFruitWithImages: withImages,
      bramsFruitTotal: allProducts.length
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-[var(--color-muted)]">Laden...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--ff-color-primary-700)] to-[var(--ff-color-primary-500)] flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">
                Afbeeldingen Beheer
              </h1>
              <p className="text-[var(--color-muted)]">
                Upload product afbeeldingen in bulk
              </p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-4">
                <div className="text-2xl font-bold text-[var(--color-text)]">
                  {stats.totalProducts}
                </div>
                <div className="text-sm text-[var(--color-muted)]">
                  Totaal producten
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-[var(--radius-xl)] p-4">
                <div className="text-2xl font-bold text-green-700">
                  {stats.withImages}
                </div>
                <div className="text-sm text-green-600">
                  Met afbeelding
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-[var(--radius-xl)] p-4">
                <div className="text-2xl font-bold text-red-700">
                  {stats.withoutImages}
                </div>
                <div className="text-sm text-red-600">
                  Zonder afbeelding
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-xl)] p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {Math.round((stats.withImages / stats.totalProducts) * 100)}%
                </div>
                <div className="text-sm text-blue-600">
                  Compleetheid
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-[var(--radius-xl)] p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Bestandsnaam conventies:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• <code className="bg-white px-1.5 py-0.5 rounded">BF-12345.jpg</code> → SKU: BF-12345</li>
                <li>• <code className="bg-white px-1.5 py-0.5 rounded">12345.png</code> → SKU: BF-12345 (auto-prefix)</li>
                <li>• <code className="bg-white px-1.5 py-0.5 rounded">XL22-0001.jpg</code> → SKU: XL22-0001</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-2xl)] p-8">
          <BulkImageUploader />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/admin/brams-fruit')}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
          >
            ← Terug naar Bram's Fruit Admin
          </button>
        </div>
      </div>
    </div>
  );
}
