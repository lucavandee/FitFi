import React, { useState } from "react";
import { X, Instagram, Twitter, Facebook, Link2, Download } from "lucide-react";
import { SocialShareData } from "../../types/achievements";
import Button from "../ui/Button";
import toast from "react-hot-toast";

interface SocialShareModalProps {
  shareData: SocialShareData;
  onClose: () => void;
  onShare: (platform: string) => void;
  className?: string;
}

const SocialShareModal: React.FC<SocialShareModalProps> = ({
  shareData,
  onClose,
  onShare,
  className = "",
}) => {
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleShare = (platform: string) => {
    onShare(platform);

    let shareUrl = "";
    const text = encodeURIComponent(shareData.shareText);
    const url = encodeURIComponent(shareData.shareUrl);

    switch (platform) {
      case "instagram":
        // Instagram doesn't support direct URL sharing, copy to clipboard
        navigator.clipboard.writeText(
          `${shareData.shareText} ${shareData.shareUrl}`,
        );
        toast.success("Tekst gekopieerd! Plak in je Instagram Story");
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        window.open(shareUrl, "_blank", "width=600,height=400");
        break;
      case "copy":
        navigator.clipboard.writeText(
          `${shareData.shareText} ${shareData.shareUrl}`,
        );
        toast.success("Link gekopieerd naar klembord!");
        break;
    }
  };

  const generateShareImage = () => {
    // In a real app, this would generate a custom image with the user's style profile
    toast.success("Share image wordt gegenereerd...");
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

      {/* Share Modal */}
      <div
        className={`relative bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          aria-label="Sluit share modal"
        >
          <X size={16} className="text-gray-600" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#89CFF0] to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">{shareData.achievement.icon}</span>
            </div>

            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Deel je Achievement!
            </h2>

            <p className="text-gray-600">
              Laat je vrienden zien wat jouw stijl over je zegt
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-[#89CFF0]/10 to-purple-50 rounded-2xl p-4 mb-6">
            <div className="text-sm text-gray-700">
              <strong>{shareData.userProfile.name}</strong> heeft zojuist
              ontdekt:
              <strong> {shareData.userProfile.styleType}</strong> met een
              <strong> {shareData.userProfile.matchPercentage}% match!</strong>
              <br />
              <span className="text-[#89CFF0]">
                #FitFiStyle #AIStyleAnalysis
              </span>
            </div>
          </div>

          {/* Share Options */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              fullWidth
              onClick={() => handleShare("instagram")}
              icon={<Instagram size={20} />}
              iconPosition="left"
              className="border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              Instagram Story
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => handleShare("twitter")}
              icon={<Twitter size={20} />}
              iconPosition="left"
              className="border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              Twitter
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => handleShare("facebook")}
              icon={<Facebook size={20} />}
              iconPosition="left"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              Facebook
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => handleShare("copy")}
              icon={<Link2 size={20} />}
              iconPosition="left"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Kopieer Link
            </Button>
          </div>

          {/* Generate Image */}
          <div className="border-t border-gray-200 pt-4">
            <Button
              variant="ghost"
              fullWidth
              onClick={generateShareImage}
              icon={<Download size={16} />}
              iconPosition="left"
              className="text-[#89CFF0] hover:bg-[#89CFF0]/10"
            >
              Genereer Share Image
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialShareModal;
