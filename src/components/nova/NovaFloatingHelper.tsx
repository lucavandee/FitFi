import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Sparkles, X, MessageCircle, Lightbulb, TrendingUp } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useNovaChat } from "./NovaChatProvider";

interface ContextualTip {
  page: string;
  tip: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const contextualTips: ContextualTip[] = [
  {
    page: "/results",
    tip: "Swipe naar rechts op outfits die je leuk vindt - zo leer ik je smaak beter kennen!",
  },
  {
    page: "/dashboard",
    tip: "Hoe meer je swiped, hoe slimmer mijn aanbevelingen worden. Probeer 50+ swipes voor beste resultaten!",
  },
  {
    page: "/onboarding",
    tip: "Wees eerlijk in je antwoorden - dit helpt mij om perfect bij jouw stijl aan te sluiten.",
  },
];

export function NovaFloatingHelper() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setOpen: openNova } = useNovaChat();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentTip, setCurrentTip] = useState<ContextualTip | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Show/hide based on page and timing
  useEffect(() => {
    const tip = contextualTips.find((t) => location.pathname.startsWith(t.page));
    if (tip) {
      setCurrentTip(tip);

      // Show after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [location.pathname]);

  // Auto-hide after 15 seconds
  useEffect(() => {
    if (isVisible && !isMinimized) {
      const timer = setTimeout(() => {
        setIsMinimized(true);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, isMinimized]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("nova_helper_dismissed", "true");
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setPosition({
      x: position.x + info.offset.x,
      y: position.y + info.offset.y,
    });
  };

  if (!isVisible || !currentTip) return null;

  return (
    <AnimatePresence>
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        initial={{ opacity: 0, scale: 0.8, x: 0, y: 100 }}
        animate={{
          opacity: 1,
          scale: 1,
          x: position.x,
          y: position.y,
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        className="fixed bottom-6 right-6 z-50 cursor-grab active:cursor-grabbing"
        style={{ touchAction: "none" }}
      >
        {isMinimized ? (
          // Minimized Bubble
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMinimized(false)}
            className="relative w-16 h-16 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full shadow-2xl flex items-center justify-center"
          >
            <Sparkles className="w-8 h-8 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>
        ) : (
          // Expanded Card
          <motion.div
            initial={{ width: 0, height: 0 }}
            animate={{ width: "auto", height: "auto" }}
            className="bg-[var(--color-surface)] border-2 border-[var(--ff-color-primary-200)] dark:border-[var(--ff-color-primary-800)] rounded-2xl shadow-2xl max-w-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-sm text-[var(--color-text)]">Nova</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Je style assistent</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="w-8 h-8 rounded-lg hover:bg-[var(--color-bg)] flex items-center justify-center transition-colors"
                  title="Minimaliseren"
                >
                  <svg
                    className="w-4 h-4 text-[var(--color-text-muted)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-8 h-8 rounded-lg hover:bg-[var(--color-bg)] flex items-center justify-center transition-colors"
                  title="Sluiten"
                >
                  <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] flex items-center justify-center">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <p className="text-sm text-[var(--color-text)] leading-relaxed">{currentTip.tip}</p>
              </div>

              {currentTip.action && (
                <button
                  onClick={currentTip.action.onClick}
                  className="w-full px-4 py-2 bg-[var(--ff-color-primary-700)] text-white rounded-xl font-semibold hover:bg-[var(--ff-color-primary-600)] transition-colors shadow-sm"
                >
                  {currentTip.action.label}
                </button>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
              <button
                onClick={() => {
                  openNova(true);
                  setIsMinimized(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)] transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                Chat
              </button>
              <button
                onClick={() => {
                  navigate('/results');
                  setIsMinimized(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg text-xs font-medium text-[var(--color-text)] hover:border-[var(--ff-color-primary-300)] transition-colors"
              >
                <TrendingUp className="w-3 h-3" />
                Trends
              </button>
            </div>

            {/* Bottom Accent */}
            <div className="h-1 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-b-2xl" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
