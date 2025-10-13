import React from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Bookmark, BookmarkCheck, Share2, Sparkles, RefreshCw, TrendingUp, Award, ArrowRight } from "lucide-react";
import { LS_KEYS, ColorProfile, Archetype } from "@/lib/quiz/types";
import { getSeedOutfits, OutfitSeed } from "@/lib/quiz/seeds";
import { OutfitVisualCompact } from "@/components/outfits/OutfitVisual";

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export default function EnhancedResultsPage() {
  React.useEffect(() => {
    try {
      localStorage.setItem(LS_KEYS.RESULTS_TS, Date.now().toString());
    } catch {}
  }, []);

  const color = readJson<ColorProfile>(LS_KEYS.COLOR_PROFILE);
  const archetype = readJson<Archetype>(LS_KEYS.ARCHETYPE) ?? "Smart Casual";
  const answers = readJson<any>(LS_KEYS.QUIZ_ANSWERS);

  const seeds: OutfitSeed[] = React.useMemo(() => {
    if (color) return getSeedOutfits(color, archetype);
    return getSeedOutfits(
      {
        temperature: "neutraal",
        value: "medium",
        contrast: "laag",
        chroma: "zacht",
        season: "zomer",
        paletteName: "Soft Cool Tonals (neutraal)",
        notes: ["Tonal outfits met zachte texturen.", "Vermijd harde contrasten."],
      },
      "Smart Casual"
    );
  }, [color, archetype]);

  const [favs, setFavs] = React.useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ff_fav_outfits") || "[]");
    } catch {
      return [];
    }
  });

  function toggleFav(id: string) {
    setFavs((curr) => {
      const next = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
      try {
        localStorage.setItem("ff_fav_outfits", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function sharePage() {
    const url = typeof window !== "undefined" ? window.location.href : "https://fitfi.ai/results";
    if (navigator.share) {
      navigator.share({ title: "Mijn FitFi Style Report", url }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  const hasCompletedQuiz = !!answers;

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Helmet>
        <title>Jouw Style Report – FitFi</title>
        <meta name="description" content="Jouw persoonlijke stijlprofiel met outfit-aanbevelingen en kleuradvies." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--ff-color-primary-50)] via-white to-[var(--ff-color-primary-25)] py-24 md:py-32">
        <div className="ff-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-600)] text-white rounded-full text-sm font-bold mb-6">
              <Sparkles className="w-4 h-4" />
              Jouw Style Report
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text)] mb-8 leading-tight">
              {hasCompletedQuiz ? (
                <>
                  Perfect bij
                  <span className="block text-[var(--ff-color-primary-600)]">jouw stijl</span>
                </>
              ) : (
                <>
                  Ontdek jouw
                  <span className="block text-[var(--ff-color-primary-600)]">perfecte stijl</span>
                </>
              )}
            </h1>
            {hasCompletedQuiz ? (
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Op basis van jouw antwoorden hebben we {seeds.length} outfits samengesteld die perfect bij je passen.
              </p>
            ) : (
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                Voltooi eerst de stijlquiz om je persoonlijke outfit-aanbevelingen te ontvangen.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {hasCompletedQuiz ? (
                <>
                  <button
                    onClick={sharePage}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--color-surface)] transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Deel resultaten
                  </button>
                  <NavLink
                    to="/onboarding"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--color-surface)] transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Opnieuw doen
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/onboarding"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Style Quiz
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Style Profile */}
      {hasCompletedQuiz && color && (
        <section className="py-20 bg-[var(--color-surface)]/30">
          <div className="ff-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Jouw <span className="text-[var(--ff-color-primary-600)]">Stijlprofiel</span>
                </h2>
                <p className="text-xl text-gray-600">
                  {color.paletteName}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
                <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Archetype</h3>
                  <p className="text-2xl font-bold text-[var(--ff-color-primary-600)]">{archetype}</p>
                </div>

                <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[var(--ff-color-primary-600)] to-[var(--ff-color-accent-600)] mb-4"></div>
                  <h3 className="text-lg font-bold mb-2">Seizoen</h3>
                  <p className="text-xl font-semibold capitalize">{color.season}</p>
                  <p className="text-sm text-gray-600 mt-1">{color.temperature}</p>
                </div>

                <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Contrast</h3>
                  <p className="text-xl font-semibold capitalize">{color.contrast}</p>
                  <p className="text-sm text-gray-600 mt-1">Lichtheid: {color.value}</p>
                </div>

                <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-6 shadow-[var(--shadow-soft)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--ff-color-primary-100)] flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Chroma</h3>
                  <p className="text-xl font-semibold capitalize">{color.chroma}</p>
                </div>
              </div>

              {/* Style Notes */}
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
                <h3 className="text-xl font-bold mb-4">Styling Tips</h3>
                <ul className="space-y-3">
                  {color.notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--ff-color-primary-600)] flex-shrink-0"></span>
                      <p className="text-gray-600">{note}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Outfit Gallery */}
      {hasCompletedQuiz && (
        <section className="py-20">
          <div className="ff-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Jouw <span className="text-[var(--ff-color-primary-600)]">Outfits</span>
                </h2>
                <p className="text-xl text-gray-600">
                  {seeds.length} looks speciaal voor jou samengesteld
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {seeds.map((outfit) => {
                  const isFavorite = favs.includes(outfit.id);
                  return (
                    <article
                      key={outfit.id}
                      className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-soft)] hover:shadow-xl transition-shadow"
                    >
                      {/* Outfit Visual */}
                      {outfit.pieces && outfit.pieces.length > 0 ? (
                        <OutfitVisualCompact pieces={outfit.pieces} />
                      ) : (
                        <div className="aspect-[3/4] bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] flex items-center justify-center">
                          <Sparkles className="w-16 h-16 text-[var(--ff-color-primary-300)]" />
                        </div>
                      )}

                      {/* Outfit Details */}
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">{outfit.title}</h3>
                            <p className="text-sm text-[var(--ff-color-primary-600)] font-semibold">{outfit.vibe}</p>
                          </div>
                          <button
                            onClick={() => toggleFav(outfit.id)}
                            className={`p-2 rounded-full transition-colors ${
                              isFavorite
                                ? 'bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-600)]'
                                : 'bg-[var(--color-bg)] text-gray-600 hover:bg-[var(--ff-color-primary-50)]'
                            }`}
                            aria-label={isFavorite ? 'Verwijder favoriet' : 'Voeg toe aan favorieten'}
                          >
                            {isFavorite ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{outfit.notes}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Favorites Section */}
      {hasCompletedQuiz && favs.length > 0 && (
        <section className="py-20 bg-[var(--color-surface)]/30">
          <div className="ff-container">
            <div className="max-w-6xl mx-auto">
              <div className="bg-[var(--color-surface)] rounded-[var(--radius-2xl)] border border-[var(--color-border)] p-8 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-3 mb-6">
                  <BookmarkCheck className="w-6 h-6 text-[var(--ff-color-primary-600)]" />
                  <h2 className="text-2xl font-bold">Je favorieten ({favs.length})</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {seeds
                    .filter((o) => favs.includes(o.id))
                    .map((outfit) => (
                      <div
                        key={outfit.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-50)] border border-[var(--ff-color-primary-200)] rounded-full text-sm font-semibold text-[var(--ff-color-primary-600)]"
                      >
                        <BookmarkCheck className="w-4 h-4" />
                        {outfit.title}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="ff-container">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[var(--radius-2xl)] p-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              {hasCompletedQuiz ? (
                <>
                  Klaar voor de <span className="text-[var(--ff-color-primary-600)]">volgende stap</span>?
                </>
              ) : (
                <>
                  Start je <span className="text-[var(--ff-color-primary-600)]">Style Journey</span>
                </>
              )}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {hasCompletedQuiz
                ? 'Ontdek meer personalized features en save je favoriete looks.'
                : 'Beantwoord enkele vragen en ontvang direct je persoonlijke style report.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {hasCompletedQuiz ? (
                <>
                  <NavLink
                    to="/dashboard"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                  >
                    Naar Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </NavLink>
                  <NavLink
                    to="/prijzen"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--color-surface)] transition-colors"
                  >
                    Bekijk Premium
                  </NavLink>
                </>
              ) : (
                <NavLink
                  to="/onboarding"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--ff-color-primary-600)] text-white rounded-[var(--radius-xl)] font-semibold hover:bg-[var(--ff-color-primary-700)] transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Style Quiz
                  <ArrowRight className="w-5 h-5" />
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
