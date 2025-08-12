import React, { useState } from 'react';
import { Send, Image, Shirt, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import type { TribePost } from '../../services/data/types';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';
import toast from 'react-hot-toast';

interface PostComposerProps {
  tribeId: string;
  onPostCreated: (post: TribePost) => void;
  className?: string;
}

const PostComposer: React.FC<PostComposerProps> = ({
  tribeId,
  onPostCreated,
  className = ''
}) => {
  const { user } = useUser();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [outfitId, setOutfitId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showOutfitInput, setShowOutfitInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !content.trim()) return;

    setIsSubmitting(true);

    try {
      // Create mock post for immediate UI update
      const mockPost: TribePost = {
        id: `post_${Date.now()}`,
        tribe_id: tribeId,
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl || null,
        outfit_id: outfitId || null,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_profile: {
          full_name: user.name || 'Anonymous',
          avatar_url: undefined
        },
        is_liked_by_current_user: false,
        recent_comments: []
      };

      // Add mock post to feed immediately
      onPostCreated(mockPost);

      // Clear form
      setContent('');
      setImageUrl('');
      setOutfitId('');
      setShowImageInput(false);
      setShowOutfitInput(false);

      // In a real implementation, this would save to Supabase
      console.log('Mock post created:', mockPost);

      toast.success('Post geplaatst!');

    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Kon post niet plaatsen');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageToggle = () => {
    setShowImageInput(!showImageInput);
    if (showImageInput) {
      setImageUrl('');
    }
  };

  const handleOutfitToggle = () => {
    setShowOutfitInput(!showOutfitInput);
    if (showOutfitInput) {
      setOutfitId('');
    }
  };

  if (!user) return null;

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-[#89CFF0] flex items-center justify-center text-white font-medium">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
          
          {/* Content Input */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Deel je stijl met de tribe..."
              className="w-full p-4 border border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
              rows={3}
              maxLength={500}
              disabled={isSubmitting}
            />
            
            {/* Image Input */}
            {showImageInput && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Image className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Afbeelding toevoegen</span>
                  <button
                    type="button"
                    onClick={() => setShowImageInput(false)}
                    className="ml-auto w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0]"
                />
                {imageUrl && (
                  <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden">
                    <ImageWithFallback
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      componentName="PostComposer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Outfit Input */}
            {showOutfitInput && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Shirt className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Outfit koppelen</span>
                  <button
                    type="button"
                    onClick={() => setShowOutfitInput(false)}
                    className="ml-auto w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  value={outfitId}
                  onChange={(e) => setOutfitId(e.target.value)}
                  placeholder="Outfit ID"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0]"
                />
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-3">
                {/* Image Button */}
                <button
                  type="button"
                  onClick={handleImageToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    showImageInput 
                      ? 'bg-[#89CFF0] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Afbeelding toevoegen"
                >
                  <Image size={16} />
                </button>

                {/* Outfit Button */}
                <button
                  type="button"
                  onClick={handleOutfitToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    showOutfitInput 
                      ? 'bg-[#89CFF0] text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Outfit koppelen"
                >
                  <Shirt size={16} />
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
                disabled={!content.trim() || isSubmitting}
                icon={<Send size={16} />}
                iconPosition="left"
                className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
              >
                {isSubmitting ? 'Plaatsen...' : 'Post'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;