import { useEffect, useRef, useState, type CSSProperties } from "react";
import { magHeroClip } from "@/components/landing/heroClipRegels";
import { useOpNadering } from "./useOpNadering";

type Netwerkinformatie = { saveData?: boolean; effectiveType?: string };

/** De clip die nu speelt, zodat er nooit twee tegelijk lopen (plan 3.7). */
let actief: HTMLVideoElement | null = null;

function speeltNog(video: HTMLVideoElement | null): video is HTMLVideoElement {
  return !!video && !video.paused && !video.ended;
}

/**
 * Een clip die een keer speelt en dan op zijn laatste beeld blijft staan: de
 * opname van de quiz (A1) en de avondclip in het slot (W3V).
 *
 * - Zelfde regels als de hero-clip (heroClipRegels.ts): niet bij reduced
 *   motion, Save-Data of 2G. Dan rendert dit niets en blijft de still of de
 *   poster staan.
 * - Geen bron tot de clip binnen 300 px van het scherm is (preload="none").
 *   Starten pas als hij voor de helft in beeld is.
 * - Geen lus, geen geluid, geen bediening, niet focusbaar. Bewegend beeld van
 *   vijf seconden of korter valt buiten WCAG 2.2.2.
 * - Een geweigerde play() (iOS Low Power Mode) of een laadfout: weg met de
 *   clip, de still eronder blijft.
 */
export default function EenmaligeClip({
  bron,
  poster,
  breekpunt,
  className = "",
  style,
  beschrijvingId,
}: {
  bron: string;
  /** Met poster staat de clip er altijd (A1); zonder pas als hij speelt (W3V over zijn eerste beeld). */
  poster?: string;
  /** Alleen bij deze mediaquery, bijvoorbeeld "(min-width: 1024px)". */
  breekpunt?: string;
  className?: string;
  style?: CSSProperties;
  /** id van een element dat beschrijft wat er in de clip gebeurt. */
  beschrijvingId?: string;
}) {
  const [mag, setMag] = useState(false);
  const [weg, setWeg] = useState(false);
  const [speelt, setSpeelt] = useState(false);
  const [ref, dichtbij, video] = useOpNadering<HTMLVideoElement>({ marge: 300 });

  useEffect(() => {
    const netwerk = (navigator as Navigator & { connection?: Netwerkinformatie }).connection;
    const regels = magHeroClip({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      saveData: netwerk?.saveData,
      effectiveType: netwerk?.effectiveType,
    });
    if (!regels) return;
    if (!breekpunt) {
      setMag(true);
      return;
    }
    const mq = window.matchMedia(breekpunt);
    setMag(mq.matches);
    // Over het breekpunt heen: de clip weg en de still laten staan.
    const opWissel = (e: MediaQueryListEvent) => {
      if (!e.matches) setWeg(true);
    };
    mq.addEventListener("change", opWissel);
    return () => mq.removeEventListener("change", opWissel);
  }, [breekpunt]);

  useEffect(() => {
    if (!mag || weg || !dichtbij || !video) return;

    // Het muted-attribuut uit JSX zet React niet betrouwbaar als eigenschap,
    // en zonder muted weigeren iOS en Chrome het automatisch afspelen.
    video.muted = true;
    let gestart = false;
    let wachtOp: HTMLVideoElement | null = null;

    const probeer = () => {
      if (gestart || video.ended) return;
      if (speeltNog(actief) && actief !== video) {
        wachtOp = actief;
        wachtOp.addEventListener("ended", probeerAlsZichtbaar, { once: true });
        return;
      }
      gestart = true;
      actief = video;
      video.play()?.catch((fout: unknown) => {
        if (fout instanceof DOMException && fout.name === "AbortError") {
          gestart = false;
          return;
        }
        setWeg(true);
      });
    };

    let zichtbaar = false;
    function probeerAlsZichtbaar() {
      if (zichtbaar) probeer();
    }

    const waarnemer = new IntersectionObserver(
      (items) => {
        zichtbaar = items.some((i) => i.intersectionRatio >= 0.5);
        if (zichtbaar) probeer();
      },
      { threshold: [0, 0.5] },
    );
    waarnemer.observe(video);

    const opZichtbaarheid = () => {
      if (document.hidden) video.pause();
      else if (gestart && !video.ended) video.play()?.catch(() => undefined);
    };
    document.addEventListener("visibilitychange", opZichtbaarheid);

    return () => {
      waarnemer.disconnect();
      document.removeEventListener("visibilitychange", opZichtbaarheid);
      wachtOp?.removeEventListener("ended", probeerAlsZichtbaar);
      if (actief === video) actief = null;
    };
  }, [mag, weg, dichtbij, video]);

  if (!mag || weg) return null;

  return (
    <video
      ref={ref}
      src={dichtbij ? bron : undefined}
      poster={poster}
      className={`${className} ${poster || speelt ? "opacity-100" : "opacity-0"} transition-opacity duration-200 ease-out`}
      style={style}
      muted
      playsInline
      preload="none"
      disablePictureInPicture
      aria-hidden={beschrijvingId ? undefined : "true"}
      aria-describedby={beschrijvingId}
      tabIndex={-1}
      onPlaying={() => setSpeelt(true)}
      onEnded={() => {
        if (actief === video) actief = null;
      }}
      onError={() => setWeg(true)}
    />
  );
}
