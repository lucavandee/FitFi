import React from "react";
import { motion } from "framer-motion";
import { Brain, Heart, ShoppingBag, MessageCircle, Sparkles } from "lucide-react";

interface NovaIntelligenceIndicatorProps {
  hasSwipeData?: boolean;
  hasBrandData?: boolean;
  hasRecentOutfits?: boolean;
  hasConversationHistory?: boolean;
  swipeCount?: number;
  brandCount?: number;
  outfitCount?: number;
  conversationCount?: number;
}

export function NovaIntelligenceIndicator({
  hasSwipeData,
  hasBrandData,
  hasRecentOutfits,
  hasConversationHistory,
  swipeCount = 0,
  brandCount = 0,
  outfitCount = 0,
  conversationCount = 0,
}: NovaIntelligenceIndicatorProps) {
  const indicators = [
    {
      active: hasSwipeData,
      icon: Heart,
      label: "Swipe Data",
      count: swipeCount,
      color: "text-pink-600",
      bgColor: "bg-pink-100",
    },
    {
      active: hasBrandData,
      icon: Sparkles,
      label: "Brand Prefs",
      count: brandCount,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      active: hasRecentOutfits,
      icon: ShoppingBag,
      label: "Saved Outfits",
      count: outfitCount,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      active: hasConversationHistory,
      icon: MessageCircle,
      label: "Gesprekken",
      count: conversationCount,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  const activeCount = indicators.filter((i) => i.active).length;

  if (activeCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4 p-4 bg-gradient-to-r from-[#FAF5F2] to-[#FAF5F2] dark:from-[#5A2010]/20 dark:to-[#5A2010]/20 rounded-xl border border-[#F4E8E3] dark:border-[#8A3D28]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C2654A] to-[#C2654A] flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-[#1A1A1A]">
            Nova Intelligence Active
          </h3>
          <p className="text-xs text-[#8A8A8A]">
            {activeCount} data bron{activeCount !== 1 ? "nen" : ""} geladen
          </p>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i < activeCount
                  ? "bg-[#C2654A]"
                  : "bg-[#E5E5E5]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-2 gap-2">
        {indicators.map((indicator, index) => {
          const Icon = indicator.icon;
          return (
            <motion.div
              key={indicator.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg transition-all
                ${
                  indicator.active
                    ? `${indicator.bgColor} ${indicator.color}`
                    : "bg-[#FAFAF8] text-[#8A8A8A] opacity-50"
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold truncate">
                  {indicator.label}
                </div>
                {indicator.active && indicator.count > 0 && (
                  <div className="text-[10px] opacity-75">
                    {indicator.count} items
                  </div>
                )}
              </div>
              {indicator.active && (
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Info Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 pt-3 border-t border-[#F4E8E3] dark:border-[#8A3D28]"
      >
        <p className="text-xs text-[#8A8A8A] leading-relaxed">
          Nova gebruikt deze data om je nog beter te helpen. Hoe meer je interacteert, hoe slimmer de adviezen worden.
        </p>
      </motion.div>
    </motion.div>
  );
}
