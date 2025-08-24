import React from "react";
import { Sparkles, Star, Palette } from "lucide-react";
import { QuizAnswers } from "../../types/quiz";

interface StylePreviewProps {
  answers: Partial<QuizAnswers>;
  currentStep: number;
  className?: string;
}

const StylePreview: React.FC<StylePreviewProps> = ({
  answers,
  currentStep,
  className = "",
}) => {
  // Generate style insights based on current answers
  const getStyleInsights = () => {
    const insights = [];

    if (answers.stylePreferences && answers.stylePreferences.length > 0) {
      const primaryStyle = answers.stylePreferences[0];
      const styleMap: Record<string, string> = {
        minimalist: "Modern Minimalist",
        classic: "Tijdloos Elegant",
        bohemian: "Bohemian Spirit",
        streetwear: "Urban Trendsetter",
        romantic: "Romantisch Chic",
        edgy: "Edgy & Bold",
      };

      insights.push({
        label: "Primaire Stijl",
        value: styleMap[primaryStyle] || primaryStyle,
        confidence: 85 + Math.floor(Math.random() * 10),
      });
    }

    if (answers.baseColors) {
      const colorMap: Record<string, string> = {
        neutral: "Neutrale Elegantie",
        earth: "Natuurlijke Warmte",
        jewel: "Luxe Juweel Tinten",
        pastel: "Zachte Romantiek",
        bold: "Gedurfde Expressie",
      };

      insights.push({
        label: "Kleurpalet",
        value: colorMap[answers.baseColors] || answers.baseColors,
        confidence: 90 + Math.floor(Math.random() * 8),
      });
    }

    if (answers.bodyType) {
      insights.push({
        label: "Pasvorm Focus",
        value: "Flatterende Silhouetten",
        confidence: 92,
      });
    }

    if (answers.occasions && answers.occasions.length > 0) {
      const occasionCount = answers.occasions.length;
      insights.push({
        label: "Veelzijdigheid",
        value: `${occasionCount} Gelegenheden`,
        confidence: Math.min(95, 70 + occasionCount * 5),
      });
    }

    if (answers.budgetRange) {
      const budget = answers.budgetRange;
      let budgetLabel = "Budget Bewust";
      if (budget > 200) budgetLabel = "Premium Keuzes";
      else if (budget > 100) budgetLabel = "Kwaliteit Focus";

      insights.push({
        label: "Shopping Stijl",
        value: budgetLabel,
        confidence: 88,
      });
    }

    return insights;
  };

  const insights = getStyleInsights();
  const overallConfidence =
    insights.length > 0
      ? Math.round(
          insights.reduce((sum, insight) => sum + insight.confidence, 0) /
            insights.length,
        )
      : 0;

  if (insights.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-br from-[#bfae9f]/10 to-purple-50 rounded-2xl p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-[#bfae9f]" />
          <h3 className="font-medium text-gray-900">Jouw Stijl Ontdekking</h3>
        </div>
        <div className="flex items-center space-x-1">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm font-medium text-gray-700">
            {overallConfidence}% Match
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">{insight.label}:</span>
              <span className="ml-2 font-medium text-gray-900">
                {insight.value}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-[#bfae9f] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${insight.confidence}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {insight.confidence}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/50">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <Palette className="w-4 h-4" />
          <span>
            {currentStep < 5
              ? `${5 - currentStep} vragen te gaan voor je complete stijlprofiel!`
              : "Klaar voor je volledige stijlanalyse!"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default StylePreview;
