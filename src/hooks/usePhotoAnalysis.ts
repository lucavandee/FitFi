import { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import {
  getUserPhotoAnalyses,
  deletePhotoAnalysis,
  type PhotoAnalysisResult,
} from "@/services/nova/photoAnalysisService";
import toast from "react-hot-toast";

export function usePhotoAnalysis() {
  const { user } = useUser();
  const [analyses, setAnalyses] = useState<PhotoAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalyses = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getUserPhotoAnalyses(user.id, 10);
      setAnalyses(data);
    } catch (err) {
      console.error("[usePhotoAnalysis] Error loading:", err);
      setError(err instanceof Error ? err.message : "Failed to load analyses");
      // Don't show error toast for empty state - it's normal for new users
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      await deletePhotoAnalysis(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Analyse verwijderd");
    } catch (err) {
      console.error("[usePhotoAnalysis] Error deleting:", err);
      toast.error("Kon analyse niet verwijderen");
    }
  };

  const addAnalysis = (analysis: PhotoAnalysisResult) => {
    setAnalyses((prev) => [analysis, ...prev]);
  };

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user]);

  return {
    analyses,
    isLoading,
    error,
    loadAnalyses,
    deleteAnalysis,
    addAnalysis,
  };
}
