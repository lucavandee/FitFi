import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useUser } from "../context/UserContext";
import Button from "../components/ui/Button";
import ImageWithFallback from "../components/ui/ImageWithFallback";

const GenderSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateProfile } = useUser();
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);

  const handleGenderSelect = async (gender: "male" | "female") => {
    setSelectedGender(gender);

    // Track gender selection
    if (typeof window.gtag === "function") {
      window.gtag("event", "gender_selection", {
        event_category: "questionnaire",
        event_label: gender,
      });
    }

    // Save to user profile
    await updateProfile({ gender });

    // Navigate to quiz
    navigate("/quiz/1");
  };

  const imgSrc = {
    male: "/images/gender/male.png",
    female: "/images/gender/female.png",
  };

  const totalSteps = 4;
  const currentStep = 2;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B]">
      <div className="container-slim py-16">
        <div className="max-w-md mx-auto">
          {/* Progress indicator */}
          <div className="mb-10">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>
                Stap {currentStep} van {totalSteps}
              </span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-2">
              Hoe identificeer je jezelf?
            </h1>
            <p className="text-white/80">
              Dit helpt ons de juiste stijladvies voor je te vinden
            </p>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-6">
              <div className="space-y-4">
                {[
                  {
                    id: "male",
                    label: "Man",
                    description: "Mannelijke stijladvies",
                  },
                  {
                    id: "female",
                    label: "Vrouw",
                    description: "Vrouwelijke stijladvies",
                  },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() =>
                      handleGenderSelect(option.id as "male" | "female")
                    }
                    className={`
                      w-full p-4 rounded-xl border transition-all duration-200 text-left
                      ${
                        selectedGender === option.id
                          ? "border-[#FF8600] bg-white/10"
                          : "border-white/30 hover:border-[#FF8600] hover:bg-white/5"
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium text-white">
                          {option.label}
                        </div>
                        <div className="text-sm text-white/70">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Illustration */}
              {selectedGender && (
                <div className="mt-8 text-center animate-fade-in">
                  <ImageWithFallback
                    src={imgSrc[selectedGender]}
                    alt={`Ik ben ${selectedGender}`}
                    className="mx-auto h-48 w-auto rounded-lg"
                    onError={(originalSrc) => {
                      console.warn(
                        `Gender image failed to load: ${originalSrc}`,
                      );
                    }}
                    componentName="GenderSelectPage"
                  />
                </div>
              )}
            </div>

            {/* Privacy indicator */}
            <div className="px-6 py-4 bg-white/5 flex items-center justify-center space-x-2">
              <ShieldCheck size={18} className="text-[#FF8600]" />
              <span className="text-sm text-white/80">
                Je gegevens zijn veilig en versleuteld
              </span>
            </div>
          </div>

          {/* Back to onboarding link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/onboarding")}
              className="inline-flex items-center text-sm text-white/70 hover:text-[#FF8600] transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" />
              Terug
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D1B2A] border-t border-white/10 p-4 z-50">
        <Button
          onClick={() => selectedGender && handleGenderSelect(selectedGender)}
          disabled={!selectedGender}
          variant="primary"
          fullWidth
        >
          {selectedGender ? "Doorgaan" : "Selecteer een optie"}
        </Button>
      </div>
    </div>
  );
};

export default GenderSelectPage;
