import React, { useState } from 'react';
import { Camera, Share2, Trophy, Upload, Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import ImageWithFallback from '../ui/ImageWithFallback';

interface CommunityPost {
  id: string;
  username: string;
  avatar: string;
  imageUrl: string;
  likes: number;
  caption: string;
}

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar: string;
  points: number;
  rank: number;
}

interface CommunityChallengeLandingProps {
  className?: string;
}

const CommunityChallengeLanding: React.FC<CommunityChallengeLandingProps> = ({ className = '' }) => {
  const [currentPostIndex, setCurrentPostIndex] = useState(0);

  const communityPosts: CommunityPost[] = [
    {
      id: 'post-1',
      username: 'emma_style',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      likes: 127,
      caption: 'Nova\'s aanbeveling was perfect voor mijn date night! #NovaKnows'
    },
    {
      id: 'post-2',
      username: 'style_maven',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      likes: 89,
      caption: 'Werk outfit goals dankzij Nova! Feeling confident 💪 #NovaKnows'
    },
    {
      id: 'post-3',
      username: 'minimalist_me',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      likes: 156,
      caption: 'Less is more - Nova gets my minimalist vibe perfectly! #NovaKnows'
    }
  ];

  const leaderboard: LeaderboardEntry[] = [
    {
      id: 'user-1',
      username: 'emma_style',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      points: 2450,
      rank: 1
    },
    {
      id: 'user-2',
      username: 'style_maven',
      avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      points: 2180,
      rank: 2
    },
    {
      id: 'user-3',
      username: 'minimalist_me',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
      points: 1890,
      rank: 3
    }
  ];

  const nextPost = () => {
    setCurrentPostIndex((prev) => (prev + 1) % communityPosts.length);
  };

  const prevPost = () => {
    setCurrentPostIndex((prev) => (prev - 1 + communityPosts.length) % communityPosts.length);
  };

  return (
    <section className={`bg-white rounded-3xl p-8 shadow-sm ${className}`} aria-labelledby="community-heading">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
          <Camera className="w-5 h-5 text-purple-500" />
        </div>
        <div>
          <h2 id="community-heading" className="text-2xl font-light text-gray-900">
            Community-uitdaging: #NovaKnows
          </h2>
          <p className="text-gray-600">Deel jouw Nova-look en win prijzen!</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Community Posts Carousel */}
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Populaire Posts</h3>
          <div className="relative">
            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 relative">
              <ImageWithFallback
                src={communityPosts[currentPostIndex].imageUrl}
                alt={`Community post van ${communityPosts[currentPostIndex].username}`}
                className="w-full h-full object-cover"
                componentName="CommunityChallengeLanding"
              />
              
              {/* Post Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={communityPosts[currentPostIndex].avatar}
                    alt={communityPosts[currentPostIndex].username}
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span className="text-white font-medium text-sm">
                    @{communityPosts[currentPostIndex].username}
                  </span>
                  <span className="text-white/80 text-sm">
                    ❤️ {communityPosts[currentPostIndex].likes}
                  </span>
                </div>
                <p className="text-white text-sm">
                  {communityPosts[currentPostIndex].caption}
                </p>
              </div>
              
              {/* Navigation */}
              <button
                onClick={prevPost}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
                aria-label="Vorige post"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextPost}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center"
                aria-label="Volgende post"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Post Indicators */}
            <div className="flex justify-center space-x-2 mt-4">
              {communityPosts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPostIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentPostIndex ? 'bg-[#bfae9f]' : 'bg-gray-300'
                  }`}
                  aria-label={`Ga naar post ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard & Upload */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <div>
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <Trophy className="w-4 h-4 text-yellow-500 mr-2" />
              Leaderboard
            </h3>
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#bfae9f] text-white text-xs font-bold">
                      {entry.rank}
                    </div>
                    <img
                      src={entry.avatar}
                      alt={entry.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium text-gray-900 text-sm">
                      @{entry.username}
                    </span>
                  </div>
                  <span className="text-[#bfae9f] font-medium text-sm">
                    {entry.points.toLocaleString()} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-gradient-to-br from-[#bfae9f]/10 to-purple-50 rounded-xl p-6">
            <h3 className="font-medium text-gray-900 mb-3">Deel jouw look!</h3>
            <p className="text-gray-600 text-sm mb-4">
              Upload een foto van jouw Nova-outfit en maak kans op stylingprijzen ter waarde van €500!
            </p>
            
            <div className="space-y-3">
              <Button
                variant="primary"
                size="sm"
                icon={<Upload size={16} />}
                iconPosition="left"
                className="w-full bg-[#bfae9f] hover:bg-[#a89a8c] text-white"
              >
                Upload foto
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Instagram size={16} />}
                  iconPosition="left"
                  className="flex-1 border-pink-300 text-pink-600 hover:bg-pink-50"
                >
                  Instagram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Share2 size={16} />}
                  iconPosition="left"
                  className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  TikTok
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-lg font-medium text-gray-900 mb-2">
          Doe mee & win stylingprijzen!
        </p>
        <p className="text-gray-600 text-sm">
          Gebruik #NovaKnows en tag @fitfi voor een kans op geweldige prijzen
        </p>
      </div>
    </section>
  );
};

export default CommunityChallengeLanding;