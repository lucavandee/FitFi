import { Sparkles, Target, Palette, TrendingUp } from 'lucide-react';

export function StyleReportPreview() {
  return (
    <div className="relative w-full aspect-[3/4] bg-white rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-border)]">
      <div className="absolute inset-0 flex flex-col">
        <div className="bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-turquoise)] p-4 sm:p-6 text-white">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide">Jouw Style Report</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1">Modern Minimal</h3>
          <p className="text-white/90 text-xs sm:text-sm">Strak, eigentijds & zelfverzekerd</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="bg-[var(--ff-color-primary-50)] rounded-xl p-3 border border-[var(--ff-color-primary-100)]">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
              <span className="text-xs font-semibold text-[var(--color-text)]">Archetype Match</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[var(--ff-color-primary-200)] rounded-full h-2">
                <div className="bg-[var(--ff-color-primary-600)] rounded-full h-2 w-[92%]"></div>
              </div>
              <span className="text-sm font-bold text-[var(--ff-color-primary-600)]">92%</span>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl p-2.5 sm:p-3 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-[var(--ff-color-accent-600)]" />
              <span className="text-xs font-semibold text-[var(--color-text)]">Jouw Kleuren</span>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#2C3E50] shadow-sm"></div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E8E8E8] shadow-sm"></div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#A67C52] shadow-sm"></div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#5D7B8C] shadow-sm"></div>
            </div>
          </div>

          <div className="bg-[var(--color-surface)] rounded-xl p-3 border border-[var(--color-border)]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[var(--ff-color-turquoise)]" />
              <span className="text-xs font-semibold text-[var(--color-text)]">Outfits</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-[3/4] bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-primary-50)] rounded-lg"></div>
              <div className="aspect-[3/4] bg-gradient-to-br from-[var(--ff-color-accent-100)] to-[var(--ff-color-accent-50)] rounded-lg"></div>
              <div className="aspect-[3/4] bg-gradient-to-br from-[var(--ff-color-turquoise-light)] to-[var(--ff-color-turquoise-lighter)] rounded-lg"></div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-[var(--color-text-muted)]">+ 9 meer outfits</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[var(--ff-color-accent-50)] to-[var(--ff-color-accent-25)] rounded-xl p-3 border border-[var(--ff-color-accent-100)]">
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              "Jouw stijl combineert minimalistische lijnen met hoogwaardige basics. Perfect voor een moderne..."
            </p>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
          <button className="w-full py-2 sm:py-2.5 bg-[var(--ff-color-primary-600)] text-white rounded-xl font-semibold text-xs sm:text-sm hover:bg-[var(--ff-color-primary-700)] transition-colors">
            Start Gratis Quiz
          </button>
        </div>
      </div>

      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-lg border border-[var(--color-border)]">
        <span className="text-[10px] sm:text-xs font-bold text-[var(--ff-color-primary-600)]">100% Gratis</span>
      </div>
    </div>
  );
}
