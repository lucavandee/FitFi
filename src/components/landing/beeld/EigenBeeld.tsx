import { srcset, terugval, type Beeldset } from "@/content/beeld";
import { useOpNadering } from "./useOpNadering";

/*
 * fetchpriority in kleine letters: React 18 kent de camelCase-prop niet en
 * waarschuwt dan; als gewoon attribuut komt hij zonder waarschuwing in de DOM.
 */
const LAGE_PRIORITEIT = { fetchpriority: "low" } as Record<string, string>;

export interface Beeldbron {
  /** Mediaquery voor deze bron; de laatste bron in de rij heeft er geen. */
  media?: string;
  set: Beeldset;
  sizes: string;
}

/**
 * Eigen beeld onder de hero: een <picture> met AVIF en WebP per breekpunt.
 *
 * - Het vak reserveert de ouder (aspect-ratio of een vaste hoogte, met de
 *   mediaankleur als achtergrond), dus het beeld verschuift niets als het komt.
 * - srcset en src staan er pas als het beeld dichtbij is (useOpNadering); tot
 *   dan vraagt de browser niets op. text-transparent verbergt de alt-tekst die
 *   een <img> zonder bron anders even als tekst toont.
 * - Nooit opgeschaald: de srcsets bevatten alleen breedtes die de bron heeft.
 */
export default function EigenBeeld({
  bronnen,
  alt,
  className = "",
  laden = "nadering",
}: {
  bronnen: readonly Beeldbron[];
  alt: string;
  className?: string;
  /** "na-load": ook na load en een idle-moment (W1, direct onder de hero). */
  laden?: "nadering" | "na-load";
}) {
  const [ref, dichtbij] = useOpNadering<HTMLImageElement>({ marge: 500, naLoad: laden === "na-load" });
  const standaard = bronnen[bronnen.length - 1].set;
  const src = terugval(standaard.webp);

  return (
    <picture>
      {bronnen.flatMap((bron) => [
        <source
          key={`${bron.media ?? "standaard"}-avif`}
          type="image/avif"
          media={bron.media}
          sizes={bron.sizes}
          srcSet={dichtbij ? srcset(bron.set.avif) : undefined}
        />,
        <source
          key={`${bron.media ?? "standaard"}-webp`}
          type="image/webp"
          media={bron.media}
          sizes={bron.sizes}
          srcSet={dichtbij ? srcset(bron.set.webp) : undefined}
        />,
      ])}
      <img
        ref={ref}
        src={dichtbij ? src.pad : undefined}
        alt={alt}
        width={src.breedte}
        height={src.hoogte}
        loading="lazy"
        decoding="async"
        {...LAGE_PRIORITEIT}
        className={`text-transparent ${className}`}
      />
    </picture>
  );
}
