import { Sparkles, Check } from 'lucide-react';

const SAMPLE_OUTFITS = [
  {
    items: [
      { url: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Beige Coat' },
      { url: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Dark Jeans' },
      { url: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'White Blouse' }
    ],
    matchScore: 94
  },
  {
    items: [
      { url: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Camel Sweater' },
      { url: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Beige Trousers' }
    ],
    matchScore: 92
  },
  {
    items: [
      { url: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Knit Top' },
      { url: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=300&h=400&dpr=2', name: 'Classic Jeans' }
    ],
    matchScore: 90
  }
];

export function StyleReportPreview() {
  return (
    <div className="relative w-full aspect-[9/16] sm:aspect-[3/4] bg-[var(--color-bg)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
      <div className="absolute inset-0 flex flex-col overflow-hidden">
        <div className="relative bg-gradient-to-br from-[var(--ff-color-primary-700)] via-[var(--ff-color-primary-600)] to-[var(--ff-cta-500)] p-6 text-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-semibold uppercase tracking-wide opacity-90">Jouw Style Report</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-1 leading-tight">Modern Minimal</h3>
              <p className="text-white/80 text-sm">Strak, eigentijds & zelfverzekerd</p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">Match</div>
              <div className="text-xl font-bold">94%</div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">Outfits</div>
              <div className="text-xl font-bold">12</div>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
              <div className="text-[10px] uppercase tracking-wide opacity-70 mb-0.5">Items</div>
              <div className="text-xl font-bold">36+</div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-white overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="bg-[var(--ff-color-primary-50)] rounded-xl p-4 border border-[var(--ff-color-primary-200)]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--ff-color-primary-600)] flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-[var(--color-text)] uppercase tracking-wide">Perfect voor jou</div>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Jouw stijl combineert minimalistische lijnen met hoogwaardige basics. Tijdloze elegantie in neutrale tinten.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-[var(--color-text)]">Jouw Outfits</h4>
                <span className="text-xs text-[var(--color-text-muted)]">Scroll voor meer</span>
              </div>

              <div className="space-y-3">
                {SAMPLE_OUTFITS.map((outfit, idx) => (
                  <div key={idx} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="flex gap-2 p-2">
                      {outfit.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="flex-1 aspect-[3/4] relative rounded-lg overflow-hidden bg-[var(--ff-color-primary-50)]">
                          <img
                            src={item.url}
                            alt={item.name}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="px-3 py-2 bg-[var(--color-bg)] flex items-center justify-between">
                      <span className="text-xs font-semibold text-[var(--color-text)]">Outfit {idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--ff-color-primary-600)]"></div>
                        <span className="text-xs font-bold text-[var(--ff-color-primary-600)]">{outfit.matchScore}% match</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-center">
                <div className="inline-block bg-[var(--ff-color-primary-50)] rounded-full px-4 py-2 border border-[var(--ff-color-primary-200)]">
                  <span className="text-xs font-semibold text-[var(--ff-color-primary-700)]">+ 9 meer gepersonaliseerde outfits</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--ff-color-accent-50)] to-[var(--ff-color-accent-100)] rounded-xl p-4 border border-[var(--ff-color-accent-200)]">
              <div className="text-xs font-semibold text-[var(--color-text)] mb-2 uppercase tracking-wide">Jouw Kleuren</div>
              <div className="flex gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#2C3E50] shadow-md border-2 border-white"></div>
                <div className="w-10 h-10 rounded-lg bg-[#F5F0E8] shadow-md border-2 border-white"></div>
                <div className="w-10 h-10 rounded-lg bg-[#A6886A] shadow-md border-2 border-white"></div>
                <div className="w-10 h-10 rounded-lg bg-[#8A7459] shadow-md border-2 border-white"></div>
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Warme neutrale tinten die jouw natuurlijke uitstraling versterken
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-[var(--color-border)] space-y-2">
          <button className="w-full py-3 bg-[var(--ff-cta-500)] text-white rounded-xl font-semibold text-sm hover:bg-[var(--ff-cta-600)] transition-all shadow-lg hover:shadow-xl active:scale-[0.98]">
            Start Gratis Quiz
          </button>
          <p className="text-center text-xs text-[var(--color-text-muted)]">
            2 minuten · Geen account nodig
          </p>
        </div>
      </div>

      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg border border-[var(--color-border)]">
        <span className="text-xs font-bold text-[var(--ff-color-primary-700)]">100% Gratis</span>
      </div>
    </div>
  );
}
