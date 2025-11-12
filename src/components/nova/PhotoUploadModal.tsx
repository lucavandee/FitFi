import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Camera, Sparkles, Loader2 } from "lucide-react";
import { analyzeOutfitPhoto, type PhotoAnalysisResult } from "@/services/nova/photoAnalysisService";
import { useEnhancedNova } from "@/hooks/useEnhancedNova";
import toast from "react-hot-toast";

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete?: (result: PhotoAnalysisResult) => void;
}

export function PhotoUploadModal({ isOpen, onClose, onAnalysisComplete }: PhotoUploadModalProps) {
  const { context } = useEnhancedNova();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Selecteer een afbeelding");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Afbeelding te groot (max 10MB)");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);

    try {
      const result = await analyzeOutfitPhoto({
        file: selectedFile,
        userContext: context || undefined,
      });

      toast.success("Analyse voltooid! 🎉");
      onAnalysisComplete?.(result);
      handleClose();
    } catch (error) {
      console.error("[PhotoUpload] Full error:", error);

      // Show detailed error message
      const errorMessage = error instanceof Error ? error.message : "Onbekende fout";

      if (errorMessage.includes("OPENAI_API_KEY")) {
        toast.error("OpenAI API key niet geconfigureerd. Vraag admin om dit op te lossen.");
      } else if (errorMessage.includes("Failed to upload")) {
        toast.error("Upload mislukt. Check je internet connectie.");
      } else if (errorMessage.includes("authenticate")) {
        toast.error("Je moet ingelogd zijn. Log opnieuw in.");
      } else {
        toast.error(`Analyse mislukt: ${errorMessage}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsAnalyzing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-[var(--color-surface)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-text)]">
                  Outfit Analyse
                </h2>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Nova analyseert je outfit
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isAnalyzing}
              className="w-8 h-8 rounded-lg hover:bg-[var(--color-bg)] flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!previewUrl ? (
              // Upload Area
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--ff-color-primary-400)] hover:bg-[var(--ff-color-primary-50)] dark:hover:bg-[var(--ff-color-primary-900)]/10 transition-all"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  Upload Outfit Foto
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  Sleep een foto of klik om te selecteren
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  PNG, JPG tot 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              // Preview & Analyze
              <div className="space-y-4">
                {/* Preview */}
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  {!isAnalyzing && (
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Info Box */}
                <div className="bg-[var(--ff-color-primary-50)] dark:bg-[var(--ff-color-primary-900)]/20 border border-[var(--ff-color-primary-200)] dark:border-[var(--ff-color-primary-800)] rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-[var(--ff-color-primary-700)] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-[var(--color-text)] leading-relaxed">
                        {context ? (
                          <>
                            Nova gaat deze outfit analyseren op basis van jouw{" "}
                            <strong>{context.archetype}</strong> stijl en{" "}
                            <strong>{context.colorProfile.undertone}</strong> undertone.
                          </>
                        ) : (
                          <>Nova gaat deze outfit analyseren en feedback geven!</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Analyze Button */}
                <motion.button
                  whileHover={{ scale: isAnalyzing ? 1 : 1.02 }}
                  whileTap={{ scale: isAnalyzing ? 1 : 0.98 }}
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-3 bg-gradient-to-r from-[var(--ff-color-primary-700)] to-[var(--ff-color-accent-700)] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Nova analyseert...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Analyseer Outfit</span>
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {/* Bottom Accent */}
          <div className="h-1 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)]" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
