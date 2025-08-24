import { useEffect, useState } from "react";
import type { OutfitItem } from "@/components/nova/NovaStyleSwipe";

const INLINE_FALLBACK: OutfitItem[] = [
  {
    id: "m-urban-1",
    title: "Urban clean — denim & white tee",
    subtitle: "Minimalistisch, fris, perfect voor weekend",
    image:
      "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=2",
    matchScore: 82,
    season: "ALL",
    tags: ["Casual", "Denim", "Wit"],
    ctaHref: "/quiz",
    source: "Nova AI",
  },
  {
    id: "f-smart-1",
    title: "Smart chic — blazer & knit",
    subtitle: "Layering voor herfst, werk naar borrel",
    image:
      "https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=2",
    matchScore: 88,
    season: "FW",
    tags: ["Chic", "Blazer", "Layering"],
    ctaHref: "/quiz",
    source: "Nova AI",
  },
  {
    id: "m-ath-1",
    title: "Athleisure — soft jogger set",
    subtitle: "Comfort met vorm, perfect voor actieve dagen",
    image:
      "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=2",
    matchScore: 74,
    season: "ALL",
    tags: ["Athleisure", "Comfort", "Sport"],
    ctaHref: "/quiz",
    source: "Nova AI",
  },
  {
    id: "f-summer-1",
    title: "Summer airy — linen set",
    subtitle: "Linnen two-piece voor warme dagen",
    image:
      "https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=2",
    matchScore: 79,
    season: "SS",
    tags: ["Linnen", "Light", "Zomer"],
    ctaHref: "/quiz",
    source: "Nova AI",
  },
  {
    id: "f-minimal-1",
    title: "Minimal elegance — clean dress",
    subtitle: "Eenvoud die spreekt, tijdloos design",
    image:
      "https://images.pexels.com/photos/1280064/pexels-photo-1280064.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=2",
    matchScore: 91,
    season: "ALL",
    tags: ["Minimal", "Elegant", "Tijdloos"],
    ctaHref: "/quiz",
    source: "Nova AI",
  },
  {
    id: "m-street-1",
    title: "Street casual — hoodie & jeans",
    subtitle: "Urban comfort met attitude",
    image:
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&dpr=2",
    matchScore: 76,
    season: "FW",
    tags: ["Street", "Casual", "Urban"],
    ctaHref: "/quiz",
    source: "Nova AI",
  },
];

export function useOutfitsFeed() {
  const [items, setItems] = useState<OutfitItem[]>(INLINE_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Try public JSON first
    fetch("/data/outfits.json", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) {
          // Validate data structure
          const validItems = data.filter(
            (item) =>
              item &&
              typeof item === "object" &&
              item.id &&
              item.title &&
              item.image,
          );

          if (validItems.length > 0) {
            setItems(validItems);
            console.log(
              `[OutfitsFeed] Loaded ${validItems.length} outfits from public JSON`,
            );
          } else {
            console.warn(
              "[OutfitsFeed] No valid items in public JSON, using fallback",
            );
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.warn(
            "[OutfitsFeed] Public JSON failed, using fallback:",
            err.message,
          );
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}
