import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getFeed } from '@/services/DataRouter';
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
  const [items, setItems] = useState<FeedOutfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(9); // Start with 9 items
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());
  const [dislikedIds, setDislikedIds] = React.useState<Set<string>>(new Set());
  const sentinelRef = useRef<HTMLDivElement|null>(null);
  const busyRef = useRef(false);
  
  const PAGE_SIZE = 9;

  // Filter visible outfits (exclude disliked) - memoized for performance
  const visibleOutfits = React.useMemo(
    () => (items ?? []).filter(o => o?.id && !dislikedIds.has(o.id)),
    [items, dislikedIds]
  );
  
  // Paginated outfits for performance
  const paginatedOutfits = React.useMemo(
    () => visibleOutfits.slice(0, visibleCount),
    [visibleOutfits, visibleCount]
  );
  
  const hasMoreToShow = visibleCount < visibleOutfits.length;

  // Initialize saved/disliked state from localStorage
  React.useEffect(() => {
    const initialSaved = new Set<string>();
    const initialDisliked = new Set<string>();
    
    // Read from localStorage to initialize state
    items.forEach(item => {
      if (item?.id) {
        if (isDisliked(item.id)) {
          initialDisliked.add(item.id);
        }
        // Note: isSaved would need to be implemented in engagement service
      }
    });
    
    setDislikedIds(initialDisliked);
  }, [items]);

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
    const similarOutfits = getSimilarOutfits(items, outfit, 6);
    
    if (similarOutfits.length > 0) {
      // Add similar outfits to the end of the current items
      setItems(currentItems => {
        const existingIds = new Set(currentItems.map(item => item.id));
        const newItems = similarOutfits.filter(item => !existingIds.has(item.id));
        return [...currentItems, ...newItems];
      });
    }
    
    toast.success('Meer zoals dit toegevoegd aan je feed');
  };

  useEffect(() => {
    // Load feed for everyone (guests and users)
    (async () => {
      const data = await getFeed({ count: 36 }); // Load more data but show paginated
      setItems(data);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
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
  }, []);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  // Show loading skeletons
  if (loading) {
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
        {paginatedOutfits.map((outfit, index) => (
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
      
      {/* Load More Button */}
      {hasMoreToShow && !loading && (
        <div className="text-center py-8">
          <Button 
            onClick={handleLoadMore}
            variant="outline"
            className="border-[#89CFF0] text-[#89CFF0] hover:bg-[#89CFF0] hover:text-white"
          >
            Meer laden ({visibleOutfits.length - visibleCount} outfits)
          </Button>
        </div>
      )}
      
      {paginatedOutfits.length === 0 && !loading && (
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
      
      <div ref={sentinelRef} className="h-14" />
    </div>
  );
}