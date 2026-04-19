import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Sparkles, Bookmark, BookmarkCheck } from 'lucide-react';
import type { QuickOutfit, QuickOutfitItem } from '@/services/visualPreferences/quickOutfitGenerator';
import { getStyleEmoji } from '@/services/visualPreferences/quickOutfitGenerator';
import { previewOutfitService } from '@/services/previewOutfits/previewOutfitService';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';

interface LiveOutfitPreviewProps {
  outfit: QuickOutfit | null;
  isVisible: boolean;
  swipeCount?: number;
  sessionId?: string;
}

export function LiveOutfitPreview({ outfit, isVisible, swipeCount = 5, sessionId }: LiveOutfitPreviewProps) {
  const { user } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user || !outfit || isSaved) return;

    setIsSaving(true);

    try {
      const saved = await previewOutfitService.savePreviewOutfit({
        userId: user.id,
        sessionId,
        outfit,
        swipeCount
      });

      if (saved) {
        setIsSaved(true);
        toast.success('Preview outfit opgeslagen! 🎉', {
          icon: '📌',
          duration: 3000
        });
      } else {
        toast.error('Kon preview niet opslaan');
      }
    } catch (err) {
      toast.error('Er ging iets mis');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isVisible || !outfit) return null;

  const items = [
    { item: outfit.top, delay: 0 },
    { item: outfit.bottom, delay: 0.15 },
    { item: outfit.footwear, delay: 0.3 }
  ].filter(({ item }) => item);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className="mt-6 px-4"
      >
        <motion.div
          className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-2xl p-4 shadow-sm"
          layoutId="outfit-preview-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            >
              <Eye className="w-4 h-4 text-[#A8513A]" />
            </motion.div>
            <h3 className="text-sm font-semibold text-[#1A1A1A]">
              Jouw Stijl Preview
            </h3>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-lg"
            >
              {outfit.top && getStyleEmoji(outfit.top.style)}
            </motion.span>

            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              onClick={handleSave}
              disabled={isSaving || isSaved}
              className="ml-auto p-2 rounded-lg hover:bg-[#FAFAF8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={isSaved ? 'Opgeslagen!' : 'Preview opslaan'}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-[#A8513A]" />
              ) : (
                <Bookmark className="w-4 h-4 text-[#8A8A8A] hover:text-[#A8513A]" />
              )}
            </motion.button>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs text-[#8A8A8A] mb-4"
          >
            {outfit.styleDescription}
          </motion.p>

          <div className="grid grid-cols-3 gap-3">
            {items.map(({ item, delay }) => (
              <OutfitItemCard
                key={item!.id}
                item={item!}
                delay={delay}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 pt-3 border-t border-[#E5E5E5]"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8A8A8A]">
                Confidence
              </span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-[#FAFAF8] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${outfit.confidence * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="h-full bg-gradient-to-r from-[#A8513A] to-[#C2654A]"
                  />
                </div>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-[#1A1A1A] font-medium"
                >
                  {Math.round(outfit.confidence * 100)}%
                </motion.span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#8A8A8A]"
          >
            <Sparkles className="w-3 h-3" />
            <span>Blijf swipen voor betere matches!</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface OutfitItemCardProps {
  item: QuickOutfitItem;
  delay: number;
}

function OutfitItemCard({ item, delay }: OutfitItemCardProps) {
  const categoryLabels: Record<string, string> = {
    top: 'Top',
    bottom: 'Broek',
    footwear: 'Schoenen',
    accessory: 'Accessoire'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay,
        type: 'spring',
        stiffness: 200,
        damping: 15
      }}
      className="relative"
    >
      <div className="aspect-[3/4] bg-[#FAFAF8] rounded-lg overflow-hidden border border-[#E5E5E5] relative">
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ delay: delay + 0.2, duration: 0.5 }}
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${item.color}40, ${item.color}20)`
          }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="w-12 h-12 rounded-full"
            style={{
              backgroundColor: item.color,
              boxShadow: `0 4px 12px ${item.color}40`
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.4 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2"
        >
          <p className="text-[10px] font-medium text-white truncate">
            {item.name}
          </p>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
        className="text-[10px] text-[#8A8A8A] text-center mt-1"
      >
        {categoryLabels[item.category]}
      </motion.p>
    </motion.div>
  );
}
