import React, { useState } from "react";
import { motion } from "framer-motion";
import { Camera, Plus, Sparkles } from "lucide-react";
import { PhotoUploadModal } from "@/components/nova/PhotoUploadModal";
import { PhotoAnalysisFeedback } from "@/components/nova/PhotoAnalysisFeedback";
import { usePhotoAnalysis } from "@/hooks/usePhotoAnalysis";

export function PhotoAnalysisWidget() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { analyses, isLoading, addAnalysis } = usePhotoAnalysis();

  const latestAnalysis = analyses[0];

  return (
    <div className="space-y-4">
      {/* Header & Upload Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#C2654A] to-[#C2654A] rounded-full flex items-center justify-center">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">Outfit Analyse</h3>
            <p className="text-sm text-[#8A8A8A]">Nova analyseert je foto's</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#A8513A] to-[#A8513A] text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Analyseer Foto</span>
        </motion.button>
      </div>

      {/* Latest Analysis or Empty State */}
      {isLoading ? (
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-8 text-center animate-pulse">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#FAFAF8] rounded-full" />
          <div className="h-4 bg-[#FAFAF8] rounded w-2/3 mx-auto mb-2" />
          <div className="h-4 bg-[#FAFAF8] rounded w-1/2 mx-auto" />
        </div>
      ) : latestAnalysis ? (
        <PhotoAnalysisFeedback analysis={latestAnalysis} compact={false} />
      ) : (
        <EmptyState onUpload={() => setIsModalOpen(true)} />
      )}

      {/* Previous Analyses */}
      {analyses.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#8A8A8A] uppercase tracking-wide">
            Eerdere Analyses
          </h4>
          {analyses.slice(1, 4).map((analysis) => (
            <PhotoAnalysisFeedback key={analysis.id} analysis={analysis} compact={true} />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <PhotoUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnalysisComplete={(result) => {
          addAnalysis(result);
        }}
      />
    </div>
  );
}

function EmptyState({ onUpload }: { onUpload: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#FAF5F2] to-[#FAF5F2] dark:from-[#5A2010]/20 dark:to-[#5A2010]/20 border-2 border-dashed border-[#D4856E] dark:border-[#A8513A] rounded-2xl p-8 text-center"
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#C2654A] to-[#C2654A] rounded-full flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-white" />
      </div>

      <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">
        Laat Nova je outfit analyseren!
      </h3>

      <p className="text-sm text-[#8A8A8A] max-w-md mx-auto mb-6 leading-relaxed">
        Upload een foto van je outfit en ontvang direct persoonlijke feedback op basis van je
        stijlprofiel, kleurenpalet en voorkeuren.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-3">
          <div className="text-2xl mb-1">🎨</div>
          <div className="text-xs text-[#8A8A8A]">Kleur analyse</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-3">
          <div className="text-2xl mb-1">✨</div>
          <div className="text-xs text-[#8A8A8A]">Style tips</div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl p-3">
          <div className="text-2xl mb-1">💯</div>
          <div className="text-xs text-[#8A8A8A]">Match score</div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onUpload}
        className="px-6 py-3 bg-gradient-to-r from-[#A8513A] to-[#A8513A] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
      >
        <Camera className="w-5 h-5" />
        <span>Upload Eerste Foto</span>
      </motion.button>
    </motion.div>
  );
}
