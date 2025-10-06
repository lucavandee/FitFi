import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Sparkles,
  Heart,
  Shirt,
  ArrowRight,
  Crown,
  RefreshCw,
  Settings,
  LogOut,
  TrendingUp,
  Award,
  Palette
} from "lucide-react";
import Button from "@/components/ui/Button";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { generateMockOutfits } from "@/utils/mockOutfits";

function readJson<T>(key: string): T | null {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}

export default function DashboardPage() {
  const [favCount, setFavCount] = React.useState(0);

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
  const lastText = last ? last.toLocaleDateString("nl-NL", { day: "2-digit", month: "short", year: "numeric" }) : "Nog niet";

  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return "Goedenacht";
    if (hour < 12) return "Goedemorgen";
    if (hour < 18) return "Goedemiddag";
    return "Goedenavond";
  }, []);

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen">
      <Helmet>
        <title>Dashboard - FitFi</title>
        <meta name="description" content="Jouw persoonlijke style dashboard met outfits, favorieten en styling tips." />
      </Helmet>

      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-accent-50)] py-16 md:py-24">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-r from-[var(--ff-color-primary-200)] to-[var(--ff-color-accent-200)] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
          <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-r from-[var(--ff-color-accent-200)] to-[var(--ff-color-secondary-200)] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-[var(--ff-color-secondary-200)] to-[var(--ff-color-primary-200)] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-slow"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-[var(--ff-color-border)] rounded-full shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-[var(--ff-color-primary-600)]" />
              <span className="text-sm font-medium text-[var(--ff-color-text-secondary)]">
                JOUW STYLE DASHBOARD
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--color-text)] mb-4">
              {greeting},{" "}
              <span className="bg-gradient-to-r from-[var(--ff-color-primary-600)] via-[var(--ff-color-accent-600)] to-[var(--ff-color-secondary-600)] bg-clip-text text-transparent">
                stijlvol
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-8">
              {hasQuizData
                ? `Je Style Report is klaar met ${outfitCount} gepersonaliseerde outfits`
                : "Start de quiz om je persoonlijke style report te ontdekken"
              }
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasQuizData ? (
                <>
                  <Button
                    as={NavLink}
                    to="/results"
                    className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Bekijk resultaten
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    as={NavLink}
                    to="/onboarding"
                    variant="ghost"
                    className="border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                  >
                    <RefreshCw className="mr-2 w-5 h-5" />
                    Opnieuw doen
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    as={NavLink}
                    to="/onboarding"
                    className="bg-[var(--ff-color-primary-700)] hover:bg-[var(--ff-color-primary-600)] text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    Start stijlquiz
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    as={NavLink}
                    to="/hoe-het-werkt"
                    variant="ghost"
                    className="border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] px-8 py-4 rounded-xl font-semibold transition-all duration-300"
                  >
                    Hoe werkt het?
                  </Button>
                </>
              )}
            </div>

            {/* Last Updated */}
            <p className="text-sm text-[var(--color-text-muted)] mt-6">
              Laatst bijgewerkt: {lastText}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Outfits Card */}
          <div className="group relative bg-white rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] shadow-lg hover:shadow-xl transition-all duration-300 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--ff-color-primary-100)] to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--ff-color-primary-100)] rounded-xl flex items-center justify-center">
                  <Shirt className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                </div>
                <div className="text-3xl font-bold text-[var(--color-text)]">{outfitCount}</div>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Outfits</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Gepersonaliseerd voor jou</p>
            </div>
          </div>

          {/* Favorites Card */}
          <div className="group relative bg-white rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-accent-300)] shadow-lg hover:shadow-xl transition-all duration-300 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--ff-color-accent-100)] to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--ff-color-accent-100)] rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-[var(--ff-color-accent-600)]" />
                </div>
                <div className="text-3xl font-bold text-[var(--color-text)]">{favCount}</div>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Favorieten</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Je saved looks</p>
            </div>
          </div>

          {/* Style Score Card */}
          <div className="group relative bg-white rounded-[var(--radius-2xl)] border-2 border-[var(--color-border)] hover:border-[var(--ff-color-secondary-300)] shadow-lg hover:shadow-xl transition-all duration-300 p-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[var(--ff-color-secondary-100)] to-transparent rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[var(--ff-color-secondary-100)] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[var(--ff-color-secondary-600)]" />
                </div>
                <div className="text-3xl font-bold text-[var(--color-text)]">{hasQuizData ? "100" : "0"}%</div>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1">Profiel compleet</h3>
              <p className="text-sm text-[var(--color-text-muted)]">
                {hasQuizData ? "Helemaal klaar!" : "Start de quiz"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Featured Outfit */}
          <div className="lg:col-span-2 space-y-6">
            {hasQuizData && outfits.length > 0 ? (
              <div className="bg-white rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text)] mb-1">Je laatste outfit</h2>
                    <p className="text-[var(--color-text-muted)]">Speciaal voor jou samengesteld</p>
                  </div>
                  <Award className="w-8 h-8 text-[var(--ff-color-primary-600)]" />
                </div>

                <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-xl)] p-6 mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {outfits[0].products.slice(0, 4).map((product, idx) => (
                      <div key={idx} className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
                    <h3 className="font-semibold text-[var(--color-text)] mb-1">{outfits[0].title}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{outfits[0].description}</p>
                  </div>
                  <Button as={NavLink} to="/results" variant="primary">
                    Bekijk alles
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] border-2 border-dashed border-[var(--ff-color-primary-300)] p-12 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-10 h-10 text-[var(--ff-color-primary-600)]" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3">Ontdek je stijl</h3>
                <p className="text-[var(--color-text-muted)] mb-6 max-w-md mx-auto">
                  Voltooi de stijlquiz en ontvang gepersonaliseerde outfit aanbevelingen die perfect bij jou passen.
                </p>
                <Button as={NavLink} to="/onboarding" variant="primary" size="lg">
                  Start stijlquiz
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Profile Info */}
            {hasQuizData && (
              <div className="bg-white rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[var(--ff-color-primary-100)] rounded-lg flex items-center justify-center">
                    <Palette className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
                  </div>
                  <h2 className="text-xl font-bold text-[var(--color-text)]">Jouw Stijlprofiel</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[var(--ff-color-bg-subtle)] rounded-[var(--radius-xl)] p-4">
                    <p className="text-sm text-[var(--color-text-muted)] mb-2">Archetype</p>
                    <p className="text-lg font-semibold text-[var(--color-text)]">{archetype || "Niet ingesteld"}</p>
                  </div>
                  <div className="bg-[var(--ff-color-bg-subtle)] rounded-[var(--radius-xl)] p-4">
                    <p className="text-sm text-[var(--color-text-muted)] mb-2">Kleurpalet</p>
                    <p className="text-lg font-semibold text-[var(--color-text)]">{color?.paletteName || "Niet ingesteld"}</p>
                  </div>
                </div>

                {color?.season && (
                  <div className="mt-4 bg-gradient-to-r from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-xl)] p-4">
                    <p className="text-sm text-[var(--color-text-muted)] mb-1">Seizoen</p>
                    <p className="text-lg font-semibold text-[var(--color-text)] capitalize">{color.season}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-lg p-6">
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Snelle acties</h3>
              <div className="space-y-3">
                <Button
                  as={NavLink}
                  to="/results"
                  variant="ghost"
                  className="w-full justify-start text-left border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)] transition-all"
                >
                  <Shirt className="mr-3 w-5 h-5" />
                  Bekijk outfits
                </Button>
                <Button
                  as={NavLink}
                  to="/onboarding"
                  variant="ghost"
                  className="w-full justify-start text-left border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)] transition-all"
                >
                  <RefreshCw className="mr-3 w-5 h-5" />
                  Quiz opnieuw doen
                </Button>
                <Button
                  as={NavLink}
                  to="/profiel"
                  variant="ghost"
                  className="w-full justify-start text-left border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)] transition-all"
                >
                  <Settings className="mr-3 w-5 h-5" />
                  Instellingen
                </Button>
              </div>
            </div>

            {/* Premium Upsell */}
            <div className="relative bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] rounded-[var(--radius-2xl)] shadow-xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

              <div className="relative">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Upgrade naar Premium</h3>
                <p className="text-white/90 text-sm mb-6">
                  Krijg onbeperkte outfits, AI styling tips en seizoensupdates.
                </p>
                <Button
                  as={NavLink}
                  to="/prijzen"
                  className="w-full bg-white text-[var(--ff-color-primary-700)] hover:bg-white/90 font-semibold"
                >
                  Bekijk prijzen
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-lg p-6">
              <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Hulp nodig?</h3>
              <div className="space-y-3">
                <Button
                  as={NavLink}
                  to="/veelgestelde-vragen"
                  variant="ghost"
                  className="w-full justify-start text-left text-sm border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)]"
                >
                  Veelgestelde vragen
                </Button>
                <Button
                  as={NavLink}
                  to="/contact"
                  variant="ghost"
                  className="w-full justify-start text-left text-sm border border-[var(--color-border)] hover:border-[var(--ff-color-primary-300)] hover:bg-[var(--ff-color-primary-50)]"
                >
                  Contact opnemen
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
