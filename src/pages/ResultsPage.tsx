import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Heart, Share2, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import LoadingFallback from '../components/ui/LoadingFallback';

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Get quiz answers from navigation state
  const answers = location.state?.answers;

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleRetakeQuiz = () => {
    navigate('/quiz/1');
  };

  const handleSaveOutfit = (outfitId: string) => {
    // TODO: Implement save functionality
    console.log('Saving outfit:', outfitId);
  };

  const handleShareOutfit = (outfitId: string) => {
    // TODO: Implement share functionality
    console.log('Sharing outfit:', outfitId);
  };

  if (isLoading) {
    return <LoadingFallback fullScreen message="Je gepersonaliseerde stijlaanbevelingen worden gegenereerd..." />;
  }

  // Mock outfit data
  const outfits = [
    {
      id: 'outfit-1',
      title: 'Casual Chic Look',
      description: 'Perfect voor dagelijks gebruik met een elegante twist',
      imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      matchPercentage: 92,
      tags: ['casual', 'elegant', 'veelzijdig'],
      items: [
        { name: 'Oversized Blazer', brand: 'Zara', price: 79.99 },
        { name: 'High-Waist Jeans', brand: 'Levi\'s', price: 89.99 },
        { name: 'White Sneakers', brand: 'Adidas', price: 99.99 }
      ]
    },
    {
      id: 'outfit-2',
      title: 'Business Casual',
      description: 'Professioneel maar comfortabel voor kantoor',
      imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      matchPercentage: 88,
      tags: ['business', 'professional', 'smart'],
      items: [
        { name: 'Silk Blouse', brand: 'H&M', price: 49.99 },
        { name: 'Tailored Trousers', brand: 'Mango', price: 69.99 },
        { name: 'Leather Pumps', brand: 'Clarks', price: 119.99 }
      ]
    },
    {
      id: 'outfit-3',
      title: 'Weekend Vibes',
      description: 'Relaxed en stijlvol voor je vrije tijd',
      imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&dpr=2',
      matchPercentage: 85,
      tags: ['weekend', 'relaxed', 'comfortable'],
      items: [
        { name: 'Knit Sweater', brand: 'COS', price: 59.99 },
        { name: 'Denim Skirt', brand: 'Weekday', price: 39.99 },
        { name: 'Canvas Sneakers', brand: 'Vans', price: 69.99 }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-primary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        {/* Header */}
        <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-secondary mb-2">
                Jouw stijlaanbevelingen
              </h1>
              <p className="text-gray-600">
                Op basis van je antwoorden hebben we deze outfits voor je samengesteld
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                onClick={handleRetakeQuiz}
                icon={<RefreshCw size={16} />}
                iconPosition="left"
                size="sm"
              >
                Quiz opnieuw
              </Button>
              
              <Button
                as={Link}
                to="/"
                variant="secondary"
                icon={<ArrowLeft size={16} />}
                iconPosition="left"
                size="sm"
              >
                Terug naar home
              </Button>
            </div>
          </div>
        </div>

        {/* Quiz Summary */}
        {answers && (
          <div className="bg-accent text-text-dark p-6 rounded-2xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Jouw antwoorden:</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Gender:</span>
                <span className="ml-2 font-medium">{answers.selectedGender}</span>
              </div>
              <div>
                <span className="text-gray-600">Stijl:</span>
                <span className="ml-2 font-medium">{answers.selectedStyle}</span>
              </div>
              <div>
                <span className="text-gray-600">Seizoen:</span>
                <span className="ml-2 font-medium">{answers.selectedSeason}</span>
              </div>
            </div>
          </div>
        )}

        {/* Outfits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {outfits.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-accent text-text-dark rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="relative aspect-[3/4]">
                <img 
                  src={outfit.imageUrl} 
                  alt={outfit.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-secondary text-primary px-3 py-1 rounded-full text-sm font-bold">
                  {outfit.matchPercentage}% Match
                </div>
                <div className="absolute top-3 right-3 flex space-x-2">
                  <button
                    onClick={() => handleSaveOutfit(outfit.id)}
                    className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Heart size={16} className="text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleShareOutfit(outfit.id)}
                    className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <Share2 size={16} className="text-gray-700" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{outfit.title}</h3>
                <p className="text-gray-600 mb-4">{outfit.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {outfit.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="space-y-2 mb-4">
                  {outfit.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center text-sm">
                      <span>{item.name} - {item.brand}</span>
                      <span className="font-semibold">€{item.price}</span>
                    </div>
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
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-secondary/20 to-secondary/10 p-6 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-secondary mb-4">
            Vind je het leuk?
          </h2>
          <p className="text-body mb-6 max-w-2xl mx-auto">
            Maak een account aan om je aanbevelingen op te slaan en nog meer gepersonaliseerde outfits te ontvangen.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              as={Link}
              to="/register" 
              variant="primary"
              size="lg"
            >
              Account aanmaken
            </Button>
            <Button 
              variant="secondary"
              onClick={handleRetakeQuiz}
              size="lg"
            >
              Quiz opnieuw doen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;