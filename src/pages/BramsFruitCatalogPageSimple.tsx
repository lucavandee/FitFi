import { useEffect, useState } from 'react';
import { getBramsFruitProductGroups } from '@/services/bramsFruit/productService';

export default function BramsFruitCatalogPageSimple() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[BramsFruit Simple] Component mounted');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('[BramsFruit Simple] Fetching products...');
      const products = await getBramsFruitProductGroups();
      console.log('[BramsFruit Simple] Got products:', products.length);
      setCount(products.length);
      setLoading(false);
    } catch (err) {
      console.error('[BramsFruit Simple] Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Error!</h1>
          <p className="text-[var(--color-text-secondary)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-[var(--color-text)] mb-4">
          Brams Fruit Collectie
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-4">
          Test pagina - als je dit ziet werkt de route!
        </p>
        <p className="text-[var(--color-text)] text-xl">
          ✅ Found {count} product groups
        </p>
      </div>
    </div>
  );
}
