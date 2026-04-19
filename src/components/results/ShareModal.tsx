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
            className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="relative p-8 pb-6 bg-gradient-to-br from-[#FAF5F2] to-[#FAF5F2]">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#FFFFFF]/50 transition-colors"
                aria-label="Sluit modal"
              >
                <X className="w-5 h-5 text-[#8A8A8A]" />
              </button>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C2654A] to-[#C2654A] flex items-center justify-center mb-4 shadow-lg">
                <Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 id="share-modal-title" className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Deel je Style Report
              </h3>
              <p className="text-base text-[#8A8A8A]">
                Laat anderen zien wat jouw unieke stijl is
              </p>
            </div>

            <div className="p-6 space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getUrl());
                  toast.success("Link gekopieerd!", { icon: "📋", duration: 2000 });
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#E5E5E5] hover:border-[#D4856E] hover:bg-[#FFFFFF] transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF5F2] flex items-center justify-center group-hover:bg-[#F4E8E3] transition-colors">
                  <Download className="w-6 h-6 text-[#A8513A]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1A1A1A]">Kopieer link</p>
                  <p className="text-sm text-[#8A8A8A]">Deel via WhatsApp, email of social media</p>
                </div>
              </button>

              <button
                onClick={() => {
                  const url = getUrl();
                  const text = "Bekijk mijn persoonlijke Style Report van FitFi!";
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
                  window.open(twitterUrl, "_blank", "noopener,noreferrer");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-[#E5E5E5] hover:border-[#D4856E] hover:bg-[#FFFFFF] transition-all text-left group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#FAF5F2] flex items-center justify-center group-hover:bg-[#F4E8E3] transition-colors">
                  <Share2 className="w-6 h-6 text-[#A8513A]" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#1A1A1A]">Deel op Twitter</p>
                  <p className="text-sm text-[#8A8A8A]">Tweet je stijlrapport</p>
                </div>
              </button>
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full px-6 py-4 bg-[#C2654A] text-white rounded-2xl font-bold text-base hover:bg-[#A8513A] transition-all shadow-lg active:scale-[0.98]"
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
