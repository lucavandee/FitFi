import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { haptics } from '@/utils/haptics';

interface FABAction {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  color?: string;
  bgColor?: string;
}

interface EnhancedFABProps {
  actions: FABAction[];
  primaryIcon?: React.ComponentType<{ className?: string }>;
  primaryColor?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  offset?: { bottom?: number; right?: number; left?: number };
}

/**
 * Enhanced FAB (Floating Action Button)
 * iOS/Material Design-style expandable FAB
 *
 * Features:
 * - Expandable menu with secondary actions
 * - Haptic feedback
 * - Smooth animations
 * - Safe area aware
 * - Backdrop blur
 * - Label tooltips
 *
 * @example
 * <EnhancedFAB
 *   actions={[
 *     {
 *       icon: RefreshCw,
 *       label: 'Quiz opnieuw',
 *       onClick: () => navigate('/onboarding')
 *     },
 *     {
 *       icon: Settings,
 *       label: 'Instellingen',
 *       onClick: () => navigate('/profile')
 *     }
 *   ]}
 * />
 */
export function EnhancedFAB({
  actions,
  primaryIcon: PrimaryIcon = Plus,
  primaryColor = 'var(--ff-color-primary-700)',
  position = 'bottom-right',
  offset = {}
}: EnhancedFABProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    haptics.impact();
    setIsExpanded(!isExpanded);
  };

  const handleActionClick = (action: FABAction) => {
    haptics.tap();
    action.onClick();
    setIsExpanded(false);
  };

  // Position styles
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 40,
    bottom: offset.bottom ?? 'max(1rem, calc(80px + env(safe-area-inset-bottom)))',
  };

  if (position === 'bottom-right') {
    positionStyles.right = offset.right ?? '1rem';
  } else if (position === 'bottom-left') {
    positionStyles.left = offset.left ?? '1rem';
  } else {
    positionStyles.left = '50%';
    positionStyles.transform = 'translateX(-50%)';
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleExpanded}
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div style={positionStyles}>
        <div className="flex flex-col items-end gap-3">
          {/* Secondary actions */}
          <AnimatePresence>
            {isExpanded && actions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{
                  delay: index * 0.05,
                  type: 'spring',
                  stiffness: 400,
                  damping: 25
                }}
                className="flex items-center gap-3"
              >
                {/* Label */}
                <motion.div
                  className="px-3 py-2 bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] whitespace-nowrap"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    {action.label}
                  </span>
                </motion.div>

                {/* Action button */}
                <button
                  onClick={() => handleActionClick(action)}
                  className={[
                    'min-w-[48px] min-h-[48px] rounded-full shadow-lg flex items-center justify-center transition-transform active:scale-95',
                    action.bgColor || 'bg-white'
                  ].join(' ')}
                  style={{
                    backgroundColor: action.bgColor || 'white'
                  }}
                >
                  <action.icon
                    className="w-5 h-5"
                    style={{
                      color: action.color || primaryColor
                    }}
                  />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Primary FAB */}
          <motion.button
            onClick={toggleExpanded}
            className="min-w-[56px] min-h-[56px] rounded-full shadow-xl flex items-center justify-center"
            style={{
              backgroundColor: primaryColor
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              rotate: isExpanded ? 45 : 0
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20
            }}
          >
            {isExpanded ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <PrimaryIcon className="w-6 h-6 text-white" />
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
}

/**
 * Simple FAB (non-expanding)
 * For single primary actions
 */
interface SimpleFABProps {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  label?: string;
  color?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function SimpleFAB({
  icon: Icon,
  onClick,
  label,
  color = 'var(--ff-color-primary-700)',
  position = 'bottom-right'
}: SimpleFABProps) {
  const [showLabel, setShowLabel] = useState(false);

  const handleClick = () => {
    haptics.impact();
    onClick();
  };

  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 40,
    bottom: 'max(1rem, calc(80px + env(safe-area-inset-bottom)))',
  };

  if (position === 'bottom-right') {
    positionStyles.right = '1rem';
  } else if (position === 'bottom-left') {
    positionStyles.left = '1rem';
  } else {
    positionStyles.left = '50%';
    positionStyles.transform = 'translateX(-50%)';
  }

  return (
    <div
      style={positionStyles}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
    >
      <div className="flex items-center gap-2">
        {/* Label tooltip */}
        <AnimatePresence>
          {showLabel && label && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="px-3 py-2 bg-[var(--color-surface)] rounded-lg shadow-lg border border-[var(--color-border)] whitespace-nowrap"
            >
              <span className="text-sm font-medium text-[var(--color-text)]">
                {label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB */}
        <motion.button
          onClick={handleClick}
          className="min-w-[56px] min-h-[56px] rounded-full shadow-xl flex items-center justify-center"
          style={{ backgroundColor: color }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </div>
  );
}

/**
 * Extended FAB
 * FAB with text label always visible (for primary actions)
 */
interface ExtendedFABProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  color?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function ExtendedFAB({
  icon: Icon,
  label,
  onClick,
  color = 'var(--ff-color-primary-700)',
  position = 'bottom-right'
}: ExtendedFABProps) {
  const handleClick = () => {
    haptics.impact();
    onClick();
  };

  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 40,
    bottom: 'max(1rem, calc(80px + env(safe-area-inset-bottom)))',
  };

  if (position === 'bottom-right') {
    positionStyles.right = '1rem';
  } else if (position === 'bottom-left') {
    positionStyles.left = '1rem';
  } else {
    positionStyles.left = '50%';
    positionStyles.transform = 'translateX(-50%)';
  }

  return (
    <motion.button
      onClick={handleClick}
      className="flex items-center gap-3 px-5 py-3 rounded-full shadow-xl"
      style={{
        ...positionStyles,
        backgroundColor: color
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Icon className="w-5 h-5 text-white" />
      <span className="text-sm font-semibold text-white">
        {label}
      </span>
    </motion.button>
  );
}

/**
 * Multi FAB (speed dial)
 * Multiple FABs in a row (Material Design speed dial)
 */
interface MultiFABProps {
  actions: FABAction[];
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export function MultiFAB({
  actions,
  position = 'bottom-right'
}: MultiFABProps) {
  const positionStyles: React.CSSProperties = {
    position: 'fixed',
    zIndex: 40,
    bottom: 'max(1rem, calc(80px + env(safe-area-inset-bottom)))',
  };

  if (position === 'bottom-right') {
    positionStyles.right = '1rem';
  } else if (position === 'bottom-left') {
    positionStyles.left = '1rem';
  } else {
    positionStyles.left = '50%';
    positionStyles.transform = 'translateX(-50%)';
  }

  return (
    <div style={positionStyles} className="flex gap-3">
      {actions.map((action, index) => (
        <motion.button
          key={index}
          onClick={() => {
            haptics.tap();
            action.onClick();
          }}
          className="min-w-[48px] min-h-[48px] rounded-full shadow-lg flex items-center justify-center"
          style={{
            backgroundColor: action.bgColor || 'var(--ff-color-primary-700)'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <action.icon
            className="w-5 h-5"
            style={{
              color: action.color || 'white'
            }}
          />
        </motion.button>
      ))}
    </div>
  );
}
