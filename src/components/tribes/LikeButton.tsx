import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import { supabase } from '../../lib/supabase';
import ImageWithFallback from '../ui/ImageWithFallback';
import Popover from '../ui/Popover';
import toast from 'react-hot-toast';

interface LikeButtonProps {
  postId: string;
  likesCount: number;
  isLiked: boolean;
  firstLikeUser?: {
    id: string;
    name: string;
    avatar: string;
  };
  onUpdate: (newLikesCount: number, newIsLiked: boolean) => void;
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  likesCount,
  isLiked,
  firstLikeUser,
  onUpdate,
  className = ''
}) => {
  const { user } = useUser();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLikers, setShowLikers] = useState(false);

  const handleToggleLike = async () => {
    if (!user?.id || isUpdating) return;

    setIsUpdating(true);

    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    onUpdate(newLikesCount, newIsLiked);

    try {
      if (newIsLiked) {
        // Add like
        const { error } = await supabase
          .from('tribe_likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });

        if (error) {
          throw error;
        }
      } else {
        // Remove like
        const { error } = await supabase
          .from('tribe_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) {
          throw error;
        }
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      
      // Revert optimistic update on error
      onUpdate(likesCount, isLiked);
      toast.error('Kon like niet verwerken');
    } finally {
      setIsUpdating(false);
    }
  };

  const renderLikersPopover = () => {
    if (likesCount === 0) return null;

    return (
      <div className="p-3 max-w-xs">
        <h4 className="font-medium text-gray-900 mb-3">Likes</h4>
        
        {firstLikeUser && (
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              {firstLikeUser.avatar ? (
                <ImageWithFallback
                  src={firstLikeUser.avatar}
                  alt={firstLikeUser.name}
                  className="w-full h-full object-cover"
                  componentName="LikeButton"
                />
              ) : (
                <div className="w-full h-full bg-[#89CFF0] flex items-center justify-center text-white text-sm font-medium">
                  {firstLikeUser.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-sm text-gray-700">{firstLikeUser.name}</span>
          </div>
        )}
        
        {likesCount > 1 && (
          <div className="text-sm text-gray-600">
            {likesCount === 2 ? 'en 1 andere persoon' : `en ${likesCount - 1} andere personen`}
          </div>
        )}
        
        {likesCount === 1 && !firstLikeUser && (
          <div className="text-sm text-gray-600">1 persoon vindt dit leuk</div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Like Button */}
      <button
        onClick={handleToggleLike}
        disabled={!user || isUpdating}
        className={`flex items-center space-x-2 transition-all duration-200 ${
          isLiked 
            ? 'text-red-500 hover:text-red-600' 
            : 'text-gray-500 hover:text-red-500'
        } ${isUpdating ? 'opacity-50' : ''}`}
        aria-label={isLiked ? 'Unlike post' : 'Like post'}
      >
        <Heart 
          size={18} 
          className={`transition-all duration-200 ${
            isLiked ? 'fill-current scale-110' : 'hover:scale-110'
          }`} 
        />
        <span className="text-sm font-medium">{likesCount}</span>
      </button>

      {/* Likers Avatar Preview */}
      {likesCount > 0 && (
        <Popover
          trigger={
            <button className="flex items-center space-x-1 hover:bg-gray-50 rounded-full px-2 py-1 transition-colors">
              {firstLikeUser?.avatar ? (
                <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <ImageWithFallback
                    src={firstLikeUser.avatar}
                    alt={`${firstLikeUser.name} liked this`}
                    className="w-full h-full object-cover"
                    componentName="LikeButton"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#89CFF0] flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-sm">
                  {firstLikeUser?.name?.charAt(0).toUpperCase() || '❤️'}
                </div>
              )}
              
              {likesCount > 1 && (
                <span className="text-xs text-gray-500">+{likesCount - 1}</span>
              )}
            </button>
          }
          content={renderLikersPopover()}
          placement="top"
          showArrow={true}
          className="z-50"
        />
      )}
    </div>
  );
};

export default LikeButton;