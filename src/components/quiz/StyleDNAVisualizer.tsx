import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

interface StyleDNAVisualizerProps {
  styleDNA: Record<string, number>;
  swipeCount: number;
  totalSwipes: number;
  isVisible?: boolean;
}

const STYLE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  minimal: { label: 'Minimaal', emoji: '⚪', color: '#D4D4D4' },
  classic: { label: 'Klassiek', emoji: '👔', color: '#1A1A1A' },
  romantic: { label: 'Romantisch', emoji: '🌸', color: '#D4856E' },
  bohemian: { label: 'Bohemian', emoji: '🌿', color: '#A07040' },
  bold: { label: 'Bold', emoji: '⚡', color: '#E07070' },
  urban: { label: 'Urban', emoji: '🏙️', color: '#6A6A6A' },
  sporty: { label: 'Sportief', emoji: '⚽', color: '#2DD4BF' },
  refined: { label: 'Verfijnd', emoji: '✨', color: '#7A5C30' },
  relaxed: { label: 'Relaxed', emoji: '😌', color: '#D4856E' },
  professional: { label: 'Professioneel', emoji: '💼', color: '#4A4A4A' },
};

export function StyleDNAVisualizer({
  styleDNA,
  swipeCount,
  totalSwipes,
  isVisible = true
}: StyleDNAVisualizerProps) {
  if (!isVisible || swipeCount === 0) return null;

  const sortedStyles = Object.entries(styleDNA)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const topStyle = sortedStyles[0];
  const progressPercent = (swipeCount / totalSwipes) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6 px-4"
      >
        <motion.div
          className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-4 shadow-sm"
          layoutId="style-dna-card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-4 h-4 text-[#A8513A]" />
              </motion.div>
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                Je Stijl DNA
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#8A8A8A]">
              <TrendingUp className="w-3 h-3" />
              <span>{swipeCount}/{totalSwipes}</span>
            </div>
          </div>

          {sortedStyles.length === 0 ? (
            <p className="text-xs text-[#8A8A8A] text-center py-2">
              Swipe om je stijlprofiel te ontdekken...
            </p>
          ) : (
            <div className="space-y-2">
              {sortedStyles.map(([styleKey, score], index) => {
                const style = STYLE_LABELS[styleKey] || {
                  label: styleKey,
                  emoji: '🎨',
                  color: '#8A8A8A'
                };
                const percentage = Math.round(score);
                const isTop = index === 0;

                return (
                  <motion.div
                    key={styleKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{style.emoji}</span>
                        <span className={`text-xs font-medium ${
                          isTop ? 'text-[#A8513A]' : 'text-[#1A1A1A]'
                        }`}>
                          {style.label}
                        </span>
                        {isTop && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[10px] px-1.5 py-0.5 bg-[#A8513A] text-white rounded-full"
                          >
                            Top
                          </motion.span>
                        )}
                      </div>
                      <motion.span
                        key={percentage}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xs font-semibold text-[#8A8A8A]"
                      >
                        {percentage}%
                      </motion.span>
                    </div>

                    <div className="h-1.5 bg-[#FAFAF8] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: isTop
                            ? '#A8513A'
                            : style.color,
                          opacity: isTop ? 1 : 0.7
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {topStyle && swipeCount >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4 pt-3 border-t border-[#E5E5E5]"
            >
              <p className="text-xs text-[#8A8A8A] text-center">
                {swipeCount < 7 ? (
                  <>
                    Je {STYLE_LABELS[topStyle[0]]?.label.toLowerCase() || topStyle[0]} stijl komt naar voren!
                    <span className="font-medium text-[#1A1A1A]"> Swipe door voor meer precisie.</span>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-[#A8513A]">Perfect!</span> Je stijlprofiel is helder.
                  </>
                )}
              </p>
            </motion.div>
          )}

          <div className="mt-3 h-1 bg-[#FAFAF8] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-[#A8513A] to-[#C2654A]"
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
