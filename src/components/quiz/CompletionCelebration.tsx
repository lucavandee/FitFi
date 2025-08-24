import React, { useEffect, useState } from "react";
import { Sparkles, Trophy, Star, Heart } from "lucide-react";

interface CompletionCelebrationProps {
  onComplete: () => void;
  className?: string;
  variant?: string;
}

const CompletionCelebration: React.FC<CompletionCelebrationProps> = ({
  onComplete,
  variant = "control",
  className = "",
}) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 500);
    const timer2 = setTimeout(() => setStep(2), 1500);
    const timer3 = setTimeout(() => setStep(3), 2500);
    const timer4 = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  // A/B Testing: Different celebration styles
  const getCelebrationStyle = () => {
    if (variant === "variant_a") {
      return {
        bgGradient: "from-purple-400 to-pink-500",
        sparkleColors: [
          "text-pink-400",
          "text-purple-400",
          "text-yellow-400",
          "text-blue-400",
        ],
        pulseColor: "animate-pulse",
      };
    }

    // Control variant
    return {
      bgGradient: "from-[#bfae9f] to-purple-500",
      sparkleColors: [
        "text-yellow-400",
        "text-purple-400",
        "text-pink-400",
        "text-blue-400",
      ],
      pulseColor: "",
    };
  };

  const celebrationStyle = getCelebrationStyle();

  return (
    <div className={`text-center py-12 ${className}`}>
      {/* Celebration Animation */}
      <div className="relative mb-8">
        <div
          className={`w-24 h-24 bg-gradient-to-br ${celebrationStyle.bgGradient} rounded-full flex items-center justify-center mx-auto transition-all duration-1000 ${celebrationStyle.pulseColor} ${
            step >= 1 ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <Trophy className="w-12 h-12 text-white" />
        </div>

        {/* Floating sparkles */}
        {step >= 2 && (
          <>
            <Sparkles
              className={`absolute top-0 left-1/4 w-6 h-6 ${celebrationStyle.sparkleColors[0]} animate-bounce`}
              style={{ animationDelay: "0.2s" }}
            />
            <Star
              className={`absolute top-4 right-1/4 w-5 h-5 ${celebrationStyle.sparkleColors[1]} animate-bounce`}
              style={{ animationDelay: "0.4s" }}
            />
            <Heart
              className={`absolute bottom-4 left-1/3 w-5 h-5 ${celebrationStyle.sparkleColors[2]} animate-bounce`}
              style={{ animationDelay: "0.6s" }}
            />
            <Sparkles
              className={`absolute bottom-0 right-1/3 w-4 h-4 ${celebrationStyle.sparkleColors[3]} animate-bounce`}
              style={{ animationDelay: "0.8s" }}
            />
          </>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {step >= 1 && (
          <h2 className="text-3xl font-light text-gray-900 animate-fade-in">
            Quiz Voltooid! 🎉
          </h2>
        )}

        {step >= 2 && (
          <p className="text-lg text-gray-600 animate-fade-in">
            Je stijlprofiel wordt nu gegenereerd...
          </p>
        )}

        {step >= 3 && (
          <div className="animate-fade-in">
            <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto mb-4">
              <div
                className={`bg-gradient-to-r ${celebrationStyle.bgGradient} h-2 rounded-full animate-pulse`}
                style={{ width: "100%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">
              AI analyseert jouw antwoorden...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompletionCelebration;
