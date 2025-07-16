import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import OutfitCard from "../components/OutfitCard";
import FadeInSection from "../components/FadeInSection";
import ResultsLoader from "../components/ui/ResultsLoader";
import SkeletonPlaceholder from "../components/ui/SkeletonPlaceholder";
import { normalizeProduct, getProductSeasonText } from "../utils/product";
import { getSafeUser } from "../utils/userUtils";

// Define types for our component
interface Product {
  id: string;
  name: string;
  imageUrl?: string;
  type?: string;
  category?: string;
  styleTags?: string[];
  description?: string;
  price?: number;
  brand?: string;
  affiliateUrl?: string;
  matchScore?: number;
  season?: string[];
}

interface Outfit {
  id: string;
  title: string;
  description: string;
  archetype: string;
  secondaryArchetype?: string;
  mixFactor?: number;
  occasion: string;
  products: Product[];
  imageUrl?: string;
  tags: string[];
  matchPercentage: number;
  explanation: string;
  season?: string;
  structure?: string[];
  weather?: string;
  categoryRatio?: Record<string, number>;
  completeness?: number;
}

interface Recommendations {
  outfits: Outfit[];
  products: Product[];
  matchScore?: number;
  userProfile?: any;
}

const EnhancedResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Extract recommendations from location state or use fallback
  useEffect(() => {
    // Check if we have data in location state
    if (!location.state || !location.state.recommendations) {
      // No data, redirect to homepage after a short delay
      const timer = setTimeout(() => {
        navigate("/");
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    
    // Simulate loading for better UX
    const loadingTimer = setTimeout(() => {
      try {
        // Process and normalize the recommendations data
        const rawRecommendations = location.state.recommendations as Recommendations;
        
        // Normalize products in each outfit
        const processedRecommendations = {
          ...rawRecommendations,
          outfits: rawRecommendations.outfits.map(outfit => ({
            ...outfit,
            products: outfit.products.map(product => normalizeProduct(product))
          })),
          products: rawRecommendations.products.map(product => normalizeProduct(product))
        };
        
        setRecommendations(processedRecommendations);
        setIsLoading(false);
      } catch (err) {
        console.error("Error processing recommendations:", err);
        setError("Er is een fout opgetreden bij het verwerken van je aanbevelingen.");
        setIsLoading(false);
      }
    }, 1000);
    
    return () => clearTimeout(loadingTimer);
  }, [location.state, navigate]);

  // If we're loading, show skeleton placeholders
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* Header skeleton */}
            <div className="mb-8">
              <SkeletonPlaceholder height="h-8" width="w-3/4" className="mb-4" />
              <SkeletonPlaceholder height="h-4" width="w-full" />
            </div>
            
            {/* Outfits skeleton */}
            <div className="mb-12">
              <SkeletonPlaceholder height="h-6" width="w-1/3" className="mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, i) => (
                  <div key={`skeleton-outfit-${i}`} className="glass-card overflow-hidden">
                    <SkeletonPlaceholder height="h-64" rounded="rounded-t-xl rounded-b-none" />
                    <div className="p-6 space-y-4">
                      <SkeletonPlaceholder height="h-6" width="w-3/4" />
                      <SkeletonPlaceholder height="h-4" width="w-full" />
                      <SkeletonPlaceholder height="h-4" width="w-5/6" />
                      <SkeletonPlaceholder height="h-10" width="w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If we have an error, show error message
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] py-12 flex items-center justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-md">
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 text-red-500 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Oeps! Er is iets misgegaan
              </h2>
              <p className="text-white/80 mb-6">
                {error}
              </p>
              <button 
                className="bg-[#FF8600] hover:bg-[#E67700] text-white font-medium py-2 px-6 rounded-full transition-colors"
                onClick={() => navigate("/")}
              >
                Terug naar home
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // If we don't have recommendations, show loader
  if (!recommendations || !recommendations.outfits || recommendations.outfits.length === 0) {
    return (
      <>
        <Navbar />
        <ResultsLoader message="We genereren je persoonlijke stijlaanbevelingen. Dit kan een moment duren..." />
      </>
    );
  }

  // Get user info from recommendations or use safe fallback
  const userProfile = recommendations.userProfile ? getSafeUser(recommendations.userProfile) : getSafeUser();
  
  // Render the results page with outfits
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#0D1B2A] to-[#1B263B] py-12 pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header with user greeting */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-3">
              Jouw persoonlijke stijlaanbevelingen
            </h1>
            <p className="text-xl text-white/80">
              Hallo {userProfile.name || 'daar'}! Deze outfits zijn speciaal voor jou samengesteld.
            </p>
          </div>
          
          {/* Outfits section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Complete outfits voor jou</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.outfits.map((outfit) => (
                <FadeInSection key={outfit.id}>
                  <OutfitCard 
                    outfit={outfit}
                    user={userProfile}
                  />
                </FadeInSection>
              ))}
            </div>
          </div>
          
          {/* Individual products section (if available) */}
          {recommendations.products && recommendations.products.length > 0 && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6">Individuele items voor jou</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recommendations.products.slice(0, 8).map((product) => (
                  <FadeInSection key={product.id}>
                    <div className="glass-card overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300">
                      <div className="relative h-48 bg-gray-800">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.png';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-700">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                              <line x1="3" y1="6" x2="21" y2="6"></line>
                              <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs shadow-sm">
                          {getProductSeasonText(product)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-white mb-1 line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-white/70 mb-3 line-clamp-2">
                          {product.description || `${product.brand || 'Merk'} - ${product.type || 'Item'}`}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white">€{product.price?.toFixed(2) || '0.00'}</span>
                          <button 
                            className="bg-[#FF8600] hover:bg-[#E67700] text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center transition-colors"
                            onClick={() => window.open(product.affiliateUrl || '#', '_blank', 'noopener,noreferrer')}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                              <line x1="3" y1="6" x2="21" y2="6"></line>
                              <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            Bekijk
                          </button>
                        </div>
                      </div>
                    </div>
                  </FadeInSection>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Sticky CTA footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D1B2A]/90 backdrop-blur-md border-t border-white/10 py-4 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-white/80 text-sm hidden md:block">
              Wat vind je van deze aanbevelingen?
            </div>
            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                className="bg-transparent border border-white/30 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-full transition-colors flex items-center flex-1 sm:flex-none justify-center"
                onClick={() => {
                  // Implement feedback functionality
                  alert("Bedankt voor je feedback!");
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
                Feedback geven
              </button>
              <button
                className="bg-[#FF8600] hover:bg-[#E67700] text-white font-medium py-2 px-4 rounded-full transition-colors flex items-center flex-1 sm:flex-none justify-center"
                onClick={() => navigate("/onboarding")}
              >
                Nieuwe stijlscan
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnhancedResultsPage;