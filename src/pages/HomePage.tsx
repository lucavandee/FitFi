import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button';
import ErrorBoundary from '../components/ErrorBoundary';
import LoadingFallback from '../components/ui/LoadingFallback';

// Import new landing components
import WelcomeHero from '../components/landing/WelcomeHero';
import AIStyleReportLanding from '../components/landing/AIStyleReportLanding';
import OutfitOfTheDayLanding from '../components/landing/OutfitOfTheDayLanding';
import WishlistLanding from '../components/landing/WishlistLanding';
import StyleStatisticsLanding from '../components/landing/StyleStatisticsLanding';
import CommunityChallengeLanding from '../components/landing/CommunityChallengeLanding';
import FeedbackLanding from '../components/landing/FeedbackLanding';
import LandingFooter from '../components/landing/LandingFooter';

// Lazy load components for better performance
const Walkthrough = React.lazy(() => 
  import('../components/walkthrough/Walkthrough').catch(() => ({ default: () => <div>Component niet beschikbaar</div> }))
);
const StyleArchetypeSlider = React.lazy(() => 
  import('../components/home/StyleArchetypeSlider').catch(() => ({ default: () => <div>Component niet beschikbaar</div> }))
);

const HomePage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Track form submission
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'lead_capture', {
        event_category: 'engagement',
        event_label: 'homepage_form',
        name: formData.name,
        email: formData.email
      });
    }
    
    // Navigate to onboarding with pre-filled data
    window.location.href = `/onboarding?name=${encodeURIComponent(formData.name)}&email=${encodeURIComponent(formData.email)}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F6]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 space-y-8">
        
        {/* Premium Landing Content */}
        <ErrorBoundary>
          <React.Suspense fallback={<LoadingFallback message="Nova laden..." />}>
            <div className="space-y-8">
              {/* Welcome Hero Section */}
              <WelcomeHero />
              
              {/* AI Style Report */}
              <AIStyleReportLanding />
              
              {/* Outfit of the Day */}
              <OutfitOfTheDayLanding />
              
              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WishlistLanding />
                <StyleStatisticsLanding />
              </div>
              
              {/* Community Challenge */}
              <CommunityChallengeLanding />
              
              {/* Feedback Section */}
              <FeedbackLanding />
              
              {/* Legacy Components - Lazy Loaded */}
              <Walkthrough />
              <StyleArchetypeSlider />
            </div>
          </React.Suspense>
        </ErrorBoundary>

        {/* Footer */}
        <ErrorBoundary>
          <LandingFooter />
        </ErrorBoundary>
      </div>
      
      {/* Quick Start CTA - Floating */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          as={Link}
          to="/onboarding" 
          variant="primary"
          size="lg"
          icon={<ArrowRight size={20} />}
          iconPosition="right"
          className="bg-[#bfae9f] hover:bg-[#a89a8c] text-white shadow-xl hover:shadow-2xl transition-all rounded-full"
        >
          Start Nova Quiz
        </Button>
      </div>
    </div>
  );
};

export default HomePage;