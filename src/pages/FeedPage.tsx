import React, { useEffect, useState } from 'react';

type FeedProduct = { id: string; name: string; imageUrl: string };
type FeedOutfit = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  products: FeedProduct[];
  archetype: string;
};

async function getFeedMock(count: number): Promise<FeedOutfit[]> {
  // Simple placeholder; replaced in step 3
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${i}`,
    title: `Outfit ${i+1}`,
    description: `Gepersonaliseerde look ${i+1}`,
    imageUrl: `https://picsum.photos/seed/fitfi-${i}/640/800`,
    products: [],
    archetype: 'casual_chic'
  }));
}

export default function FeedPage() {
  const [items, setItems] = useState<FeedOutfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getFeedMock(12);
      setItems(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="container mx-auto p-6">Nova Feed laden…</div>;

  return (
    <div className="container mx-auto p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((o) => (
        <article key={o.id} className="rounded-2xl shadow p-4 bg-white">
          <img src={o.imageUrl} alt={o.title} className="w-full h-64 object-cover rounded-xl mb-3" />
          <h3 className="font-semibold mb-1">{o.title}</h3>
          <p className="text-sm text-neutral-600 mb-3">{o.description}</p>
          <div className="flex gap-2 flex-wrap">
            {o.products.slice(0,4).map(p => (
              <span key={p.id} className="text-xs px-2 py-1 rounded bg-black/5">{p.name}</span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}