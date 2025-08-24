import React, { useState, useEffect } from "react";
import { X, Share2, Download } from "lucide-react";
import { Achievement } from "../../types/achievements";
import Button from "../ui/Button";

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
  onShare?: () => void;
  className?: string;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({
  achievement,
  onClose,
  onShare,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600";
      case "rare":
        return "from-blue-400 to-blue-600";
      case "epic":
        return "from-purple-400 to-purple-600";
      case "legendary":
        return "from-yellow-400 to-yellow-600";
      default:
        return "from-gray-400 to-gray-600";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "border-gray-300";
      case "rare":
        return "border-blue-300";
      case "epic":
        return "border-purple-300";
      case "legendary":
        return "border-yellow-300";
      default:
        return "border-gray-300";
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Achievement Card */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Sluit achievement"
        >
          <X size={16} className="text-gray-600" />
        </button>

        <div className="p-8 text-center">
          {/* Achievement Icon */}
          <div
            className={`w-20 h-20 rounded-full bg-gradient-to-br ${getRarityColor(achievement.rarity)} flex items-center justify-center mx-auto mb-6 ${getRarityBorder(achievement.rarity)} border-4`}
          >
            <span className="text-3xl">{achievement.icon}</span>
          </div>

          {/* Achievement Info */}
          <div className="mb-6">
            <div
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                achievement.rarity === "legendary"
                  ? "bg-yellow-100 text-yellow-800"
                  : achievement.rarity === "epic"
                    ? "bg-purple-100 text-purple-800"
                    : achievement.rarity === "rare"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {achievement.rarity.charAt(0).toUpperCase() +
                achievement.rarity.slice(1)}
            </div>

            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Achievement Unlocked!
            </h2>

            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {achievement.title}
            </h3>

            <p className="text-gray-600">{achievement.description}</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            {onShare && (
              <Button
                variant="outline"
                onClick={onShare}
                icon={<Share2 size={16} />}
                iconPosition="left"
                className="flex-1 border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                Delen
              </Button>
            )}

            <Button
              variant="primary"
              onClick={handleClose}
              className="flex-1 bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            >
              Geweldig!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementNotification;
