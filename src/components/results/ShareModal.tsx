import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { canonicalUrl } from "@/utils/urls";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export function ShareModal({ open, onClose }: ShareModalProps) {
  const getUrl = () =>
    typeof window !== "undefined" ? window.location.href : canonicalUrl("/results");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-modal-title"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-surface)] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="relative p-8 pb-6 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)]">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-surface)]/50 transition-colors"
                aria-label="Sluit modal"
              >
                <X className="w-5 h-5 text-[var(--color-muted)]" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] flex items-center justify-center mb-4 shadow-lg">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 id="share-modal-title" className="text-3xl font-bold text-[var(--color-text)] mb-2">
                Deel je Style Report
              </h3>
              <p className="text-base text-[var(--color-muted)]">
                Laat anderen zien wat jouw unieke stijl is
              </p>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getUrl());
                  toast.success("Link gekopieerd!", { icon: "📋", duration: 2000 });
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--color-surface)] transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                  <Download className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--color-text)]">Kopieer link</p>
                  <p className="text-sm text-[var(--color-muted)]">Deel via WhatsApp, email of social media</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const url = getUrl();
                  const text = "Bekijk mijn persoonlijke Style Report van FitFi!";
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                  window.open(twitterUrl, "_blank", "noopener,noreferrer");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--color-surface)] transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--ff-color-primary-100)] flex items-center justify-center group-hover:bg-[var(--ff-color-primary-200)] transition-colors">
                  <Share2 className="w-6 h-6 text-[var(--ff-color-primary-700)]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--color-text)]">Deel op Twitter</p>
                  <p className="text-sm text-[var(--color-muted)]">Tweet je stijlrapport</p>
                </div>
              </button>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full px-6 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-2xl font-bold text-base hover:bg-[var(--ff-color-primary-700)] transition-all shadow-lg active:scale-[0.98]"
              >
                Sluiten
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
