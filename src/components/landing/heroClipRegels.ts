/*
 * Levende hero: de bronnen en de beslissing of de clip mag laden.
 *
 * De clips beginnen precies op de hero-stills uit LandingPage (gemeten met
 * SSIM tussen het eerste frame en de still: 0,96 na codering). Daarom hetzelfde
 * breekpunt als de <picture> daar: onder 1024 px de staande still en clip,
 * daarboven de liggende. Wijzigt het breekpunt of een still, dan hoort de clip
 * mee te veranderen, anders valt het eerste frame niet meer over het beeld.
 *
 * Herkomst: Kling 3.0 4K vanaf de goedgekeurde stills, gekozen door Luc op
 * 8 oktober 2026 (desktop take A, mobiel take A). Log en metingen staan in
 * ~/claude-artifacts/fitfi-beeld/batch-3-hero/.
 *
 * 119 frames op 24 fps is 4,96 s. De bron is 121 frames (5,04 s); twee frames
 * eraf houdt de clip onder de vijf seconden van WCAG 2.2.2, zodat er geen
 * pauzeknop nodig is. De naam draagt de eerste acht tekens van de sha256.
 *
 * De AIGC-tag uit de Kling-bron (Label 1, producent kling, ProduceID) staat
 * ook in deze bestanden: de voorwaarden van Higgsfield (5.5) verbieden het
 * weghalen van herkomstsignalen. Hercoderen? Dan met
 * -metadata "AIGC=<waarde uit de bron>" -movflags +faststart+use_metadata_tags.
 */
export const HERO_CLIP = {
  breekpunt: "(max-width: 1023px)",
  mobiel: "/video/hero-mobiel.407d6557.mp4",
  desktop: "/video/hero-desktop.4f8e982a.mp4",
} as const;

export interface HeroClipOmgeving {
  /** prefers-reduced-motion: reduce */
  reducedMotion: boolean;
  /** navigator.connection.saveData, ontbreekt in Safari en Firefox */
  saveData?: boolean;
  /** navigator.connection.effectiveType, bijvoorbeeld "4g" of "slow-2g" */
  effectiveType?: string;
}

/**
 * Mag de clip laden? Nee bij reduced motion, bij Save-Data en op een
 * 2G-verbinding. Ontbreekt de netwerkinformatie (Safari), dan beslist de kleine
 * bestandsgrootte: de clip laadt pas na het load-event, dus hij concurreert niet
 * met de still om de eerste render.
 */
export function magHeroClip(omgeving: HeroClipOmgeving): boolean {
  if (omgeving.reducedMotion) return false;
  if (omgeving.saveData) return false;
  if (omgeving.effectiveType === "2g" || omgeving.effectiveType === "slow-2g") return false;
  return true;
}
