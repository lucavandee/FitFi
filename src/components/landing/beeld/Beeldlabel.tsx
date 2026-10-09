import type { Hoek } from "@/content/beeld";

/*
 * Het AI-label van eigen beeld (plan "Onder de hero", 3.6; AI Act art. 50(4)).
 *
 * - Echte tekst in de <figcaption>, zodat een schermlezer hem leest; de alt
 *   beschrijft alleen wat je ziet.
 * - In het beeldkader, 16 px van de rand op mobiel en 24 px vanaf 768 px, op de
 *   rustigste hoek. Plat wit op een vast verloop dat aan het beeld vastzit,
 *   niet aan het label. Nooit een vlak of kaart.
 * - Statisch: elk beeld onder de hero past in zijn geheel onder de kop, dus een
 *   label bovenin staat in rust nooit onder de kop. Alleen het schermvullende
 *   slotbeeld krijgt een sticky label (variant "sticky").
 */

const HOEK_ONDER_LG: Record<Hoek, string> = {
  linksboven: "left-4 md:left-6",
  rechtsboven: "right-4 md:right-6",
};

const HOEK_VANAF_LG: Record<Hoek, string> = {
  linksboven: "lg:left-6 lg:right-auto",
  rechtsboven: "lg:right-6 lg:left-auto",
};

function Zinnen({ zinnen, tweeRegels }: { zinnen: readonly string[]; tweeRegels: "altijd" | "onder-lg" }) {
  const blok = tweeRegels === "altijd" ? "block" : "block lg:inline";
  return (
    <>
      {zinnen.map((z, i) => (
        <span key={z} className={blok}>
          {/* Een echte spatie, ook als de zinnen onder elkaar staan: daar valt
              hij aan het begin van de regel weg, en een schermlezer leest twee
              zinnen in plaats van een aan elkaar geplakt woord. */}
          {i > 0 && " "}
          {z}
        </span>
      ))}
    </>
  );
}

/** Een vast verloop over het beeld, onder het label. Decoratief. */
export function Verloop({ achtergrond, className = "" }: { achtergrond: string; className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ background: achtergrond }}
      aria-hidden="true"
    />
  );
}

export default function Beeldlabel({
  zinnen,
  hoek,
  tweeRegels = "onder-lg",
  sticky = false,
}: {
  zinnen: readonly string[];
  /** Hoek onder 1024 px en vanaf 1024 px. */
  hoek: { onderLg: Hoek; vanafLg: Hoek };
  tweeRegels?: "altijd" | "onder-lg";
  /**
   * Sticky binnen de sectie op de kophoogte plus 16 px. De figcaption is dan de
   * baan: bovenin het beeld, net zo hoog dat het label van zijn plek in het
   * beeld (16 of 24 px) naar de kop plus 16 px kan schuiven en niet verder.
   */
  sticky?: boolean;
}) {
  const tekst = "text-sm font-medium text-white";

  if (sticky) {
    return (
      <figcaption
        className={`pointer-events-none absolute top-0 z-10 pt-4 md:pt-6 ${HOEK_ONDER_LG[hoek.onderLg]} ${HOEK_VANAF_LG[hoek.vanafLg]}`}
        style={{ height: "calc(var(--header-h, 90px) + 16px + 21px)" }}
      >
        <span className={`sticky block ${tekst}`} style={{ top: "calc(var(--header-h, 90px) + 16px)" }}>
          <Zinnen zinnen={zinnen} tweeRegels={tweeRegels} />
        </span>
      </figcaption>
    );
  }

  return (
    <figcaption
      className={`pointer-events-none absolute top-4 md:top-6 z-10 ${HOEK_ONDER_LG[hoek.onderLg]} ${HOEK_VANAF_LG[hoek.vanafLg]} ${tekst}`}
    >
      <Zinnen zinnen={zinnen} tweeRegels={tweeRegels} />
    </figcaption>
  );
}
