import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image, CircleAlert as AlertCircle } from 'lucide-react';
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
      .select('id, image_url');

    if (!allProducts) return;

    const withImages = allProducts.filter(p => p.image_url && !p.image_url.includes('/fallbacks/')).length;
    const withoutImages = allProducts.length - withImages;

    setStats({
      totalProducts: allProducts.length,
      withImages,
      withoutImages,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="text-[#8A8A8A]">Laden...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A8513A] to-[#C2654A] flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                Afbeeldingen Beheer
              </h1>
              <p className="text-[#8A8A8A]">
                Upload product afbeeldingen in bulk
              </p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-4">
                <div className="text-2xl font-bold text-[#1A1A1A]">
                  {stats.totalProducts}
                </div>
                <div className="text-sm text-[#8A8A8A]">
                  Totaal producten
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                <div className="text-2xl font-bold text-green-700">
                  {stats.withImages}
                </div>
                <div className="text-sm text-green-600">
                  Met afbeelding
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="text-2xl font-bold text-red-700">
                  {stats.withoutImages}
                </div>
                <div className="text-sm text-red-600">
                  Zonder afbeelding
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="text-2xl font-bold text-blue-700">
                  {Math.round((stats.withImages / stats.totalProducts) * 100)}%
                </div>
                <div className="text-sm text-blue-600">
                  Compleetheid
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
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

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-8">
          <BulkImageUploader />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/admin')}
            className="text-sm text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
          >
            ← Terug naar Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
