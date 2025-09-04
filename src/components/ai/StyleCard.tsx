import { Heart, ShoppingBag, Sparkles } from "lucide-react";

interface StyleCardProps {
  title: string;
  description: string;
  imageUrl: string;
  matchPercentage: number;
  onLike?: () => void;
  onShop?: () => void;
  isLiked?: boolean;
}

export default function StyleCard({
  title,
  description,
  imageUrl,
  matchPercentage,
  onLike,
  onShop,
  isLiked = false
}: StyleCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
          <div className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span className="text-xs font-medium text-gray-700">{matchPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <button
            onClick={onLike}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
              isLiked 
                ? 'bg-red-50 text-red-600 border border-red-200' 
                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span>Like</span>
          </button>
          
          <button
            onClick={onShop}
            className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-700 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop</span>
          </button>
        </div>
      </div>
    </div>
  );
}