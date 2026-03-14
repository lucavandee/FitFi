import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Clock, Gift } from "lucide-react";

interface ExitIntentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExitIntentModal({ isOpen, onClose }: ExitIntentModalProps) {
  const headingId = React.useId();

  React.useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-surface)] rounded-t-3xl sm:rounded-3xl p-8 sm:p-10 max-w-2xl w-full shadow-2xl relative overflow-y-auto"
            style={{ maxHeight: "92dvh" }}
          >
            {/* Drag handle – mobile only */}
            <div className="flex justify-center mb-4 sm:hidden" aria-hidden="true">
              <div className="w-9 h-1 rounded-full bg-[var(--color-border)]" />
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-[var(--ff-color-primary-50)] hover:bg-[var(--ff-color-primary-100)] transition-colors z-10 flex items-center justify-center"
              aria-label="Sluiten"
            >
              <X className="w-5 h-5 text-[var(--color-muted)]" />
            </button>

            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] rounded-full blur-3xl opacity-30 pointer-events-none" aria-hidden="true" />

            {/* Content */}
            <div className="text-center relative z-10">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[var(--ff-color-primary-100)] to-[var(--ff-color-accent-100)] mb-6"
              >
                <Gift className="w-10 h-10 text-[var(--ff-color-primary-700)]" />
              </motion.div>

              {/* Heading */}
              <h2 id={headingId} className="text-3xl sm:text-4xl font-bold text-[var(--color-text)] mb-3">
                Wacht even!
              </h2>
              <p className="text-xl text-[var(--color-muted)] mb-6">
                We hebben een speciale deal voor je
              </p>

              {/* Offer Card */}
              <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl p-6 mb-6 border-2 border-[var(--ff-color-primary-200)]">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
                  <span className="text-sm font-semibold text-[var(--ff-color-primary-700)] uppercase tracking-wide">
                    Exclusieve Exit Aanbieding
                  </span>
                </div>

                <div className="mb-4">
                  <div className="text-5xl font-bold text-[var(--color-text)] mb-2">
                    2 maanden gratis
                  </div>
                  <div className="text-lg text-[var(--color-muted)]">
                    in plaats van 1 maand
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 text-left max-w-sm mx-auto mb-4">
                  <li className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                    <span className="text-[var(--ff-color-success-600)] font-bold" aria-hidden="true">✓</span>
                    <span>50+ gepersonaliseerde outfits</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                    <span className="text-[var(--ff-color-success-600)] font-bold" aria-hidden="true">✓</span>
                    <span>AI styling assistent (Nova)</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--color-text)]">
                    <span className="text-[var(--ff-color-success-600)] font-bold" aria-hidden="true">✓</span>
                    <span>Onbeperkt outfits opslaan</span>
                  </li>
                </ul>

                {/* Timer */}
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-muted)]">
                  <Clock className="w-4 h-4" />
                  <span>Deze aanbieding is 24 uur geldig</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                <NavLink
                  to="/prijzen?promo=exit2free"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 px-6 py-3 min-h-[48px] bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] text-white rounded-xl font-semibold text-base transition-colors duration-200"
                >
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                  Claim deze deal
                </NavLink>

                <button
                  onClick={onClose}
                  className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors min-h-[44px] px-4 w-full"
                >
                  Nee, bedankt. Ik betaal liever vol tarief.
                </button>
              </div>

              {/* Fine Print */}
              <p className="text-xs text-[var(--color-muted)] mt-4">
                Geldig voor nieuwe Premium abonnementen · Stop wanneer je wilt
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
