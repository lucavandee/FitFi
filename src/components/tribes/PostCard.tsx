import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';
import { TribePost, TribePostComment } from '../../types/tribes';
import { TribesService } from '../../services/tribesService';
import { useUser } from '../../context/UserContext';
import ImageWithFallback from '../ui/ImageWithFallback';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: TribePost;
  onUpdate: (updatedPost: TribePost) => void;
  className?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, onUpdate, className = '' }) => {
  const { user } = useUser();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const handleToggleLike = async () => {
    if (!user?.id) return;

    try {
      const isLiked = await TribesService.togglePostLike(post.id, user.id);
      
      const updatedPost = {
        ...post,
        is_liked: isLiked,
        likes_count: isLiked ? post.likes_count + 1 : post.likes_count - 1
      };
      
      onUpdate(updatedPost);
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Kon like niet verwerken');
    }
  };

  const handleAddComment = async () => {
    if (!user?.id || !newComment.trim()) return;

    try {
      setIsCommenting(true);
      const comment = await TribesService.addComment(post.id, newComment.trim(), user.id);
      
      if (comment) {
        const updatedPost = {
          ...post,
          comments_count: post.comments_count + 1,
          recent_comments: [comment, ...(post.recent_comments || [])].slice(0, 3)
        };
        
        onUpdate(updatedPost);
        setNewComment('');
        toast.success('Comment toegevoegd!');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Kon comment niet toevoegen');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/tribes/${post.tribe_id}/posts/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post van ${post.user_profile?.full_name || 'FitFi gebruiker'}`,
          text: post.content,
          url: shareUrl
        });
      } catch (error) {
        // User cancelled or error occurred
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link gekopieerd!');
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm p-6 ${className}`}>
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {post.user_profile?.avatar_url ? (
            <img
              src={post.user_profile.avatar_url}
              alt={post.user_profile.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#89CFF0] flex items-center justify-center text-white font-medium">
              {post.user_profile?.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-900">
              {post.user_profile?.full_name || 'Anonymous'}
            </h4>
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString('nl-NL', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <button className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
          <MoreHorizontal size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">{post.content}</p>
      </div>

      {/* Post Image */}
      {post.image_url && (
        <div className="mb-4 rounded-2xl overflow-hidden">
          <ImageWithFallback
            src={post.image_url}
            alt="Post afbeelding"
            className="w-full h-auto"
            componentName="PostCard"
          />
        </div>
      )}

      {/* Outfit Preview */}
      {post.outfit && (
        <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-20 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={post.outfit.image_url || 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=2'}
                alt={post.outfit.title}
                className="w-full h-full object-cover"
                componentName="PostCard"
              />
            </div>
            <div className="flex-1">
              <h5 className="font-medium text-gray-900">{post.outfit.title}</h5>
              <p className="text-sm text-gray-600">{post.outfit.match_percentage}% match</p>
            </div>
          </div>
        </div>
      )}

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-6">
          <button
            onClick={handleToggleLike}
            className={`flex items-center space-x-2 transition-colors ${
              post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart size={18} className={post.is_liked ? 'fill-current' : ''} />
            <span className="text-sm font-medium">{post.likes_count}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-500 hover:text-[#89CFF0] transition-colors"
          >
            <MessageCircle size={18} />
            <span className="text-sm font-medium">{post.comments_count}</span>
          </button>
          
          <button
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-500 hover:text-[#89CFF0] transition-colors"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Recent Comments */}
          {post.recent_comments && post.recent_comments.length > 0 && (
            <div className="space-y-3 mb-4">
              {post.recent_comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                    {comment.user_profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-2xl px-4 py-2">
                      <p className="font-medium text-gray-900 text-sm">
                        {comment.user_profile?.full_name || 'Anonymous'}
                      </p>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          {user && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-[#89CFF0] flex items-center justify-center text-white text-sm font-medium">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Schrijf een comment..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#89CFF0] focus:border-[#89CFF0] transition-colors"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  variant="primary"
                  size="sm"
                  disabled={!newComment.trim() || isCommenting}
                  className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] rounded-full"
                >
                  {isCommenting ? (
                    <div className="w-4 h-4 border-2 border-[#0D1B2A] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;