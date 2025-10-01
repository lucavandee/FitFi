// /src/pages/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Trophy, Users, Target, SlidersHorizontal } from "lucide-react";

import ErrorBoundary from "@/components/system/ErrorBoundary";
import SafeWidget from "@/components/dashboard/SafeWidget";
import FeaturedOutfitCard from "@/components/dashboard/FeaturedOutfitCard";
import GamificationPanel from "@/components/dashboard/GamificationPanel";
import ChallengeSnapshot from "@/components/dashboard/ChallengeSnapshot";
import NovaInsightCard from "@/components/dashboard/NovaInsightCard";
import ReferralCard from "@/components/dashboard/ReferralCard";
import NotificationsMini from "@/components/notifications/NotificationsMini";
import NBAQuickActions from "@/components/dashboard/NBAQuickActions";
import StickyBottomBar from "@/components/dashboard/StickyBottomBar";

import { useUser } from "@/context/UserContext";
import { useNotifications } from "@/hooks/useNotifications";
import { urls } from "@/utils/urls";

type Density = "comfort" | "compact";

const DashboardPage: React.FC = () => {
  const {
    user,
    userStats,
    userStreak,
    featuredOutfit,
    nbaContext,
    handleClaimDaily,
    loading: statsLoading,
    streakLoading,
  } = useUser();
  const { notifications, loading: notificationsLoading } = useNotifications();

  // (1) Weergave-voorkeuren Dashboard (persist)
  const [density, setDensity] = useState<Density>(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("ff_dash_density") : null;
    return (saved as Density) || "comfort";
  });
  useEffect(() => {
    try {
      window.localStorage.setItem("ff_dash_density", density);
    } catch {}
  }, [density]);

  const cardPad = density === "compact" ? "p-4" : "p-6";
  const gapMain = density === "compact" ? "gap-6" : "gap-8";
  const cardClassBase =
    "rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)]";
  const cardClass = `${cardClassBase} ${cardPad}`;

  const quickLinkClass =
    "rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] text-center group transition-all hover:shadow-md hover:transform hover:scale-105";

  const headerToolbar = useMemo(
    () => (
      <div className="mt-2 flex items-center gap-3">
        <div className="inline-flex items-center gap-2 text-[var(--color-text)]/70">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm">Weergave</span>
        </div>
        <button
          type="button"
          onClick={() => setDensity("comfort")}
          aria-pressed={density === "comfort"}
          className={`px-3 py-1.5 rounded-xl border border-[var(--color-border)] ${
            density === "comfort" ? "ring-2 ring-[var(--color-primary)]" : ""
          }`}
        >
          Comfort
        </button>
        <button
          type="button"
          onClick={() => setDensity("compact")}
          aria-pressed={density === "compact"}
          className={`px-3 py-1.5 rounded-xl border border-[var(--color-border)] ${
            density === "compact" ? "ring-2 ring-[var(--color-primary)]" : ""
          }`}
        >
          Compact
        </button>
      </div>
    ),
    [density]
  );

  return (
    <main>
      <div className={`container mx-auto px-4 md:px-6 py-8`}>
        {/* Header */}
        <ErrorBoundary>
          <div className="mb-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)]">
              Welkom terug, {user?.first_name || "Stylish"}
            </h1>
            <p className="text-[var(--color-text)]/70">Je persoonlijke hub voor outfits, levels en community.</p>
            {headerToolbar}
          </div>
        </ErrorBoundary>

        {/* Dashboard Grid */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 ${gapMain}`}>
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Quick Actions */}
            <ErrorBoundary>
              <SafeWidget name="Quick Actions">
                <div className={cardClass}>
                  <h2 className="text-xl font-medium text-[var(--color-text)] mb-4 md:mb-6">Aanbevolen acties</h2>
                  <NBAQuickActions ctx={nbaContext} />
                </div>
              </SafeWidget>
            </ErrorBoundary>

            {/* Featured Outfit */}
            <ErrorBoundary>
              <SafeWidget name="Featured Outfit">
                <FeaturedOutfitCard outfit={featuredOutfit} loading={false} />
              </SafeWidget>
            </ErrorBoundary>

            {/* Challenge Snapshot */}
            <ErrorBoundary>
              <SafeWidget name="Challenge Snapshot">
                <div className={cardClass}>
                  <ChallengeSnapshot />
                </div>
              </SafeWidget>
            </ErrorBoundary>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ErrorBoundary>
              <SafeWidget name="Gamification Panel">
                <div className={cardClass}>
                  <GamificationPanel
                    level={userStats?.level}
                    xp={userStats?.xp}
                    streak={userStreak?.current_streak}
                    loading={statsLoading || streakLoading}
                  />
                </div>
              </SafeWidget>
            </ErrorBoundary>

            <ErrorBoundary>
              <SafeWidget name="Nova Insight">
                <div className={cardClass}>
                  <NovaInsightCard
                    text="Je stijl evolueert naar meer verfijnde keuzes. Probeer eens een statement accessoire!"
                    loading={false}
                  />
                </div>
              </SafeWidget>
            </ErrorBoundary>

            <ErrorBoundary>
              <SafeWidget name="Referral Card">
                <div className={cardClass}>
                  <ReferralCard codeUrl={urls.buildReferralUrl(user.id)} count={user?.referrals?.length || 0} goal={3} />
                </div>
              </SafeWidget>
            </ErrorBoundary>

            <ErrorBoundary>
              <SafeWidget name="Notifications">
                <div className={cardClass}>
                  <NotificationsMini items={notifications} loading={notificationsLoading} />
                </div>
              </SafeWidget>
            </ErrorBoundary>
          </div>
        </div>

        {/* Quick Links */}
        <ErrorBoundary>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/outfits", label: "Outfits", icon: <TrendingUp size={20} /> },
              { href: "/gamification", label: "Levels", icon: <Trophy size={20} /> },
              { href: "/tribes", label: "Tribes", icon: <Users size={20} /> },
              { href: "/quiz", label: "Quiz", icon: <Target size={20} /> },
            ].map((link) => (
              <Link key={link.href} to={link.href} className={`${quickLinkClass} ${cardPad} group`}>
                <div className="w-12 h-12 bg-[var(--overlay-accent-08a)] text-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {link.icon}
                </div>
                <span className="font-medium text-[var(--color-text)]">{link.label}</span>
              </Link>
            ))}
          </div>
        </ErrorBoundary>
      </div>

      <StickyBottomBar onClaimDaily={handleClaimDaily} userId={user.id} />
    </main>
  );
};

export default DashboardPage;