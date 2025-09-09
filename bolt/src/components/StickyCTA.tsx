type Props = { label:string; sublabel?:string; onClick:()=>void };
export default function StickyCTA({label,sublabel,onClick}:Props){
  return (
    <div className="fixed bottom-4 left-0 right-0">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="w-full rounded-2xl border border-zinc-200 bg-white shadow-sm p-3 flex items-center justify-center gap-3">
          <div className="flex-1">
            <div className="text-base font-semibold">{label}</div>
            {sublabel && <div className="text-sm opacity-80">{sublabel}</div>}
          </div>
          <button onClick={onClick} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-black text-white">
            Start gratis
          </button>
        </div>
      </div>
    </div>
  );
}
