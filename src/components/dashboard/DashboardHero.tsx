import React from "react";
import { Sparkles, Calendar, Activity } from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardHeroProps {
  greeting: string;
  userName: string;
  outfitCount: number;
  favCount: number;
  streakDays: number;
  hasQuizData: boolean;
}

export const DashboardHero: React.FC<DashboardHeroProps> = ({
  greeting,
  userName,
  outfitCount,
  favCount,
  streakDays,
  hasQuizData
}) => {
  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--ff-color-primary-50)] via-[var(--color-bg)] to-[var(--ff-color-accent-50)] opacity-60"></div>

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--ff-color-primary-200)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--ff-color-accent-200)] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="ff-container relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1 fade-in-up">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-[var(--color-surface)]/80 backdrop-blur-xl rounded-full text-sm font-bold text-[var(--ff-color-primary-700)] mb-6 shadow-lg border border-[var(--color-border)] hover-lift">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                JOUW STYLE DASHBOARD
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-4 leading-tight">
                {greeting},{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] bg-clip-text text-transparent">
                    {userName || "daar"}
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] rounded-full opacity-60"></div>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-[var(--color-text-muted)] mb-8 max-w-2xl leading-relaxed">
                {hasQuizData
                  ? "Jouw stijlreis in één overzicht"
                  : "Start je stijlreis met onze slimme quiz"}
              </p>

              {!hasQuizData && (
                <Link
                  to="/onboarding"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] text-white text-lg font-bold rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
                >
                  <Sparkles className="w-6 h-6" />
                  Start gratis stijlquiz
                </Link>
              )}
            </div>

            <div className="lg:flex-shrink-0 fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="grid grid-cols-2 gap-6 lg:gap-8">
                <StatCard
                  icon={<Sparkles className="w-8 h-8" />}
                  value={outfitCount}
                  label="Outfits"
                  gradient="from-purple-500 to-pink-500"
                />
                <StatCard
                  icon={<Calendar className="w-8 h-8" />}
                  value={favCount}
                  label="Favorieten"
                  gradient="from-blue-500 to-cyan-500"
                />
                <div className="col-span-2">
                  <StatCard
                    icon={<Activity className="w-8 h-8" />}
                    value={streakDays}
                    label="Dagen streak"
                    gradient="from-orange-500 to-red-500"
                    large
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  gradient: string;
  large?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, gradient, large }) => (
  <div className={`group relative overflow-hidden ${large ? 'p-8' : 'p-6'} bg-white/90 dark:bg-[var(--color-surface)]/90 backdrop-blur-xl rounded-2xl border border-[var(--color-border)] shadow-xl hover:shadow-2xl transition-all duration-300 hover-lift`}>
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

    <div className="relative z-10 flex flex-col items-center text-center">
      <div className={`mb-4 p-4 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className={`${large ? 'text-5xl' : 'text-4xl'} font-black text-[var(--color-text)] mb-2 tabular-nums`}>
        {value}
      </div>
      <div className={`${large ? 'text-base' : 'text-sm'} font-bold text-[var(--color-text-muted)] uppercase tracking-wider`}>
        {label}
      </div>
    </div>
  </div>
);
