import type { CSSProperties } from "react";
import { NavLink } from "react-router-dom";
import { GRIJZE_KAMER, KLEURKAMER_COPY, kamer as kamerVan, kamerBeeld, slotVraag, srcSet, type KamerSleutel, type Wie } from "@/content/kleurkamers";
import { track } from "@/utils/analytics";
import { ARCHIVO, KNOP_OP } from "./stijl";

const COPY = KLEURKAMER_COPY.slot;

const MASKER: CSSProperties = {
  WebkitMaskImage: "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 6%, #000 90%, transparent 100%)",
  WebkitMaskComposite: "source-in",
  maskImage: "linear-gradient(to right, transparent 0, #000 6%, #000 94%, transparent 100%), linear-gradient(to bottom, transparent 0, #000 6%, #000 90%, transparent 100%)",
  maskComposite: "intersect",
};

/*
 * De persoon begint in de grijze still op 56 procent (heren) en 62 procent
 * (dames) van de breedte, gemeten op 22 oktober 2026. De plaat is hooguit 1920
 * px breed en staat in het midden; het tekstblok stopt 48 px voor 54 procent.
 */
const TEKST_BREED = "calc(min(100vw, 1920px) * 0.54 + max(0px, (100vw - 1920px) / 2) - var(--rand) - 48px)";

/** De plaat is hooguit 1920 px breed. */
const SIZES_PLAAT = "(min-width: 1920px) 1920px, 100vw";

const MASKER_STAAND: CSSProperties = {
  WebkitMaskImage: "linear-gradient(to bottom, #000 0, #000 92%, transparent 100%)",
  maskImage: "linear-gradient(to bottom, #000 0, #000 92%, transparent 100%)",
};

/**
 * Het slot: dezelfde persoon in dezelfde studio, nu zonder kleur. Na de kamers
 * is dit het stille moment. Wie een kamer koos, krijgt de vraag of die die
 * kleur draagt; de quiz vraagt in stap 3 welke kleuren je het liefst draagt.
 * Het rapport gaat niet over de gekozen kamer. Zonder eigen keuze de vraag van
 * de held.
 */
export default function Slot({ wie, eigenKeuze }: { wie: Wie; eigenKeuze: KamerSleutel | null }) {
  const k = eigenKeuze ? kamerVan(eigenKeuze) : null;
  const veld = GRIJZE_KAMER.veld[wie];
  const liggend = kamerBeeld("grijs", wie, false);
  const staand = kamerBeeld("grijs", wie, true);
  const alt =
    wie === "dames"
      ? "Dezelfde vrouw in een lange antraciet jas en broek, nu in een grijze studio zonder kleur."
      : "Dezelfde man in een antraciet overjas en broek, nu in een grijze studio zonder kleur.";

  // Twee keer gerenderd (telefoon en desktop, elkaar uitsluitend), dus een id per variant.
  const tekstblok = (kopId: string) => (
    <div>
      <div className="flex items-start gap-4">
        {k && <span aria-hidden="true" className="mt-2 h-10 w-10 flex-none border border-[rgba(26,26,26,0.3)]" style={{ backgroundColor: k.hex }} />}
        <h2 id={kopId} className="font-archivo text-[36px] text-[#1A1A1A] [text-wrap:balance] lg:text-[clamp(56px,6vw,104px)]" style={ARCHIVO.display}>
          {slotVraag(k)}
        </h2>
      </div>
      <p className="mt-5 text-[18px] leading-[27px] text-[#1A1A1A] lg:text-[20px] lg:leading-[30px]">{COPY.tekst.tekst}</p>
      <div className="mt-8 [&>a]:w-full sm:[&>a]:w-auto">
        <NavLink
          to="/onboarding"
          className={KNOP_OP.licht}
          onClick={() => {
            track("cta_click", { page: "landing", position: "slot", kamer: eigenKeuze ?? "geen", wie });
            track("quiz_start", { page: "landing", position: "slot" });
          }}
        >
          {KLEURKAMER_COPY.held.knop}
        </NavLink>
      </div>
    </div>
  );

  return (
    // Zonder eigen keuze is de vraag die van de held; dan geen tweede regio met dezelfde naam (axe landmark-unique).
    <section aria-labelledby={k ? "slot-kop" : undefined} className="font-archivo" style={{ backgroundColor: veld, color: "#1A1A1A" }}>
      {/* Telefoon en tablet: de staande uitsnede, dan de tekst op het grijs. */}
      <div className="lg:hidden">
        <figure className="relative m-0 w-full" style={{ aspectRatio: "4 / 5", ...MASKER_STAAND }}>
          <picture>
            <source type="image/avif" srcSet={srcSet(staand.avif)} sizes="100vw" />
            <img
              src={staand.webp[960]}
              srcSet={srcSet(staand.webp)}
              sizes="100vw"
              alt={alt}
              aria-describedby="slot-ai"
              width={staand.verhouding[0]}
              height={staand.verhouding[1]}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "50% 30%" }}
            />
          </picture>
        </figure>
        <div className="px-[var(--rand)] pb-16 pt-4">
          <p id="slot-ai" className="text-[14px] text-[#1A1A1A]">
            {COPY.aiLabel}
          </p>
          <div className="mt-6">{tekstblok("slot-kop")}</div>
          <p className="mt-8 max-w-prose text-[14px] leading-[22px] text-[#1A1A1A]">{COPY.plannen.tekst}</p>
        </div>
      </div>

      {/* Desktop: de liggende plaat, met de tekst op het lege papier links. */}
      <div className="hidden lg:block">
        <div className="relative">
          <div className="relative mx-auto w-full max-w-[1920px]" style={{ aspectRatio: "16 / 9", maxHeight: "100svh" }}>
            <div className="absolute inset-0" style={MASKER}>
              <picture>
                <source type="image/avif" srcSet={srcSet(liggend.avif)} sizes={SIZES_PLAAT} />
                <img
                  src={liggend.webp[1920]}
                  srcSet={srcSet(liggend.webp)}
                  sizes={SIZES_PLAAT}
                  alt={alt}
                  aria-describedby="slot-ai-desktop"
                  width={liggend.verhouding[0]}
                  height={liggend.verhouding[1]}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </picture>
            </div>
          </div>
          {/* Op de linkerrand van de pagina (--rand), en smal genoeg om voor de persoon te stoppen. */}
          <div className="absolute left-[var(--rand)] top-[24%]" style={{ maxWidth: TEKST_BREED }}>
            {tekstblok("slot-kop-breed")}
          </div>
        </div>
        <div className="flex items-baseline justify-between gap-8 px-[var(--rand)] pb-8">
          <p id="slot-ai-desktop" className="flex-none text-[14px] text-[#1A1A1A]">
            {COPY.aiLabel}
          </p>
          <p className="max-w-[60rem] text-right text-[14px] leading-[22px] text-[#1A1A1A]">{COPY.plannen.tekst}</p>
        </div>
      </div>
    </section>
  );
}
