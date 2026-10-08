import { useEffect, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import EigenBeeld from "@/components/landing/beeld/EigenBeeld";
import EenmaligeClip from "@/components/landing/beeld/EenmaligeClip";
import Beeldlabel, { Verloop } from "@/components/landing/beeld/Beeldlabel";
import { magHeroClip } from "@/components/landing/heroClipRegels";
import { W3, W3V_CLIP_AAN } from "@/content/beeld";
import { LANDING_COPY } from "@/content/landingCopy";
import { track } from "@/utils/analytics";

const COPY = LANDING_COPY.slot;

type Netwerkinformatie = { saveData?: boolean; effectiveType?: string };

/**
 * Mag de avondclip hier spelen? Dezelfde regels als EenmaligeClip, zodat de
 * still onder de clip zijn eerste beeld is wanneer hij speelt, en de scherpe
 * W3 wanneer niet.
 */
function useClipMag(aan: boolean): boolean {
  const [mag, setMag] = useState(false);
  useEffect(() => {
    if (!aan) return;
    const netwerk = (navigator as Navigator & { connection?: Netwerkinformatie }).connection;
    const regels = magHeroClip({
      reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      saveData: netwerk?.saveData,
      effectiveType: netwerk?.effectiveType,
    });
    setMag(regels && window.matchMedia(W3.clip.breekpunt).matches);
  }, [aan]);
  return mag;
}

/**
 * Slot (plan "Onder de hero", 4.5): dezelfde gracht, leeg, in de avond, met de
 * eerste vraag van de quiz als displaykop en een knop die precies die vraag
 * opent. De tweede boekensteun naast de hero: schermvullend beeld, hetzelfde
 * verloop, tekst linksonder.
 *
 * - Het label is sticky binnen de sectie op de kophoogte plus 16 px: het beeld
 *   is schermvullend, dus zonder dat zou het label in rust onder de kop staan.
 *   overflow-clip en niet overflow-hidden: hidden maakt de sectie een
 *   scrollcontainer, en dan plakt het label aan de sectie in plaats van aan het
 *   scherm.
 * - Displaykop volgens CLAUDE.md deel 2 (benoemde afwijking: de enige serif
 *   onder de hero).
 * - De knop staat binnen py-40 (deel 15), dus op een telefoon ruim boven de
 *   onderbalk.
 */
export default function Slot({ clip = W3V_CLIP_AAN }: { clip?: boolean }) {
  const clipMag = useClipMag(clip);
  const desktop = clipMag ? W3.clipstart : W3.desktop;

  const opKlik = () => {
    track("cta_click", { page: "landing", position: "slot" });
    track("quiz_start", { page: "landing", position: "slot" });
  };

  return (
    <section
      id="slot"
      aria-labelledby="slot-kop"
      className="relative isolate flex min-h-svh items-end overflow-clip bg-[var(--vak-mobiel)] lg:bg-[var(--vak-desktop)]"
      style={{ "--vak-mobiel": W3.mobiel.mediaankleur, "--vak-desktop": desktop.mediaankleur } as CSSProperties}
    >
      <figure className="absolute inset-0 m-0">
        <EigenBeeld
          bronnen={[
            { media: "(max-width: 1023px)", set: W3.mobiel, sizes: "100vw" },
            { set: desktop, sizes: "100vw" },
          ]}
          alt={W3.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {clip && clipMag && (
          <EenmaligeClip
            bron={W3.clip.pad}
            breekpunt={W3.clip.breekpunt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <Verloop achtergrond={W3.verloop.basis} />
        <Verloop achtergrond={W3.verloop.onderMd} className="md:hidden" />
        <Beeldlabel zinnen={W3.label} hoek={{ onderLg: W3.labelHoek, vanafLg: W3.labelHoek }} tweeRegels="altijd" sticky />
      </figure>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-40 sm:px-6 lg:px-8">
        <p className="text-sm text-white/90">{COPY.stap.tekst}</p>
        <h2 id="slot-kop" className="mt-3 max-w-3xl text-[32px] leading-[1.05] text-white md:text-[64px]">
          <span className="font-serif italic">{COPY.kopDelen[0]}</span>
          <span className="font-sans font-bold">{COPY.kopDelen[1]}</span>
        </h2>
        <p className="mt-6 max-w-prose text-base leading-relaxed text-white">{COPY.tekst.tekst}</p>
        <Link
          to="/onboarding"
          onClick={opKlik}
          className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#A85740] px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-[#9A503B]"
        >
          {COPY.knop.tekst}
        </Link>
      </div>
    </section>
  );
}
