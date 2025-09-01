import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import supabase from "@/lib/supabase";
import { useUser } from "@/context/UserContext";

export default function DashboardPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    (async () => {
      try {
        const sb = supabase;
        const { data, error } = await sb
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (!error) setProfile(data);
      } catch (err) {
        console.warn("[Dashboard] Profile load failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.id]);

  return (
    <>
      <Helmet>
        <title>Dashboard • FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijl-dashboard met AI-aanbevelingen en outfit matches." />
      </Helmet>
      
      <div className="min-h-screen bg-surface px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-heading font-bold text-ink mb-2">
              Jouw stijl-dashboard
            </h1>
            <p className="text-muted text-lg">
              Ontdek je persoonlijke stijl met AI-powered aanbevelingen
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="ff-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-ink">Outfit matches</h2>
                <div className="w-3 h-3 bg-accent rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-ink mb-1">95%</p>
              <p className="text-sm text-muted">Gemiddelde match score</p>
            </div>

            <div className="ff-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-ink">Stijl-quiz</h2>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-ink mb-1">✓</p>
              <p className="text-sm text-muted">Profiel compleet</p>
            </div>

            <div className="ff-card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-ink">Referral punten</h2>
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-ink mb-1">12</p>
              <p className="text-sm text-muted">Verdiende punten</p>
            </div>
          </div>

          {/* Welcome Card */}
          <div className="ff-card p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-heading font-bold text-ink mb-2">
                  Welkom terug
                </h2>
                <p className="text-muted">
                  Klaar voor nieuwe stijl-ontdekkingen?
                </p>
              </div>
              <div className="hidden md:block w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex-shrink-0"></div>
            </div>

            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-muted rounded-full animate-pulse"></div>
                <p className="text-muted">Gegevens laden...</p>
              </div>
            ) : profile ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center text-white font-bold">
                    {profile.full_name?.charAt(0) || profile.username?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-ink">
                      {profile.full_name || profile.username || "Stijl-liefhebber"}
                    </p>
                    <p className="text-sm text-muted">{user?.email}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-4">
                  <button className="btn btn-primary">
                    Nieuwe outfits ontdekken
                  </button>
                  <button className="btn btn-secondary">
                    Nova AI openen
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted mb-4">Profiel niet gevonden</p>
                <button 
                  onClick={() => navigate("/quiz")}
                  className="btn btn-primary"
                >
                  Stijl-quiz starten
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="ff-card p-6 group cursor-pointer hover:shadow-lg transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white text-xl">
                  ✨
                </div>
                <div>
                  <h3 className="font-semibold text-ink group-hover:text-primary transition-colors">
                    AI Stijl-analyse
                  </h3>
                  <p className="text-sm text-muted">
                    Laat Nova je stijl analyseren
                  </p>
                </div>
              </div>
            </div>

            <div className="ff-card p-6 group cursor-pointer hover:shadow-lg transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center text-white text-xl">
                  👥
                </div>
                <div>
                  <h3 className="font-semibold text-ink group-hover:text-primary transition-colors">
                    Stijl Tribes
                  </h3>
                  <p className="text-sm text-muted">
                    Ontdek communities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}