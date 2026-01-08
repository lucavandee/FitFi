/**
 * CompletenessIndicator Component
 *
 * Shows outfit completeness status and warns about missing required items.
 * Prevents users from seeing incomplete outfits without explanation.
 *
 * Examples:
 * - ✅ "3/3 items" (complete)
 * - ⚠️ "2/3 items - missing footwear" (incomplete)
 * - 💡 "Style with your own shoes" (suggestion)
 */

import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

export type RequiredCategory = 'top' | 'bottom' | 'footwear';
export type OptionalCategory = 'accessory' | 'outerwear' | 'dress' | 'jumpsuit';
export type ProductCategory = RequiredCategory | OptionalCategory;

export interface CompletenessData {
  completeness?: number; // 0-100
  totalItems: number;
  requiredItems: number;
  missingCategories?: ProductCategory[];
  structure?: string[]; // e.g., ['top', 'bottom', 'footwear', 'accessory']
}

interface CompletenessIndicatorProps {
  data: CompletenessData;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  top: 'bovenstuk',
  bottom: 'onderstuk',
  footwear: 'schoenen',
  accessory: 'accessoire',
  outerwear: 'jas',
  dress: 'jurk',
  jumpsuit: 'jumpsuit'
};

const REQUIRED_CATEGORIES: RequiredCategory[] = ['top', 'bottom', 'footwear'];

/**
 * Determines completeness status and styling
 */
function getCompletenessStatus(completeness?: number, missingCategories?: ProductCategory[]) {
  const hasRequired = missingCategories
    ? !missingCategories.some(cat => REQUIRED_CATEGORIES.includes(cat as RequiredCategory))
    : true;

  if (completeness === undefined) {
    // Fallback: assume complete if no data
    return {
      status: 'complete' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle
    };
  }

  if (completeness >= 100 || (hasRequired && completeness >= 80)) {
    return {
      status: 'complete' as const,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle
    };
  }

  if (hasRequired && completeness >= 60) {
    return {
      status: 'optional-missing' as const,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Info
    };
  }

  return {
    status: 'incomplete' as const,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: AlertCircle
  };
}

/**
 * Generates human-readable completeness message
 */
function getCompletenessMessage(
  data: CompletenessData,
  status: 'complete' | 'optional-missing' | 'incomplete'
): { primary: string; secondary?: string; suggestion?: string } {
  const { totalItems, requiredItems, missingCategories = [] } = data;

  if (status === 'complete') {
    return {
      primary: `${totalItems}/${totalItems} items`,
      secondary: 'Compleet outfit'
    };
  }

  const missingRequired = missingCategories.filter(cat =>
    REQUIRED_CATEGORIES.includes(cat as RequiredCategory)
  );

  const missingOptional = missingCategories.filter(
    cat => !REQUIRED_CATEGORIES.includes(cat as RequiredCategory)
  );

  if (missingRequired.length > 0) {
    const missingLabels = missingRequired.map(cat => CATEGORY_LABELS[cat]).join(', ');

    return {
      primary: `${totalItems}/${requiredItems} verplichte items`,
      secondary: `Ontbreekt: ${missingLabels}`,
      suggestion: `Style met eigen ${missingLabels}`
    };
  }

  if (missingOptional.length > 0) {
    const missingLabels = missingOptional.map(cat => CATEGORY_LABELS[cat]).join(', ');

    return {
      primary: `${totalItems} items`,
      secondary: `Optioneel: ${missingLabels}`,
      suggestion: `Voeg ${missingLabels} toe voor compleet look`
    };
  }

  return {
    primary: `${totalItems} items`,
    secondary: 'Basis outfit compleet'
  };
}

/**
 * Size variants
 */
const SIZE_VARIANTS = {
  sm: {
    container: 'px-2 py-1 text-xs gap-1',
    icon: 'w-3 h-3',
    badge: 'text-[10px]'
  },
  md: {
    container: 'px-3 py-1.5 text-sm gap-1.5',
    icon: 'w-4 h-4',
    badge: 'text-xs'
  },
  lg: {
    container: 'px-4 py-2 text-base gap-2',
    icon: 'w-5 h-5',
    badge: 'text-sm'
  }
};

