import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getFeed } from '@/services/DataRouter';
import { useUser } from '@/context/UserContext';
import { useQuizAnswers } from '@/hooks/useQuizAnswers';
import OutfitCard from '@/components/outfits/OutfitCard';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface EmptyStateProps {
  title: string;
  ctaText: string;
  to: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, ctaText, to }) => {
  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md">
        <div className="w-16 h-16 bg-[#89CFF0]/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 text-[#89CFF0]" />
        </div>
        <h2 className="text-2xl font-light text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Log in en voltooi je stijlquiz om gepersonaliseerde outfit aanbevelingen te zien.
        </p>
        <Button 
          as={Link}
          to={to}
          variant="primary"
          size="lg"
          fullWidth
          icon={<ArrowRight size={20} />}
          iconPosition="right"
          className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
};

type FeedOutfit = Awaited<ReturnType<typeof getFeed>> extends (infer T)[] ? T : never;

export default function FeedPage() {
  const { user, status } = useUser();
  const { isQuizCompleted, isLoading: quizLoading } = useQuizAnswers();
  const [items, setItems] = useState<FeedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [savedOutfits, setSavedOutfits] = useState<Set<string>>(new Set());
  const [dislikedOutfits, setDislikedOutfits] = useState<Set<string>>(new Set());
  const [categoryWeights, setCategoryWeights] = useState<Map<string, number>>(new Map());
  const [brandWeights, setBrandWeights] = useState<Map<string, number>>(new Map());
  const sentinelRef = useRef<HTMLDivElement|null>(null);
  const busyRef = useRef(false);

  // Check if user can access feed
  const canAccessFeed = user && status === 'authenticated' && !quizLoading && isQuizCompleted();

  useEffect(() => {
    if (canAccessFeed) {
      (async () => {
        const data = await getFeed({ count: 18 });
        setItems(data);
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, [canAccessFeed]);

  useEffect(() => {
    if (!canAccessFeed) return;
    
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(async (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !busyRef.current) {
        busyRef.current = true;
        const data = await getFeed({ count: 12 });
        setItems(prev => [...prev, ...data]);
        setPage(p => p+1);
        busyRef.current = false;
      }
    }, { rootMargin: '600px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [canAccessFeed]);

  const handleSave = (outfit: FeedOutfit) => {
    setSavedOutfits(prev => new Set([...prev, outfit.id]));
    toast.success('Outfit opgeslagen!');
    
    // Track save action
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'outfit_save', {
        event_category: 'engagement',
        event_label: outfit.archetype,
        outfit_id: outfit.id
      });
    }
  };

  const handleMoreLikeThis = (outfit: FeedOutfit) => {
    // Extract category and brand from outfit for weighting
    const category = outfit.archetype || 'casual_chic';
    const brand = 'fitfi'; // Mock brand since outfit doesn't have direct brand
    
    // Increase weights for this category/brand
    setCategoryWeights(prev => {
      const newWeights = new Map(prev);
      newWeights.set(category, (newWeights.get(category) || 0) + 1);
      return newWeights;
    });
    
    setBrandWeights(prev => {
      const newWeights = new Map(prev);
      newWeights.set(brand, (newWeights.get(brand) || 0) + 1);
      return newWeights;
    });
    
    // Log feedback to localStorage
    const feedback = {
      type: 'more_like_this',
      outfit_id: outfit.id,
      archetype: outfit.archetype,
      timestamp: Date.now(),
      category,
      brand
    };
    
    const existingFeedback = JSON.parse(localStorage.getItem('fitfi_feedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('fitfi_feedback', JSON.stringify(existingFeedback));
    
    toast.success('We zoeken meer outfits zoals deze voor je!');
    
    // Track positive feedback
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'outfit_like', {
        event_category: 'feedback',
        event_label: outfit.archetype,
        outfit_id: outfit.id
      });
    }
  };

  const handleNotMyStyle = (outfit: FeedOutfit) => {
    // Log negative feedback to localStorage
    const feedback = {
      type: 'not_my_style',
      outfit_id: outfit.id,
      archetype: outfit.archetype,
      timestamp: Date.now()
    };
    
    const existingFeedback = JSON.parse(localStorage.getItem('fitfi_feedback') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('fitfi_feedback', JSON.stringify(existingFeedback));
    
    // Remove from current feed
    setDislikedOutfits(prev => new Set([...prev, outfit.id]));
    setItems(prev => prev.filter(item => item.id !== outfit.id));
    toast.success('Outfit verwijderd uit je feed');
    
    // Track negative feedback
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'outfit_dislike', {
        event_category: 'feedback',
        event_label: outfit.archetype,
        outfit_id: outfit.id
      });
    }
  };

  // Show CTA if user not authenticated or quiz not completed
  if (!user || status !== 'authenticated') {
    return <EmptyState title="Maak eerst je Style Report" ctaText="Inloggen en starten" to="/inloggen" />;
  }

  if (!quizLoading && !isQuizCompleted()) {
    return <EmptyState title="Voltooi eerst je Style Report" ctaText="Start Style Report" to="/onboarding" />;
  }

  // Show loading skeletons
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-light text-[#0D1B2A] mb-2">Jouw Style Feed</h1>
          <p className="text-gray-600">Gepersonaliseerde outfit aanbevelingen</p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl shadow p-4 bg-white animate-pulse">
              <div className="w-full h-64 bg-gray-200 rounded-xl mb-3"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="mt-3 flex gap-2">
                <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
                <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
                <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-light text-[#0D1B2A] mb-2">Jouw Style Feed</h1>
        <p className="text-gray-600">Gepersonaliseerde outfit aanbevelingen op basis van je stijlprofiel</p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items
          .filter(outfit => !dislikedOutfits.has(outfit.id))
          .map((outfit, i) => (
          <OutfitCard
            key={`${outfit.id}-${i}`}
            outfit={{
              ...outfit,
              currentSeasonLabel: outfit.currentSeasonLabel || 'Dit seizoen',
              dominantColorName: outfit.dominantColorName || undefined
            }}
            onSave={handleSave}
            onMoreLikeThis={handleMoreLikeThis}
            onNotMyStyle={handleNotMyStyle}
          />
        ))}
      </div>
      
      {items.filter(outfit => !dislikedOutfits.has(outfit.id)).length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Geen outfits meer
          </h3>
          <p className="text-gray-600 mb-6">
            Je hebt alle beschikbare outfits bekeken. Kom later terug voor nieuwe aanbevelingen!
          </p>
          <Button 
            as={Link}
            to="/dashboard" 
            variant="primary"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
          >
            Terug naar Dashboard
          </Button>
        </div>
      )}
      
      <div ref={sentinelRef} className="h-14" />
    </div>
  );
}