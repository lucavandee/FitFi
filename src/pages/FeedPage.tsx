import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getFeed } from '@/services/DataRouter';
import { useUser } from '@/context/UserContext';
import { useQuizAnswers } from '@/hooks/useQuizAnswers';
import { isDisliked } from '@/services/engagement';
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
  const sentinelRef = useRef<HTMLDivElement|null>(null);
  const busyRef = useRef(false);

  // Filter visible outfits (exclude disliked)
  const visibleOutfits = React.useMemo(() => 
    items.filter(outfit => !isDisliked(outfit.id)), 
    [items]
  );

  // Insert similar outfits at specific position
  const insertSimilar = (index: number, similarOutfits: any[]) => {
    setItems(currentItems => {
      const before = currentItems.slice(0, index + 1);
      const after = currentItems.slice(index + 1);
      
      // Deduplicate based on ID
      const existingIds = new Set(currentItems.map(item => item.id));
      const newItems = similarOutfits.filter(item => !existingIds.has(item.id));
      
      return [...before, ...newItems, ...after];
    });
  };

  // Dismiss outfit from feed
  const dismissOutfit = (id: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== id));
  };

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
        <p className="text-gray-600">Gepersonaliseerde outfit aanbevelingen op basis van je stijlprofiel</p>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleOutfits.map((outfit, index) => (
          <OutfitCard
            key={outfit.id}
            outfit={{
              ...outfit,
              currentSeasonLabel: outfit.currentSeasonLabel || 'Dit seizoen',
              dominantColorName: outfit.dominantColorName || undefined
            }}
            allOutfits={items}
            onInsertSimilar={(similarItems) => insertSimilar(index, similarItems)}
            onDismiss={dismissOutfit}
          />
        ))}
      </div>
      
      {visibleOutfits.length === 0 && !loading && (
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