export function CompletenessIndicator({
  data,
  size = 'md',
  showTooltip = true,
  className
}: CompletenessIndicatorProps) {
  const { completeness, missingCategories } = data;
  const statusData = getCompletenessStatus(completeness, missingCategories);
  const message = getCompletenessMessage(data, statusData.status);
  const sizeClasses = SIZE_VARIANTS[size];
  const Icon = statusData.icon;

  const [showTooltipState, setShowTooltipState] = React.useState(false);

  return (
    <div className={cn('relative inline-flex', className)}>
      {/* Main badge */}
      <div
        className={cn(
          'inline-flex items-center rounded-full border font-medium transition-all',
          sizeClasses.container,
          statusData.color,
          statusData.bgColor,
          statusData.borderColor,
          showTooltip && 'cursor-help'
        )}
        onMouseEnter={() => showTooltip && setShowTooltipState(true)}
        onMouseLeave={() => setShowTooltipState(false)}
        role="status"
        aria-label={`${message.primary}${message.secondary ? ` - ${message.secondary}` : ''}`}
      >
        <Icon className={cn(sizeClasses.icon, 'flex-shrink-0')} aria-hidden="true" />
        <span className="font-semibold">{message.primary}</span>

        {/* Completeness percentage badge (if available) */}
        {completeness !== undefined && completeness < 100 && (
          <span
            className={cn(
              'ml-1 rounded-full px-1.5 py-0.5 font-bold',
              sizeClasses.badge,
              statusData.bgColor,
              'ring-1 ring-inset',
              statusData.borderColor
            )}
          >
            {completeness}%
          </span>
        )}
      </div>

      {/* Tooltip with details */}
      {showTooltip && showTooltipState && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 pointer-events-none"
          role="tooltip"
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg shadow-xl p-3">
            <div className="font-semibold mb-1">{message.primary}</div>
            {message.secondary && <div className="text-gray-300 text-xs mb-2">{message.secondary}</div>}
            {message.suggestion && (
              <div className="text-blue-300 text-xs flex items-start gap-1.5 mt-2 pt-2 border-t border-gray-700">
                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{message.suggestion}</span>
              </div>
            )}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-gray-900" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact variant - just icon + count
 */
export function CompletenessIconBadge({ data, className }: { data: CompletenessData; className?: string }) {
  const { completeness, totalItems, requiredItems, missingCategories } = data;
  const statusData = getCompletenessStatus(completeness, missingCategories);
  const Icon = statusData.icon;

  const isComplete =
    completeness === undefined ||
    completeness >= 100 ||
    !missingCategories?.some(cat => REQUIRED_CATEGORIES.includes(cat as RequiredCategory));

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 text-xs font-medium',
        statusData.color,
        className
      )}
      role="status"
      aria-label={`${totalItems} van ${requiredItems} items`}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>
        {totalItems}/{requiredItems}
      </span>
      {!isComplete && <span className="text-[10px] opacity-75">(!)</span>}
    </div>
  );
}

/**
 * Helper: Extract completeness data from outfit object
 */
export function getOutfitCompletenessData(outfit: {
  completeness?: number;
  structure?: string[];
  products?: Array<{ category?: string; type?: string }>;
}): CompletenessData {
  const structure = outfit.structure || [];
  const products = outfit.products || [];

  // Determine present categories
  const presentCategories = new Set<string>();
  products.forEach(p => {
    const cat = (p.category || p.type || '').toLowerCase();
    if (cat) presentCategories.add(cat);
  });

  // Determine missing categories
  const allCategories: ProductCategory[] = ['top', 'bottom', 'footwear', 'accessory', 'outerwear'];
  const missingCategories = allCategories.filter(cat => !presentCategories.has(cat));

  // Count required items
  const requiredCount = REQUIRED_CATEGORIES.filter(cat => presentCategories.has(cat)).length;

  return {
    completeness: outfit.completeness,
    totalItems: products.length,
    requiredItems: REQUIRED_CATEGORIES.length, // Always 3
    missingCategories: missingCategories.length > 0 ? missingCategories : undefined,
    structure
  };
}
