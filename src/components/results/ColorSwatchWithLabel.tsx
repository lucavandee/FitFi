import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { ColorSwatch } from '@/data/colorPalettes';
import { getColorAriaLabel } from '@/data/colorPalettes';

interface ColorSwatchWithLabelProps {
  swatch: ColorSwatch;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  recommendation?: 'do' | 'dont' | 'neutral';
}

/**
 * ColorSwatchWithLabel - Interactive color swatch with accessible labels
 *
 * Purpose:
 * - Show concrete color with name
 * - Hover to see more info
 * - Fully accessible (keyboard, screen readers)
 * - Touch-friendly for mobile
 *
 * A11y:
 * - aria-label with full description
 * - Keyboard focusable
 * - Sufficient color contrast for text
 * - Screen reader announces color name + category
 */
export function ColorSwatchWithLabel({
  swatch,
  size = 'md',
  showLabel = true,
  recommendation = 'neutral'
}: ColorSwatchWithLabelProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const showTooltip = isHovered || isFocused;

  // Size variants
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };

  // Text size variants
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  // Determine text color based on background luminance
  const getTextColor = (hex: string): string => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    return luminance > 128 ? 'black000' : 'whiteFFF';
  };

  const textColor = getTextColor(swatch.hex);

  // Recommendation icon
  const RecommendationIcon = recommendation === 'do' ? Check :
                             recommendation === 'dont' ? X :
                             null;

  const recommendationColor = recommendation === 'do' ? 'text-green-600 bg-green-100' :
                              recommendation === 'dont' ? 'text-red-600 bg-red-100' :
                              '';

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Color Swatch */}
      <motion.button
        className={`${sizeClasses[size]} rounded-xl shadow-md relative overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ff-color-primary-500)] focus:ring-offset-2 transition-all`}
        style={{ backgroundColor: swatch.hex }}
        whileHover={{ scale: 1.1, boxShadow: '0 8px 16px rgba(0,0,0,0.15)' }}
        whileTap={{ scale: 0.95 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-label={getColorAriaLabel(swatch)}
        role="button"
        tabIndex={0}
      >
        {/* Recommendation Badge */}
        {RecommendationIcon && (
          <div className={`absolute top-1 right-1 w-5 h-5 rounded-full ${recommendationColor} flex items-center justify-center`}>
            <RecommendationIcon className="w-3 h-3" />
          </div>
        )}

        {/* Hover Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center p-2"
              style={{
                backgroundColor: `${swatch.hex}EE`, // 93% opacity
                color: textColor
              }}
            >
              <span className="text-xs font-bold text-center leading-tight">
                {swatch.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Label (always visible) */}
      {showLabel && (
        <div className="text-center max-w-[80px]">
          <p className={`${textSizeClasses[size]} font-medium text-gray-700 leading-tight`}>
            {swatch.name}
          </p>
          {swatch.description && (
            <p className="text-xs text-gray-500 mt-0.5">
              {swatch.description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ColorSwatchGrid - Grid layout for multiple swatches
 */
interface ColorSwatchGridProps {
  swatches: ColorSwatch[];
  title?: string;
  recommendation?: 'do' | 'dont' | 'neutral';
  columns?: number;
}

export function ColorSwatchGrid({
  swatches,
  title,
  recommendation = 'neutral',
  columns = 6
}: ColorSwatchGridProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-lg font-bold text-gray-800">
          {title}
        </h4>
      )}

      <div
        className={`grid gap-4`}
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(80px, 1fr))`,
          maxWidth: `${columns * 96}px` // 96px = 80px + 16px gap
        }}
      >
        {swatches.map((swatch, idx) => (
          <ColorSwatchWithLabel
            key={`${swatch.hex}-${idx}`}
            swatch={swatch}
            recommendation={recommendation}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * UX Notes:
 *
 * 1. Visual Feedback:
 *    - Hover: Scale + shadow
 *    - Focus: Ring (keyboard accessibility)
 *    - Tap: Scale down (mobile feedback)
 *
 * 2. Progressive Disclosure:
 *    - Default: Color swatch + name
 *    - Hover/Focus: Full color name overlaid
 *    - Touch: Tap to see name
 *
 * 3. Accessibility:
 *    - aria-label: "Basiskleur: Zuiver wit"
 *    - Keyboard focusable (tabIndex={0})
 *    - Focus ring visible
 *    - Screen reader announces full info
 *
 * 4. Color Contrast:
 *    - Text color adapts to background
 *    - Always readable (WCAG AA compliant)
 *
 * 5. Mobile Optimization:
 *    - Touch targets ≥ 48x48px
 *    - Tap feedback (scale down)
 *    - Labels always visible (no hover needed)
 *
 * References:
 * - WCAG 2.1: Color Contrast (AA)
 * - Material Design: Touch Targets
 * - Apple HIG: Accessibility
 */
