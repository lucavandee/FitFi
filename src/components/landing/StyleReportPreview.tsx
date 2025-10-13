const SAMPLE_OUTFITS = [
  {
    items: [
      { url: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Beige Coat' },
      { url: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Dark Jeans' },
      { url: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'White Blouse' }
    ]
  },
  {
    items: [
      { url: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Camel Sweater' },
      { url: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Beige Trousers' }
    ]
  }
];

export function StyleReportPreview() {
  return (
    <div className="relative w-full aspect-[9/16] sm:aspect-[3/4] bg-white rounded-3xl shadow-xl overflow-hidden border border-[var(--color-border)] transition-all duration-300 hover:shadow-2xl">
      <div className="absolute inset-0 flex flex-col">
        <div className="bg-[var(--ff-color-primary-300)] p-8 sm:p-10 text-white">
          <div className="mb-2">
            <span className="text-[11px] sm:text-xs font-medium uppercase tracking-widest opacity-75">Jouw Style Report</span>
          </div>
          <h3 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight tracking-tight">Modern Minimal</h3>
          <p className="text-white/70 text-sm sm:text-base font-light">Strak, eigentijds & zelfverzekerd</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-gradient-to-b from-white to-[var(--color-bg)]">
          <div>
            <div className="text-sm font-semibold text-[var(--color-text)] mb-5 tracking-wide">Jouw Outfits</div>

            <div className="space-y-5">
              {SAMPLE_OUTFITS.map((outfit, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-2.5 border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
                >
                  <div className="flex gap-2.5">
                    {outfit.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex-1 aspect-[3/4] relative rounded-xl overflow-hidden bg-[var(--color-bg)] group-hover:ring-2 group-hover:ring-[var(--ff-color-primary-300)] transition-all duration-300"
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <span className="inline-block text-xs text-[var(--color-text-muted)] bg-[var(--ff-color-primary-50)] px-4 py-2 rounded-full border border-[var(--ff-color-primary-200)]">
                + 10 meer gepersonaliseerde outfits
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[var(--color-border)] shadow-sm">
            <div className="text-sm font-semibold text-[var(--color-text)] mb-4 tracking-wide">Jouw Kleuren</div>
            <div className="flex gap-3.5">
              <div className="relative group/color">
                <div className="w-14 h-14 rounded-xl bg-[#2C3E50] shadow-md transition-transform duration-300 group-hover/color:scale-110 group-hover/color:shadow-lg"></div>
              </div>
              <div className="relative group/color">
                <div className="w-14 h-14 rounded-xl bg-[#F5F0E8] shadow-md border border-[var(--color-border)] transition-transform duration-300 group-hover/color:scale-110 group-hover/color:shadow-lg"></div>
              </div>
              <div className="relative group/color">
                <div className="w-14 h-14 rounded-xl bg-[#A6886A] shadow-md transition-transform duration-300 group-hover/color:scale-110 group-hover/color:shadow-lg"></div>
              </div>
              <div className="relative group/color">
                <div className="w-14 h-14 rounded-xl bg-[#D8CABA] shadow-md transition-transform duration-300 group-hover/color:scale-110 group-hover/color:shadow-lg"></div>
              </div>
            </div>
            <p className="mt-4 text-xs text-[var(--color-text-muted)] leading-relaxed">
              Warme neutrale tinten die perfect bij jouw natuurlijke uitstraling passen
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-white border-t border-[var(--color-border)]">
          <button className="w-full py-3.5 bg-[var(--ff-color-primary-300)] text-white rounded-2xl font-semibold text-sm sm:text-base hover:bg-[var(--ff-color-primary-400)] transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] tracking-wide">
            Start Gratis Quiz
          </button>
          <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
            2 minuten · Geen account nodig
          </p>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white/98 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-[var(--color-border)] transition-all duration-300 hover:scale-105">
        <span className="text-xs font-bold text-[var(--ff-color-primary-600)] tracking-wide">Gratis</span>
      </div>
    </div>
  );
}
