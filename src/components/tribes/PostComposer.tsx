import React, { useState } from 'react';
import { Send, Image, X } from 'lucide-react';
import { useTribePosts } from '@/hooks/useTribePosts';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface PostComposerProps {
  tribeId: string;
  userId?: string;
  placeholder?: string;
  className?: string;
  onPostCreated?: () => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  tribeId,
  userId,
  placeholder = 'Deel iets met de tribe...',
  className = '',
  onPostCreated
}) => {
  const { addPost } = useTribePosts(tribeId);
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error('Log in om een post te maken');
      return;
    }

    if (!content.trim()) {
      toast.error('Voeg wat tekst toe aan je post');
      return;
    }

    setIsSubmitting(true);

    try {
      await addPost({
        tribe_id: tribeId,
        user_id: userId,
        authorId: userId,
        authorName: `User ${userId.slice(-4)}`, // Would be fetched from user profile
        content: content.trim(),
        image_url: imageUrl || undefined,
        likes: 0,
        commentsCount: 0
      });

      // Reset form
      setContent('');
      setImageUrl('');
      
      toast.success('Post gedeeld! 🎉');
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Kon post niet maken. Probeer opnieuw.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
  };

  const clearImage = () => {
    setImageUrl('');
  };

  if (!userId) {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-sm text-center ${className}`}>
        <div className="w-12 h-12 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Send className="w-6 h-6 text-[#89CFF0]" />
        </div>
        <h3 className="font-medium text-gray-900 mb-2">Deel met de tribe</h3>
        <p className="text-gray-600 text-sm mb-4">
          Log in om posts te delen en deel uit te maken van de conversatie.
        </p>
        <Button
          variant="primary"
          size="sm"
          className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
          onClick={() => window.location.href = '/inloggen'}
        >
          Inloggen
        </Button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Text Input */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
            disabled={isSubmitting}
          />
        </div>

        {/* Image URL Input */}
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <input
                type="url"
                value={imageUrl}
                onChange={handleImageUrlChange}
                placeholder="Afbeelding URL (optioneel)"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors text-sm"
                disabled={isSubmitting}
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
          
          {/* Image Preview */}
          {imageUrl && (
            <div className="mt-3">
              <div className="relative inline-block">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                  onError={() => {
                    toast.error('Ongeldige afbeelding URL');
                    setImageUrl('');
                  }}
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Image className="w-4 h-4" />
            <span>Voeg een afbeelding toe voor meer engagement</span>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            icon={<Send className="w-4 h-4" />}
            iconPosition="right"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
          >
            {isSubmitting ? 'Delen...' : 'Deel post'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;