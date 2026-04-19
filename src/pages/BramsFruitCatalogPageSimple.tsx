import { useEffect, useState } from 'react';
import { getBramsFruitProductGroups } from '@/services/bramsFruit/productService';

export default function BramsFruitCatalogPageSimple() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const products = await getBramsFruitProductGroups();
      setCount(products.length);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-[#8A8A8A]">Producten laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Fout!</h1>
          <p className="text-[#8A8A8A]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-4">
          Brams Fruit Collectie
        </h1>
        <p className="text-[#8A8A8A] mb-4">
          Test pagina - als je dit ziet werkt de route!
        </p>
        <p className="text-[#1A1A1A] text-xl">
          ✅ Found {count} product groups
        </p>
      </div>
    </div>
  );
}
