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
  return <ResultsPremium />;
}

export default EnhancedResultsPage;