import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Sparkles, Heart, Shirt, RefreshCw, Settings, Camera, TrendingUp, Target } from "lucide-react";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { supabase } from "@/lib/supabaseClient";
import { useOutfits } from "@/hooks/useOutfits";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { generateAmbientInsights } from "@/services/nova/ambientInsights";
import { dismissInsight, getDismissedInsights, filterDismissedInsights } from "@/services/nova/dismissedInsightsService";
import {
  BentoGrid,
  BentoStatCard
} from "@/components/dashboard/BentoGrid";
import {
  QuickInsightsWidget,
  PhotoUploadWidget,
  StyleProfileWidget,
  QuickActionsWidget,
  GamificationWidget,
  RecentOutfitsWidget,
  EmptyStateWidget
} from "@/components/dashboard/CleanDashboardWidgets";
import { EnhancedFAB } from "@/components/ui/EnhancedFAB";
import toast from "react-hot-toast";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (e) {
    return null;
  }
}

/**
 * Clean Dashboard Page
 *
 * Premium Bento Grid layout inspired by Linear, Notion, Arc
 *
 * Performance Optimizations:
 * - No PullToRefresh wrapper (interfered with native scroll)
 * - Animations disabled on mobile (<768px)
 * - will-change + contain CSS on grid
 * - Reduced container nesting
 * - Loading="lazy" on images
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = React.useState<string | undefined>();
  const [userName, setUserName] = React.useState<string>("");
  const [favCount, setFavCount] = React.useState(0);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE);
  const hasQuizData = !!(archetype || color);

  const { data: outfitsData, loading: outfitsLoading } = useOutfits({
    archetype: archetype?.name,
    limit: 6,
    enabled: hasQuizData
  });

  // Get user
  React.useEffect(() => {
    const client = supabase();
    if (client) {
      client.auth.getUser().then(({ data }) => {
        setUserId(data?.user?.id);
        const email = data?.user?.email || "";
        const name = email.split("@")[0];
        setUserName(name.charAt(0).toUpperCase() + name.slice(1));
      }).catch(err => {
        console.warn('[Dashboard] Failed to get user:', err);
      });
    }
  }, []);

  // Get favorites count
  React.useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]") as string[];
      setFavCount(Array.isArray(favs) ? favs.length : 0);
    } catch {
      setFavCount(0);
    }
  }, []);

  // Greeting
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "Goedenacht";
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  }, []);

  // Color palette
  const colorPalette = React.useMemo(() => {
    if (!color?.palette || !Array.isArray(color.palette)) return [];
    return color.palette.slice(0, 6);
  }, [color]);

  // Nova insights
  const { data: dismissedHashes } = useQuery({
    queryKey: ['dismissedInsights', userId],
    queryFn: () => getDismissedInsights(userId!),
    enabled: !!userId,
    staleTime: 60000
  });

  const rawInsights = React.useMemo(() => {
    const insights = generateAmbientInsights({
      hasQuizData,
      outfitCount: outfitsData?.length || 0,
      favCount,
      archetype: archetype?.name,
      colorPalette,
      photoAnalyzed: false
    });
    return insights || [];
  }, [hasQuizData, outfitsData?.length, favCount, archetype, colorPalette]);

  const novaInsights = React.useMemo(() => {
    if (!dismissedHashes) return rawInsights;
    return filterDismissedInsights(rawInsights, dismissedHashes);
  }, [rawInsights, dismissedHashes]);

  const handleDismissInsight = React.useCallback(async (
    type: any,
    insight: string
  ) => {
    if (!userId) return;
    const success = await dismissInsight(userId, type, insight, 7);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['dismissedInsights', userId] });
      toast.success('Inzicht verborgen voor 7 dagen');
    }
  }, [userId, queryClient]);

  // Quick actions
  const quickActions = [
    {
      icon: Sparkles,
      label: 'Nieuwe outfits',
      description: 'Bekijk je matches',
      href: '/results'
    },
    {
      icon: Camera,
      label: 'Upload foto',
      description: 'Krijg AI advies',
      href: '/onboarding?step=photo'
    },
    {
      icon: TrendingUp,
      label: 'Progress',
      description: 'Bekijk statistieken',
      href: '/dashboard?tab=stats'
    },
    {
      icon: Settings,
      label: 'Instellingen',
      description: 'Pas profiel aan',
      href: '/profile'
    }
  ];

  // Mock gamification data (replace with real hook later)
  const gamificationData = {
    level: 3,
    xp: 420,
    xpToNextLevel: 500,
    streak: 7
  };

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Dashboard - FitFi</title>
        <meta name="description" content="Jouw style dashboard met outfits, favorieten en styling tips." />
      </Helmet>

      {/* Compact Header */}
      <div className="py-8 sm:py-12 bg-[var(--color-bg)]">
        <div className="ff-container">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm text-[var(--color-muted)] mb-2">
              {greeting}
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text)]">
              {userName || "Dashboard"}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content - Simplified nesting for scroll performance */}
      <div className="ff-container pb-24">
        <div className="max-w-7xl mx-auto">
          {!hasQuizData ? (
            // Empty state
            <BentoGrid>
              <EmptyStateWidget />
            </BentoGrid>
          ) : (
            // Bento Grid with widgets (animations disabled on mobile)
            <BentoGrid>
              {/* Stats - no animations for instant load */}
              <BentoStatCard
                icon={<Shirt className="w-5 h-5" />}
                label="Outfits"
                value={outfitsData?.length || 0}
                trend={{ value: 12, isPositive: true }}
                disableAnimation
              />

              <BentoStatCard
                icon={<Heart className="w-5 h-5" />}
                label="Favorieten"
                value={favCount}
                trend={{ value: 8, isPositive: true }}
                disableAnimation
              />

              <BentoStatCard
                icon={<Target className="w-5 h-5" />}
                label="Profiel"
                value="100%"
                disableAnimation
              />

              {/* Style Profile */}
              {archetype && (
                <StyleProfileWidget
                  archetype={archetype}
                  colorPalette={colorPalette}
                />
              )}

              {/* Nova Insights */}
              {novaInsights.length > 0 && (
                <QuickInsightsWidget
                  insights={novaInsights}
                  onDismiss={handleDismissInsight}
                />
              )}

              {/* Photo Upload */}
              <PhotoUploadWidget />

              {/* Gamification */}
              <GamificationWidget
                level={gamificationData.level}
                xp={gamificationData.xp}
                xpToNextLevel={gamificationData.xpToNextLevel}
                streak={gamificationData.streak}
              />

              {/* Recent Outfits */}
              <RecentOutfitsWidget
                outfitCount={outfitsData?.length || 0}
                featuredImage={outfitsData?.[0]?.image}
              />

              {/* Quick Actions */}
              <QuickActionsWidget actions={quickActions} />
            </BentoGrid>
          )}
        </div>
      </div>

      {/* Enhanced FAB */}
      {hasQuizData && (
        <EnhancedFAB
          actions={[
            {
              icon: RefreshCw,
              label: 'Quiz opnieuw',
              onClick: () => navigate('/onboarding')
            },
            {
              icon: Camera,
              label: 'Upload foto',
              onClick: () => navigate('/onboarding?step=photo')
            },
            {
              icon: Settings,
              label: 'Instellingen',
              onClick: () => navigate('/profile')
            }
          ]}
        />
      )}
    </main>
  );
}
