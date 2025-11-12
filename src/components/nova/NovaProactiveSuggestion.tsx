import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowRight, TrendingUp, Heart, ShoppingBag } from "lucide-react";

export interface ProactiveSuggestion {
  id: string;
  title: string;
  message: string;
  icon?: "sparkles" | "trend" | "heart" | "shop";
  action?: {
    label: string;
    href: string;
  };
  priority: number;
  context: string[];
}

interface NovaProactiveSuggestionProps {
  suggestions: ProactiveSuggestion[];
  maxVisible?: number;
  position?: "inline" | "floating";
}

export function NovaProactiveSuggestion({
  suggestions,
  maxVisible = 1,
  position = "inline",
}: NovaProactiveSuggestionProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleSuggestions = suggestions
    .filter((s) => !dismissed.has(s.id))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, maxVisible);

  useEffect(() => {
    if (visibleSuggestions.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % visibleSuggestions.length);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [visibleSuggestions.length]);

  if (visibleSuggestions.length === 0) return null;

  const current = visibleSuggestions[currentIndex];

  const iconMap = {
    sparkles: Sparkles,
    trend: TrendingUp,
    heart: Heart,
    shop: ShoppingBag,
  };

  const IconComponent = current.icon ? iconMap[current.icon] : Sparkles;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4 }}
        className={`
          relative bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)]
          dark:from-[var(--ff-color-primary-900)]/30 dark:to-[var(--ff-color-accent-900)]/30
          border-2 border-[var(--ff-color-primary-200)] dark:border-[var(--ff-color-primary-800)]
          rounded-2xl p-6 shadow-lg
          ${position === "floating" ? "fixed bottom-6 right-6 max-w-md z-40" : ""}
        `}
      >
        {/* Nova Badge */}
        <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full flex items-center justify-center shadow-lg animate-pulse">
          <Sparkles className="w-6 h-6 text-white" />
        </div>

        {/* Close Button */}
        <button
          onClick={() => setDismissed((prev) => new Set([...prev, current.id]))}
          className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 pr-10">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--ff-color-primary-600)] flex items-center justify-center text-white shadow-md">
            <IconComponent className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-[var(--ff-color-primary-700)] uppercase tracking-wide">
                Nova Tip
              </span>
              {visibleSuggestions.length > 1 && (
                <div className="flex gap-1">
                  {visibleSuggestions.map((_, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === currentIndex
                          ? "bg-[var(--ff-color-primary-600)] w-4"
                          : "bg-[var(--color-border)]"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">{current.title}</h3>
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4">
              {current.message}
            </p>

            {/* Action */}
            {current.action && (
              <motion.a
                href={current.action.href}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors shadow-md"
              >
                <span>{current.action.label}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>
            )}
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-b-2xl" />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Generate proactive suggestions based on user behavior
 */
export function generateProactiveSuggestions(userContext: any): ProactiveSuggestion[] {
  const suggestions: ProactiveSuggestion[] = [];

  // No swipe data
  if (!userContext?.recentSwipes || userContext.recentSwipes.swipeCount < 10) {
    suggestions.push({
      id: "start-swiping",
      title: "Start met swipen!",
      message:
        "Hoe meer je swiped, hoe beter ik je smaak leer kennen. Begin met 20 swipes voor nauwkeurige aanbevelingen.",
      icon: "heart",
      action: {
        label: "Start Swipe Sessie",
        href: "/onboarding?step=visual",
      },
      priority: 10,
      context: ["dashboard", "results"],
    });
  }

  // Has many swipes but no saved outfits
  if (
    userContext?.recentSwipes?.swipeCount > 30 &&
    (!userContext.recentOutfits || userContext.recentOutfits.length === 0)
  ) {
    suggestions.push({
      id: "save-first-outfit",
      title: "Tijd om outfits op te slaan!",
      message:
        "Je hebt al " +
        userContext.recentSwipes.swipeCount +
        " swipes gedaan. Sla je favoriete outfits op om ze later terug te vinden.",
      icon: "shop",
      action: {
        label: "Bekijk Outfits",
        href: "/results",
      },
      priority: 9,
      context: ["dashboard"],
    });
  }

  // Brand affinity detected
  if (userContext?.brandAffinity?.preferred?.length > 0) {
    const topBrand = userContext.brandAffinity.preferred[0];
    suggestions.push({
      id: `brand-${topBrand.brand}`,
      title: `${topBrand.brand} perfect voor jou!`,
      message: `Je liket ${topBrand.brand} in ${Math.round(topBrand.score)}% van de gevallen. Zal ik meer ${topBrand.brand} items laten zien?`,
      icon: "trend",
      action: {
        label: `Bekijk ${topBrand.brand}`,
        href: `/results?brand=${encodeURIComponent(topBrand.brand)}`,
      },
      priority: 8,
      context: ["dashboard", "results"],
    });
  }

  // Seasonal suggestion
  const month = new Date().getMonth();
  if (month >= 5 && month <= 8) {
    // Summer
    suggestions.push({
      id: "summer-2025",
      title: "Zomer essentials ☀️",
      message:
        "Het is zomer! Lichte kleuren zoals off-white, lichtblauw en pasteltinten passen perfect bij het seizoen.",
      icon: "sparkles",
      action: {
        label: "Zomer Outfits",
        href: "/results?season=summer",
      },
      priority: 6,
      context: ["dashboard", "results"],
    });
  } else if (month >= 11 || month <= 2) {
    // Winter
    suggestions.push({
      id: "winter-2025",
      title: "Winter essentials ❄️",
      message:
        "Tijd voor layering! Warme tonen, donkere kleuren en gestructureerde items zijn nu perfect.",
      icon: "sparkles",
      action: {
        label: "Winter Outfits",
        href: "/results?season=winter",
      },
      priority: 6,
      context: ["dashboard", "results"],
    });
  }

  // Style trend detected
  if (userContext?.recentSwipes?.liked?.length > 10) {
    const styles = userContext.recentSwipes.liked.map((s: any) => s.style);
    const styleCounts = styles.reduce(
      (acc: any, style: string) => {
        acc[style] = (acc[style] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const topStyle = Object.entries(styleCounts).sort((a: any, b: any) => b[1] - a[1])[0];

    if (topStyle && topStyle[1] > 5) {
      suggestions.push({
        id: `style-${topStyle[0]}`,
        title: `Je houdt van ${topStyle[0]}!`,
        message: `${Math.round((topStyle[1] / styles.length) * 100)}% van je likes zijn ${topStyle[0]}. Zal ik meer ${topStyle[0]} outfits samenstellen?`,
        icon: "heart",
        action: {
          label: `Meer ${topStyle[0]}`,
          href: `/results?style=${topStyle[0]}`,
        },
        priority: 7,
        context: ["dashboard", "results"],
      });
    }
  }

  return suggestions;
}
