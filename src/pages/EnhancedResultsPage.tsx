import React, { useEffect, useRef, useState } from "react";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import ResultSkeleton from "@/components/system/ResultSkeleton";
import ErrorFallback from "@/components/system/ErrorFallback";
import { openNovaStream, NovaEvent } from "@/services/nova/novaClient";
import OutfitCardPro from "@/components/results/OutfitCardPro";

/**
 * EnhancedResultsPage (polish)
 * - Premium editorial header met sterke typografische hiërarchie
 * - Gracieus fallback pad (redactionele outfits) wanneer Nova/SSE niet actief is
 * - Tokens-first; micro-animaties in polish.css
 */

type ShopLink = { label: string; href: string };
type Outfit = {
  id: string;
  title: string;
  imageUrl?: string;
  items?: { name: string; note?: string }[];
  shop?: ShopLink;
};

type PatchState = { explanation?: string };

const USE_DEV_MOCK =
  import.meta.env.DEV && (import.meta.env.VITE_DEV_MOCK_NOVA ?? "1") === "1";

// Redactionele fallback (veilig, stilistisch consistent)
const FALLBACK: { title: string; sub: string; outfits: Outfit[] } = {
  title: "Onze aanbeveling",
  sub: "We kozen voor een cleane, smart-casual basis: netter denim, witte sneaker en een licht overshirt — minimalistisch, modern en comfortabel.",
  outfits: [
    {
      id: "o1",
      title: "Smart casual (dagelijks)",
      imageUrl: "/images/outfit-fallback.jpg",
      items: [
        { name: "Netter denim", note: "rechte pijp" },
        { name: "Witte sneaker", note: "minimal" },
        { name: "Licht overshirt", note: "koele tint" }
      ],
      shop: { label: "Shop vergelijkbare items", href: "/#" }
    },
    {
      id: "o2",
      title: "Monochrome workday",
      imageUrl: "/images/fallbacks/default.jpg",
      items: [
        { name: "Fijngebreide crew", note: "off-white" },
        { name: "Wolmix pantalon", note: "rechte pijp" },
        { name: "Leren loafer", note: "clean buckle" }
      ],
      shop: { label: "Shop vergelijkbare items", href: "/#" }
    },
    {
      id: "o3",
      title: "Athflow weekend",
      imageUrl: "/images/fallbacks/footwear.jpg",
      items: [
        { name: "Merino zip hoodie" },
        { name: "Tech jogger" },
        { name: "Minimal runner" }
      ],
      shop: { label: "Shop vergelijkbare items", href: "/#" }
    }
  ]
};

function EnhancedResultsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [patch, setPatch] = useState<PatchState>({});
  const abortRef = useRef<AbortController | null>(null);

  const start = async () => {
    setLoading(true);
    setErr(null);
    setPatch({});
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (USE_DEV_MOCK) {
      setTimeout(() => {
        setPatch({
          explanation:
            "Jouw stijlprofiel leunt richting clean en modern. We combineren rustige vlakken en koele tinten voor een kledingkast die meteen klopt en makkelijk te mixen is."
        });
        setLoading(false);
      }, 250);
      return;
    }

    try {
      await openNovaStream(
        {
          mode: "style-report",
          messages: [
            {
              role: "user",
              content:
                "Geef een korte, heldere uitleg (1–2 zinnen) bij een outfit-advies, NL, zonder marketingtaal."
            }
          ]
        },
        {
          onStart: () => {},
          onMeta: () => {},
          onChunk: (e: NovaEvent & { type: "chunk" }) => {
            setPatch((p) => ({ explanation: (p.explanation ?? "") + e.delta }));
          },
          onHeartbeat: () => {},
          onDone: () => setLoading(false),
          onError: (e) => {
            setErr(e.message || "Kon geen verbinding maken met de analyse-service.");
            setLoading(false);
          }
        },
        { signal: abortRef.current.signal }
      );
    } catch (e: any) {
      setErr(e?.message ?? "Onbekende fout");
      setLoading(false);
    }
  };

  useEffect(() => {
    start();
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const explanation = patch.explanation || FALLBACK.sub;

  return (
    <main id="main">
      <Seo
        title="Resultaten — Jouw outfitadvies | FitFi"
        description="Concreet outfitadvies op basis van je profiel. Rustig, persoonlijk en privacy-first."
      />

      {/* Editorial header */}
      <section className="ff-section bg-[var(--color-bg)]">
        <div className="ff-container">
          {loading ? (
            <ResultSkeleton />
          ) : (
            <header
              className="rounded-2xl bg-[var(--color-surface)] shadow-[var(--shadow-soft)] p-6 md:p-8 card-pro"
              aria-live="polite"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="chip">AI Style Report</span>
                {err ? (
                  <span className="chip chip-warn" aria-live="polite">
                    Offline mode
                  </span>
                ) : (
                  <span className="chip chip-ok">Live analyse</span>
                )}
              </div>

              <h1 className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                {FALLBACK.title}
              </h1>
              <p className="mt-3 max-w-3xl text-[var(--color-muted)]">{explanation}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => {}}>Shop deze look</Button>
                <Button variant="secondary" onClick={start}>
                  Nieuwe analyse
                </Button>

                {/* context chips */}
                <div className="flex flex-wrap gap-2 ml-2">
                  <span className="chip">100% rustig</span>
                  <span className="chip">Mix & match</span>
                  <span className="chip">Privacy-first</span>
                </div>
              </div>
            </header>
          )}
        </div>
      </section>

      {/* Outfits grid */}
      <section className="ff-section bg-white">
        <div className="ff-container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FALLBACK.outfits.map((o) => (
              <OutfitCardPro key={o.id} outfit={o} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA-rail */}
      <section className="ff-section bg-[var(--color-bg)]">
        <div className="ff-container flex flex-wrap items-center justify-between gap-4">
          <p className="m-0 text-[var(--color-text)]">
            Meer varianten per silhouet, seizoen en kleurtint?
          </p>
          <a href="/pricing" className="btn btn-primary">
            Ontgrendel premium outfits
          </a>
        </div>
      </section>
    </main>
  );
}

export default EnhancedResultsPage;