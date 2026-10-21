import { formaat, type VoorbeeldStuk } from "@/content/voorbeeldOutfits";
import { toonNaam } from "@/utils/productNaam";

/**
 * Een productfoto uit de feed, ongewijzigd (Daisycon art. 2.6): in de
 * verhouding van de bron (H&M 2:3), object-contain op gebroken wit, zonder
 * radius en zonder iets eroverheen (CLAUDE.md deel 17 en 18). De kleinere
 * versie komt van de winkel zelf (imwidth).
 */
export function Packshot({ stuk, sizes, laden = "lazy" }: { stuk: VoorbeeldStuk; sizes: string; laden?: "lazy" | "eager" }) {
  return (
    <div className="aspect-[2/3] overflow-hidden bg-[#FAFAF8]">
      <img
        src={formaat(stuk.beeld, 600)}
        srcSet={`${formaat(stuk.beeld, 400)} 400w, ${formaat(stuk.beeld, 800)} 800w`}
        sizes={sizes}
        alt={toonNaam({ name: stuk.naam, brand: stuk.merk })}
        className="h-full w-full object-contain"
        loading={laden}
        decoding="async"
      />
    </div>
  );
}
