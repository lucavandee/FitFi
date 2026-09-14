/**
 * Fixture: uitsluitend de componentspecs die CLAUDE.md deel 2 en deel 13
 * letterlijk voorschrijft. Dit bestand MOET nul harde overtredingen geven.
 * Slaat de checker hier aan, dan spreekt hij het design system tegen.
 */
export function Conform() {
  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <header className="fixed bg-white/90 backdrop-blur-md border-b border-[#E5E5E5] h-16">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#A85740]" />
      </header>

      <section className="bg-[#F5F0EB] pt-24 pb-16 md:pt-32 md:pb-20">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] text-center">Kop</h1>
        <p className="text-base text-[#4A4A4A] text-center mt-4 max-w-lg mx-auto">Body</p>
        <span className="text-xs font-medium text-[#6E6E6E]">Caption</span>
      </section>

      <button className="bg-[#A85740] hover:bg-[#9A503B] text-white font-semibold text-base py-3 px-6 rounded-xl transition-colors duration-200">
        Begin gratis
      </button>
      <button className="bg-white border border-[#E5E5E5] hover:border-[#A85740] text-[#1A1A1A] font-medium text-base py-3 px-6 rounded-xl">
        Bekijk je resultaten
      </button>

      <article className="bg-white border border-[#E5E5E5] rounded-2xl p-6 hover:shadow-md transition-shadow duration-200">
        <span className="absolute top-3 left-3 rounded-full bg-[#A85740]/10 text-[#A85740]">Badge</span>
        <img className="aspect-[3/4] object-cover" loading="lazy" alt="Outfit" src="/o.jpg" />
        <button className="rounded-xl">Bewaar outfit</button>
        <a className="text-[#4A7EC2]">Bekijk bij partner</a>
      </article>

      <form className="bg-white border border-[#E5E5E5] rounded-2xl p-6 md:p-8 shadow-sm">
        <label className="text-sm font-medium text-[#1A1A1A]">Label</label>
        <input className="rounded-xl py-3 px-4 border border-[#E5E5E5] focus:ring-2 focus:ring-[#A85740]/20 focus:border-[#A85740]" />
      </form>

      <div className="fixed inset-0 bg-black/40">
        <div className="rounded-2xl max-w-lg shadow-xl bg-white p-6">
          <button className="rounded-full">Ontgrendel premium</button>
        </div>
      </div>

      <section className="py-40 bg-[#F5F0EB]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" />
        <p className="text-[#3D8B5E]">Succes</p>
        <p className="text-[#D4913D]">Waarschuwing</p>
        <p className="text-[#C24A4A]">Error</p>
      </section>
    </div>
  );
}
