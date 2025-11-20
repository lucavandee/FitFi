import type { Product } from './types';

/**
 * Handler for insufficient products scenario
 * Provides intelligent suggestions when filtering leaves too few products
 */

export interface InsufficientProductsContext {
  totalProducts: number;
  filteredProducts: number;
  criteria: {
    gender?: string;
    budget?: { min?: number; max?: number };
  };
  categoryCounts: Record<string, number>;
}

export interface InsufficientProductsSuggestion {
  reason: string;
  userMessage: string;
  suggestions: Array<{
    action: string;
    description: string;
    newCriteria?: any;
  }>;
  canContinue: boolean;
}

/**
 * Analyze why there are insufficient products and provide suggestions
 */
export function handleInsufficientProducts(
  context: InsufficientProductsContext
): InsufficientProductsSuggestion {
  const { totalProducts, filteredProducts, criteria, categoryCounts } = context;

  console.log('[InsufficientProductsHandler] Analyzing:', {
    total: totalProducts,
    filtered: filteredProducts,
    criteria
  });

  // Identify the main blocker
  const missingCategories: string[] = [];
  const requiredCategories = ['top', 'bottom', 'footwear'];

  requiredCategories.forEach(cat => {
    if (!categoryCounts[cat] || categoryCounts[cat] < 2) {
      missingCategories.push(cat);
    }
  });

  // Calculate filtering impact
  const retentionRate = (filteredProducts / totalProducts) * 100;

  // Build suggestion based on the issue
  if (retentionRate < 5) {
    // Very aggressive filtering - likely budget + gender combo
    return buildBudgetAndGenderSuggestion(criteria, missingCategories);
  } else if (retentionRate < 20) {
    // Moderate filtering - likely budget issue
    return buildBudgetSuggestion(criteria, missingCategories);
  } else if (missingCategories.length > 0) {
    // Specific categories missing
    return buildCategorySuggestion(criteria, missingCategories);
  } else {
    // General insufficient products
    return buildGeneralSuggestion(criteria);
  }
}

function buildBudgetAndGenderSuggestion(
  criteria: InsufficientProductsContext['criteria'],
  missingCategories: string[]
): InsufficientProductsSuggestion {
  const genderLabel = criteria.gender === 'female' ? 'dames' : criteria.gender === 'male' ? 'heren' : '';
  const budgetStr = criteria.budget?.max ? `€${criteria.budget.max}` : '';

  return {
    reason: 'budget_and_gender_too_restrictive',
    userMessage: `We hebben momenteel beperkte ${genderLabel}producten binnen jouw budget van ${budgetStr} per item.`,
    suggestions: [
      {
        action: 'increase_budget',
        description: `Verhoog je budget naar €${Math.ceil((criteria.budget?.max || 100) * 1.5)}`,
        newCriteria: {
          budget: {
            ...criteria.budget,
            max: Math.ceil((criteria.budget?.max || 100) * 1.5)
          }
        }
      },
      {
        action: 'include_more_retailers',
        description: 'Toon producten van meer merken en winkels',
        newCriteria: {
          expandRetailers: true
        }
      },
      {
        action: 'notify_when_available',
        description: 'Laat me weten wanneer nieuwe producten beschikbaar zijn',
        newCriteria: null
      }
    ],
    canContinue: false
  };
}

function buildBudgetSuggestion(
  criteria: InsufficientProductsContext['criteria'],
  missingCategories: string[]
): InsufficientProductsSuggestion {
  const budgetStr = criteria.budget?.max ? `€${criteria.budget.max}` : '';
  const categoryStr = missingCategories.length > 0
    ? ` voor ${missingCategories.join(', ')}`
    : '';

  return {
    reason: 'budget_too_restrictive',
    userMessage: `Er zijn weinig producten${categoryStr} binnen jouw budget van ${budgetStr}.`,
    suggestions: [
      {
        action: 'increase_budget',
        description: `Verhoog je budget naar €${Math.ceil((criteria.budget?.max || 100) * 1.3)}`,
        newCriteria: {
          budget: {
            ...criteria.budget,
            max: Math.ceil((criteria.budget?.max || 100) * 1.3)
          }
        }
      },
      {
        action: 'flexible_budget',
        description: 'Sta een flexibel budget toe (sommige items mogen duurder zijn)',
        newCriteria: {
          budgetFlexibility: 0.2 // 20% flexibility
        }
      },
      {
        action: 'see_all',
        description: 'Toon alle beschikbare producten',
        newCriteria: {
          budget: null
        }
      }
    ],
    canContinue: false
  };
}

function buildCategorySuggestion(
  criteria: InsufficientProductsContext['criteria'],
  missingCategories: string[]
): InsufficientProductsSuggestion {
  const categoryLabels: Record<string, string> = {
    top: 'tops',
    bottom: 'broeken/rokken',
    footwear: 'schoenen',
    outerwear: 'jassen',
    accessory: 'accessoires'
  };

  const missingLabels = missingCategories.map(cat => categoryLabels[cat] || cat).join(', ');

  return {
    reason: 'missing_categories',
    userMessage: `We hebben momenteel weinig ${missingLabels} die aan je criteria voldoen.`,
    suggestions: [
      {
        action: 'expand_criteria',
        description: 'Verbreed je voorkeuren voor betere matches',
        newCriteria: null
      },
      {
        action: 'see_available',
        description: 'Toon wat wel beschikbaar is',
        newCriteria: {
          relaxConstraints: true
        }
      },
      {
        action: 'notify_new_stock',
        description: 'Stuur me een bericht bij nieuwe producten',
        newCriteria: null
      }
    ],
    canContinue: false
  };
}

function buildGeneralSuggestion(
  criteria: InsufficientProductsContext['criteria']
): InsufficientProductsSuggestion {
  return {
    reason: 'general_insufficient',
    userMessage: 'We kunnen momenteel geen complete outfits samenstellen met je voorkeuren.',
    suggestions: [
      {
        action: 'relax_filters',
        description: 'Versoepel enkele filters',
        newCriteria: {
          relaxed: true
        }
      },
      {
        action: 'try_different_style',
        description: 'Probeer een andere stijl',
        newCriteria: null
      },
      {
        action: 'contact_support',
        description: 'Neem contact op voor persoonlijk advies',
        newCriteria: null
      }
    ],
    canContinue: false
  };
}

/**
 * Get category counts from filtered products
 */
export function getCategoryCounts(products: Product[]): Record<string, number> {
  return products.reduce((acc, product) => {
    const category = product.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Format suggestion as user-friendly message
 */
export function formatSuggestionMessage(suggestion: InsufficientProductsSuggestion): string {
  const lines = [
    suggestion.userMessage,
    '',
    'Je kunt:',
    ...suggestion.suggestions.map((s, i) => `${i + 1}. ${s.description}`)
  ];

  return lines.join('\n');
}
