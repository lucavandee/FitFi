const SAMPLE_OUTFIT = {
  items: [
    { url: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2', name: 'Beige Coat' },
    { url: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2', name: 'Dark Jeans' },
    { url: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2', name: 'White Blouse' }
  ]
};

export function StyleReportPreview() {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-white rounded-3xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
      <div className="absolute inset-0 flex flex-col">
        {/* Header: Clean white met subtiele border */}
        <div className="relative bg-white px-8 pt-10 pb-8 border-b border-[var(--color-border)]">
          <div className="mb-1.5">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--color-text-muted)]">Style Report</span>
          </div>
          <h3 className="text-4xl font-bold text-[var(--color-text)] mb-1 leading-[1.1] tracking-tight">Modern Minimal</h3>
          <p className="text-[var(--color-text-muted)] text-sm font-light leading-relaxed">Strak, eigentijds & zelfverzekerd</p>

          {/* Badge: subtle accent color */}
          <div className="absolute top-6 right-6 bg-[var(--ff-color-primary-50)] rounded-full px-3 py-1.5 border border-[var(--ff-color-primary-200)]">
            <span className="text-[10px] font-bold text-[var(--ff-color-primary-700)] uppercase tracking-wider">Gratis</span>
          </div>
        </div>

        {/* Content: Light background */}
        <div className="flex-1 overflow-y-auto px-8 py-8 bg-[var(--color-bg)] space-y-7">
          {/* Style Description */}
          <div>
            <div className="mb-4">
              <div className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-1">Perfect voor jou</div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Jouw stijl combineert tijdloze basics met strakke lijnen. Minimalistisch en eigentijds.
              </p>
            </div>

            {/* Outfit Card: Clean white */}
            <div className="bg-white rounded-2xl p-3 shadow-sm border border-[var(--color-border)]">
              <div className="grid grid-cols-3 gap-2.5">
                {SAMPLE_OUTFIT.items.map((item, idx) => (
                  <div key={idx} className="aspect-[3/4] relative rounded-xl overflow-hidden bg-[var(--color-bg)]">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3 text-center">
                <span className="text-[11px] text-[var(--color-text-muted)]">+ 11 meer outfits</span>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <div className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wider mb-3">Jouw Kleurenpalet</div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--color-border)]">
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div className="aspect-square rounded-lg bg-[var(--color-text)] shadow-sm"></div>
                <div className="aspect-square rounded-lg bg-[var(--ff-color-beige-50)] shadow-sm border border-[var(--color-border)]"></div>
                <div className="aspect-square rounded-lg bg-[var(--ff-color-beige-500)] shadow-sm"></div>
                <div className="aspect-square rounded-lg bg-[var(--ff-color-beige-300)] shadow-sm"></div>
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                Navy, cream, taupe en beige. Warme neutrale tinten voor een elegante basis.
              </p>
            </div>
          </div>

          {/* Value Prop: Subtle accent background */}
          <div className="bg-white rounded-2xl p-5 border border-[var(--ff-color-primary-200)] shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[var(--ff-color-primary-700)]">94% Match</span>
              <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Persoonlijk</span>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              Gebaseerd op jouw voorkeuren en lichaamstype
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
