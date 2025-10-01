// /src/pages/DashboardPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Trophy, Users, Target } from "lucide-react";

import ErrorBoundary from "@/components/system/ErrorBoundary";
import SafeWidget from "@/components/dashboard/SafeWidget";
import FeaturedOutfitCard from "@/components/dashboard/FeaturedOutfitCard";
import GamificationPanel from "@/components/dashboard/GamificationPanel";
import ChallengeSnapshot from "@/components/dashboard/ChallengeSnapshot";
import NovaInsightCard from "@/components/dashboard/NovaInsightCard";
import ReferralCard from "@/components/dashboard/ReferralCard";
import NotificationsMini from "@/components/dashboard/NotificationsMini";
import NBAQuickActions from "@/components/dashboard/NBAQuickActions";
import StickyBottomBar from "@/components/dashboard/StickyBottomBar";

import { useUser } from "@/context/UserContext";
import { useNotifications } from "@/hooks/useNotifications";
import { urls } from "@/utils/urls";

const DashboardPage: React.FC = () => {
  const { user, userStats, userStreak, featuredOutfit, nbaContext, handleClaimDaily, loading: statsLoading, streakLoading } =
    useUser();
  const { notifications, loading: notificationsLoading } = useNotifications();

  return (
    <main>
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <ErrorBoundary>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-text)]">Welkom terug, {user?.first_name || "Stylish"}</h1>
            <p className="text-[var(--color-text)]/70">Je persoonlijke hub voor outfits, levels en community.</p>
          </div>
        </ErrorBoundary>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions — tokens-first card i.p.v. plain white */}
            <ErrorBoundary>
              <SafeWidget name="Quick Actions">
                <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
                  <h2 className="text-xl font-medium text-[var(--color-text)] mb-6">Aanbevolen acties</h2>
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
                <ChallengeSnapshot />
              </SafeWidget>
            </ErrorBoundary>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ErrorBoundary>
              <SafeWidget name="Gamification Panel">
                <GamificationPanel
                  level={userStats?.level}
                  xp={userStats?.xp}
                  streak={userStreak?.current_streak}
                  loading={statsLoading || streakLoading}
                />
              </SafeWidget>
            </ErrorBoundary>

            <ErrorBoundary>
              <SafeWidget name="Nova Insight">
                <NovaInsightCard
                  text="Je stijl evolueert naar meer verfijnde keuzes. Probeer eens een statement accessoire!"
                  loading={false}
                />
              </SafeWidget>
            </ErrorBoundary>

            <ErrorBoundary>
              <SafeWidget name="Referral Card">
                <ReferralCard
                  codeUrl={urls.buildReferralUrl(user.id)}
                  count={user?.referrals?.length || 0}
                  goal={3}
                />
              </SafeWidget>
            </ErrorBoundary>

            <ErrorBoundary>
              <SafeWidget name="Notifications">
                <NotificationsMini items={notifications} loading={notificationsLoading} />
              </SafeWidget>
            </ErrorBoundary>
          </div>
        </div>

        {/* Quick Links — rustige taupe badges + kaart-chroming */}
        <ErrorBoundary>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/outfits", label: "Outfits", icon: <TrendingUp size={20} /> },
              { href: "/gamification", label: "Levels", icon: <Trophy size={20} /> },
              { href: "/tribes", label: "Tribes", icon: <Users size={20} /> },
              { href: "/quiz", label: "Quiz", icon: <Target size={20} /> },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] hover:shadow-md transition-all hover:transform hover:scale-105 text-center group"
              >
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