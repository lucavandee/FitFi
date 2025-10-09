import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles,
  Heart,
  Shirt,
  ArrowRight,
  RefreshCw,
  Settings,
  TrendingUp,
  Award
} from "lucide-react";
import Button from "@/components/ui/Button";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { generateMockOutfits } from "@/utils/mockOutfits";
import SavedOutfitsGallery from "@/components/dashboard/SavedOutfitsGallery";
import { supabase } from "@/lib/supabaseClient";

function readJson<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}

export default function DashboardPage() {
  const [favCount, setFavCount] = React.useState(0);
  const [userId, setUserId] = React.useState<string | undefined>();

  React.useEffect(() => {
    const client = supabase();
    if (client) {
      client.auth.getUser().then(({ data }) => {
        setUserId(data?.user?.id);
      });
    }
  }, []);

  const ts = React.useMemo(() => {
    try { const raw = localStorage.getItem(LS_KEYS.RESULTS_TS); return raw ? parseInt(raw, 10) : null; } catch { return null; }
  }, []);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE);

  const hasQuizData = React.useMemo(() => {
    return !!(archetype || color);
  }, [archetype, color]);

  const outfitCount = React.useMemo(() => {
    if (!hasQuizData) return 0;
    return generateMockOutfits(6).length;
  }, [hasQuizData]);

  const outfits = React.useMemo(() => {
    if (!hasQuizData) return [];
    return generateMockOutfits(6).slice(0, 1);
  }, [hasQuizData]);

  React.useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]") as string[];
      setFavCount(favs.length);
    } catch {
      setFavCount(0);
    }
  }, []);

  const last = ts ? new Date(ts) : null;
  const lastText = last ? last.toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" }) : "06 okt 2025";

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "Goedenacht";
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <Helmet>
        <title>Dashboard - FitFi</title>
        <meta name="description" content="Jouw persoonlijke style dashboard met outfits, favorieten en styling tips." />
      </Helmet>

      {/* Hero Section - Clean beige background */}
      <section className="hero-wrap">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto text-center">
            {/* Eyebrow */}
            <div className="accent-chip hero-chip inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">JOUW STYLE DASHBOARD</span>
            </div>

            {/* Headline */}
            <h1 className="hero-title mb-4">
              {greeting},
            </h1>

            {/* Subtitle */}
            <p className="hero-lead mx-auto mb-8">
              {hasQuizData
                ? `Je Style Report is klaar met ${outfitCount} gepersonaliseerde outfits`
                : "Start de quiz om je persoonlijke style report te ontdekken"
              }
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              {hasQuizData ? (
                <>
                  <Button
                    as={NavLink}
                    to="/results"
                    variant="primary"
                    size="lg"
                  >
                    Bekijk resultaten
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    as={NavLink}
                    to="/onboarding"
                    variant="secondary"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 w-4 h-4" />
                    Opnieuw doen
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    as={NavLink}
                    to="/onboarding"
                    variant="primary"
                    size="lg"
                  >
                    Start stijlquiz
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button
                    as={NavLink}
                    to="/hoe-het-werkt"
                    variant="secondary"
                    size="lg"
                  >
                    Hoe werkt het?
                  </Button>
                </>
              )}
            </div>

            {/* Last Updated */}
            <p className="text-sm text-[var(--color-muted)]">
              Laatst bijgewerkt: {lastText}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="ff-section">
        <div className="ff-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Outfits */}
            <article className="card card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="icon-chip">
                  <Shirt className="w-4 h-4" />
                </div>
                <div className="text-4xl font-bold text-[var(--color-text)]">{outfitCount}</div>
              </div>
              <h3 className="card-title mb-1">Outfits</h3>
              <p className="card-text text-sm">Gepersonaliseerd voor jou</p>
            </article>

            {/* Favorites */}
            <article className="card card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="icon-chip">
                  <Heart className="w-4 h-4" />
                </div>
                <div className="text-4xl font-bold text-[var(--color-text)]">{favCount}</div>
              </div>
              <h3 className="card-title mb-1">Favorieten</h3>
              <p className="card-text text-sm">Je saved looks</p>
            </article>

            {/* Profile Complete */}
            <article className="card card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="icon-chip">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-4xl font-bold text-[var(--color-text)]">
                  {hasQuizData ? "100" : "0"}%
                </div>
              </div>
              <h3 className="card-title mb-1">Profiel compleet</h3>
              <p className="card-text text-sm">
                {hasQuizData ? "Helemaal klaar!" : "Start de quiz"}
              </p>
            </article>
          </div>

          {/* Saved Outfits Gallery */}
          {userId && (
            <div className="mb-12">
              <SavedOutfitsGallery userId={userId} />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Featured Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured Outfit or Empty State */}
              {hasQuizData && outfits.length > 0 ? (
                <article className="card">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="section-title mb-1">Je laatste outfit</h2>
                      <p className="card-text">Speciaal voor jou samengesteld</p>
                    </div>
                    <Award className="w-6 h-6 text-[var(--color-text)]" />
                  </div>

                  {/* Outfit Products Grid */}
                  <div className="bg-[var(--color-bg)] rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-3 gap-4">
                      {outfits[0].products.slice(0, 3).map((product, idx) => (
                        <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden border border-[var(--color-border)]">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="card-title mb-1">{outfits[0].title}</h3>
                      <p className="card-text text-sm">{outfits[0].description}</p>
                    </div>
                    <Button as={NavLink} to="/results" variant="primary">
                      Bekijk alles
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </article>
              ) : (
                <article className="card text-center py-12">
                  <div className="icon-chip mx-auto mb-4" style={{ width: "3rem", height: "3rem" }}>
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="section-title mb-3">Ontdek je stijl</h3>
                  <p className="card-text mb-6 max-w-md mx-auto">
                    Voltooi de stijlquiz en ontvang gepersonaliseerde outfit aanbevelingen die perfect bij jou passen.
                  </p>
                  <Button as={NavLink} to="/onboarding" variant="primary" size="lg">
                    Start stijlquiz
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </article>
              )}

              {/* Profile Info */}
              {hasQuizData && (
                <article className="card">
                  <h3 className="section-title mb-4">Jouw Stijlprofiel</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[var(--color-bg)] rounded-lg p-4 border border-[var(--color-border)]">
                      <p className="text-sm text-[var(--color-muted)] mb-2">Archetype</p>
                      <p className="card-title">{archetype || "Niet ingesteld"}</p>
                    </div>
                    <div className="bg-[var(--color-bg)] rounded-lg p-4 border border-[var(--color-border)]">
                      <p className="text-sm text-[var(--color-muted)] mb-2">Kleurpalet</p>
                      <p className="card-title">{color?.paletteName || "Niet ingesteld"}</p>
                    </div>
                  </div>

                  {color?.season && (
                    <div className="mt-4 bg-[var(--color-bg)] rounded-lg p-4 border border-[var(--color-border)]">
                      <p className="text-sm text-[var(--color-muted)] mb-1">Seizoen</p>
                      <p className="card-title capitalize">{color.season}</p>
                    </div>
                  )}
                </article>
              )}
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <article className="card">
                <h3 className="card-title mb-4">Snelle acties</h3>
                <div className="space-y-3">
                  <Button
                    as={NavLink}
                    to="/results"
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    <Shirt className="mr-3 w-4 h-4" />
                    Bekijk outfits
                  </Button>
                  <Button
                    as={NavLink}
                    to="/onboarding"
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    <RefreshCw className="mr-3 w-4 h-4" />
                    Quiz opnieuw doen
                  </Button>
                  <Button
                    as={NavLink}
                    to="/prijzen"
                    variant="ghost"
                    className="w-full justify-start text-left"
                  >
                    <Settings className="mr-3 w-4 h-4" />
                    Upgrade
                  </Button>
                </div>
              </article>

              {/* Support */}
              <article className="card">
                <h3 className="card-title mb-4">Hulp nodig?</h3>
                <div className="space-y-3">
                  <Button
                    as={NavLink}
                    to="/veelgestelde-vragen"
                    variant="ghost"
                    className="w-full justify-start text-left text-sm"
                  >
                    Veelgestelde vragen
                  </Button>
                  <Button
                    as={NavLink}
                    to="/contact"
                    variant="ghost"
                    className="w-full justify-start text-left text-sm"
                  >
                    Contact opnemen
                  </Button>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
