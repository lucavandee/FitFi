import React, { useEffect, useRef, useState } from 'react';
import { getFeed } from '@/services/DataRouter';

type FeedOutfit = Awaited<ReturnType<typeof getFeed>> extends (infer T)[] ? T : never;

export default function FeedPage() {
  const [items, setItems] = useState<FeedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const sentinelRef = useRef<HTMLDivElement|null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    (async () => {
      const data = await getFeed({ count: 18 });
      setItems(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(async (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !busyRef.current) {
        busyRef.current = true;
        const data = await getFeed({ count: 12 });
        setItems(prev => [...prev, ...data]);
        setPage(p => p+1);
        busyRef.current = false;
      }
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (loading) return <div className="container mx-auto p-6">Nova Feed laden…</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((o, i) => (
          <article key={`${o.id}-${i}`} className="rounded-2xl shadow p-4 bg-white">
            <img src={o.imageUrl} alt={o.title} className="w-full h-64 object-cover rounded-xl mb-3" />
            <h3 className="font-semibold mb-1">{o.title}</h3>
            <p className="text-sm text-neutral-600 mb-3">{o.description}</p>
            <div className="flex gap-2 flex-wrap">
              {(o.products ?? []).slice(0,4).map((p:any) => (
                <span key={p.id} className="text-xs px-2 py-1 rounded bg-black/5">{p.name}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
      <div ref={sentinelRef} className="h-14" />
    </div>
  );
}