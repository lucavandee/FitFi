import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Share2, 
  Download, 
  ShoppingBag, 
  Filter, 
  Sparkles, 
  Bookmark,
  BookmarkCheck
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useUser } from '../context/UserContext';

interface Outfit {
  id: string;
  title: string;
  description: string;
  matchPercentage: number;
  imageUrl: string;
  items: {
    id: string;
    name: string;
    brand: string;
    price: number;
    imageUrl: string;
    link: string;
  }[];
  tags: string[];
  occasions: string[];
}

const RecommendationsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, saveRecommendation } = useUser();
  const [activeTab, setActiveTab] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [savedRecommendations, setSavedRecommendations] = useState<string[]>([]);

  // Mock outfits data
  const recommendedOutfits: Outfit[] = [
    {
      id: '1',
      title: 'Smart Casual Office Look',
      description: 'A balanced blend of professional and comfortable pieces perfect for the modern workplace.',
      matchPercentage: 94,
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      items: [
        {
          id: 'item1',
          name: 'Classic Blazer',
          brand: 'Minimalist',
          price: 129.99,
          imageUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          link: '#'
        },
        {
          id: 'item2',
          name: 'Slim Fit Chinos',
          brand: 'Urban Outfit',
          price: 79.99,
          imageUrl: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          link: '#'
        },
        {
          id: 'item3',
          name: 'Oxford Shirt',
          brand: 'Classic Essentials',
          price: 59.99,
          imageUrl: 'https://images.pexels.com/photos/297933/pexels-photo-297933.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          link: '#'
        }
      ],
      tags: ['professional', 'minimalist', 'versatile'],
      occasions: ['work', 'meeting', 'casual friday']
    },
    {
      id: '2',
      title: 'Weekend Casual Ensemble',
      description: 'Effortlessly stylish look for your weekend adventures and casual outings.',
      matchPercentage: 87,
      imageUrl: 'https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      items: [
        {
          id: 'item4',
          name: 'Relaxed Jeans',
          brand: 'Denim Expert',
          price: 89.99,
          imageUrl: 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          link: '#'
        },
        {
          id: 'item5',
          name: 'Casual T-shirt',
          brand: 'Comfort Basics',
          price: 29.99,
          imageUrl: 'https://images.pexels.com/photos/4066293/pexels-photo-4066293.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          link: '#'
        },
        {
          id: 'item6',
          name: 'Canvas Sneakers',
          brand: 'Street Style',
          price: 64.99,
          imageUrl: 'https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          link: '#'
        }
      ],
      tags: ['casual', 'comfortable', 'versatile'],
      occasions: ['weekend', 'casual', 'day out']
    },
    {
      id: '3',
      title: 'Evening Dinner Attire',
      description: 'Sophisticated yet modern outfit perfect for dinner dates and evening events.',
      matchPercentage: 83,
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      items: [
        {
          id: 'item7',
          name: 'Slim Dress Pants',
          brand: 'Fine Tailoring',
          price: 119.99,
          imageUrl: 'https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          link: '#'
        },
        {
          id: 'item8',
          name: 'Dress Shirt',
          brand: 'Classic Essentials',
          price: 79.99,
          imageUrl: 'https://images.pexels.com/photos/6764034/pexels-photo-6764034.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          link: '#'
        },
        {
          id: 'item9',
          name: 'Leather Loafers',
          brand: 'Luxury Step',
          price: 149.99,
          imageUrl: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          link: '#'
        }
      ],
      tags: ['formal', 'elegant', 'sophisticated'],
      occasions: ['dinner', 'date', 'evening event']
    }
  ];

  useEffect(() => {
    // In a real app, you would fetch recommendations from an API
    // For now we'll use the mock data
    
    // Get saved recommendations from user context
    if (user) {
      setSavedRecommendations(user.savedRecommendations);
    }
    
    // Set the first outfit as selected by default
    if (recommendedOutfits.length > 0 && !selectedOutfit) {
      setSelectedOutfit(recommendedOutfits[0]);
    }
  }, [user]);

  const handleSaveRecommendation = async (outfitId: string) => {
    if (!user) {
      navigate('/onboarding');
      return;
    }
    
    await saveRecommendation(outfitId);
    setSavedRecommendations(prev => [...prev, outfitId]);
  };

  const filteredOutfits = activeFilter
    ? recommendedOutfits.filter(outfit => outfit.tags.includes(activeFilter) || outfit.occasions.includes(activeFilter))
    : recommendedOutfits;

  const allTags = [...new Set(recommendedOutfits.flatMap(outfit => [...outfit.tags, ...outfit.occasions]))];

  const handleSelectOutfit = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
    
    // Scroll to top on mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isSaved = (outfitId: string) => {
    return savedRecommendations.includes(outfitId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center mb-3 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
            <Sparkles size={16} className="mr-1" />
            Personalized for You
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Style Recommendations
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Based on your preferences, we've curated these looks just for you.
            Each outfit is designed to complement your style and enhance your wardrobe.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 pb-2">
            <Button 
              variant={activeFilter === null ? "primary" : "outline"} 
              size="sm"
              onClick={() => setActiveFilter(null)}
              className="whitespace-nowrap"
            >
              All Recommendations
            </Button>
            
            {allTags.map(tag => (
              <Button 
                key={tag}
                variant={activeFilter === tag ? "primary" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter(tag)}
                className="whitespace-nowrap"
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Detailed view of selected outfit */}
          <div className="lg:w-2/3 order-2 lg:order-1">
            {selectedOutfit && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors animate-fade-in">
                <div className="relative">
                  <img 
                    src={selectedOutfit.imageUrl} 
                    alt={selectedOutfit.title} 
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                    <Sparkles size={16} className="mr-1" />
                    {selectedOutfit.matchPercentage}% Match
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {selectedOutfit.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {selectedOutfit.description}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleSaveRecommendation(selectedOutfit.id)} 
                        className={`
                          p-2 rounded-full transition-colors
                          ${isSaved(selectedOutfit.id) 
                            ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30' 
                            : 'bg-gray-100 text-gray-500 hover:text-orange-500 dark:bg-gray-700 dark:text-gray-400'}
                        `}
                        aria-label={isSaved(selectedOutfit.id) ? 'Saved to favorites' : 'Save to favorites'}
                      >
                        {isSaved(selectedOutfit.id) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                      </button>
                      <button 
                        className="p-2 rounded-full bg-gray-100 text-gray-500 hover:text-orange-500 transition-colors dark:bg-gray-700 dark:text-gray-400"
                        aria-label="Share outfit"
                      >
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedOutfit.tags.concat(selectedOutfit.occasions).map(tag => (
                      <span 
                        key={tag} 
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </span>
                    ))}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Outfit Items
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {selectedOutfit.items.map(item => (
                      <div 
                        key={item.id} 
                        className="border dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{item.brand}</p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-bold">${item.price.toFixed(2)}</span>
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                            >
                              Shop Now
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      Total Estimated Cost: <span className="font-bold text-gray-900 dark:text-white">
                        ${selectedOutfit.items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        icon={<Download size={16} />}
                        iconPosition="left"
                      >
                        Save as PDF
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm"
                        icon={<ShoppingBag size={16} />}
                        iconPosition="left"
                      >
                        Shop Complete Look
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* List of outfits */}
          <div className="lg:w-1/3 order-1 lg:order-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-colors">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {filteredOutfits.length} Recommended Outfits
                </h3>
                <button className="text-gray-500 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  <Filter size={18} />
                </button>
              </div>
              
              <div className="overflow-y-auto max-h-[800px]">
                {filteredOutfits.map(outfit => (
                  <div 
                    key={outfit.id}
                    onClick={() => handleSelectOutfit(outfit)}
                    className={`
                      p-4 border-b dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                      ${selectedOutfit?.id === outfit.id ? 'bg-orange-50 dark:bg-gray-700' : ''}
                    `}
                  >
                    <div className="flex gap-4">
                      <img 
                        src={outfit.imageUrl} 
                        alt={outfit.title} 
                        className="w-24 h-24 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white">{outfit.title}</h4>
                          <div className="text-orange-500 font-bold">{outfit.matchPercentage}%</div>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                          {outfit.description}
                        </p>
                        <div className="flex mt-2">
                          {outfit.tags.slice(0, 2).map(tag => (
                            <span 
                              key={tag} 
                              className="text-xs mr-2 px-2 py-0.5 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Want even more personalized recommendations?
          </p>
          <Button 
            variant="outline"
            size="lg"
            icon={<Sparkles size={18} />}
            iconPosition="left"
          >
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;