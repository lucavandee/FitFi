import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { haptics } from '@/utils/haptics';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showHandle?: boolean;
  maxHeight?: string;
  snapPoints?: number[];
  initialSnap?: number;
}

/**
 * Bottom Sheet Component
 * iOS-style modal that slides up from bottom
 *
 * Features:
 * - Swipe to dismiss
 * - Snap points for different heights
 * - Backdrop with blur
 * - Portal rendering
 * - Keyboard aware
 * - Haptic feedback
 *
 * @example
 * <BottomSheet
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Outfit Details"
 * >
 *   <OutfitContent />
 * </BottomSheet>
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  showHandle = true,
  maxHeight = '85vh',
  snapPoints = [0.5, 0.85],
  initialSnap = 0.85
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const [currentSnap, setCurrentSnap] = React.useState(initialSnap);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Backdrop opacity based on drag
  const opacity = useTransform(y, [0, 200], [0.5, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Swipe down to close (threshold: 150px or velocity > 500)
    if (offset > 150 || velocity > 500) {
      haptics.impact();
      onClose();
    } else {
      // Snap back
      haptics.tap();
      y.set(0);
    }
  };

  const handleBackdropClick = () => {
    haptics.tap();
    onClose();
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            style={{ opacity }}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] rounded-t-3xl shadow-2xl"
            style={{
              maxHeight,
              y
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-[var(--color-border)] rounded-full" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {title}
                </h2>
                <button
                  onClick={() => {
                    haptics.tap();
                    onClose();
                  }}
                  className="w-8 h-8 rounded-full bg-[var(--ff-color-neutral-100)] flex items-center justify-center hover:bg-[var(--ff-color-neutral-200)] transition-colors"
                  aria-label="Sluit"
                >
                  <X className="w-5 h-5 text-[var(--color-muted)]" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: `calc(${maxHeight} - 80px)` }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

/**
 * Bottom Sheet with Snap Points
 * Allows sheet to snap to multiple height positions
 */
export function SnapBottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = ['40vh', '85vh'],
  initialSnap = 1
}: Omit<BottomSheetProps, 'snapPoints' | 'initialSnap'> & {
  snapPoints?: string[];
  initialSnap?: number;
}) {
  const [currentSnapIndex, setCurrentSnapIndex] = React.useState(initialSnap);
  const y = useMotionValue(0);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Close threshold
    if (offset > 200 || velocity > 800) {
      haptics.impact();
      onClose();
      return;
    }

    // Snap to closest point
    if (offset > 100 && currentSnapIndex > 0) {
      // Snap down
      setCurrentSnapIndex(currentSnapIndex - 1);
      haptics.tap();
    } else if (offset < -100 && currentSnapIndex < snapPoints.length - 1) {
      // Snap up
      setCurrentSnapIndex(currentSnapIndex + 1);
      haptics.tap();
    }

    y.set(0);
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface)] rounded-t-3xl shadow-2xl"
            style={{
              height: snapPoints[currentSnapIndex],
              y
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-[var(--color-border)] rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {title}
                </h2>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto h-full pb-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
}

/**
 * Action Sheet variant (iOS-style action picker)
 */
interface ActionSheetAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  actions,
  cancelLabel = 'Annuleer'
}: ActionSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title} showHandle={false}>
      <div className="p-2">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              haptics.tap();
              if (!action.disabled) {
                action.onClick();
                onClose();
              }
            }}
            disabled={action.disabled}
            className={[
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors',
              action.variant === 'destructive'
                ? 'text-red-600 hover:bg-red-50 active:bg-red-100'
                : 'text-[var(--color-text)] hover:bg-[var(--ff-color-neutral-100)] active:bg-[var(--ff-color-neutral-200)]',
              action.disabled && 'opacity-50 cursor-not-allowed'
            ].join(' ')}
          >
            {action.icon && (
              <span className="flex-shrink-0">
                {action.icon}
              </span>
            )}
            <span className="font-medium">{action.label}</span>
          </button>
        ))}

        {/* Cancel button */}
        <button
          onClick={() => {
            haptics.tap();
            onClose();
          }}
          className="w-full mt-2 px-4 py-3 rounded-xl text-center font-semibold text-[var(--color-text)] bg-[var(--ff-color-neutral-100)] hover:bg-[var(--ff-color-neutral-200)] transition-colors"
        >
          {cancelLabel}
        </button>
      </div>
    </BottomSheet>
  );
}
