import React from 'react';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import Button from '../ui/Button';

const SavedOutfits: React.FC = () => {
  const { user } = useUser();

  // Mock saved outfits data
  const savedOutfits = [
    {
      id: 'outfit-1',
      title: 'Casual Chic Look',
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      savedAt: '2024-12-15',
      tags: ['casual', 'chic', 'everyday']
    },
    {
      id: 'outfit-2',
      title: 'Business Professional',
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
      savedAt: '2024-12-14',
      tags: ['business', 'professional', 'formal']
    }
  ];

  const handleRemoveOutfit = (outfitId: string) => {
    console.log('Removing outfit:', outfitId);
    // TODO: Implement remove functionality
  };

  return (
    <div className="space-y-6">
      <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-secondary mb-6">Opgeslagen Outfits</h2>
        
        {savedOutfits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedOutfits.map((outfit) => (
              <div key={outfit.id} className="bg-white p-4 rounded-xl shadow-sm">
                <div className="relative aspect-[3/4] mb-4">
                  <img 
                    src={outfit.imageUrl} 
                    alt={outfit.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleRemoveOutfit(outfit.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <h3 className="font-semibold mb-2">{outfit.title}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Opgeslagen op {new Date(outfit.savedAt).toLocaleDateString('nl-NL')}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {outfit.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  icon={<ShoppingBag size={16} />}
                  iconPosition="left"
                >
                  Shop deze look
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nog geen opgeslagen outfits
            </h3>
            <p className="text-gray-500 mb-6">
              Begin met het opslaan van outfits die je leuk vindt
            </p>
            <Button variant="primary">
              Ontdek nieuwe outfits
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedOutfits;