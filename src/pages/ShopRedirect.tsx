import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { buildDeeplink, getDefaultPartner } from '@/utils/deeplinks';
import Seo from '@/components/Seo';

export default function ShopRedirect() {
  const [sp] = useSearchParams();
  const q = sp.get('q') || '';
  const partner = (sp.get('p') as any) || getDefaultPartner();

  const target = useMemo(() => buildDeeplink(partner, q || ''), [partner, q]);

  useEffect(() => {
    const t = setTimeout(() => { if (target) window.location.href = target; }, 700);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
      <Seo title="Shop redirect • FitFi" />
      <div className="card p-6 max-w-md text-center">
        <h1 className="text-2xl font-semibold text-ink">We sturen je door…</h1>
        <p className="text-gray-600 mt-2">We openen een winkel met je zoekopdracht:</p>
        <p className="mt-2 font-medium break-words">"{q || 'outfit'}"</p>
        <a href={target} className="btn-primary mt-6 inline-block rounded-xl px-4 py-2 bg-[#89CFF0] text-[#0D1B2A] hover:bg-[#89CFF0]/90">
          Open nu
        </a>
        <div className="text-xs text-gray-500 mt-3">
          Werkt de redirect niet? <Link to="/" className="underline text-[#89CFF0]">Terug naar FitFi</Link>
        </div>
      </div>
    </main>
  );
}