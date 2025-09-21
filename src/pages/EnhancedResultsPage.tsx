import React, { useEffect, useRef, useState } from "react";
import Seo from "@/components/Seo";
import Button from "@/components/ui/Button";
import ResultSkeleton from "@/components/system/ResultSkeleton";
import ErrorFallback from "@/components/system/ErrorFallback";
import { openNovaStream, NovaEvent } from "@/services/nova/novaClient";

/**
 * EnhancedResultsPage
 * - Probeert Nova SSE (premium) te starten.
 * - Valt gracieus terug op een redactionele resultatenweergave als SSE niet beschikbaar is.
 * - Volledig tokens-first (geen hex in componenten).
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

const USE_DEV_MOCK = import.meta.env.DEV && (import.meta.env.VITE_DEV_MOCK_NOVA ?? "1") === "1";

// Redactionele fallback-content (secure defaults)
const FALLBACK: { title: string; sub: string; outfits: Outfit[] } = {
  title: "Onze aanbeveling",
  sub: "We kozen voor een cleane, smart-casual basis die rust en helderheid brengt — afgestemd op silhouet en kleurtinten.",
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

  // Start Nova stream met graceful fallback
  const start = async () => {
    setLoading(true);
    setErr(null);
    setPatch({});
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    if (USE_DEV_MOCK) {
      // Snelle dev-demo
      setTimeout(() => {
        setPatch({
          explanation:
            "We kozen voor een cleane, smart-casual look: netter denim, witte sneaker en licht overshirt — minimalistisch en comfortabel."
        });
        setLoading(false);
      }, 250);
      return;
    }

    try {
      await openNovaStream(
        {
          mode: "style-report",
          messages: [{ role: "user", content: "Genereer korte, heldere uitleg voor resultatenpagina." }]
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

  // UI helpers
  const Explanation = () => (
    <div className="p-6 md:p-8 rounded-2xl bg-[var(--color-surface)] shadow-[var(--shadow-soft)]">
      <h2 className="text-xl font-semibold text-[var(--color-text)]">{FALLBACK.title}</h2>
      <p className="mt-3 text-[var(--color-muted)]">
        {patch.explanation ? patch.explanation : FALLBACK.sub}
      </p>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => {}}>Shop deze look</Button>
        <Button variant="secondary" onClick={() => start()}>Nieuwe analyse</Button>
      </div>
      {err && (
        <p className="mt-3 text-sm text-[var(--color-warn-text)]">
          ({err}) We tonen een voorbeeldresultaat.
        </p>
      )}
    </div>
  );

  const OutfitCard: React.FC<{ outfit: Outfit }> = ({ outfit }) => (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] overflow-hidden">
      {outfit.imageUrl && (
        <img
          src={outfit.imageUrl}
          alt={outfit.title}
          className="w-full h-56 object-cover"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text)]">{outfit.title}</h3>
        {outfit.items && (
          <ul className="mt-3 space-y-1 text-[var(--color-text)]">
            {outfit.items.map((it, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                <span className="text-sm">
                  {it.name}
                  {it.note ? <span className="text-[var(--color-muted)]"> — {it.note}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        )}
        {outfit.shop && (
          <div className="mt-4">
            <a href={outfit.shop.href} className="btn btn-secondary">
              {outfit.shop.label}
            </a>
          </div>
        )}
      </div>
    </article>
  );

  return (
    <main id="main">
      <Seo title="Resultaten — Jouw outfitadvies | FitFi" description="Concreet outfitadvies op basis van je profiel. Privacy-first." />
      <section className="ff-section bg-[var(--color-bg)]">
        <div className="ff-container max-w-4xl">
          {loading ? <ResultSkeleton /> : <Explanation />}
        </div>
      </section>

      <section className="ff-section bg-white">
        <div className="ff-container">
          {/* Toon redactionele outfits altijd als veilige basis */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FALLBACK.outfits.map((o) => (
              <OutfitCard key={o.id} outfit={o} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA rail */}
      <section className="ff-section bg-[var(--color-bg)]">
        <div className="ff-container flex flex-wrap items-center justify-between gap-4">
          <p className="section-intro m-0">Meer varianten per silhouet en seizoen?</p>
          <a href="/pricing" className="btn btn-primary">Ontgrendel premium outfits</a>
        </div>
      </section>
    </main>
  );
}

export default EnhancedResultsPage;