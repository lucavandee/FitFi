import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Sparkles,
  Star,
  TrendingUp,
  Heart,
  Share2,
} from "lucide-react";
import Button from "../components/ui/Button";
import { useUser } from "../context/UserContext";
import { useQuizAnswers } from "../hooks/useQuizAnswers";
import LoadingFallback from "../components/ui/LoadingFallback";
import toast from "react-hot-toast";

const EnhancedResultsPage: React.FC = () => {
  const { user, isLoading: userLoading } = useUser();
  const {
    quizData,
    isLoading: quizLoading,
    isQuizCompleted,
    resetQuiz,
    isResetting,
  } = useQuizAnswers();
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Get any data passed from onboarding
  const onboardingData = location.state?.onboardingData;

  // Redirect to quiz if not completed
  useEffect(() => {
    if (!quizLoading && !userLoading && !isQuizCompleted()) {
      navigate("/quiz", { replace: true });
    }
  }, [quizLoading, userLoading, isQuizCompleted, navigate]);

  useEffect(() => {
    // Simulate AI analysis completion
    const timer = setTimeout(() => {
      setAnalysisComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleQuizRestart = async () => {
    try {
      const success = await resetQuiz();

      if (success) {
        // Set flag to prevent redirect back to results
        sessionStorage.setItem("quiz-restarted", "true");
        toast.success("Quiz opnieuw gestart!");
        navigate("/quiz", { replace: true });
      }
    } catch (error) {
      console.error("Quiz restart error:", error);
      toast.error("Kan quiz niet resetten. Probeer opnieuw.");
    }
  };

  if (userLoading || quizLoading) {
    return (
      <LoadingFallback fullScreen message="Enhanced resultaten laden..." />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF8F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Inloggen vereist
          </h2>
          <p className="text-gray-600 mb-6">
            Je moet ingelogd zijn om je resultaten te bekijken.
          </p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  // Don't show results if quiz not completed (will redirect)
  if (!isQuizCompleted()) {
    return <LoadingFallback fullScreen message="Quiz controleren..." />;
  }

  if (!analysisComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-[#89CFF0] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-light text-gray-900 mb-4">
            Enhanced AI analyseert jouw stijl...
          </h2>
          <p className="text-gray-600 mb-6">
            We creëren jouw uitgebreide stijlprofiel met onboarding data.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#89CFF0] h-2 rounded-full animate-pulse"
              style={{ width: "85%" }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF8F6] via-white to-[#F5F3F0]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar dashboard
          </Link>

          <div className="text-center">
            <div className="w-16 h-16 bg-[#89CFF0] rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Jouw Enhanced AI-Stijlanalyse
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Gebaseerd op jouw onboarding en quiz antwoorden hebben we een
              uitgebreid stijlprofiel voor je samengesteld
            </p>
          </div>
        </div>

        {/* Enhanced Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Main Analysis Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium text-gray-900">
                Enhanced Stijlprofiel
              </h2>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-medium text-gray-900">
                  92% Enhanced Match
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#89CFF0]/10 to-purple-50 rounded-2xl p-6 mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-3">
                {getEnhancedStyleProfileTitle(quizData, onboardingData)}
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                {getEnhancedStyleDescription(quizData, onboardingData)}
              </p>
              <div className="flex flex-wrap gap-2">
                {getEnhancedStyleTags(quizData, onboardingData).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Enhanced Preferences */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">
                Enhanced voorkeuren analyse:
              </h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Persoonlijkheid Match</span>
                    <span>92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#89CFF0] h-2 rounded-full"
                      style={{ width: "92%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Lifestyle Compatibility</span>
                    <span>88%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-400 h-2 rounded-full"
                      style={{ width: "88%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Seasonal Preferences</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full"
                      style={{ width: "95%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Stats */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Enhanced Statistieken
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Enhanced Match</span>
                  <span className="font-medium text-[#89CFF0]">92%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Onboarding Score</span>
                  <span className="font-medium text-green-600">95%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Data Completeness</span>
                  <span className="font-medium text-blue-600">98%</span>
                </div>
              </div>
            </div>

            {/* Enhanced Actions */}
            <div className="bg-white rounded-3xl shadow-sm p-6">
              <h3 className="font-medium text-gray-900 mb-4">
                Enhanced Acties
              </h3>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  fullWidth
                  icon={<Heart size={16} />}
                  iconPosition="left"
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-white"
                >
                  Bewaar Enhanced Profiel
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  icon={<Share2 size={16} />}
                  iconPosition="left"
                  className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
                >
                  Deel Enhanced Resultaat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Next Steps */}
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            Enhanced Aanbevelingen
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Met je enhanced stijlprofiel kunnen we nog betere gepersonaliseerde
            outfit aanbevelingen voor je maken.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              as={Link}
              to="/outfits"
              variant="primary"
              size="lg"
              icon={<TrendingUp size={20} />}
              iconPosition="left"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-white"
            >
              Bekijk Enhanced Outfits
            </Button>
            <Button
              onClick={handleQuizRestart}
              variant="outline"
              size="lg"
              className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              disabled={isResetting}
              aria-busy={isResetting}
            >
              {isResetting ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-[#89CFF0] border-t-transparent rounded-full animate-spin mr-2"></div>
                  Quiz resetten...
                </div>
              ) : (
                "Quiz Opnieuw Doen"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions to generate enhanced content based on quiz + onboarding data
function getEnhancedStyleProfileTitle(
  quizAnswers: any,
  onboardingData: any,
): string {
  if (onboardingData?.archetypes && onboardingData.archetypes.length > 0) {
    const primaryArchetype = onboardingData.archetypes[0];
    const archetypeMap: Record<string, string> = {
      klassiek: "Enhanced Klassiek Elegant",
      casual_chic: "Enhanced Casual Chic",
      urban: "Enhanced Urban Minimalist",
      streetstyle: "Enhanced Street Trendsetter",
      retro: "Enhanced Retro Spirit",
      luxury: "Enhanced Luxury Connoisseur",
    };
    return archetypeMap[primaryArchetype] || "Enhanced Unieke Stijl";
  }

  if (quizAnswers?.stylePreferences) {
    const preferences = quizAnswers.stylePreferences;
    if (preferences.includes("minimalist")) return "Enhanced Modern Minimalist";
    if (preferences.includes("classic")) return "Enhanced Tijdloos Elegant";
    if (preferences.includes("bohemian")) return "Enhanced Bohemian Spirit";
    if (preferences.includes("streetwear")) return "Enhanced Urban Trendsetter";
    if (preferences.includes("romantic")) return "Enhanced Romantisch Chic";
    if (preferences.includes("edgy")) return "Enhanced Edgy & Bold";
  }

  return "Enhanced Eclectische Stijl";
}

function getEnhancedStyleDescription(
  quizAnswers: any,
  onboardingData: any,
): string {
  let description = "Jouw enhanced stijlprofiel combineert ";

  // Add onboarding insights
  if (onboardingData?.season) {
    description += `jouw voorkeur voor het ${onboardingData.season}seizoen `;
  }

  if (onboardingData?.occasions && onboardingData.occasions.length > 0) {
    description += `met focus op ${onboardingData.occasions.join(", ").toLowerCase()} gelegenheden `;
  }

  // Add quiz insights
  if (quizAnswers?.baseColors) {
    const colorMap: Record<string, string> = {
      neutral: "neutrale elegantie",
      earth: "natuurlijke warmte",
      jewel: "luxe juweel tinten",
      pastel: "zachte romantiek",
      bold: "gedurfde expressie",
    };
    description += `en ${colorMap[quizAnswers.baseColors] || "unieke kleurvoorkeur"} `;
  }

  description +=
    "voor een volledig gepersonaliseerde stijlervaring die perfect bij jouw persoonlijkheid en lifestyle past.";

  return description;
}

function getEnhancedStyleTags(quizAnswers: any, onboardingData: any): string[] {
  const tags = ["Enhanced", "Gepersonaliseerd"];

  // Add onboarding tags
  if (onboardingData?.archetypes) {
    tags.push(
      ...onboardingData.archetypes.map(
        (arch: string) =>
          arch.charAt(0).toUpperCase() + arch.slice(1).replace("_", " "),
      ),
    );
  }

  if (onboardingData?.season) {
    tags.push(
      onboardingData.season.charAt(0).toUpperCase() +
        onboardingData.season.slice(1),
    );
  }

  // Add quiz tags
  if (quizAnswers?.stylePreferences) {
    const styleMap: Record<string, string> = {
      minimalist: "Minimalistisch",
      classic: "Klassiek",
      bohemian: "Bohemian",
      streetwear: "Streetwear",
      romantic: "Romantisch",
      edgy: "Edgy",
    };

    quizAnswers.stylePreferences.forEach((pref: string) => {
      if (styleMap[pref]) {
        tags.push(styleMap[pref]);
      }
    });
  }

  // Add unique enhanced tags
  tags.push("AI-Powered", "Multi-Source", "Veelzijdig");

  return Array.from(new Set(tags)).slice(0, 6); // Limit to 6 unique tags
}

export default EnhancedResultsPage;
