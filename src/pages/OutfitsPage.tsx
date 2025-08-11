import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader, Heart, Share2, Filter } from 'lucide-react';
import { useUser } from '../context/UserContext';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';
import { getRecommendedProducts } from '../services/DataRouter';

const OutfitsPage: React.FC = () => {
  const { user } = useUser();
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        setLoading(true);
        const products = await getRecommendedProducts();
        setOutfits(products);
      } catch (error) {
        console.error('Error fetching outfits:', error);
        setOutfits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-light text-gray-900 mb-4">Inloggen vereist</h2>
          <p className="text-gray-600 mb-6">Je moet ingelogd zijn om aanbevelingen te bekijken.</p>
          <Button as={Link} to="/inloggen" variant="primary" fullWidth>
            Inloggen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/results" 
            className="inline-flex items-center text-[#89CFF0] hover:text-[#89CFF0]/80 transition-colors mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Terug naar resultaten
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-[#0D1B2A] mb-2">
                Jouw Aanbevelingen
              </h1>
              <p className="text-gray-600">
                Gepersonaliseerde outfit aanbevelingen speciaal voor jou
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                icon={<Filter size={16} />}
                iconPosition="left"
                className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
              >
                Filter
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Share2 size={16} />}
                iconPosition="left"
                className="border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Delen
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-[#89CFF0]" size={32} />
          </div>
        ) : (
          <>
            {/* Outfits Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {outfits.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  brand={item.brand}
                  title={item.title}
                  price={item.price}
                  imageUrl={item.imageUrl}
                  deeplink={item.deeplink}
                />
              ))}
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-medium text-[#0D1B2A] mb-4">
            Vind je het leuk?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Ontdek nog meer gepersonaliseerde aanbevelingen en bouw je perfecte garderobe op.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              as={Link}
              to="/dashboard" 
              variant="primary"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            >
              Ga naar Dashboard
            </Button>
            <Button 
              as={Link}
              to="/quiz" 
              variant="outline"
              className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
            >
              Quiz opnieuw doen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitsPage;