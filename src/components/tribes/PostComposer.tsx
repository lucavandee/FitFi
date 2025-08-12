import React, { useState } from "react";
import { useTribePosts } from "@/hooks/useTribePosts";
import { useUser } from "@/context/UserContext";
import { Send, Image, X, Loader } from "lucide-react";
import Button from "../ui/Button";
import ImageWithFallback from "../ui/ImageWithFallback";
import toast from "react-hot-toast";

type Props = {
  tribeId: string;
  userId?: string;
  className?: string;
  placeholder?: string;
};

export const PostComposer: React.FC<Props> = ({ 
  tribeId, 
  userId,
  className = '',
  placeholder = "Deel iets met je tribe..."
}) => {
  const { user, status } = useUser();
  const actualUserId = userId || user?.id;
  const { addPost } = useTribePosts(tribeId);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!actualUserId || status !== 'authenticated') {
      toast.error("Log in om te posten");
      window.location.href = `/inloggen?returnTo=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    if (!content.trim() && !imageUrl.trim()) {
      toast.error("Voeg content of een afbeelding toe");
      return;
    }
    
    setBusy(true);
    try {
      await addPost({
        tribe_id: tribeId,
        user_id: actualUserId,
        content: content.trim(),
        image_url: imageUrl.trim() || undefined,
      });
      
      // Reset form
      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      
      toast.success("Post geplaatst! 🎉");
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Posten mislukt";
      toast.error(errorMessage);
      console.error('[PostComposer] Post creation failed:', e);
    } finally {
      setBusy(false);
    }
  }

  const handleImageToggle = () => {
    setShowImageInput(!showImageInput);
    if (showImageInput) {
      setImageUrl("");
    }
  };

  const canSubmit = (content.trim() || imageUrl.trim()) && status === 'authenticated' && !busy;

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      <form onSubmit={onSubmit}>
        <div className="flex items-start space-x-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#89CFF0] flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          
          {/* Content Input */}
          <div className="flex-1">
            <textarea
              className="w-full border border-gray-200 rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors placeholder-gray-500"
              placeholder={placeholder}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={busy || status !== 'authenticated'}
            />
            
            {/* Image Input */}
            {showImageInput && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Image className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Afbeelding toevoegen</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImageInput(false)}
                    className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                    aria-label="Sluit afbeelding input"
                  >
                    <X size={12} className="text-gray-600" />
                  </button>
                </div>
                
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
                  disabled={busy}
                />
                
                {/* Image Preview */}
                {imageUrl && (
                  <div className="mt-3">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                      <ImageWithFallback
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        componentName="PostComposer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Actions Row */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                {/* Image Toggle */}
                <button
                  type="button"
                  onClick={handleImageToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    showImageInput 
                      ? 'bg-[#89CFF0] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Afbeelding toevoegen"
                  disabled={busy}
                >
                  <Image size={16} />
                </button>

                {/* Character Count */}
                <div className="text-sm text-gray-500">
                  {content.length}/500
                </div>
              </div>
              
              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!canSubmit}
                icon={busy ? <Loader className="w-4 h-4 animate-spin" /> : <Send size={16} />}
                iconPosition="left"
                className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-busy={busy}
              >
                {busy ? 'Plaatsen...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Login CTA for guests */}
      {status !== 'authenticated' && (
        <div className="mt-4 p-4 bg-[#89CFF0]/10 rounded-2xl text-center">
          <p className="text-sm text-gray-700 mb-3">
            Log in om posts te delen met de tribe
          </p>
          <Button
            as="a"
            href="/inloggen"
            variant="primary"
            size="sm"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
          >
            Inloggen
          </Button>
        </div>
      )}
    </div>
  );
};