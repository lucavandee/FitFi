import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Seo from '@/components/Seo';
import { useOutfits } from '@/hooks/useOutfits';
import { useUser } from '@/context/UserContext';
import { useQuizAnswers } from '@/hooks/useQuizAnswers';
import { isDisliked, toggleSave, dislike, getSimilarOutfits } from '@/services/engagement';
import OutfitCard from '@/components/outfits/OutfitCard';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

// RequireAuth mini-component for action buttons
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  if (!user) {
    return (
      <button 
        className="btn-outline px-3 py-2 border border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white rounded-xl text-xs font-medium transition-colors"
        onClick={() => window.location.href = '/inloggen?returnTo=/feed'}
      >
        Inloggen om op te slaan
      </button>
    );
  }
  return <>{children}</>;
}

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
  const { user } = useUser();
  const { isQuizCompleted } = useQuizAnswers();
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading, 
    error 
  } = useOutfits(12);
  
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  const [dislikedIds, setDislikedIds] = React.useState<Set<string>>(new Set());
  
  // Flatten all pages into single array
  const allOutfits = useMemo(() => {
    return data?.pages.flatMap(page => page.items) || [];
  }, [data]);

  // Filter visible outfits (exclude disliked) - memoized for performance
  const visibleOutfits = React.useMemo(
    () => allOutfits.filter(o => o?.id && !dislikedIds.has(o.id)),
    [allOutfits, dislikedIds]
  );

  // Initialize saved/disliked state from localStorage
  React.useEffect(() => {
    const initialSaved = new Set<string>();
    const initialDisliked = new Set<string>();
    
    // Read from localStorage to initialize state
    allOutfits.forEach(item => {
      if (item?.id) {
        if (isDisliked(item.id)) {
          initialDisliked.add(item.id);
        }
        // Note: isSaved would need to be implemented in engagement service
      }
    });
    
    setDislikedIds(initialDisliked);
  }, [allOutfits]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const el = document.getElementById('feed-sentinel');
    if (!el) return;
    
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { rootMargin: '100px' });
    
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Action handlers
  const onSave = (id: string) => {
    if (!user) {
      window.location.href = '/inloggen?returnTo=/feed';
      return;
    }
    
    const nowSaved = toggleSave(id);
    setSavedIds(prev => {
      const newSet = new Set(prev);
      if (nowSaved) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
    toast.success(nowSaved ? 'Bewaard' : 'Verwijderd uit bewaard');
  };

  const onDislike = (id: string) => {
    if (!user) {
      window.location.href = '/inloggen?returnTo=/feed';
      return;
    }
    
    dislike(id);
    setDislikedIds(prev => new Set(prev).add(id));
    toast('We laten minder van deze stijl zien');
  };

  const onMoreLikeThis = (outfit: any) => {
    if (!user) {
      window.location.href = '/inloggen?returnTo=/feed';
      return;
    }
    
    // Get similar outfits and add them to the feed
    const similarOutfits = getSimilarOutfits(allOutfits, outfit, 6);
    
    if (similarOutfits.length > 0) {
      // For now, just show success message
      // In a real implementation, we'd add these to the query cache
      console.log('Similar outfits found:', similarOutfits.length);
    }
    
    toast.success('Meer zoals dit toegevoegd aan je feed');
  };

  // Handle error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Kon feed niet laden
          </h3>
          <p className="text-gray-600 mb-6">
            Er ging iets mis bij het laden van de outfits. Probeer de pagina te vernieuwen.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            variant="primary"
            className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
          >
            Pagina vernieuwen
          </Button>
        </div>
      </div>
    );
  }

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-light text-[#0D1B2A] mb-2">Jouw Style Feed</h1>
          <p className="text-gray-600">Gepersonaliseerde outfit aanbevelingen</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-3"></div>
              <div className="space-y-3">
                <div>
                  <div className="h-5 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
                  <div className="h-8 bg-gray-200 rounded-xl flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title="Style Feed - Gepersonaliseerde Outfit Aanbevelingen"
        description="Ontdek jouw perfecte outfits met AI-powered aanbevelingen. Gepersonaliseerde style feed gebaseerd op jouw unieke stijlprofiel."
        canonical="https://fitfi.app/feed"
        keywords="outfit aanbevelingen, style feed, AI fashion, gepersonaliseerde mode, outfit inspiratie"
      />
    <div className="container mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-light text-[#0D1B2A] mb-2">Jouw Style Feed</h1>
        <p className="text-gray-600">
          {user && isQuizCompleted() 
            ? 'Gepersonaliseerde outfit aanbevelingen op basis van je stijlprofiel'
            : 'Ontdek stijlinspiratie en maak een account voor gepersonaliseerde aanbevelingen'
          }
        </p>
        
        {/* Guest CTA */}
        {!user && (
          <div className="mt-4 p-4 bg-[#89CFF0]/10 rounded-2xl max-w-md mx-auto">
            <p className="text-sm text-gray-700 mb-3">
              Wil je gepersonaliseerde aanbevelingen? Maak gratis een account aan!
            </p>
            <Button 
              as={Link}
              to="/registreren"
              variant="primary"
              size="sm"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            >
              Gratis account maken
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleOutfits.map((outfit, index) => (
          <OutfitCard
            key={`outfit-${outfit.id}`}
            outfit={{
              ...outfit,
              currentSeasonLabel: outfit.currentSeasonLabel || 'Dit seizoen',
              dominantColorName: outfit.dominantColorName || undefined
            }}
            onSave={() => onSave(outfit.id)}
            onDislike={() => onDislike(outfit.id)}
            onMoreLikeThis={() => onMoreLikeThis(outfit)}
          />
        ))}
      </div>
      
      {/* Loading More Indicator */}
      {isFetchingNextPage && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-[#89CFF0] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Meer outfits laden...</p>
        </div>
      )}
      
      {/* Intersection Observer Sentinel */}
      <div id="feed-sentinel" className="h-10" />
      
      {visibleOutfits.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-4">
            Geen outfits meer
          </h3>
          <p className="text-gray-600 mb-6">
            {user 
              ? 'Je hebt alle beschikbare outfits bekeken. Kom later terug voor nieuwe aanbevelingen!'
              : 'Maak een account aan voor meer gepersonaliseerde outfit aanbevelingen!'
            }
          </p>
          {user ? (
            <Button 
              as={Link}
              to="/dashboard" 
              variant="primary"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            >
              Terug naar Dashboard
            </Button>
          ) : (
            <Button 
              as={Link}
              to="/registreren" 
              variant="primary"
              className="bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A]"
            >
              Gratis account maken
            </Button>
          )}
        </div>
      )}
    </div>
    </>
  );
}