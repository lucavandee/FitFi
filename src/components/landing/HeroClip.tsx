import { useEffect, useRef, useState, type RefObject } from "react";
import { HERO_CLIP, magHeroClip } from "@/components/landing/heroClipRegels";

type Netwerkinformatie = { saveData?: boolean; effectiveType?: string };

/*
 * Levende hero: een clip van vijf seconden die precies op de hero-still begint.
 *
 * - De still blijft het LCP-element. De clip krijgt pas een bron na het
 *   load-event plus een idle-moment, en wordt pas zichtbaar als hij speelt.
 * - Speelt een keer, zonder geluid, en blijft daarna op het laatste beeld staan.
 *   Bewegend beeld van vijf seconden of korter valt buiten WCAG 2.2.2, dus geen
 *   loop en geen pauzeknop nodig. De clip zoomt langzaam in, daarom springt hij
 *   aan het eind niet terug naar de still.
 * - Niet bij reduced motion, Save-Data of 2G. Een geweigerde play() (iOS Low
 *   Power Mode) of een laadfout laat de still gewoon staan.
 * - Zelfde uitsnede (objectPosition) als de <img> in LandingPage, anders valt
 *   het eerste frame niet over de still.
 */
/**
 * `still` is de hero-<img>. De clip krijgt pas een bron als die binnen is: op
 * Slow 4G viel load plus idle (2,5 s) eerder dan de still (3,3 tot 3,5 s), en
 * dan haalde de clip bandbreedte weg bij het beeld dat er eerst moet staan.
 */
export default function HeroClip({ still }: { still?: RefObject<HTMLImageElement> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [bron, setBron] = useState<string | null>(null);
  const [zichtbaar, setZichtbaar] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const netwerk = (navigator as Navigator & { connection?: Netwerkinformatie }).connection;
    if (
      !magHeroClip({
        reducedMotion,
        saveData: netwerk?.saveData,
        effectiveType: netwerk?.effectiveType,
      })
    ) {
      return;
    }

    const breekpunt = window.matchMedia(HERO_CLIP.breekpunt);
    let gestopt = false;
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    const kiesBron = () => {
      if (gestopt) return;
      setBron(breekpunt.matches ? HERO_CLIP.mobiel : HERO_CLIP.desktop);
    };

    // Safari kent requestIdleCallback pas sinds kort. De typing doet alsof hij
    // er altijd is, dus de else-tak loopt via een gewone Window-variabele.
    const venster: Window = window;
    const naIdle = () => {
      if ("requestIdleCallback" in window) {
        idleId = window.requestIdleCallback(kiesBron, { timeout: 2000 });
      } else {
        timeoutId = venster.setTimeout(kiesBron, 300);
      }
    };

    // Eerst de still, dan load plus idle. Een still die niet laadt houdt de
    // clip niet tegen: dan gaat hij na de fout gewoon verder.
    const img = still?.current ?? null;
    const naStill = () => {
      if (gestopt) return;
      if (document.readyState === "complete") naIdle();
      else window.addEventListener("load", naIdle, { once: true });
    };
    if (!img || img.complete) naStill();
    else {
      img.addEventListener("load", naStill, { once: true });
      img.addEventListener("error", naStill, { once: true });
    }

    // Gaat de bezoeker over het breekpunt, dan wisselt de <picture> van still
    // en klopt de clip niet meer. Dan de clip weg en de still laten staan.
    const opWissel = () => {
      setZichtbaar(false);
      setBron(null);
    };
    breekpunt.addEventListener("change", opWissel);

    return () => {
      gestopt = true;
      img?.removeEventListener("load", naStill);
      img?.removeEventListener("error", naStill);
      window.removeEventListener("load", naIdle);
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
      breekpunt.removeEventListener("change", opWissel);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !bron) return;

    // Het muted-attribuut uit JSX zet React niet betrouwbaar als eigenschap,
    // en zonder muted weigeren iOS en Chrome het automatisch afspelen.
    video.muted = true;
    video.play()?.catch((fout: unknown) => {
      // Een pause() bij een verborgen tab weigert een nog lopende play() met
      // AbortError. Dat is geen geweigerde autoplay: de visibilitychange-tak
      // hieronder start de clip weer als de bezoeker terugkomt.
      if (fout instanceof DOMException && fout.name === "AbortError") return;
      setZichtbaar(false);
      setBron(null);
    });

    const opZichtbaarheid = () => {
      if (document.hidden) video.pause();
      else if (!video.ended) video.play()?.catch(() => undefined);
    };
    document.addEventListener("visibilitychange", opZichtbaarheid);
    return () => document.removeEventListener("visibilitychange", opZichtbaarheid);
  }, [bron]);

  if (!bron) return null;

  return (
    <video
      ref={videoRef}
      src={bron}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[400ms] ease-out ${
        zichtbaar ? "opacity-100" : "opacity-0"
      }`}
      style={{ objectPosition: "center 20%" }}
      muted
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setZichtbaar(true)}
      onError={() => {
        setZichtbaar(false);
        setBron(null);
      }}
    />
  );
}
