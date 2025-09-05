export default function Logos(){
  const logos=["Vogue","GQ","Highsnobiety","Monocle","Wired","Esquire"];
  return(
    <section className="ff-card text-center">
      <p className="uppercase tracking-wide text-xs text-gray-500">Gespot door</p>
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {logos.map(l=><div key={l} className="text-gray-500 text-sm">{l}</div>)}
      </div>
    </section>
  );
}