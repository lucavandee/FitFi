import React from 'react';
import type { NovaOutfitsPayload, Outfit } from '@/lib/outfitSchema';
import { ShoppingCart, Star, Tag } from 'lucide-react';

function ScorePill({score}:{score:number}) {
  const hue = Math.round((score/100)*120); // rood→groen
  return (
    <div className="absolute top-3 right-3 rounded-full px-2 py-1 text-xs font-semibold text-white"
         style={{ backgroundColor:`hsl(${hue} 70% 45%)`}}>
      {score}%
    </div>
  );
}

function Palette({colors}:{colors?:string[]}) {
  if (!colors?.length) return null;
  return (
    <div className="flex gap-1">
      {colors.slice(0,4).map((c,i)=>(
        <span key={i} className="h-3 w-3 rounded-full border" style={{backgroundColor:c}} title={c}/>
      ))}
    </div>
  );
}

function ShopLink({o}:{o:Outfit}) {
  const q = encodeURIComponent(o.shopQuery || o.items.map(i=>i.name).join(' '));
  return (
    <a
      href={`/shop?q=${q}`}
      className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-[#89CFF0] text-[#0D1B2A] hover:bg-[#89CFF0]/90 transition"
    >
      <ShoppingCart size={16}/> Shop outfit
    </a>
  );
}

export default function OutfitCards({ data }:{ data:NovaOutfitsPayload }) {
  return (
    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {data.outfits.map(o=>(
        <div key={o.id} className="relative rounded-2xl border bg-white p-4 shadow-[0_8px_30px_rgb(13_27_42/0.06)]">
          <ScorePill score={o.matchScore}/>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-base font-semibold text-ink">{o.title}</h4>
              {o.occasion && <div className="text-xs text-gray-500 mt-0.5">{o.occasion}</div>}
            </div>
            <Palette colors={o.palette}/>
          </div>

          <ul className="mt-3 space-y-1.5 text-sm text-ink">
            {o.items.map((it, idx)=>(
              <li key={idx} className="flex gap-2">
                <span className="text-gray-500">{it.role}:</span>
                <span className="font-medium">{it.name}</span>
                {it.color && <span className="text-gray-500">({it.color})</span>}
                {it.note && <span className="text-gray-500">– {it.note}</span>}
              </li>
            ))}
          </ul>

          {o.why && <p className="mt-2 text-sm text-gray-600">{o.why}</p>}

          <div className="mt-3 flex items-center gap-3">
            <ShopLink o={o}/>
            {o.budget && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                <Tag size={14}/> {o.budget}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}