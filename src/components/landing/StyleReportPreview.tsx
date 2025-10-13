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
    <div className="relative w-full aspect-[9/16] sm:aspect-[3/4] bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="absolute inset-0 flex flex-col">
        <div className="bg-[var(--ff-color-primary-400)] p-8 text-white">
          <div className="mb-1">
            <span className="text-xs font-medium uppercase tracking-wider opacity-80">Jouw Style Report</span>
          </div>
          <h3 className="text-3xl font-bold mb-2 leading-tight">Modern Minimal</h3>
          <p className="text-white/75 text-sm">Strak, eigentijds & zelfverzekerd</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <div className="text-sm font-medium text-[var(--color-text)] mb-4">Jouw Outfits</div>

            <div className="space-y-4">
              {SAMPLE_OUTFITS.map((outfit, idx) => (
                <div key={idx} className="bg-[var(--color-bg)] rounded-xl p-2 border border-[var(--color-border)]">
                  <div className="flex gap-2">
                    {outfit.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex-1 aspect-[3/4] relative rounded-lg overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <span className="text-xs text-[var(--color-text-muted)]">+ 10 meer outfits beschikbaar</span>
            </div>
          </div>

          <div className="bg-[var(--color-bg)] rounded-xl p-4 border border-[var(--color-border)]">
            <div className="text-sm font-medium text-[var(--color-text)] mb-3">Jouw Kleuren</div>
            <div className="flex gap-3">
              <div className="w-12 h-12 rounded-lg bg-[#2C3E50] shadow-sm"></div>
              <div className="w-12 h-12 rounded-lg bg-[#F5F0E8] shadow-sm"></div>
              <div className="w-12 h-12 rounded-lg bg-[#A6886A] shadow-sm"></div>
              <div className="w-12 h-12 rounded-lg bg-[#D8CABA] shadow-sm"></div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-[var(--color-border)]">
          <button className="w-full py-3 bg-[var(--ff-color-primary-400)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--ff-color-primary-500)] transition-colors">
            Start Gratis Quiz
          </button>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-md">
        <span className="text-xs font-semibold text-[var(--ff-color-primary-600)]">Gratis</span>
      </div>
    </div>
  );
}
