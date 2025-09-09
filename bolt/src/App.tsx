import { useEffect, useState } from "react";
import StickyCTA from "./components/StickyCTA";
import ResultSkeleton from "./components/ResultSkeleton";

type Outfit = { id:string; title:string; reason:string };

export default function App(){
  const [loading,setLoading] = useState(true);
  const [outfits,setOutfits] = useState<Outfit[]>([]);

  useEffect(()=>{
    const t = setTimeout(()=>{
      setOutfits([
        {id:"1", title:"Minimal Black Layers", reason:"slankt af, makkelijk te combineren"},
        {id:"2", title:"Smart Casual Denim", reason:"nonchalant + strak silhouet"},
      ]);
      setLoading(false);
    }, 900);
    return ()=>clearTimeout(t);
  },[]);

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      <div className="container mx-auto max-w-3xl p-4">
        <h1 className="text-lg font-semibold">Jouw resultaten</h1>
        <p className="text-sm opacity-80">Explainability inbegrepen: korte reden per outfit.</p>

        {loading ? (
          <div className="mt-6 grid gap-4">
            <ResultSkeleton/>
            <ResultSkeleton/>
            <ResultSkeleton/>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {outfits.map(o=>(
              <div key={o.id} className="p-4 rounded-2xl border border-zinc-200 bg-white shadow-sm">
                <div className="font-medium">{o.title}</div>
                <div className="text-sm opacity-80 mt-2">Waarom: {o.reason}.</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <StickyCTA
        label="Krijg outfits op maat"
        sublabel="Wij combineren pasvorm + stijl. Gratis starten."
        onClick={()=>alert("CTA clicked")}
      />
    </div>
  );
}
